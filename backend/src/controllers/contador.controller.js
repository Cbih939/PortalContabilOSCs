import pool from '../config/db.js';

// Dashboard: Estatísticas
export const getDashboardStats = async (req, res) => {
  try {
    const contadorId = req.user.id;

    // 1. Total de OSCs vinculadas a este contador
    const [oscRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM oscs WHERE assigned_contador_id = ?',
      [contadorId]
    );
    
    // 2. Documentos pendentes (exemplo: status 'Pendente')
    // Ajuste 'documents' para o nome real da sua tabela de docs se for diferente
    const [docRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM documents d
       JOIN oscs o ON d.osc_id = o.id
       WHERE o.assigned_contador_id = ? AND d.status = 'Pendente'`,
      [contadorId]
    );

    // 3. Mensagens não lidas (Opcional, se tabela messages existir)
    let unreadMessages = 0;
    try {
        const [msgRows] = await pool.execute(
            'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = FALSE',
            [contadorId]
        );
        unreadMessages = msgRows[0].total;
    } catch (e) { console.log("Tabela messages ainda não populada ou erro ignorável"); }

    res.json({
      totalOSCs: oscRows[0].total,
      pendingDocs: docRows[0].total || 0,
      unreadMessages: unreadMessages
    });

  } catch (error) {
    console.error('Erro Dashboard Contador:', error);
    res.status(500).json({ message: 'Erro ao carregar estatísticas.' });
  }
};

// Listar Minhas OSCs
export const getMyOSCs = async (req, res) => {
  try {
    const contadorId = req.user.id;

    // AQUI ESTAVA O ERRO: Fazemos JOIN com users para pegar o nome correto
    const query = `
      SELECT 
        o.id, 
        o.cnpj, 
        u.name as nome_osc,  -- Pega o nome da tabela USERS
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

// Criar/Vincular Nova OSC (Simplificado)
export const createOSC = async (req, res) => {
    // ... (Mantenha sua lógica de criação se já tiver, ou me peça para enviar)
    // Se não tiver essa função usada, pode deixar vazia ou retornar erro 501
    res.status(501).json({message: "Não implementado neste snippet"});
}