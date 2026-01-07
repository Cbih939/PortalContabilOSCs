import pool from '../config/db.js';

// Enviar Mensagem
export const sendMessage = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Não autorizado' });

    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content) return res.status(400).json({ message: 'Dados incompletos' });

    await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [sender_id, receiver_id, content]
    );

    res.status(201).json({ message: 'Enviado' });
  } catch (error) {
    console.error('Erro sendMessage:', error.message);
    res.status(500).json({ message: 'Erro ao enviar.' });
  }
};

// Buscar Mensagens
export const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    const [rows] = await pool.execute(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `, [currentUserId, otherUserId, otherUserId, currentUserId]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro getMessages:', error.message);
    res.status(500).json({ message: 'Erro ao buscar chat.' });
  }
};

// Buscar Contatos (CORREÇÃO DO ERRO 500)
export const getContacts = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Logue novamente.' });

    const role = req.user.role;
    const myId = req.user.id;
    let query = '';
    
    // Define quem vê quem (buscando SEMPRE na tabela users para evitar erro de coluna)
    if (role === 'Adm') {
      query = 'SELECT * FROM users WHERE id != ?';
    } else if (role === 'Contador') {
      // Contador vê OSCs e Admins
      query = 'SELECT * FROM users WHERE id != ? AND (role = "OSC" OR role = "Adm")';
    } else if (role === 'OSC') {
      // OSC vê Contadores e Admins
      query = 'SELECT * FROM users WHERE id != ? AND (role = "Contador" OR role = "Adm")';
    } else {
      query = 'SELECT * FROM users WHERE id != ?';
    }

    const [users] = await pool.execute(query, [myId]);

    // Filtra dados sensíveis e normaliza o nome
    const contacts = users.map(u => ({
      id: u.id,
      role: u.role,
      email: u.email,
      // Pega o nome de qualquer coluna que existir
      name: u.name || u.nome || u.razao_social || u.email.split('@')[0],
      avatar: null // Futuro
    }));

    res.status(200).json(contacts);

  } catch (error) {
    console.error('Erro getContacts:', error); // Log detalhado
    res.status(500).json({ message: 'Erro ao listar contatos.' });
  }
};