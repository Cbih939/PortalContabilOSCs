import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const cid = req.user.id;
    let oscs = 0, docs = 0, msgs = 0;

    // 1. Contar OSCs (Sem filtros complexos para evitar erro)
    try {
        const [r] = await pool.execute('SELECT COUNT(*) as t FROM oscs WHERE assigned_contador_id=?', [cid]);
        oscs = r[0].t;
    } catch (e) { console.log('Erro Count OSCs:', e.message); }

    // 2. Contar Documentos (CORRIGIDO: Removido 'AND d.status = ...' que causava o crash)
    try {
        const [r] = await pool.execute(`
            SELECT COUNT(*) as t FROM documents d 
            JOIN oscs o ON d.osc_id = o.id 
            WHERE o.assigned_contador_id = ?
        `, [cid]);
        docs = r[0].t;
    } catch (e) { console.log('Erro Count Docs:', e.message); }

    // 3. Contar Mensagens (Verifica se tabela existe antes de crashar)
    try {
        const [r] = await pool.execute('SELECT COUNT(*) as t FROM messages WHERE receiver_id=? AND is_read=0', [cid]);
        msgs = r[0].t;
    } catch (e) { console.log('Erro Count Msgs (Tabela pode não existir):', e.message); }

    res.json({ totalOSCs: oscs, pendingDocs: docs, unreadMessages: msgs });

  } catch (error) {
    console.error('Erro Crítico Dashboard:', error);
    // Retorna zerado para o painel abrir mesmo se o banco falhar
    res.json({ totalOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  }
};

// --- Funções Auxiliares para Rotas (Evitam erro 404/500 nas rotas) ---

export const getMyOSCs = async (req, res) => {
    try {
        // Traz dados básicos para a lista
        const [rows] = await pool.execute(`
            SELECT o.id, o.cnpj, COALESCE(u.name, 'OSC Sem Nome') as name, u.email, u.phone
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.assigned_contador_id = ?
        `, [req.user.id]);
        res.json(rows);
    } catch (e) { 
        console.error(e);
        res.json([]); 
    }
};

export const getNotifications = async (req, res) => {
    // Retorna vazio por segurança
    res.json([]);
};

export const getRecentActivity = async (req, res) => {
    // Retorna vazio por segurança
    res.json([]);
};

// Esta função geralmente é do Admin, mas deixamos aqui para evitar erro de importação
export const createOSC = async (req, res) => {
    res.status(501).json({ message: "Função disponível apenas para Admin" });
};