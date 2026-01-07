import pool from '../config/db.js';

// Enviar Mensagem
export const sendMessage = async (req, res) => {
  try {
    // Verificação de segurança
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content) {
      return res.status(400).json({ message: 'Dados incompletos (receiver_id ou content faltando).' });
    }

    const query = `
      INSERT INTO messages (sender_id, receiver_id, content) 
      VALUES (?, ?, ?)
    `;
    
    await pool.execute(query, [sender_id, receiver_id, content]);

    res.status(201).json({ message: 'Mensagem enviada com sucesso.' });
  } catch (error) {
    console.error('Erro detalhado ao enviar mensagem:', error);
    res.status(500).json({ message: 'Erro interno ao enviar mensagem.' });
  }
};

// Buscar Mensagens (Chat)
export const getMessages = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    // Busca mensagens trocadas entre os dois usuários (enviadas ou recebidas)
    const query = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `;

    const [rows] = await pool.execute(query, [currentUserId, otherUserId, otherUserId, currentUserId]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro detalhado ao buscar mensagens:', error);
    // Se a tabela não existir, o erro aparecerá aqui
    res.status(500).json({ message: 'Erro interno ao buscar histórico de mensagens.' });
  }
};

// Buscar Contatos
export const getContacts = async (req, res) => {
  try {
    // Debug: Ver o que está chegando no req.user
    // console.log("getContacts - req.user:", req.user);

    if (!req.user || !req.user.id) {
      console.error("getContacts - Erro: req.user está indefinido. Verifique o AuthMiddleware.");
      return res.status(401).json({ message: 'Usuário não identificado.' });
    }

    const currentUserId = req.user.id;
    const userRole = req.user.role; // Certifique-se que no banco é 'Adm', 'Contador' ou 'OSC'

    let query = '';
    let params = [];

    // Lógica de quem pode ver quem
    if (userRole === 'Adm') {
      // Admin vê todos (exceto ele mesmo)
      query = 'SELECT id, name, email, role FROM users WHERE id != ?';
      params = [currentUserId];

    } else if (userRole === 'Contador') {
      // Contador vê Admin e OSCs
      query = 'SELECT id, name, email, role FROM users WHERE id != ? AND (role = "OSC" OR role = "Adm")';
      params = [currentUserId];

    } else if (userRole === 'OSC') {
      // OSC vê Admin e Contadores
      query = 'SELECT id, name, email, role FROM users WHERE id != ? AND (role = "Contador" OR role = "Adm")';
      params = [currentUserId];
      
    } else {
      // Fallback genérico (para evitar query vazia)
      query = 'SELECT id, name, email, role FROM users WHERE id != ?';
      params = [currentUserId];
    }

    const [contacts] = await pool.execute(query, params);
    
    res.status(200).json(contacts || []);

  } catch (error) {
    console.error('Erro CRÍTICO ao buscar contatos:', error); 
    res.status(500).json({ message: 'Erro interno ao buscar lista de contatos.' });
  }
};