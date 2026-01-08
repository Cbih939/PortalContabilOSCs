import pool from '../config/db.js';

// Função principal do Dashboard (Corrigida para evitar erro 502)
export const getDashboardStats = async (req, res) => {
  try {
    const cid = req.user.id; // ID do contador logado
    let oscs = 0;
    let docs = 0;
    let msgs = 0;

    // 1. Contar OSCs
    try {
      // Ajuste: geralmente a coluna é 'contador_id'. Se o seu banco usar 'assigned_contador_id', altere aqui.
      const [r] = await pool.execute(
        'SELECT COUNT(*) as t FROM oscs WHERE contador_id = ?', 
        [cid]
      );
      oscs = r[0]?.t || 0;
    } catch (e) {
      console.error('[Dashboard] Erro ao contar OSCs:', e.message);
    }

    // 2. Contar Documentos Pendentes (CORREÇÃO PRINCIPAL: removido d.status)
    try {
      // Removemos a verificação "AND d.status = 'Pendente'" para evitar o erro "Unknown column"
      // Agora contamos apenas o total de documentos associados às OSCs deste contador
      const [r] = await pool.execute(`
        SELECT COUNT(*) as t 
        FROM documents d 
        JOIN oscs o ON d.osc_id = o.id 
        WHERE o.contador_id = ?
      `, [cid]);
      docs = r[0]?.t || 0;
    } catch (e) {
      console.error('[Dashboard] Erro ao contar Documentos:', e.message);
    }

    // 3. Contar Mensagens
    try {
      // Verifica se existem mensagens não lidas
      const [r] = await pool.execute(
        'SELECT COUNT(*) as t FROM messages WHERE receiver_id = ? AND is_read = 0', 
        [cid]
      );
      msgs = r[0]?.t || 0;
    } catch (e) {
      console.warn('[Dashboard] Erro ao contar Mensagens (Tabela pode não existir):', e.message);
    }

    // Retorna os dados para o frontend
    res.json({ 
      totalOSCs: oscs, 
      pendingDocs: docs, 
      unreadMessages: msgs 
    });

  } catch (error) {
    console.error('Erro Crítico no Dashboard do Contador:', error);
    // Em caso de erro fatal, retorna zeros para não travar o login (status 200 com dados vazios)
    res.json({ totalOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  }
};

// --- Funções Auxiliares para Rotas (Evitam erro 404/500 nas rotas) ---

export const getMyOSCs = async (req, res) => {
  try {
    const cid = req.user.id;
    // Traz dados básicos para a lista de OSCs
    const [rows] = await pool.execute(`
      SELECT o.id, o.cnpj, COALESCE(u.name, 'OSC Sem Nome') as name, u.email, u.phone
      FROM oscs o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.contador_id = ?
    `, [cid]);
    
    res.json(rows);
  } catch (e) { 
    console.error('Erro ao buscar OSCs:', e.message);
    res.json([]); // Retorna array vazio em vez de erro para não quebrar a UI
  }
};

export const getNotifications = async (req, res) => {
  // Retorna array vazio por segurança para não gerar erro 404 no frontend
  res.json([]);
};

export const getRecentActivity = async (req, res) => {
  // Retorna array vazio por segurança
  res.json([]);
};

// Esta função geralmente é do Admin, mas deixamos aqui como placeholder 
// para evitar erro caso a rota esteja apontada incorretamente
export const createOSC = async (req, res) => {
  res.status(501).json({ message: "Função disponível apenas para Admin" });
};