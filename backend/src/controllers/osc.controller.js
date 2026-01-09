import pool from '../config/db.js';

/**
 * @desc    Lista todas as OSCs para o Administrador
 * @route   GET /api/oscs
 */
export const getAllOSCs = async (req, res) => {
    try {
        console.log('[Admin] Iniciando busca global de OSCs...');

        // Query sem 'o.status' para evitar ER_BAD_FIELD_ERROR já identificado nos logs
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                u.name as nome_do_contador
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
        `);

        // MAPEAMENTO CRÍTICO: Ajustamos os nomes das chaves para o que o React espera
        const formattedRows = rows.map(osc => ({
            id: osc.id,
            // O Frontend busca por esses termos para exibir na tabela:
            razao_social: osc.razao_social || 'Sem Razão Social',
            nome: osc.razao_social || 'Sem Razão Social', 
            cnpj: osc.cnpj || '00.000.000/0000-00',
            // Coluna 'CONTADOR ASSOCIADO' na sua imagem:
            contador_associado: osc.nome_do_contador || 'Não atribuído',
            // Coluna 'STATUS' na sua imagem:
            status: 'Ativo' // Valor fixo pois a coluna não existe no banco atual
        }));

        console.log(`[Admin] Sucesso: ${formattedRows.length} OSCs enviadas para a interface.`);
        return res.status(200).json(formattedRows);

    } catch (error) {
        console.error('[OSC Controller Error]:', error.sqlMessage || error);
        return res.status(500).json({ message: 'Erro interno ao carregar lista de OSCs.' });
    }
};

/**
 * @desc    Lista OSCs vinculadas (Contador/OSC)
 */
export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = `
            SELECT o.*, u.status as user_status 
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
            status: r.user_status || 'Ativo'
        }));

        return res.json(formatted);
    } catch (error) {
        console.error('[OSC Error getMyOSCs]:', error);
        return res.status(500).json({ message: 'Erro ao buscar OSCs vinculadas.' });
    }
};

/**
 * @desc    Busca detalhes de uma OSC específica
 */
export const getOSCById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);

        if (rows.length === 0) return res.status(404).json({ message: 'OSC não encontrada.' });

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('[OSC Error getOSCById]:', error);
        return res.status(500).json({ message: 'Erro ao buscar detalhes.' });
    }
};