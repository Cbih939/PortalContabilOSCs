import pool from '../config/db.js';

export const getContacts = async (req, res) => {
    res.setHeader('Content-Type', 'application/json'); // Força JSON
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
        return res.status(200).json([]); // Nunca retorne erro 500 aqui para não quebrar o map
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

export const sendMessage = async (req, res) => {
    try {
        const sender_id = req.user.id;
        const { receiver_id, content } = req.body;

        // LOG PARA DEBUG - Verifique no console do PM2 (pm2 logs)
        console.log(`[Chat Debug] Tentando salvar mensagem: De ${sender_id} para ${receiver_id}. Conteúdo: ${content}`);

        if (!receiver_id || !content) {
            console.error('[Chat Error] Dados ausentes no corpo da requisição:', req.body);
            return res.status(400).json({ success: false, message: "Dados incompletos" });
        }

        const [result] = await pool.execute(
            'INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES (?, ?, ?, 0)',
            [sender_id, receiver_id, content]
        );

        console.log(`[Chat Success] Mensagem salva com ID: ${result.insertId}`);
        return res.status(201).json({ id: result.insertId, success: true });
    } catch (error) {
        console.error('[Chat Database Error]:', error);
        return res.status(500).json({ success: false, message: "Erro interno ao salvar no DB" });
    }
};

export const createMessage = sendMessage;