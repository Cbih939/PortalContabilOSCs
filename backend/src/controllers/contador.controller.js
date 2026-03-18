import pool from '../config/db.js';

// 1. Estatísticas do Dashboard
// 1. Estatísticas do Dashboard (Foco total em Documentação)
export const getDashboardStats = async (req, res) => {
    try {
        const cid = req.user.id;
        
        // Conta OSCs ativas ligadas ao escritório
        const [r1] = await pool.execute(`
            SELECT COUNT(o.id) as total 
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ? AND (u.status = 'Ativo' OR u.status IS NULL)
        `, [cid]);
        const activeOSCs = r1[0].total;

        // Conta todos os documentos com status "Pendente" do escritório
        const [r2] = await pool.execute(`
            SELECT COUNT(d.id) as total 
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'
        `, [cid]);
        const pendingDocs = r2[0].total;

        // Conta Mensagens não lidas para o contador
        const [r3] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0', [cid]
        );
        const unreadMessages = r3[0].total;

        // Busca OSCs que têm documentos "Pendentes" (Aguardando Validação)
        const [missingDocsQuery] = await pool.execute(`
            SELECT o.id, COALESCE(o.razao_social, u.name) as name, 
                   COUNT(d.id) as pending_count,
                   GROUP_CONCAT(d.original_name SEPARATOR ', ') as missing
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            JOIN documents d ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'
            GROUP BY o.id
            ORDER BY pending_count DESC
            LIMIT 15
        `, [cid]);

        const missingDocsList = missingDocsQuery.map(row => ({
            id: row.id,
            name: row.name || 'OSC Sem Nome',
            missing: `Aguardando validação: ${row.pending_count} documento(s) (${row.missing.substring(0, 50)}${row.missing.length > 50 ? '...' : ''})`
        }));

        res.json({ 
            activeOSCs, 
            pendingDocs, 
            unreadMessages,
            missingDocsList
        });

    } catch (error) {
        console.error('[Dashboard] Erro fatal:', error);
        res.json({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0, missingDocsList: [] });
    }
};

// 2. Atividade Recente (Buscando quem enviou o documento)
export const getRecentActivity = async (req, res) => {
    try {
        const cid = req.user.id;

        const query = `
            SELECT 
                d.id, 
                d.original_name, 
                d.created_at, 
                d.status,
                COALESCE(o.razao_social, u_osc.name, u_osc.email, 'OSC Desconhecida') as osc_name,
                COALESCE(u_uploader.name, 'Usuário do Sistema') as sender_name
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            LEFT JOIN users u_osc ON o.user_id = u_osc.id
            LEFT JOIN users u_uploader ON d.uploaded_by = u_uploader.id
            WHERE o.assigned_contador_id = ?
            ORDER BY d.created_at DESC
            LIMIT 15
        `;

        const [rows] = await pool.execute(query, [cid]);

        const activities = rows.map(row => ({
            id: row.id,
            oscName: row.osc_name,
            content: `Novo documento: ${row.original_name}`,
            timestamp: row.created_at,
            type: 'file',
            status: row.status,
            sender_name: row.sender_name // Nome de quem enviou
        }));

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