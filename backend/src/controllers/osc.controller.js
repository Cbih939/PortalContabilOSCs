import pool from '../config/db.js';

/**
 * @desc    Lista todas as OSCs para o Administrador
 */
export const getAllOSCs = async (req, res) => {
    try {
        console.log('[Admin] Buscando OSCs com colunas confirmadas...');

        // Query usando assigned_contador_id conforme seu DESCRIBE
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                u.name as contador_nome
            FROM oscs o
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `);

        const formattedRows = rows.map(osc => ({
            id: osc.id,
            nome: osc.razao_social || 'Sem Razão Social',
            razao_social: osc.razao_social || 'Sem Razão Social',
            cnpj: osc.cnpj || '',
            // Este campo preenche a coluna "CONTADOR ASSOCIADO" na sua tela
            contador_associado: osc.contador_nome || 'Não atribuído',
            // Como não existe o.status, enviamos 'Ativo' por padrão
            status: 'Ativo'
        }));

        console.log(`[Admin] Sucesso: ${formattedRows.length} OSCs enviadas.`);
        res.status(200).json(formattedRows);
    } catch (error) {
        console.error('[OSC Admin Error]:', error.sqlMessage || error);
        res.status(500).json({ message: 'Erro ao carregar lista de OSCs.' });
    }
};

/**
 * @desc    Lista OSCs vinculadas (Contador ou própria OSC)
 */
export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = `
            SELECT o.id, o.cnpj, o.razao_social, o.responsible, o.email
            FROM oscs o
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

        res.json(formatted);
    } catch (error) {
        console.error('[OSC MyOSCs Error]:', error);
        res.status(500).json({ message: 'Erro ao buscar OSCs vinculadas.' });
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
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno.' });
    }
};