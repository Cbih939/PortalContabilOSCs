import pool from '../config/db.js';

export const getAllOSCs = async (req, res) => {
    try {
        console.log('[Admin] Buscando OSCs para renderização no Frontend...');

        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                u.name as nome_contador
            FROM oscs o
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `);

        // MAPEAMENTO EXATO PARA O SEU ManageOSCs.jsx
        const formattedRows = rows.map(osc => ({
            id: osc.id,
            cnpj: osc.cnpj || '',
            // O Frontend espera 'name' (Linha 117 e Filtro Linha 82)
            name: osc.razao_social || 'Sem Razão Social', 
            // O Frontend espera 'contadorName' (Linha 119 e Filtro Linha 83)
            contadorName: osc.nome_contador || 'Nenhum',
            // O Frontend espera 'status' (Linha 123)
            status: 'Ativo'
        }));

        console.log(`[Admin] Sucesso: Encontradas ${formattedRows.length} OSCs.`);
        return res.status(200).json(formattedRows);

    } catch (error) {
        console.error('[OSC Admin Error]:', error.sqlMessage || error);
        return res.status(500).json({ message: 'Erro interno' });
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