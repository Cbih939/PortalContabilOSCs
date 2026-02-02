import pool from '../config/db.js';

// 1. Listar Contatos (Barra Lateral)
export const getContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let rows = [];

        if (userRole === 'Contador') {
            const [oscs] = await pool.execute(`
                SELECT u.id, u.name, u.email, o.razao_social
                FROM users u
                JOIN oscs o ON o.user_id = u.id
                WHERE o.assigned_contador_id = ?
            `, [userId]);
            rows = oscs;
        } else {
            const [contacts] = await pool.execute(`
                SELECT u.id, u.name, u.email 
                FROM users u
                JOIN oscs o ON o.assigned_contador_id = u.id
                WHERE o.user_id = ?
            `, [userId]);

            rows = contacts;

            if (rows.length === 0) {
                const [admin] = await pool.execute('SELECT id, name, email FROM users WHERE id = 2');
                if (admin.length > 0) rows.push(admin[0]);
            }
        }

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
                name: contact.razao_social || contact.name,
                contactName: contact.razao_social || contact.name,
                userName: contact.name,
                email: contact.email,
                lastMessage: lastMsg.content || 'Inicie uma conversa',
                time: lastMsg.created_at || null,
                unread: (lastMsg.sender_id === contact.id && lastMsg.is_read === 0) ? 1 : 0
            };
        }));

        res.json(contactsWithMsg);
    } catch (error) {
        console.error('[Chat Error]:', error);
        res.status(500).json({ message: 'Erro ao carregar contatos.' });
    }
};

// 2. Obter Histórico (Resolve erro 400)
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const contactId = req.params.id || req.query.contactId;

        if (!contactId) {
            return res.status(400).json({ message: "ID do contato é necessário." });
        }

        const query = `
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?)
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `;
        
        const [rows] = await pool.execute(query, [userId, contactId, contactId, userId]);

        const safeMsgs = rows.map(m => ({
            id: m.id,
            text: m.content,       
            isMe: m.sender_id === userId,
            created_at: m.created_at
        }));

        res.json(safeMsgs);
    } catch (error) {
        res.status(500).json([]);
    }
};

// 3. Enviar Mensagem
export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const content = req.body.content || req.body.message || req.body.text;
        let receiver_id = req.body.receiver_id || req.body.receiverId;

        if (!receiver_id) receiver_id = 2; // Suporte

        if (!content) return res.status(400).json({ message: "Vazio" });

        const [result] = await pool.execute(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
            [userId, receiver_id, content]
        );

        res.status(201).json({ id: result.insertId, message: "Salvo" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao salvar" });
    }
};

export const createMessage = sendMessage;