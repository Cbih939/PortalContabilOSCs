import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
    try {
        // 🔥 VOLTAMOS À RECEITA QUE FUNCIONA NO "MINHAS OSCs"
        const contadorId = req.user.id;
        
        // 1. Busca OSCs usando o id normal do contador
        const [oscs] = await pool.execute(`
            SELECT o.* FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ?
        `, [contadorId]);

        const activeOSCs = oscs.length;

        if (activeOSCs === 0) {
            const [msgs] = await pool.execute('SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0', [contadorId]);
            return res.json({ activeOSCs: 0, pendingDocs: 0, unreadMessages: msgs[0].total || 0, missingDocsList: [], _debug: 'ID_DO_CONTADOR' });
        }

        // 2. Busca Documentos
        const [docs] = await pool.execute(`
            SELECT d.id, d.osc_id, d.original_name, d.ref_month, d.ref_year, d.status 
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ?
        `, [contadorId]);

        // 3. Busca Mensagens
        const [msgs] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0', [contadorId]
        );
        const unreadMessages = msgs[0].total || 0;

        // Conta pendentes gerais
        const pendingDocsList = docs.filter(d => {
            const st = d.status ? String(d.status).toUpperCase() : 'PENDENTE';
            return st !== 'CONCLUIDO' && st !== 'CONCLUSO TEC';
        });
        const pendingDocs = pendingDocsList.length;

        // 4. Motor do Calendário
        const missingDocsList = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); 
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        for (const osc of oscs) {
            const oscDocs = docs.filter(d => d.osc_id === osc.id);
            
            const pendingOscDocs = oscDocs.filter(d => {
                const st = d.status ? String(d.status).toUpperCase() : 'PENDENTE';
                return st !== 'CONCLUIDO' && st !== 'CONCLUSO TEC';
            });
            
            let missingText = [];

            if (pendingOscDocs.length > 0) {
                missingText.push(`⏳ ${pendingOscDocs.length} doc(s) aguardando validação`);
            }

            const rawDate = osc.data_origem_estatuto || osc.dataOrigemEstatuto || osc.data_fundacao || osc.dataFundacao || osc.created_at || osc.createdAt;
            let oY = 2000, oM = 0;
            if (rawDate) {
                const d = new Date(rawDate);
                oY = d.getFullYear(); oM = d.getMonth();
            }

            let mesesAtraso = [];
            for (let i = 0; i < currentMonth; i++) {
                if (currentYear < oY || (currentYear === oY && i < oM)) continue; 
                
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

        res.json({ activeOSCs, pendingDocs, unreadMessages, missingDocsList, _debug: 'ID_DO_CONTADOR' });

    } catch (error) {
        console.error('[Dashboard Stats Error]:', error);
        res.status(500).json({ message: "Erro ao calcular estatísticas." });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const contadorId = req.user.id; // 🔥 ID DO CONTADOR
        
        const query = `
            SELECT 
                d.id, d.original_name, d.created_at, d.status,
                COALESCE(o.razao_social, u.name, 'OSC') as osc_name
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ?
            ORDER BY d.created_at DESC
            LIMIT 15
        `;

        const [rows] = await pool.execute(query, [contadorId]);

        const activities = rows.map(row => ({
            id: row.id,
            oscName: row.osc_name,
            content: `Documento recebido: ${row.original_name}`,
            timestamp: row.created_at,
            sender: `Painel da OSC` 
        }));

        res.json(activities);
    } catch (error) {
        console.error('[Activity Error]:', error);
        res.status(500).json({ message: "Erro ao buscar atividades." });
    }
};

// 3. Minhas OSCs (A sua função original, intocada e funcional)
export const getMyOSCs = async (req, res) => {
    try {
        const contadorId = req.user.id;

        const [oscs] = await pool.execute(`
            SELECT o.*, u.status 
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ?
        `, [contadorId]);

        if (oscs.length === 0) return res.json([]);

        const [docs] = await pool.execute(`
            SELECT d.* FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ?
        `, [contadorId]);

        const formattedOscs = oscs.map(osc => ({
            ...osc,
            documents: docs.filter(d => d.osc_id === osc.id)
        }));

        res.json(formattedOscs);
    } catch (e) {
        console.error('[Contador getMyOSCs Error]:', e);
        res.status(500).json({ message: "Erro ao buscar OSCs" });
    }
};