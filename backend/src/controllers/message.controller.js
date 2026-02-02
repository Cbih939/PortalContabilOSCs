import pool from '../config/db.js';

// 1. Listar Contatos (Quem aparece na barra lateral)
export const getContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let rows = [];

        if (userRole === 'Contador') {
            // Contador vê todas as OSCs vinculadas ao seu ID de contador
            const [oscs] = await pool.execute(`
                SELECT u.id, u.name, u.email, o.razao_social
                FROM users u
                JOIN oscs o ON o.user_id = u.id
                WHERE o.assigned_contador_id = ?
            `, [userId]);
            rows = oscs;
        } else {
            // OSC vê o seu Contador vinculado
            const [contacts] = await pool.execute(`
                SELECT u.id, u.name, u.email 
                FROM users u
                JOIN oscs o ON o.assigned_contador_id = u.id
                WHERE o.user_id = ?
            `, [userId]);

            rows = contacts;

            // Fallback: Se a OSC não tiver contador, mostra o Suporte (ID 2)
            if (rows.length === 0) {
                const [admin] = await pool.execute('SELECT id, name, email FROM users WHERE id = 2');
                if (admin.length > 0) rows.push(admin[0]);
            }
        }

        // Busca a última mensagem para cada contato para exibir no preview da lista
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
                lastMessage: lastMsg.content || 'Sem mensagens ainda',
                time: lastMsg.created_at || null,
                unread: (lastMsg.sender_id === contact.id && lastMsg.is_read === 0) ? 1 : 0
            };
        }));

        res.json(contactsWithMsg);

    } catch (error) {
        console.error('[Chat Error] getContacts:', error);
        res.status(500).json({ message: 'Erro ao carregar contatos.' });
    }
};

// 2. Obter Histórico de Conversa (Específico entre dois usuários)
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { contactId } = req.query; // Importante: o frontend deve enviar ?contactId=X

        if (!contactId) {
            return res.status(400).json({ message: "contactId é obrigatório para filtrar a conversa." });
        }

        // Busca mensagens trocadas especificamente entre o logado e o contato selecionado
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
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            created_at: m.created_at
        }));

        // Opcional: Marcar mensagens como lidas ao abrir a conversa
        await pool.execute(
            'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?',
            [contactId, userId]
        );

        res.json(safeMsgs);
    } catch (error) {
        console.error('[Chat Error] getMessages:', error);
        res.status(500).json([]);
    }
};

// 3. Enviar Mensagem
export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        // Normalização dos campos vindos do frontend
        const content = req.body.content || req.body.message || req.body.text;
        const receiver_id = req.body.receiver_id || req.body.receiverId;

        if (!receiver_id) {
            return res.status(400).json({ message: "Destinatário não identificado." });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "A mensagem não pode estar vazia." });
        }

        const [result] = await pool.execute(
            'INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES (?, ?, ?, 0)',
            [userId, receiver_id, content]
        );

        res.status(201).json({ 
            id: result.insertId, 
            message: "Mensagem enviada", 
            sender_id: userId, 
            receiver_id, 
            content 
        });
    } catch (error) {
        console.error('[Chat Error] sendMessage:', error);
        res.status(500).json({ message: "Erro ao enviar mensagem" });
    }
};

// Alias para manter compatibilidade caso usem createMessage em algum lugar
export const createMessage = sendMessage;