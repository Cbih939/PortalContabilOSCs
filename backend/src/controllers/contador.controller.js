import pool from '../config/db.js';

// 1. Estatísticas do Dashboard (Foco em Ação e Conformidade)
export const getDashboardStats = async (req, res) => {
    try {
        const cid = req.user.id;
        
        // 1. Conta OSCs Ativas (Sem filtro de status que estava a bloquear a contagem)
        const [oscs] = await pool.execute(`
            SELECT id, COALESCE(razao_social, name) as name, data_origem_estatuto, data_fundacao, created_at 
            FROM oscs 
            WHERE assigned_contador_id = ?
        `, [cid]);
        
        const activeOSCs = oscs.length;

        if (activeOSCs === 0) {
            return res.json({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0, missingDocsList: [] });
        }

        // 2. Busca todos os documentos destas OSCs para análise
        const [docs] = await pool.execute(`
            SELECT d.id, d.osc_id, d.ref_month, d.ref_year, d.status, d.doc_type 
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ?
        `, [cid]);

        // Conta documentos aguardando validação
        const pendingDocs = docs.filter(d => d.status && d.status.toLowerCase() === 'pendente').length;

        // 3. Conta Mensagens não lidas
        const [msgs] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0', [cid]
        );
        const unreadMessages = msgs[0].total;

        // 4. Lógica Inteligente de Pendências (Cruza com o seu Calendário)
        const missingDocsList = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); // 0 a 11
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        for (const osc of oscs) {
            const oscDocs = docs.filter(d => d.osc_id === osc.id);
            const pendingOscDocs = oscDocs.filter(d => d.status && d.status.toLowerCase() === 'pendente');
            
            let missingText = [];

            // A. Regra de Aguardando Validação
            if (pendingOscDocs.length > 0) {
                missingText.push(`⏳ ${pendingOscDocs.length} doc(s) aguardando validação`);
            }

            // B. Regra de Atraso (Meses passados sem documentos)
            const rawDate = osc.data_origem_estatuto || osc.data_fundacao || osc.created_at;
            let oY = 2000, oM = 0;
            if (rawDate) {
                const d = new Date(rawDate);
                oY = d.getFullYear(); oM = d.getMonth();
            }

            let mesesAtraso = [];
            for (let i = 0; i < currentMonth; i++) { // Avalia até ao mês passado
                if (currentYear < oY || (currentYear === oY && i < oM)) continue; // Pre-origem
                
                const monthNum = i + 1;
                const hasDoc = oscDocs.some(d => parseInt(d.ref_month) === monthNum && parseInt(d.ref_year) === currentYear);
                
                if (!hasDoc) {
                    mesesAtraso.push(monthNames[i]);
                }
            }

            if (mesesAtraso.length > 0) {
                missingText.push(`🔴 Atraso: ${mesesAtraso.join(', ')}`);
            }

            // Se tem alguma pendência, adiciona à tabela de ação
            if (missingText.length > 0) {
                missingDocsList.push({
                    id: osc.id,
                    name: osc.name || 'OSC Sem Nome',
                    missing: missingText.join(' | ')
                });
            }
        }

        res.json({ activeOSCs, pendingDocs, unreadMessages, missingDocsList });

    } catch (error) {
        console.error('[Dashboard] Erro fatal:', error);
        res.json({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0, missingDocsList: [] });
    }
};

// 2. Atividade Recente (Buscando QUEM enviou o arquivo)
export const getRecentActivity = async (req, res) => {
    try {
        const cid = req.user.id;
        const query = `
            SELECT 
                d.id, d.original_name, d.created_at, 
                COALESCE(o.razao_social, o.name, 'OSC') as osc_name,
                COALESCE(u.name, 'Sistema') as sender_name,
                u.role as sender_role
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE o.assigned_contador_id = ?
            ORDER BY d.created_at DESC
            LIMIT 15
        `;

        const [rows] = await pool.execute(query, [cid]);

        const activities = rows.map(row => {
            const roleTag = row.sender_role ? ` (${row.sender_role})` : '';
            return {
                id: row.id,
                oscName: row.osc_name,
                content: `Enviou o documento: ${row.original_name}`,
                timestamp: row.created_at,
                sender: `${row.sender_name}${roleTag}`
            };
        });

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