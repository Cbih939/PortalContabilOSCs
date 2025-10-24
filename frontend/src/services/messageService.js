// src/services/messageService.js
import api from './api.js';

/** Busca histórico entre Contador logado e uma OSC específica */
export const getMessagesHistory = (oscId) => {
  return api.get(`/messages/${oscId}`); // Rota GET /api/messages/:oscId
};

/** Busca histórico da OSC logada (com seu contador) */
export const getMyMessages = () => {
  return api.get('/messages/my');
};

/** Envia uma nova mensagem */
export const sendMessage = (messageData) => { // { toOscId?: ID, text: '...' } OU { toContadorId?: ID, text: '...' }
  return api.post('/messages', messageData);
};