// backend/src/controllers/osc.controller.js
import pool from '../config/db.js';

/**
 * @desc    Lista as OSCs vinculadas ao utilizador logado (Contador ou própria OSC)
 */
export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log('--- DEBUG MY OSCs INÍCIO ---');
        console.log(`1. Quem está pedindo? ID: ${userId}, Role: ${userRole}`);

        // TESTE 1: Verificar se existem OSCs no banco
        const [total] = await pool.execute('SELECT COUNT(*) as t FROM oscs');
        console.log(`2. Total absoluto de OSCs no banco: ${total[0].t}`);

        // Query Base (Sem a coluna o.status que causava erro)
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

        // Lógica de Filtro baseada no Role
        if (userRole === 'Contador') {
            console.log('3. Aplicando filtro de Contador');
            query += ' WHERE o.assigned_contador_id = ?';
            params.push(userId);
        } else if (userRole === 'OSC') {
            console.log('3. Aplicando filtro de OSC');
            query += ' WHERE o.user_id = ?';
            params.push(userId);
        } else {
            console.log('3. Sem filtro (Admin)');
        }

        const [rows] = await pool.execute(query, params);
        console.log(`4. Resultado da query: ${rows.length} registros encontrados.`);

        // Formatação segura para o Frontend
        const safeRows = rows.map(row => ({
            id: row.id,
            name: row.name || 'Sem Nome',
            cnpj: row.cnpj || '',
            responsible: row.responsible || 'Não informado',
            status: row.user_status || 'Ativo' // Fallback para o status do usuário
        }));

        console.log('--- DEBUG MY OSCs FIM ---');
        return res.json(safeRows);

    } catch (error) {
        console.error('ERRO FATAL EM getMyOSCs:', error.sqlMessage || error);
        return res.status(500).json({ 
            message: 'Erro ao buscar suas OSCs', 
            details: error.sqlMessage 
        });
    }
};

/**
 * @desc    Lista todas as OSCs do sistema (para o Administrador)
 */
export const getAllOSCs = async (req, res) => {
    try {
        console.log('[Admin] Buscando lista global de OSCs...');

        // Query direta (Removido o.status para evitar erro ER_BAD_FIELD_ERROR)
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                u.name as contador_responsavel,
                u.status as user_status
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
        `);

        // Mapeamos os dados para garantir que o campo 'status' exista no JSON enviado ao React
        const formattedRows = rows.map(row => ({
            id: row.id,
            razao_social: row.razao_social || 'N/A',
            cnpj: row.cnpj || '',
            contador_responsavel: row.contador_responsavel || 'Não atribuído',
            status: row.user_status || 'Ativo'
        }));

        console.log(`[Admin] Sucesso: ${rows.length} OSCs encontradas.`);
        return res.status(200).json(formattedRows);

    } catch (error) {
        console.error('[OSC Controller Error - getAllOSCs]:', error.sqlMessage || error);
        return res.status(500).json({ 
            message: 'Erro interno ao buscar lista de OSCs.',
            error: error.sqlMessage 
        });
    }
};

/**
 * @desc    Busca os detalhes de uma OSC específica
 */
export const getOSCById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[OSC] Buscando detalhes da ID: ${id}`);

        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'OSC não encontrada.' });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('[OSC Controller Error - getOSCById]:', error.sqlMessage || error);
        return res.status(500).json({ message: 'Erro ao buscar detalhes da OSC.' });
    }
};