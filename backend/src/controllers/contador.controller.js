import pool from '../config/db.js';

// 1. Dashboard Stats (Com proteção contra tabelas faltando)
export const getDashboardStats = async (req, res) => {
  try {
    const contadorId = req.user.id;
    let totalOSCs = 0, pendingDocs = 0, unreadMessages = 0;

    try {
        const [r1] = await pool.execute('SELECT COUNT(*) as t FROM oscs WHERE assigned_contador_id = ?', [contadorId]);
        totalOSCs = r1[0].t;
    } catch (e) {}

    try {
        const [r2] = await pool.execute(`SELECT COUNT(*) as t FROM documents d JOIN oscs o ON d.osc_id = o.id WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'`, [contadorId]);
        pendingDocs = r2[0].t;
    } catch (e) {}

    try {
        const [r3] = await pool.execute('SELECT COUNT(*) as t FROM messages WHERE receiver_id = ? AND is_read = 0', [contadorId]);
        unreadMessages = r3[0].t;
    } catch (e) {}

    res.json({ totalOSCs, pendingDocs, unreadMessages });
  } catch (error) {
    // Retorna zerado para não travar a tela com erro 500
    res.json({ totalOSCs: 0, pendingDocs: 0, unreadMessages: 0 }); 
  }
};

// 2. Minhas OSCs (CORRIGIDO: Usa LEFT JOIN)
export const getMyOSCs = async (req, res) => {
  try {
    const contadorId = req.user.id;
    
    // LEFT JOIN e COALESCE garantem que a lista aparece mesmo se o nome estiver null
    const query = `
      SELECT 
        o.id, 
        o.cnpj, 
        COALESCE(u.name, u.email, 'OSC (Nome Pendente)') as nome_osc,
        u.email,
        u.phone
      FROM oscs o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.assigned_contador_id = ?
    `;
    const [rows] = await pool.execute(query, [contadorId]);
    res.json(rows);
  } catch (error) {
    console.error('Erro getMyOSCs:', error);
    res.status(500).json({ message: 'Erro ao listar OSCs.' });
  }
};

// 3. Funções "Dummy" para as rotas não quebrarem
export const getNotifications = async (req, res) => res.json([]);
export const getRecentActivity = async (req, res) => res.json([]);
export const createOSC = async (req, res) => res.status(501).json({message: "Use a rota do admin"});