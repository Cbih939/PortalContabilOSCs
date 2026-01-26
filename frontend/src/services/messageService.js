import api from './api.js';

export const getContacts = async () => {
  const response = await api.get('/messages/contacts');
  return response.data;
};

export const getMessages = async (oscId) => {
  const response = await api.get(`/messages/${oscId}`);
  return response.data;
};

export const getMyMessages = async () => {
  const response = await api.get('/messages/my');
  return response.data;
};

/**
 * Envia uma nova mensagem.
 * Esta função foi blindada para aceitar o formato de objeto enviado pelo Messages.jsx.
 */
export const sendMessage = async (payload) => {
  // Validação preventiva no frontend
  if (!payload || !payload.receiver_id || !payload.content) {
    console.error("Payload de mensagem inválido:", payload);
    throw new Error("Dados de mensagem incompletos.");
  }

  // Envia explicitamente os dados para a rota POST /api/messages
  const response = await api.post('/messages', {
    receiver_id: payload.receiver_id,
    content: payload.content
  });
  
  return response.data;
};

export const getMessagesHistory = (oscId) => getMessages(oscId);