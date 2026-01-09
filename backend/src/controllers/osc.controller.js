// backend/src/controllers/osc.controller.js
import pool from '../config/db.js';

/**
 * @desc    Lista todas as OSCs para o Administrador com Debug Avançado
 */
export const getAllOSCs = async (req, res) => {
    try {
        console.log('--- [DEBUG ADMIN OSC] INÍCIO DA REQUISIÇÃO ---');

        // Query sem a coluna 'status' que não existe no seu banco
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                u.name as nome_do_contador,
                u.id as contador_id
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
        `);

        console.log(`[DEBUG] Linhas brutas vindas do MySQL: ${rows.length}`);
        if (rows.length > 0) {
            console.log('[DEBUG] Exemplo da primeira linha bruta:', JSON.stringify(rows[0]));
        }

        // Mapeamento com logs de transformação
        const formattedRows = rows.map((osc, index) => {
            const item = {
                id: osc.id,
                // Adicionamos múltiplas variações de nome para garantir compatibilidade com o Frontend
                nome: osc.razao_social || 'Sem Nome',
                razao_social: osc.razao_social || 'Sem Nome',
                razaoSocial: osc.razao_social || 'Sem Nome',
                cnpj: osc.cnpj || '',
                // Verificamos como o Frontend chama o contador associado
                contador_associado: osc.nome_do_contador || 'Não atribuído',
                contadorNome: osc.nome_do_contador || 'Não atribuído',
                // Injetamos um status fixo para evitar filtros de "Inativo" no Frontend
                status: 'Ativo'
            };
            
            if (index === 0) console.log('[DEBUG] Exemplo do primeiro objeto formatado que será enviado:', JSON.stringify(item));
            return item;
        });

        console.log(`--- [DEBUG ADMIN OSC] SUCESSO: ENVIANDO ${formattedRows.length} OSCs ---`);
        return res.status(200).json(formattedRows);

    } catch (error) {
        console.error('!!! [DEBUG ADMIN OSC] ERRO CRÍTICO !!!');
        console.error('Mensagem:', error.message);
        console.error('SQL State:', error.sqlState);
        console.error('SQL Message:', error.sqlMessage);
        return res.status(500).json({ 
            message: 'Erro interno ao carregar OSCs.',
            debug_error: error.sqlMessage 
        });
    }
};

/**
 * @desc    Busca OSCs vinculadas ao Contador ou à própria OSC
 */
export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        console.log(`[DEBUG MY OSCs] UserID: ${userId}, Role: ${userRole}`);

        let query = `
            SELECT o.*, u.name as contador_nome 
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
        
        const formatted = rows.map(r => ({
            ...r,
            name: r.razao_social || 'Sem Nome',
            status: 'Ativo'
        }));

        return res.json(formatted);
    } catch (error) {
        console.error('[DEBUG MY OSCs] Erro:', error);
        return res.status(500).json({ message: 'Erro ao buscar OSCs vinculadas.' });
    }
};

/**
 * @desc    Busca detalhes por ID
 */
export const getOSCById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'OSC não encontrada.' });
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('[DEBUG OSC BY ID] Erro:', error);
        return res.status(500).json({ message: 'Erro ao buscar detalhes.' });
    }
};