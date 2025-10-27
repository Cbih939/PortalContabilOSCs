// backend/src/controllers/msg.controller.js

// Importa os modelos necessários
import * as MessageModel from '../models/message.model.js';
import * as OscModel from '../models/osc.model.js'; // Precisamos disto para verificar permissões
import { ROLES } from '../utils/constants.js'; // Importa ROLES

/**
 * @desc    Busca o histórico de mensagens da OSC logada.
 * @route   GET /api/messages/my
 * @access  Privado (OSC)
 */
export const getMyMessages = async (req, res) => {
  try {
    // 1. O 'req.user.id' é o ID da OSC (injetado pelo middleware de auth)
    const oscId = req.user.id;
    console.log(`[getMyMessages] Buscando mensagens para OSC ID: ${oscId}`); // <-- LOG 1

    if (req.user.role !== ROLES.OSC) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 2. A OSC só fala com o seu Contador. Encontra quem é.
    const contador = await OscModel.findContadorForOsc(oscId);
    console.log(`[getMyMessages] Contador encontrado para esta OSC:`, contador); // <-- LOG 2

    if (!contador) {
      console.log('[getMyMessages] OSC não associada a um contador. Retornando [].');
      return res.status(200).json([]); // Retorna histórico vazio
    }

    // 3. Busca a conversa entre esta OSC e o seu Contador
    const messages = await MessageModel.findConversationHistory(oscId, contador.id);
    console.log(`[getMyMessages] Modelo encontrou ${messages.length} mensagens.`); // <-- LOG 3

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
 * @body    { text: string, toOscId?: string } (Se Contador envia)
 * @body    { text: string } (Se OSC envia)
 */
export const sendMessage = async (req, res) => {
  try {
    const { id: fromId, role: fromRole, name: fromName } = req.user;
    const { text, toOscId } = req.body; // 'toOscId' só vem do Contador

    // --- LOG DE DEBUG ---
    console.log(`[SendMessage] Recebido: role=${fromRole}, fromId=${fromId}, text=${text}, toOscId=${toOscId}`);

    // 1. Validação de entrada
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'O texto da mensagem não pode estar vazio.' });
    }

    let oscId, contadorId, senderRole;

    // 2. Determina os IDs da conversa (osc_id, contador_id)
    if (fromRole === ROLES.OSC) {
      oscId = fromId;
      // 1. A OSC está a enviar. Descobre para qual contador.
      const contador = await OscModel.findContadorForOsc(oscId);
      if (!contador) {
        console.error(`[SendMessage] Falha: OSC ${oscId} não tem contador associado.`);
        return res.status(400).json({ message: 'Não é possível enviar mensagem. OSC não associada a um contador.' });
      }
      contadorId = contador.id;
      senderRole = ROLES.OSC;
      console.log(`[SendMessage] OSC (id:${oscId}) a enviar para Contador (id:${contadorId})`);

    } else if (fromRole === ROLES.CONTADOR) {
      contadorId = fromId;
      oscId = toOscId; // ID da OSC para quem o Contador está a enviar
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
    const messageData = {
      osc_id: oscId,
      contador_id: contadorId,
      text: text.trim(),
      sender_role: senderRole,
      sender_id: fromId,
      from_name: fromName,
    };
    
    // --- LOG DE DEBUG ---
    console.log('[SendMessage] A inserir no DB:', messageData);

    // 4. Cria a mensagem no banco
    const newMessage = await MessageModel.createMessage(messageData);

    // --- LOG DE DEBUG ---
    console.log('[SendMessage] Mensagem criada com sucesso:', newMessage);

    // 5. (Opcional) Emitir evento de WebSocket/Socket.io aqui

    // 6. Retorna a mensagem criada
    res.status(201).json(newMessage);

  } catch (error) {
    // --- LOG DE DEBUG ---
    console.error('Erro no controlador sendMessage:', error); // O erro que procuramos estará aqui
    res.status(500).json({ message: 'Erro interno do servidor ao enviar mensagem.' });
  }
};