// Localização sugerida: src/controllers/admin/message.controller.js ou onde preferir
import pool from '../config/db.js';

// --- SISTEMA DE CHAT (MANTIDO) ---

export const getContacts = async (req, res) => {
    res.setHeader('Content-Type', 'application/json'); 
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let rows = [];

        if (userRole === 'Contador') {
            const [oscs] = await pool.execute(`
                SELECT u.id, u.name, o.razao_social
                FROM users u
                JOIN oscs o ON o.user_id = u.id
                WHERE o.assigned_contador_id = ?
            `, [userId]);
            rows = oscs || [];
        } else {
            const [contacts] = await pool.execute(`
                SELECT u.id, u.name 
                FROM users u
                JOIN oscs o ON o.assigned_contador_id = u.id
                WHERE o.user_id = ?
            `, [userId]);
            rows = contacts || [];
        }

        const contactsWithMsg = await Promise.all(rows.map(async (c) => {
            const [m] = await pool.execute(
                'SELECT content FROM messages WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?) ORDER BY created_at DESC LIMIT 1',
                [userId, c.id, c.id, userId]
            );
            return {
                id: c.id,
                name: c.razao_social || c.name,
                lastMessage: m[0]?.content || 'Inicie uma conversa'
            };
        }));

        return res.status(200).json(contactsWithMsg);
    } catch (error) {
        console.error(error);
        return res.status(200).json([]); 
    }
};

export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const contactId = req.query.contactId || req.params.id;

        if (!contactId || contactId === 'undefined') return res.json([]);

        const [rows] = await pool.execute(`
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?)
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `, [userId, contactId, contactId, userId]);

        const formatted = (rows || []).map(m => ({
            id: m.id,
            text: m.content,
            isMe: m.sender_id === userId,
            time: m.created_at
        }));

        return res.json(formatted);
    } catch (error) {
        return res.json([]);
    }
};

// --- SISTEMA DE MODELOS DE PAGAMENTO (ATUALIZADO E SINCRONIZADO) ---

// Esta função agora atende tanto pelo nome 'category' quanto 'status' para evitar erros de undefined nas rotas
export const getMessagesByStatus = async (req, res) => {
  // Tenta pegar de 'status' ou 'category' vindo da URL
  const status = req.params.status || req.params.category;
  
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_messages WHERE category = ?', 
      [status]
    );
    res.json(rows);
  } catch (error) {
    console.error('[Admin Message Error]:', error);
    res.status(500).json({ message: 'Erro ao buscar modelos de mensagem.' });
  }
};

// Alias para manter compatibilidade se você já usa 'getMessagesByCategory' em algum lugar
export const getMessagesByCategory = getMessagesByStatus;

// --- SISTEMA DE ENVIO (MANTIDO E MELHORADO) ---

export const sendMessage = async (req, res) => {
    try {
        const sender_id = req.user.id;
        const { receiver_id, content, email, subject } = req.body;

        // Se houver um 'email' no corpo, trata-se de um envio administrativo (Cobrança)
        if (email) {
            console.log(`[Admin Mail] Simulação de envio para: ${email} | Assunto: ${subject}`);
            // Aqui você pode adicionar a lógica do Nodemailer depois
            return res.status(200).json({ success: true, message: "Mensagem administrativa processada" });
        }

        // Caso contrário, trata-se do chat comum
        console.log(`[Chat Debug] Tentando salvar mensagem: De ${sender_id} para ${receiver_id}.`);

        if (!receiver_id || !content) {
            return res.status(400).json({ success: false, message: "Dados incompletos" });
        }

        const [result] = await pool.execute(
            'INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES (?, ?, ?, 0)',
            [sender_id, receiver_id, content]
        );

        return res.status(201).json({ id: result.insertId, success: true });
    } catch (error) {
        console.error('[Chat Database Error]:', error);
        return res.status(500).json({ success: false, message: "Erro interno ao salvar no DB" });
    }
};

export const createMessage = sendMessage;