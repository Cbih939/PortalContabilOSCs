// backend/src/controllers/osc.controller.js
import pool from '../config/db.js';

/**
 * @desc    Lista as OSCs vinculadas ao utilizador logado
 */
export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[OSC Debug] Quem pede: ID ${userId}, Role: ${userRole}`);

        // Query sem a coluna o.status (usamos u.status da tabela de usuários como fallback)
        let query = `
            SELECT 
                o.id, 
                o.cnpj, 
                COALESCE(o.razao_social, u.name, 'Sem Nome') as name,
                o.responsible, 
                o.email, 
                o.phone, 
                o.cidade,
                o.estado,
                u.status as user_status
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
        `;
        
        const params = [];

        if (userRole === 'Contador') {
            query += ' WHERE o.assigned_contador_id = ?';
            params.push(userId);
        } else if (userRole === 'OSC') {
            query += ' WHERE o.user_id = ?';
            params.push(userId);
        }

        const [rows] = await pool.execute(query, params);

        const safeRows = rows.map(row => ({
            id: row.id,
            name: row.name || 'Sem Nome',
            cnpj: row.cnpj || '',
            responsible: row.responsible || 'Não informado',
            status: row.user_status || 'Ativo'
        }));

        return res.json(safeRows);
    } catch (error) {
        console.error('[OSC Error - getMyOSCs]:', error.sqlMessage || error);
        return res.status(500).json({ message: 'Erro ao buscar suas OSCs' });
    }
};

/**
 * @desc    Lista todas as OSCs do sistema (para o Administrador)
 */
export const getAllOSCs = async (req, res) => {
    try {
        console.log('[Admin] Buscando lista global de OSCs (Mapeamento Completo)...');

        // Query sem 'o.status' para evitar ER_BAD_FIELD_ERROR
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                o.user_id,
                u.name as contador_nome
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
        `);

        // Mapeamos os nomes dos campos para garantir que o Frontend encontre o que procura
        const formattedRows = rows.map(osc => ({
            id: osc.id,
            // O Frontend pode estar procurando por 'nome', 'name' ou 'razao_social'
            nome: osc.razao_social || 'Sem Razão Social',
            razao_social: osc.razao_social || 'Sem Razão Social',
            cnpj: osc.cnpj || '00.000.000/0000-00',
            // O campo 'CONTADOR ASSOCIADO' na sua imagem espera este valor:
            contador_associado: osc.contador_nome || 'Não atribuído',
            contador_nome: osc.contador_nome || 'Não atribuído',
            // Injetamos o status como 'Ativo' já que a coluna não existe no banco
            status: 'Ativo'
        }));

        console.log(`[Admin] Sucesso: ${formattedRows.length} OSCs formatadas e enviadas.`);
        return res.status(200).json(formattedRows);

    } catch (error) {
        console.error('[OSC Controller Error]:', error.sqlMessage || error);
        return res.status(500).json({ message: 'Erro interno ao processar OSCs.' });
    }
};

/**
 * @desc    Busca detalhes de uma OSC
 */
export const getOSCById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'OSC não encontrada.' });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('[OSC Controller Error]:', error.sqlMessage || error);
        return res.status(500).json({ message: 'Erro ao buscar detalhes.' });
    }
};