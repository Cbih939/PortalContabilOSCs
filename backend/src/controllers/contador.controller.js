import pool from '../config/db.js';

// 1. Estatísticas do Dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const cid = req.user.id;
        let oscs = 0, docs = 0, msgs = 0;

        // 1. Contar OSCs ATIVAS vinculadas a este contador
        try {
            const [r1] = await pool.execute(`
                SELECT COUNT(o.id) as total 
                FROM oscs o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.assigned_contador_id = ? 
                AND (u.status = 'Ativo' OR u.status IS NULL)
            `, [cid]);
            oscs = r1[0].total;
        } catch (e) { console.error('[Dashboard] Erro Count OSCs:', e.message); }

        // 2. Contar Documentos Pendentes
        try {
            const [r2] = await pool.execute(`
                SELECT COUNT(d.id) as t 
                FROM documents d
                JOIN oscs o ON d.osc_id = o.id
                WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'
            `, [cid]);
            docs = r2[0].t;
        } catch (e) { console.error('[Dashboard] Erro Count Docs:', e.message); }

        // 3. Contar Mensagens não lidas
        try {
            const [r3] = await pool.execute(
                'SELECT COUNT(*) as t FROM messages WHERE receiver_id = ? AND is_read = 0', 
                [cid]
            );
            msgs = r3[0].t;
        } catch (e) { console.error('[Dashboard] Erro Count Msgs:', e.message); }

        res.json({ totalOSCs: oscs, pendingDocs: docs, unreadMessages: msgs });

    } catch (error) {
        console.error('Erro Fatal Dashboard:', error);
        res.json({ totalOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
    }
};

// 2. Atividade Recente (Envio de Documentos)
export const getRecentActivity = async (req, res) => {
    try {
        const cid = req.user.id;

        // Busca os 5 últimos documentos.
        // Usa COALESCE para pegar a Razão Social OU o Nome do Usuário se a razão for nula.
        const query = `
            SELECT 
                d.id, 
                d.original_name, 
                d.created_at, 
                d.status,
                COALESCE(o.razao_social, u.name, 'OSC Desconhecida') as osc_name
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ?
            ORDER BY d.created_at DESC
            LIMIT 5
        `;

        const [rows] = await pool.execute(query, [cid]);

        // Formata a resposta
        const activities = rows.map(row => ({
            id: row.id,
            description: `A ${row.osc_name} enviou o documento ${row.original_name}`,
            date: row.created_at,
            type: 'document_upload',
            status: row.status
        }));

        res.json(activities);

    } catch (error) {
        console.error('Erro Activity:', error);
        res.status(500).json([]);
    }
};

// 3. Minhas OSCs (Lista completa)
export const getMyOSCs = async (req, res) => {
    try {
        // Traz lista com fallback de nome também
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.cnpj, 
                COALESCE(o.razao_social, u.name, 'Sem Nome') as name, 
                o.email, 
                o.phone,
                u.status as status
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ?
        `, [req.user.id]);
        
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Erro ao buscar OSCs" });
    }
};