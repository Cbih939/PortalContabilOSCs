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
 * Corrigido para aceitar tanto um objeto quanto parâmetros separados.
 */
export const sendMessage = async (arg1, arg2) => {
  let payload = {};

  // Lógica Robusta: Verifica se o primeiro argumento é um objeto com as propriedades
  if (typeof arg1 === 'object' && arg1 !== null && arg1.receiver_id) {
    payload = {
      receiver_id: arg1.receiver_id,
      content: arg1.content
    };
  } else {
    // Se não for objeto, assume que arg1 é o ID e arg2 é o texto
    payload = {
      receiver_id: arg1,
      content: arg2
    };
  }

  // Validação Crítica
  if (!payload.receiver_id || !payload.content) {
    console.error("Erro de validação no Service:", payload);
    throw new Error("ID do destinatário ou conteúdo ausente.");
  }

  const response = await api.post('/messages', payload);
  return response.data;
};

export const getMessagesHistory = (oscId) => getMessages(oscId);