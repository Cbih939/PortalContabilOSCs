import pool from '../config/db.js';

export const getHistoricoPagamentos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id,
                u.name AS osc_name,
                u.cnpj,
                p.payment_date,
                p.amount,
                DATE_FORMAT(p.payment_date, '%m/%Y') AS competencia
            FROM payments p
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'succeeded'
            ORDER BY p.payment_date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar histórico." });
    }
};