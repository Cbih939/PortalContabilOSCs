// backend/src/controllers/msg.controller.js

import * as MessageModel from '../models/message.model.js';
import * as OscModel from '../models/osc.model.js';
import { ROLES } from '../utils/constants.js';
import pool from '../config/db.js';

/**
 * @desc    Busca a lista de contatos (OSCs) para o Contador logado (Sidebar).
 * @route   GET /api/messages/contacts
 * @access  Privado (Contador)
 */
export const getChatContacts = async (req, res) => {
  try {
    const contadorId = req.user.id;

    if (req.user.role !== ROLES.CONTADOR) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    console.log(`[getChatContacts] Buscando OSCs para o contador ID: ${contadorId}`);

    const query = `
      SELECT 
        o.id, 
        o.name, 
        'OSC' as role,
        
        (SELECT text FROM messages m 
         WHERE (m.sender_id = o.id OR m.receiver_id = o.id) 
         ORDER BY m.created_at DESC LIMIT 1) as lastMessage,
         
        (SELECT created_at FROM messages m 
         WHERE (m.sender_id = o.id OR m.receiver_id = o.id) 
         ORDER BY m.created_at DESC LIMIT 1) as lastMessageTime,

        (SELECT COUNT(*) FROM messages m 
         WHERE m.sender_id = o.id 
           AND m.receiver_id = ? 
           AND m.read_at IS NULL) as unreadCount

      FROM oscs o
      WHERE o.assigned_contador_id = ?
    `;

    const [rows] = await pool.execute(query, [contadorId, contadorId]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro no controlador getChatContacts:', error);
    res.status(500).json({ message: 'Erro ao buscar lista de contatos.' });
  }
};

/**
 * @desc    Busca o histórico de mensagens da OSC logada.
 * @route   GET /api/messages/my
 * @access  Privado (OSC)
 */
export const getMyMessages = async (req, res) => {
  try {
    const oscId = req.user.id;
    
    if (req.user.role !== ROLES.OSC) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // Busca quem é o contador desta OSC
    const contador = await OscModel.findContadorForOsc(oscId);
    
    // --- LÓGICA CRÍTICA: Retorna 404 se não houver contador ---
    if (!contador) {
      console.log('[getMyMessages] OSC sem contador vinculado.');
      return res.status(404).json({ 
        code: 'NO_CONTADOR', 
        message: 'Esta OSC não está vinculada a nenhum escritório de contabilidade.' 
      });
    }

    // Se tiver contador, busca as mensagens
    const messages = await MessageModel.findConversationHistory(oscId, contador.id);
    res.status(200).json(messages);

  } catch (error) {
    console.error('Erro no controlador getMyMessages:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar mensagens.' });
  }
};

/**
 * @desc    Busca o histórico de mensagens de uma OSC específica.
 * @route   GET /api/messages/:oscId
 * @access  Privado (Contador)
 */
export const getMessagesHistory = async (req, res) => {
  try {
    const contadorId = req.user.id;
    if (req.user.role !== ROLES.CONTADOR) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const { oscId } = req.params;

    const isAssigned = await OscModel.isOscAssignedToContador(oscId, contadorId);
    if (!isAssigned) {
      return res.status(403).json({ message: 'Acesso negado. Esta OSC não está associada a si.' });
    }

    const messages = await MessageModel.findConversationHistory(oscId, contadorId);
    res.status(200).json(messages);

  } catch (error) {
    console.error('Erro no controlador getMessagesHistory:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Envia uma nova mensagem.
 * @route   POST /api/messages
 * @access  Privado (OSC ou Contador)
 */
export const sendMessage = async (req, res) => {
  try {
    const { id: fromId, role: fromRole, name: fromName } = req.user;
    const { text, toOscId } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'O texto da mensagem não pode estar vazio.' });
    }

    let oscId, contadorId, senderRole;

    if (fromRole === ROLES.OSC) {
      oscId = fromId;
      const contador = await OscModel.findContadorForOsc(oscId);
      if (!contador) {
        return res.status(400).json({ message: 'Não é possível enviar mensagem. OSC não associada a um contador.' });
      }
      contadorId = contador.id;
      senderRole = ROLES.OSC;

    } else if (fromRole === ROLES.CONTADOR) {
      contadorId = fromId;
      oscId = toOscId;
      if (!oscId) {
        return res.status(400).json({ message: 'O ID da OSC destinatária (toOscId) é obrigatório.' });
      }
      const isAssigned = await OscModel.isOscAssignedToContador(oscId, contadorId);
      if (!isAssigned) {
        return res.status(403).json({ message: 'Acesso negado. Esta OSC não está associada a si.' });
      }
      senderRole = ROLES.CONTADOR;
    
    } else {
      return res.status(403).json({ message: 'Perfil inválido.' });
    }

    const messageData = {
      osc_id: oscId,
      contador_id: contadorId,
      text: text.trim(),
      sender_role: senderRole,
      sender_id: fromId,
      from_name: fromName,
    };
    
    const newMessage = await MessageModel.createMessage(messageData);
    res.status(201).json(newMessage);

  } catch (error) {
    console.error('Erro no controlador sendMessage:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao enviar mensagem.' });
  }
};