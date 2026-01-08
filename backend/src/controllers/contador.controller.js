import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
    try {
        const cid = req.user.id;
        let oscs = 0, docs = 0, msgs = 0;

        // 1. Contar OSCs vinculadas
        try {
            const [r1] = await pool.execute(
                'SELECT COUNT(*) as t FROM oscs WHERE assigned_contador_id = ?', 
                [cid]
            );
            oscs = r1[0].t;
        } catch (e) { console.log('Erro OSCs stats:', e.message); }

        // 2. Contar Documentos Pendentes
        try {
            // Nota: O dump mostra que a coluna é 'to_contador_id' na tabela documents, 
            // ou podemos ligar via OSC. Vamos pelo mais seguro (JOIN).
            const [r2] = await pool.execute(`
                SELECT COUNT(*) as t 
                FROM documents d
                JOIN oscs o ON d.osc_id = o.id
                WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'
            `, [cid]);
            docs = r2[0].t;
        } catch (e) { console.log('Erro Docs stats:', e.message); }

        // 3. Contar Mensagens não lidas
        try {
            const [r3] = await pool.execute(
                'SELECT COUNT(*) as t FROM messages WHERE receiver_id = ? AND is_read = 0', 
                [cid]
            );
            msgs = r3[0].t;
        } catch (e) { console.log('Erro Msgs stats:', e.message); }

        res.json({ totalOSCs: oscs, pendingDocs: docs, unreadMessages: msgs });

    } catch (error) {
        console.error('Erro Dashboard:', error);
        res.json({ totalOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
    }
};

export const getMyOSCs = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT id, cnpj, razao_social as name, email, phone 
             FROM oscs 
             WHERE assigned_contador_id = ?`,
            [req.user.id]
        );
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Erro ao buscar OSCs" });
    }
};