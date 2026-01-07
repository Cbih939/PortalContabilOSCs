import pool from '../config/db.js';

// 1. Enviar Mensagem
export const sendMessage = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Logue novamente' });
    
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content) return res.status(400).json({ message: 'Dados faltando' });

    // Insere na tabela nova
    await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [sender_id, receiver_id, content]
    );

    res.status(201).json({ message: 'Enviada' });
  } catch (error) {
    console.error('Erro SendMessage:', error.message);
    res.status(500).json({ message: 'Erro ao enviar.' });
  }
};

// 2. Histórico de Mensagens
export const getMessagesHistory = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Logue novamente' });

    const { otherUserId } = req.params;
    const myId = req.user.id;

    // Busca conversas (IDA e VOLTA)
    const [rows] = await pool.execute(`
      SELECT id, sender_id, receiver_id, content, created_at, is_read 
      FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `, [myId, otherUserId, otherUserId, myId]);

    res.json(rows);
  } catch (error) {
    console.error('Erro getMessagesHistory:', error.message); // Verifique o log se der erro
    res.status(500).json({ message: 'Erro ao carregar chat.' });
  }
};

// 3. Contatos (Chat)
export const getChatContacts = async (req, res) => {
  try {
    const role = req.user.role;
    const myId = req.user.id;
    let query = '';

    // Busca na tabela USERS para evitar erro de coluna
    if (role === 'Adm') query = 'SELECT id, name, email, role FROM users WHERE id != ?';
    else if (role === 'Contador') query = 'SELECT id, name, email, role FROM users WHERE id != ? AND (role="OSC" OR role="Adm")';
    else if (role === 'OSC') query = 'SELECT id, name, email, role FROM users WHERE id != ? AND (role="Contador" OR role="Adm")';
    else query = 'SELECT id, name, email, role FROM users WHERE id != ?';

    const [rows] = await pool.execute(query, [myId]);
    
    // Garante que o frontend receba um nome
    const contacts = rows.map(u => ({
        ...u,
        name: u.name || u.email // Fallback se name for null
    }));

    res.json(contacts);
  } catch (error) {
    console.error('Erro ChatContacts:', error);
    res.status(500).json({ message: 'Erro ao listar contatos.' });
  }
};