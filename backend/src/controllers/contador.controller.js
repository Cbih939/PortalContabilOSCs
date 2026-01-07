import pool from '../config/db.js';

// 1. Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const contadorId = req.user.id;

    // Total de OSCs
    const [oscRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM oscs WHERE assigned_contador_id = ?',
      [contadorId]
    );

    // Documentos Pendentes (Joins seguros)
    let pendingDocs = 0;
    try {
        const [docRows] = await pool.execute(
        `SELECT COUNT(*) as total FROM documents d
         JOIN oscs o ON d.osc_id = o.id
         WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'`,
        [contadorId]
        );
        pendingDocs = docRows[0].total;
    } catch (e) { console.log("Erro ao contar docs ou tabela inexistente"); }

    // Mensagens não lidas
    let unreadMessages = 0;
    try {
        const [msgRows] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0',
            [contadorId]
        );
        unreadMessages = msgRows[0].total;
    } catch (e) { console.log("Aviso: Tabela messages pode não existir ainda."); }

    res.json({
      totalOSCs: oscRows[0].total,
      pendingDocs: pendingDocs,
      unreadMessages: unreadMessages
    });

  } catch (error) {
    console.error('Erro getDashboardStats:', error);
    res.status(500).json({ message: 'Erro estatísticas.' });
  }
};

// 2. Minhas OSCs
export const getMyOSCs = async (req, res) => {
  try {
    const contadorId = req.user.id;

    // JOIN com users para pegar o nome corretamente
    const query = `
      SELECT 
        o.id, 
        o.cnpj, 
        u.name as nome_osc,
        u.email,
        u.phone
      FROM oscs o
      JOIN users u ON o.user_id = u.id
      WHERE o.assigned_contador_id = ?
    `;

    const [rows] = await pool.execute(query, [contadorId]);
    res.json(rows);
  } catch (error) {
    console.error('Erro getMyOSCs:', error);
    res.status(500).json({ message: 'Erro ao listar OSCs.' });
  }
};

// 3. Notificações (Função que faltava e causava o erro 502)
export const getNotifications = async (req, res) => {
  try {
    // Retorna array vazio por enquanto para evitar erro
    // Futuramente você pode conectar com uma tabela de notificações
    res.status(200).json([]);
  } catch (error) {
    console.error('Erro getNotifications:', error);
    res.status(500).json({ message: 'Erro notificações.' });
  }
};

// 4. Atividade Recente (Para o gráfico/lista do dashboard)
export const getRecentActivity = async (req, res) => {
  try {
    // Retorna vazio por enquanto
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: 'Erro atividade.' });
  }
};

// 5. Criar OSC (Placeholder para evitar erro de importação)
export const createOSC = async (req, res) => {
    res.status(501).json({message: "Não implementado"});
};