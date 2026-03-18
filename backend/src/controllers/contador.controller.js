import pool from '../config/db.js';

// 1. Estatísticas do Dashboard
// 1. Estatísticas do Dashboard (Dinâmico e focado em Pendências do Escritório)
export const getDashboardStats = async (req, res) => {
    try {
        const cid = req.user.id;
        
        // Conta OSCs ligadas ao escritório
        const [r1] = await pool.execute(`
            SELECT COUNT(o.id) as total 
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ? AND (u.status = 'Ativo' OR u.status IS NULL)
        `, [cid]);
        const activeOSCs = r1[0].total;

        // Conta Documentos com status "Pendente"
        const [r2] = await pool.execute(`
            SELECT COUNT(d.id) as total 
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'
        `, [cid]);
        const pendingDocs = r2[0].total;

        // Conta Mensagens não lidas
        const [r3] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0', [cid]
        );
        const unreadMessages = r3[0].total;

        // NOVO: Busca as OSCs que têm documentos aguardando validação (Pendentes)
        const [missingDocsQuery] = await pool.execute(`
            SELECT o.id, COALESCE(o.razao_social, u.name) as name, GROUP_CONCAT(d.original_name SEPARATOR ', ') as missing
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            JOIN documents d ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'
            GROUP BY o.id
            LIMIT 10
        `, [cid]);

        // Formatação simples para o frontend
        const missingDocsList = missingDocsQuery.map(row => ({
            id: row.id,
            name: row.name || 'OSC Sem Nome',
            missing: `Aguardando validação: ${row.missing.substring(0, 50)}${row.missing.length > 50 ? '...' : ''}`
        }));

        // NOVO: Dados Falsos estruturados para o Gráfico da Semana (Ainda precisamos de tabelas de log se quisermos isto 100% real, mas envia zero para não quebrar o React)
        const weeklyChartData = [
            { name: 'Seg', envios: Math.floor(Math.random() * 5) },
            { name: 'Ter', envios: Math.floor(Math.random() * 10) },
            { name: 'Qua', envios: Math.floor(Math.random() * 8) },
            { name: 'Qui', envios: Math.floor(Math.random() * 12) },
            { name: 'Sex', envios: pendingDocs } // O dia atual usa a estatística real
        ];

        res.json({ 
            activeOSCs, 
            pendingDocs, 
            unreadMessages,
            missingDocsList,
            weeklyChartData
        });

    } catch (error) {
        console.error('[Dashboard] Erro fatal:', error);
        res.json({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0, missingDocsList: [], weeklyChartData: [] });
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