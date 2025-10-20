// backend/src/controllers/msg.controller.js

// (Assumimos que estes ficheiros existirão em '../models/' e '../utils/')
import * as MessageModel from '../models/message.model.js';
import * as OscModel from '../models/osc.model.js'; // Precisamos disto para verificar permissões
import { ROLES } from '../utils/constants.js';

/**
 * @desc    Busca o histórico de mensagens da OSC logada.
 * @route   GET /api/messages/my
 * @access  Privado (OSC)
 */
export const getMyMessages = async (req, res) => {
  try {
    // 1. O 'req.user.id' é o ID da OSC (injetado pelo middleware de auth)
    const oscId = req.user.id;
    if (req.user.role !== ROLES.OSC) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 2. A OSC só fala com o seu Contador. Encontra quem é.
    const contador = await OscModel.findContadorForOsc(oscId);
    if (!contador) {
      // OSC não está associada a ninguém, retorna histórico vazio
      return res.status(200).json([]);
    }

    // 3. Busca a conversa entre esta OSC e o seu Contador
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
    // 1. O 'req.user.id' é o ID do Contador
    const contadorId = req.user.id;
    if (req.user.role !== ROLES.CONTADOR) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 2. O ID da OSC vem da URL (ex: /api/messages/123)
    const { oscId } = req.params;

    // 3. VERIFICAÇÃO DE SEGURANÇA (Crítico):
    //    Este Contador tem permissão para ver as mensagens desta OSC?
    const isAssigned = await OscModel.isOscAssignedToContador(oscId, contadorId);
    
    if (!isAssigned) {
      return res.status(403).json({ 
        message: 'Acesso negado. Esta OSC não está associada a si.' 
      });
    }

    // 4. Busca a conversa
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
 * @body    { text: string, toOscId?: string }
 * - Se a OSC envia: { text: "..." }
 * - Se o Contador envia: { text: "...", toOscId: "123" }
 */
export const sendMessage = async (req, res) => {
  try {
    const { id: fromId, role: fromRole, name: fromName } = req.user;
    const { text, toOscId } = req.body; // 'toOscId' só vem do Contador

    // 1. Validação de entrada
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'O texto da mensagem não pode estar vazio.' });
    }

    let oscId, contadorId, senderRole;

    // 2. Determina os IDs da conversa (osc_id, contador_id)
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
      
      // VERIFICAÇÃO DE SEGURANÇA: O Contador pode enviar para esta OSC?
      const isAssigned = await OscModel.isOscAssignedToContador(oscId, contadorId);
      if (!isAssigned) {
        return res.status(403).json({ message: 'Acesso negado. Esta OSC não está associada a si.' });
      }
      senderRole = ROLES.CONTADOR;
    
    } else {
      return res.status(403).json({ message: 'Perfil de utilizador inválido para enviar mensagens.' });
    }

    // 3. Prepara os dados para o modelo do banco de dados
    //    (Este schema é robusto e permite identificar facilmente a conversa)
    const messageData = {
      osc_id: oscId,
      contador_id: contadorId,
      text: text.trim(),
      sender_role: senderRole,
      sender_id: fromId, // (Opcional, mas bom para rastreio)
      
      // (Campos do mock para facilitar o frontend, se o modelo os suportar)
      from_name: fromName,
      // (O 'to_name' pode ser buscado aqui, ou o frontend pode deduzir)
    };

    // 4. Cria a mensagem no banco
    const newMessage = await MessageModel.createMessage(messageData);

    // 5. (Opcional, mas recomendado) Emitir um evento de WebSocket/Socket.io aqui
    //    para notificar o destinatário em tempo real.
    //    ex: io.to(receptorId).emit('new_message', newMessage);

    // 6. Retorna a mensagem criada
    res.status(201).json(newMessage);

  } catch (error) {
    console.error('Erro no controlador sendMessage:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao enviar mensagem.' });
  }
};