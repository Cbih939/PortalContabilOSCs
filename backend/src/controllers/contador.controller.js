import pool from '../config/db.js';

// 1. Dashboard Stats (Blindado contra falhas)
export const getDashboardStats = async (req, res) => {
  try {
    const contadorId = req.user.id;

    // Estatística 1: Total de OSCs
    let totalOSCs = 0;
    try {
        const [oscRows] = await pool.execute(
            'SELECT COUNT(*) as total FROM oscs WHERE assigned_contador_id = ?',
            [contadorId]
        );
        totalOSCs = oscRows[0].total;
    } catch (e) { console.error("Erro contagem OSCs:", e.message); }

    // Estatística 2: Documentos
    let pendingDocs = 0;
    try {
        const [docRows] = await pool.execute(
        `SELECT COUNT(*) as total FROM documents d
         JOIN oscs o ON d.osc_id = o.id
         WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'`,
        [contadorId]
        );
        pendingDocs = docRows[0].total;
    } catch (e) { }

    // Estatística 3: Mensagens
    let unreadMessages = 0;
    try {
        const [msgRows] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0',
            [contadorId]
        );
        unreadMessages = msgRows[0].total;
    } catch (e) { }

    res.json({
      totalOSCs: totalOSCs,
      pendingDocs: pendingDocs,
      unreadMessages: unreadMessages
    });

  } catch (error) {
    console.error('Erro CRÍTICO no Dashboard:', error);
    // Retorna zerado em vez de erro 500 para não travar a tela
    res.json({ totalOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  }
};

// 2. Minhas OSCs (CORRIGIDO COM LEFT JOIN)
export const getMyOSCs = async (req, res) => {
  try {
    const contadorId = req.user.id;
    
    // LEFT JOIN garante que a OSC aparece mesmo sem usuário vinculado
    // COALESCE garante que tenhamos um nome para exibir
    const query = `
      SELECT 
        o.id, 
        o.cnpj, 
        COALESCE(u.name, u.email, 'OSC Sem Nome') as nome_osc,
        u.email,
        u.phone
      FROM oscs o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.assigned_contador_id = ?
    `;
    const [rows] = await pool.execute(query, [contadorId]);
    res.json(rows);
  } catch (error) {
    console.error('Erro getMyOSCs:', error.message);
    res.status(500).json({ message: 'Erro ao listar OSCs.' });
  }
};

// 3. Funções auxiliares para evitar erro 502 nas rotas
export const getNotifications = async (req, res) => { res.json([]); };
export const getRecentActivity = async (req, res) => { res.json([]); };
export const createOSC = async (req, res) => { res.status(501).json({message: "Não implementado"}); };