import api from './api.js';

export const getContacts = async () => {
  const response = await api.get('/messages/contacts');
  return response.data;
};

export const getMessages = async (contactId) => {
  const response = await api.get(`/messages/${contactId}`);
  return response.data;
};

export const getMyMessages = async () => {
  const response = await api.get('/messages/my');
  return response.data;
};

/**
 * ENVIO DE MENSAGEM CORRIGIDO
 * Garante que o ID do destinatário (receiver_id) seja capturado corretamente.
 */
export const sendMessage = async (arg1, arg2) => {
  let payload = {};

  // Verifica se o componente enviou um objeto estruturado
  if (typeof arg1 === 'object' && arg1 !== null) {
    payload = {
      receiver_id: arg1.receiver_id || arg1.id,
      content: arg1.content || arg1.text
    };
  } else {
    // Fallback para parâmetros soltos (ID, Texto)
    payload = {
      receiver_id: arg1,
      content: arg2
    };
  }

  // VALIDAÇÃO PRÉVIA: Impede requisições vazias que geram erros de banco
  if (!payload.receiver_id || !payload.content) {
    console.error("Dados incompletos para envio:", payload);
    throw new Error("Erro: Destinatário ou conteúdo ausente.");
  }

  // O uso de POST garante que os dados sejam salvos e não lidos do cache (Erro 304)
  const response = await api.post('/messages', payload);
  return response.data;
};

export const getMessagesHistory = (oscId) => getMessages(oscId);