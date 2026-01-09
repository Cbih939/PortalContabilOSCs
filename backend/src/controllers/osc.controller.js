import pool from '../config/db.js';

export const getAllOSCs = async (req, res) => {
    try {
        console.log('--- [DEBUG ADMIN OSC] PROCESSANDO REQUISIÇÃO ---');

        // Query ajustada: buscamos especificamente o contador vinculado via assigned_contador_id
        // se a sua tabela usar esse campo para a relação Contador <-> OSC
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                o.email,
                u.name as nome_contador
            FROM oscs o
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `);

        const formattedRows = rows.map(osc => ({
            id: osc.id,
            // Campos que o React costuma usar em tabelas administrativas
            nome: osc.razao_social || 'Sem Razão Social',
            razao_social: osc.razao_social || 'Sem Razão Social',
            cnpj: osc.cnpj || '00.000.000/0000-00',
            email: osc.email || '',
            // Ajuste no nome do contador para garantir exibição
            contador_associado: osc.nome_contador || 'Pendente de Atribuição',
            status: 'Ativo'
        }));

        console.log(`[DEBUG] Enviando ${formattedRows.length} OSCs formatadas.`);
        return res.status(200).json(formattedRows);

    } catch (error) {
        console.error('!!! [DEBUG ADMIN OSC] ERRO SQL !!!', error.sqlMessage);
        return res.status(500).json({ message: 'Erro ao carregar lista de OSCs.' });
    }
};

export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = `
            SELECT o.*, u.name as contador_nome 
            FROM oscs o 
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `;
        const params = [];

        if (userRole === 'Contador') {
            query += ' WHERE o.assigned_contador_id = ?';
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
        return res.status(500).json({ message: 'Erro ao buscar OSCs.' });
    }
};

export const getOSCById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'OSC não encontrada.' });
        return res.status(200).json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno.' });
    }
};