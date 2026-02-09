import pool from '../config/db.js';

// 1. Estatísticas do Dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const cid = req.user.id;
        
        // CONTAR OSCs ATIVAS
        const [r1] = await pool.execute(`
            SELECT COUNT(o.id) as total 
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ? 
            AND (u.status = 'Ativo' OR u.status IS NULL)
        `, [cid]);
        const oscs = r1[0].total;

        // CONTAR DOCUMENTOS PENDENTES .
        const [r2] = await pool.execute(`
            SELECT COUNT(d.id) as total 
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'
        `, [cid]);
        const docs = r2[0].total;

        // CONTAR MENSAGENS NÃO LIDAS
        const [r3] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0', 
            [cid]
        );
        const msgs = r3[0].total;

        res.json({ activeOSCs: oscs, pendingDocs: docs, unreadMessages: msgs });

    } catch (error) {
        console.error('[Dashboard] Erro fatal:', error);
        res.json({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
    }
};

// 2. Atividade Recente (AJUSTADO PARA O SEU REACT)
export const getRecentActivity = async (req, res) => {
    try {
        const cid = req.user.id;

        const query = `
            SELECT 
                d.id, 
                d.original_name, 
                d.created_at, 
                d.status,
                COALESCE(o.razao_social, u.name, u.email, 'OSC Desconhecida') as osc_name
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ?
            ORDER BY d.created_at DESC
            LIMIT 10
        `;

        const [rows] = await pool.execute(query, [cid]);

        // Mapeamento EXATO para o seu ContadorDashboard.jsx
        const activities = rows.map(row => ({
            id: row.id,
            oscName: row.osc_name,        // O React espera 'oscName'
            content: row.original_name,   // O React espera 'content' (nome do arquivo)
            timestamp: row.created_at,    // O React espera 'timestamp'
            type: 'file',                 // O React verifica: item.type === 'file'
            status: row.status
        }));

        console.log(`[Activity] Enviando ${activities.length} itens formatados para o React.`);
        res.json(activities);

    } catch (error) {
        console.error('[Activity] Erro:', error);
        res.status(500).json([]);
    }
};

// 3. Minhas OSCs
export const getMyOSCs = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT o.*, u.status 
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ?
        `, [req.user.id]);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ message: "Erro ao buscar OSCs" });
    }
};