import pool from '../config/db.js';

// 1. Listar Contatos (Quem aparece na barra lateral do chat)
export const getContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[Chat] Buscando contatos para User ID: ${userId} (${userRole})`);

        let query = '';
        let params = [];

        // Lógica: Quem o usuário vê na lista?
        if (userRole === 'Contador') {
            // Contador vê todas as OSCs vinculadas a ele
            query = `
                SELECT u.id, u.name, u.email, o.razao_social
                FROM users u
                JOIN oscs o ON o.user_id = u.id
                WHERE o.assigned_contador_id = ?
            `;
            params = [userId];
        } else {
            // OSC vê apenas o seu Contador
            query = `
                SELECT u.id, u.name, u.email 
                FROM users u
                JOIN oscs o ON o.assigned_contador_id = u.id
                WHERE o.user_id = ?
            `;
            params = [userId];
        }

        const [rows] = await pool.execute(query, params);

        // Busca a última mensagem para cada contato (para exibir na lista)
        const contactsWithMsg = await Promise.all(rows.map(async (contact) => {
            const [msgs] = await pool.execute(`
                SELECT content, created_at, is_read, sender_id 
                FROM messages 
                WHERE (sender_id = ? AND receiver_id = ?) 
                   OR (sender_id = ? AND receiver_id = ?)
                ORDER BY created_at DESC LIMIT 1
            `, [userId, contact.id, contact.id, userId]);

            const lastMsg = msgs[0] || {};

            return {
                id: contact.id,
                
                // Mapeamento Universal de Nomes
                name: contact.razao_social || contact.name,
                contactName: contact.razao_social || contact.name,
                userName: contact.name,
                
                email: contact.email,
                avatar: null, // Pode adicionar URL se tiver
                
                // Dados da última mensagem (Preview)
                lastMessage: lastMsg.content || 'Inicie uma conversa',
                time: lastMsg.created_at || null,
                unread: (lastMsg.sender_id === contact.id && lastMsg.is_read === 0) ? 1 : 0
            };
        }));

        console.log(`[Chat] Enviando ${contactsWithMsg.length} contatos.`);
        res.json(contactsWithMsg);

    } catch (error) {
        console.error('[Chat] Erro ao listar contatos:', error);
        res.status(500).json({ message: 'Erro ao carregar contatos.' });
    }
};

// 2. Obter Histórico de Conversa com um Usuário
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { contactId } = req.params;

        const [rows] = await pool.execute(`
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `, [userId, contactId, contactId, userId]);

        // Mapeamento para o frontend
        const safeMsgs = rows.map(m => ({
            id: m.id,
            text: m.content,
            content: m.content, // Variação
            senderId: m.sender_id,
            isMe: m.sender_id === userId, // Flag para saber se fui eu
            timestamp: m.created_at,
            read: m.is_read
        }));

        res.json(safeMsgs);
    } catch (error) {
        console.error('[Chat] Erro ao buscar mensagens:', error);
        res.status(500).json({ message: 'Erro ao buscar mensagens.' });
    }
};

// 3. Enviar Mensagem
export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id; // Garante que pega o ID do usuário autenticado

    if (!receiver_id || !content) {
      return res.status(400).json({ message: "Dados insuficientes (receiver_id e content são obrigatórios)." });
    }

    const [result] = await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [sender_id, receiver_id, content]
    );

    res.status(201).json({ id: result.insertId, sender_id, receiver_id, content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao enviar mensagem." });
  }
};