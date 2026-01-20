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

// 2. Obter Histórico de Conversas
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        // Pega o contactId da URL, mas se não vier, assume undefined
        const contactId = req.params.contactId; 

        let query = '';
        let params = [];

        if (contactId && contactId !== 'undefined') {
            // Se tem um ID específico, busca conversa par-a-par
            query = `
                SELECT * FROM messages 
                WHERE (sender_id = ? AND receiver_id = ?) 
                   OR (sender_id = ? AND receiver_id = ?)
                ORDER BY created_at ASC
            `;
            params = [userId, contactId, contactId, userId];
        } else {
            // CORREÇÃO: Se não passar ID (ex: tela geral de mensagens da OSC),
            // busca TODAS as mensagens onde o usuário participa (envia ou recebe).
            // Isso resolve o problema de "Array Vazio" na tela inicial.
            query = `
                SELECT * FROM messages 
                WHERE sender_id = ? OR receiver_id = ?
                ORDER BY created_at ASC
            `;
            params = [userId, userId];
        }

        const [rows] = await pool.execute(query, params);

        // Mapeamento seguro
        const safeMsgs = rows.map(m => ({
            id: m.id,
            text: m.content,       // Frontend espera 'text'
            content: m.content,    // Frontend as vezes espera 'content'
            sender_id: m.sender_id, // Importante para identificar quem mandou
            senderId: m.sender_id,
            receiver_id: m.receiver_id,
            isMe: m.sender_id === userId,
            created_at: m.created_at,
            is_read: m.is_read
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
    // Aceita variações no payload para evitar erros
    const content = req.body.content || req.body.message || req.body.text;
    let receiver_id = req.body.receiver_id || req.body.receiverId;
    
    const sender_id = req.user.id;

    // Se não tiver receiver_id (caso de OSC sem vínculo), força envio para o Suporte (ID 2)
    if (!receiver_id) {
        console.log('[Chat] Sem receiver_id. Redirecionando para Suporte (ID 2).');
        receiver_id = 2;
    }

    if (!content) {
      return res.status(400).json({ message: "Conteúdo da mensagem é obrigatório." });
    }

    console.log(`[Chat] Enviando de ${sender_id} para ${receiver_id}: ${content}`);

    const [result] = await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [sender_id, receiver_id, content]
    );

    res.status(201).json({ 
        message: "Enviado com sucesso", 
        id: result.insertId,
        content: content,
        sender_id: sender_id,
        receiver_id: receiver_id,
        created_at: new Date()
    });

  } catch (error) {
    console.error('[Chat] Erro ao enviar mensagem:', error);
    res.status(500).json({ message: "Erro interno ao enviar mensagem." });
  }
};