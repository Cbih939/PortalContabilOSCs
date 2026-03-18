import pool from '../config/db.js';

// 1. Estatísticas do Dashboard (Com Radar de Erros)
export const getDashboardStats = async (req, res) => {
    try {
        const cid = req.user.id;
        
        // 1. Busca TODAS as OSCs do escritório
        const [oscs] = await pool.execute(`SELECT * FROM oscs WHERE assigned_contador_id = ?`, [cid]);
        const activeOSCs = oscs.length;

        if (activeOSCs === 0) {
            return res.json({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0, missingDocsList: [] });
        }

        // 2. Busca TODOS os documentos destas OSCs
        const [docs] = await pool.execute(`
            SELECT d.id, d.osc_id, d.original_name, d.ref_month, d.ref_year, d.status 
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ?
        `, [cid]);

        // A REGRA DE OURO: Se não for 'CONCLUIDO' e não for 'CONCLUSO TEC', então está pendente para o Contador validar!
        const pendingDocsList = docs.filter(d => !d.status || (d.status.toUpperCase() !== 'CONCLUIDO' && d.status.toUpperCase() !== 'CONCLUSO TEC'));
        const pendingDocs = pendingDocsList.length;

        // 3. Busca Mensagens não lidas
        const [msgs] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0', [cid]
        );
        const unreadMessages = msgs[0].total;

        // 4. Lógica do Calendário de Conformidade
        const missingDocsList = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); 
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        for (const osc of oscs) {
            const oscDocs = docs.filter(d => d.osc_id === osc.id);
            
            // Filtra os que aguardam validação desta OSC específica
            const pendingOscDocs = oscDocs.filter(d => !d.status || (d.status.toUpperCase() !== 'CONCLUIDO' && d.status.toUpperCase() !== 'CONCLUSO TEC'));
            
            let missingText = [];

            // Regra A: Aguardando Validação
            if (pendingOscDocs.length > 0) {
                missingText.push(`⏳ ${pendingOscDocs.length} doc(s) aguardando validação`);
            }

            // Regra B: Atrasos de meses anteriores
            const rawDate = osc.data_origem_estatuto || osc.dataOrigemEstatuto || osc.data_fundacao || osc.dataFundacao || osc.created_at || osc.createdAt;
            let oY = 2000, oM = 0;
            if (rawDate) {
                const d = new Date(rawDate);
                oY = d.getFullYear(); oM = d.getMonth();
            }

            let mesesAtraso = [];
            for (let i = 0; i < currentMonth; i++) {
                if (currentYear < oY || (currentYear === oY && i < oM)) continue; // Ignora meses antes de a OSC existir
                
                const monthNum = i + 1;
                const hasDoc = oscDocs.some(d => parseInt(d.ref_month) === monthNum && parseInt(d.ref_year) === currentYear);
                
                if (!hasDoc) {
                    mesesAtraso.push(monthNames[i]);
                }
            }

            if (mesesAtraso.length > 0) {
                missingText.push(`🔴 Atraso: ${mesesAtraso.join(', ')}`);
            }

            if (missingText.length > 0) {
                missingDocsList.push({
                    id: osc.id,
                    name: osc.razao_social || osc.name || 'OSC Desconhecida',
                    missing: missingText.join(' | ')
                });
            }
        }

        res.json({ activeOSCs, pendingDocs, unreadMessages, missingDocsList });

    } catch (error) {
        console.error('[Dashboard Stats Error]:', error);
        // O TRUQUE: Envia o erro de SQL para aparecer na tabela do seu ecrã!
        res.json({ 
            activeOSCs: 0, pendingDocs: 0, unreadMessages: 0, 
            missingDocsList: [{ id: 999, name: '🚨 ERRO NO BANCO DE DADOS', missing: error.message }] 
        });
    }
};

// 2. Atividade Recente (À Prova de Falhas)
export const getRecentActivity = async (req, res) => {
    try {
        const cid = req.user.id;
        const query = `
            SELECT 
                d.id, d.original_name, d.created_at, d.status,
                COALESCE(o.razao_social, o.name, 'OSC') as osc_name
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ?
            ORDER BY d.created_at DESC
            LIMIT 15
        `;

        const [rows] = await pool.execute(query, [cid]);

        const activities = rows.map(row => ({
            id: row.id,
            oscName: row.osc_name,
            content: `Novo documento submetido: ${row.original_name}`,
            timestamp: row.created_at,
            sender: `Usuário do Sistema` 
        }));

        res.json(activities);
    } catch (error) {
        console.error('[Activity Error]:', error);
        // O TRUQUE: O erro vai aparecer na lista de atividades!
        res.json([{ id: 999, oscName: '🚨 ERRO SQL', content: error.message, timestamp: new Date(), sender: 'Sistema' }]);
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