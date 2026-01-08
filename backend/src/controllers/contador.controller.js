import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const cid = req.user.id;
    let oscs = 0, docs = 0, msgs = 0;

    // 1. Total OSCs
    try {
        const [r] = await pool.execute('SELECT COUNT(*) as t FROM oscs WHERE assigned_contador_id=?', [cid]);
        oscs = r[0].t;
    } catch (e) { console.log('Erro Stats OSC:', e.message); }

    // 2. Docs Pendentes (CORRIGIDO: Removido filtro de status que dava erro)
    try {
        // Apenas conta documentos das OSCs vinculadas, sem filtrar por status 'Pendente' para evitar erro de coluna
        const [r] = await pool.execute(`
            SELECT COUNT(*) as t FROM documents d 
            JOIN oscs o ON d.osc_id = o.id 
            WHERE o.assigned_contador_id = ?
        `, [cid]);
        docs = r[0].t;
    } catch (e) { console.log('Erro Stats Docs:', e.message); }

    // 3. Mensagens não lidas
    try {
        // Verifica se tabela messages existe antes de tentar
        const [r] = await pool.execute('SELECT COUNT(*) as t FROM messages WHERE receiver_id=? AND is_read=0', [cid]);
        msgs = r[0].t;
    } catch (e) { 
        // Se a tabela messages não existir, ignora
        console.log('Tabela messages não encontrada ou vazia.'); 
    }

    res.json({ totalOSCs: oscs, pendingDocs: docs, unreadMessages: msgs });
  } catch (error) {
    console.error('Erro Geral Dashboard:', error);
    // Retorna zerado para o painel abrir mesmo com erro
    res.json({ totalOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  }
};

export const getMyOSCs = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT o.id, o.cnpj, COALESCE(u.name, 'OSC') as name, u.email, u.phone 
            FROM oscs o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE o.assigned_contador_id=?`, 
            [req.user.id]
        );
        res.json(rows);
    } catch (e) { res.status(500).json({message: 'Erro'}); }
};

// Funções auxiliares (Placeholders para não quebrar rotas)
export const getNotifications = async (req, res) => res.json([]);
export const getRecentActivity = async (req, res) => res.json([]);
export const createOSC = async (req, res) => res.status(501).json({});