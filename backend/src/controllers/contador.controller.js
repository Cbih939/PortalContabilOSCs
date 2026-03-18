import pool from '../config/db.js';

// 1. Estatísticas do Dashboard (À Prova de Balas e Inteligente)
export const getDashboardStats = async (req, res) => {
    try {
        const cid = req.user.id;
        
        // 1. Buscar todas as OSCs ligadas a este escritório (SELECT * evita erros de colunas)
        const [oscs] = await pool.execute(`SELECT * FROM oscs WHERE assigned_contador_id = ?`, [cid]);
        const activeOSCs = oscs.length;

        if (activeOSCs === 0) {
            return res.json({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0, missingDocsList: [] });
        }

        // 2. Buscar todos os documentos dessas OSCs
        const [docs] = await pool.execute(`
            SELECT d.* FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            WHERE o.assigned_contador_id = ?
        `, [cid]);

        // Contar quantos estão pendentes
        const pendingDocs = docs.filter(d => d.status && d.status.toLowerCase() === 'pendente').length;

        // 3. Buscar Mensagens não lidas
        const [msgs] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0', [cid]
        );
        const unreadMessages = msgs[0].total;

        // 4. Lógica Inteligente de Pendências (Mapeia o seu Calendário)
        const missingDocsList = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); // 0 (Jan) a 11 (Dez)
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        for (const osc of oscs) {
            const oscDocs = docs.filter(d => d.osc_id === osc.id);
            const pendingOscDocs = oscDocs.filter(d => d.status && d.status.toLowerCase() === 'pendente');
            
            let missingText = [];

            // Regra A: Tem documentos que o Contador precisa de validar (Verdes)
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
            // Avalia os meses desde Janeiro até ao mês passado (não cobra o mês atual)
            for (let i = 0; i < currentMonth; i++) {
                if (currentYear < oY || (currentYear === oY && i < oM)) continue; // Ignora meses antes da fundação
                
                const monthNum = i + 1;
                // Verifica se existe algum documento para aquele mês/ano
                const hasDoc = oscDocs.some(d => parseInt(d.ref_month) === monthNum && parseInt(d.ref_year) === currentYear);
                
                if (!hasDoc) {
                    mesesAtraso.push(monthNames[i]);
                }
            }

            if (mesesAtraso.length > 0) {
                missingText.push(`🔴 Atraso: ${mesesAtraso.join(', ')}`);
            }

            // Se tiver pendência ou atraso, entra na tabela!
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
        res.json({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0, missingDocsList: [] });
    }
};

// 2. Atividade Recente (Query exata que funciona no seu banco)
export const getRecentActivity = async (req, res) => {
    try {
        const cid = req.user.id;
        const query = `
            SELECT 
                d.id, d.original_name, d.created_at, d.status,
                COALESCE(o.razao_social, u.name, u.email, 'OSC Desconhecida') as osc_name
            FROM documents d
            JOIN oscs o ON d.osc_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ?
            ORDER BY d.created_at DESC
            LIMIT 15
        `;

        const [rows] = await pool.execute(query, [cid]);

        const activities = rows.map(row => ({
            id: row.id,
            oscName: row.osc_name,
            content: `Enviou o documento: ${row.original_name}`,
            timestamp: row.created_at,
            sender: row.osc_name // Assumimos que foi a OSC a enviar
        }));

        res.json(activities);
    } catch (error) {
        console.error('[Activity Error]:', error);
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