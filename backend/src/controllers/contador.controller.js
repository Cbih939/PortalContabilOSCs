import pool from '../config/db.js';

// 1. Estatísticas do Dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const cid = req.user.id;
        console.log(`[Dashboard] ID do Contador logado: ${cid}`);

        let oscs = 0, docs = 0, msgs = 0;

        // CONTAR OSCs ATIVAS
        // A query verifica OSCs do contador (ID 2) onde o status do usuário é 'Ativo'
        const [r1] = await pool.execute(`
            SELECT COUNT(o.id) as total 
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ? 
            AND (u.status = 'Ativo' OR u.status IS NULL)
        `, [cid]);
        
        oscs = r1[0].total;
        console.log(`[Dashboard] Total de OSCs encontradas: ${oscs}`);

        // CONTAR DOCUMENTOS PENDENTES
        // Conta documentos das OSCs deste contador que estão 'Pendente'
        const [r2] = await pool.execute(`
            SELECT COUNT(d.id) as total 
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'
        `, [cid]);
        
        docs = r2[0].total;

        // CONTAR MENSAGENS NÃO LIDAS
        const [r3] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0', 
            [cid]
        );
        msgs = r3[0].total;

        res.json({ totalOSCs: oscs, pendingDocs: docs, unreadMessages: msgs });

    } catch (error) {
        console.error('[Dashboard] Erro fatal:', error);
        res.json({ totalOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
    }
};

/// 2. Atividade Recente (Com Logs de Debug)
export const getRecentActivity = async (req, res) => {
    try {
        const cid = req.user.id;
        
        // Query robusta para buscar documentos
        const query = `
            SELECT 
                d.id, 
                d.original_name, 
                d.created_at, 
                d.status,
                COALESCE(o.razao_social, u.name, 'OSC Desconhecida') as osc_name
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            LEFT JOIN users u ON d.uploaded_by_user_id = u.id
            WHERE o.assigned_contador_id = ?
            ORDER BY d.created_at DESC
            LIMIT 10
        `;

        const [rows] = await pool.execute(query, [cid]);

        // Formata e adiciona LOG para debug
        const activities = rows.map(row => ({
            id: row.id,
            description: `A ${row.osc_name} enviou o documento ${row.original_name}`,
            date: row.created_at, // O frontend deve formatar a data
            type: 'document_upload', // Tipo fixo para ícone
            status: row.status
        }));

        console.log(`[Activity] Enviando ${activities.length} atividades para o frontend.`);
        
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