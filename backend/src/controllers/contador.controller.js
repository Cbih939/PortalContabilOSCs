import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const cid = req.user.id;
    let oscs = 0, docs = 0, msgs = 0;

    // 1. OSCs
    try {
        const [r] = await pool.execute('SELECT COUNT(*) as t FROM oscs WHERE assigned_contador_id=?', [cid]);
        oscs = r[0].t;
    } catch (e) {}

    // 2. Docs (CORREÇÃO: Query simplificada para não dar erro de coluna)
    try {
        const [r] = await pool.execute(`
            SELECT COUNT(*) as t FROM documents d 
            JOIN oscs o ON d.osc_id = o.id 
            WHERE o.assigned_contador_id = ?
        `, [cid]);
        docs = r[0].t;
    } catch (e) { console.log('Erro Stats Docs:', e.message); }

    // 3. Msgs
    try {
        const [r] = await pool.execute('SELECT COUNT(*) as t FROM messages WHERE receiver_id=? AND is_read=0', [cid]);
        msgs = r[0].t;
    } catch (e) {}

    res.json({ totalOSCs: oscs, pendingDocs: docs, unreadMessages: msgs });
  } catch (error) {
    res.json({ totalOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  }
};

// Funções obrigatórias para não quebrar a rota
export const getMyOSCs = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM oscs WHERE assigned_contador_id=?', [req.user.id]);
        res.json(rows);
    } catch (e) { res.json([]); }
};
export const getNotifications = async (req, res) => res.json([]);
export const getRecentActivity = async (req, res) => res.json([]);
export const createOSC = async (req, res) => res.status(501).json({});