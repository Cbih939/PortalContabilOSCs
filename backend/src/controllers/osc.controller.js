// backend/src/controllers/osc.controller.js
import pool from '../config/db.js';

/**
 * @desc    Lista todas as OSCs para o Administrador (Compatível com ManageOSCs.jsx)
 */
// backend/src/controllers/osc.controller.js

export const getAllOSCs = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                u.name as contador_nome_sql
            FROM oscs o
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `);

        const formattedRows = rows.map(osc => ({
            id: osc.id,
            cnpj: osc.cnpj || '',
            // Ajuste para a Linha 82 e 117 do Frontend:
            name: osc.razao_social || 'Sem Razão Social', 
            // Ajuste para a Linha 83 e 119 do Frontend:
            contadorName: osc.contador_nome_sql || 'Nenhum',
            // Ajuste para a Linha 123 do Frontend:
            status: 'Ativo' 
        }));

        return res.status(200).json(formattedRows);
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno' });
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