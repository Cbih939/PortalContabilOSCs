// backend/src/controllers/osc.controller.js
import pool from '../config/db.js';

/**
 * @desc    Lista todas as OSCs para o Administrador (Compatível com ManageOSCs.jsx)
 */
export const getAllOSCs = async (req, res) => {
    try {
        console.log('[Admin] Buscando OSCs para renderização no Frontend...');

        // Query direta nas colunas confirmadas pelo seu DESCRIBE
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                u.name as nome_do_contador
            FROM oscs o
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `);

        // MAPEAMENTO CRÍTICO para o ManageOSCs.jsx não filtrar os resultados como vazios
        const formattedRows = rows.map(osc => ({
            id: osc.id,
            cnpj: osc.cnpj || '00.000.000/0000-00',
            // O Frontend busca por 'name' (Linhas 82 e 117 do ManageOSCs.jsx)
            name: osc.razao_social || 'Sem Razão Social', 
            // O Frontend busca por 'contadorName' (Linhas 83 e 119 do ManageOSCs.jsx)
            contadorName: osc.nome_do_contador || 'Nenhum',
            // O Frontend espera 'status' para o badge (Linha 123 do ManageOSCs.jsx)
            status: 'Ativo'
        }));

        console.log(`[Admin] Sucesso: Enviando ${formattedRows.length} OSCs formatadas.`);
        return res.status(200).json(formattedRows);

    } catch (error) {
        console.error('[OSC Admin Error]:', error.sqlMessage || error.message);
        return res.status(500).json({ message: 'Erro ao carregar lista de OSCs.' });
    }
};

/**
 * @desc    Associa um contador a uma OSC
 */
export const assignContador = async (req, res) => {
    try {
        const { id } = req.params;
        const { contadorId } = req.body;

        await pool.execute(
            'UPDATE oscs SET assigned_contador_id = ? WHERE id = ?',
            [contadorId === "null" ? null : contadorId, id]
        );

        const [updated] = await pool.execute('SELECT id, razao_social as name FROM oscs WHERE id = ?', [id]);
        
        return res.json({
            message: 'Sucesso',
            osc: updated[0]
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao associar.' });
    }
};

// ... Mantenha getMyOSCs e getOSCById simplificados
export const getMyOSCs = async (req, res) => {
    const [rows] = await pool.execute('SELECT id, razao_social as name, cnpj FROM oscs');
    res.json(rows);
};

export const getOSCById = async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
};