import pool from '../config/db.js';

// 1. Listar Contatos (Quem aparece na barra lateral ou é o alvo da conversa)
export const getContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[Chat] Buscando contatos para User ID: ${userId} (${userRole})`);

        let rows = [];

        if (userRole === 'Contador') {
            // Contador vê todas as OSCs vinculadas a ele
            const [oscs] = await pool.execute(`
                SELECT u.id, u.name, u.email, o.razao_social
                FROM users u
                JOIN oscs o ON o.user_id = u.id
                WHERE o.assigned_contador_id = ?
            `, [userId]);
            rows = oscs;
        } else {
            // OSC vê o seu Contador.
            // MODIFICAÇÃO: Usamos LEFT JOIN para não quebrar se for NULL
            // E adicionamos lógica para trazer o Suporte (ID 2) se não tiver vínculo.
            const [contacts] = await pool.execute(`
                SELECT u.id, u.name, u.email 
                FROM users u
                JOIN oscs o ON o.assigned_contador_id = u.id
                WHERE o.user_id = ?
            `, [userId]);

            rows = contacts;

            // FALLBACK CRÍTICO: Se a lista estiver vazia (OSC sem vínculo),
            // adicionamos manualmente o Contador de Suporte (ID 2)
            if (rows.length === 0) {
                console.log('[Chat] OSC sem vínculo. Adicionando Suporte (ID 2) à lista.');
                // Busca dados do admin/suporte (Assumindo ID 2)
                const [admin] = await pool.execute('SELECT id, name, email FROM users WHERE id = 2');
                if (admin.length > 0) {
                    rows.push(admin[0]);
                }
            }
        }

        // Busca a última mensagem para cada contato
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
                avatar: null,
                lastMessage: lastMsg.content || 'Inicie uma conversa',
                time: lastMsg.created_at || null,
                unread: (lastMsg.sender_id === contact.id && lastMsg.is_read === 0) ? 1 : 0
            };
        }));

        res.json(contactsWithMsg);

    } catch (error) {
        console.error('[Chat] Erro ao listar contatos:', error);
        res.status(500).json({ message: 'Erro ao carregar contatos.' });
    }
};

export const createMessage = async (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.id; // O ID de quem está logado (Contador ou OSC)

  if (!receiver_id || !content) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [sender_id, receiver_id, content]
    );
    res.status(201).json({ id: result.insertId, sender_id, receiver_id, content });
  } catch (error) {
    console.error("Erro ao salvar mensagem:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

// 2. Obter Histórico de Conversas
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[DEBUG] Buscando mensagens para User ID: ${userId}`);

        // Busca TODAS as mensagens onde o usuário é remetente OU destinatário
        const query = `
            SELECT * FROM messages 
            WHERE sender_id = ? OR receiver_id = ?
            ORDER BY created_at ASC
        `;
        
        const [rows] = await pool.execute(query, [userId, userId]);
        
        console.log(`[DEBUG] Mensagens encontradas no banco: ${rows.length}`);

        const safeMsgs = rows.map(m => ({
            id: m.id,
            text: m.content,       
            isMe: m.sender_id === userId,
            created_at: m.created_at
        }));

        res.json(safeMsgs);
    } catch (error) {
        console.error('[DEBUG] ERRO SQL:', error);
        res.status(500).json([]);
    }
};

// Enviar Mensagem
export const sendMessage = async (req, res) => {
  try {
    const content = req.body.content || req.body.message || req.body.text;
    let receiver_id = req.body.receiver_id || req.body.receiverId;
    const sender_id = req.user.id;

    // Se não tiver destinatário, manda para o Admin/Suporte (ID 2)
    if (!receiver_id) receiver_id = 2;

    if (!content) return res.status(400).json({ message: "Vazio" });

    const [result] = await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [sender_id, receiver_id, content]
    );

    res.status(201).json({ message: "Salvo", id: result.insertId });
  } catch (error) {
    console.error('[DEBUG] Erro no INSERT:', error);
    res.status(500).json({ message: "Erro ao salvar" });
  }
};

