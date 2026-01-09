import pool from '../config/db.js';

export const getAllOSCs = async (req, res) => {
    try {
        console.log('[Admin] Iniciando busca global de OSCs...');

        // Query BASE (apenas o que existe no seu DESCRIBE)
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                u.name as nome_contador
            FROM oscs o
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `);

        // MAPEAMENTO PARA O FRONTEND
        const formattedRows = rows.map(osc => ({
            id: osc.id,
            // O React busca por estas chaves para preencher as colunas:
            razao_social: osc.razao_social || 'Sem Nome',
            nome: osc.razao_social || 'Sem Nome', 
            cnpj: osc.cnpj || '00.000.000/0000-00',
            contador_associado: osc.nome_contador || 'Pendente',
            status: 'Ativo' // Injetamos manual pois a coluna não existe no banco
        }));

        console.log(`[Admin] Sucesso: Enviando ${formattedRows.length} OSCs.`);
        return res.status(200).json(formattedRows);

    } catch (error) {
        console.error('[OSC Admin Error]:', error.sqlMessage || error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

// Mantenha getMyOSCs e getOSCById conforme anteriormente
export const getMyOSCs = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, razao_social as name, cnpj FROM oscs');
        res.json(rows);
    } catch (e) { res.status(500).send(); }
};

export const getOSCById = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (e) { res.status(500).send(); }
};