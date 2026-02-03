import pool from '../config/db.js';

// 1. Listar Contatos (Barra Lateral)
export const getContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let rows = [];

        if (userRole === 'Contador') {
            // Contador vê as OSCs vinculadas a ele
            const [oscs] = await pool.execute(`
                SELECT u.id, u.name, u.email, o.razao_social
                FROM users u
                JOIN oscs o ON o.user_id = u.id
                WHERE o.assigned_contador_id = ?
            `, [userId]);
            rows = oscs;
        } else {
            // OSC vê o Contador dela
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

        // Se rows não for array ou estiver vazio, retorna lista vazia
        if (!Array.isArray(rows) || rows.length === 0) return res.json([]);

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
                name: contact.razao_social || contact.name || 'Usuário',
                email: contact.email,
                lastMessage: lastMsg.content || 'Sem mensagens',
                time: lastMsg.created_at || null,
                unread: (lastMsg.sender_id === contact.id && lastMsg.is_read === 0) ? 1 : 0
            };
        }));

        res.json(contactsWithMsg);
    } catch (error) {
        console.error('[Chat Error] getContacts:', error);
        res.json([]); // Retorna array vazio em vez de erro 500 para não quebrar o .map()
    }
};

// 2. Obter Histórico de Conversa
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const contactId = req.query.contactId || req.params.id;

        if (!contactId) return res.json([]); 

        const [rows] = await pool.execute(`
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?)
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `, [userId, contactId, contactId, userId]);

        // Mapeia para o formato que o Frontend espera
        const formatted = rows.map(m => ({
            id: m.id,
            text: m.content,
            isMe: m.sender_id === userId,
            time: m.created_at
        }));

        res.json(formatted);
    } catch (error) {
        console.error('[Chat Error] getMessages:', error);
        res.json([]); // Sempre retorna array para evitar erro de .map() no React
    }
};

// 3. Enviar Mensagem
export const sendMessage = async (req, res) => {
    try {
        const sender_id = req.user.id;
        const { receiver_id, content } = req.body;

        if (!receiver_id || !content) return res.status(400).json({ message: "Dados incompletos" });

        const [result] = await pool.execute(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
            [sender_id, receiver_id, content]
        );

        res.status(201).json({ id: result.insertId, success: true });
    } catch (error) {
        res.status(500).json({ message: "Erro ao enviar" });
    }
};

export const createMessage = sendMessage;