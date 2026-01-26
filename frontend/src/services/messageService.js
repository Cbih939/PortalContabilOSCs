import api from './api.js';

/**
 * Busca a lista de contatos (OSCs vinculadas) para a barra lateral.
 */
export const getContacts = async () => {
  const response = await api.get('/messages/contacts');
  return response.data;
};

/**
 * Busca o histórico de mensagens de um contato específico.
 */
export const getMessages = async (contactId) => {
  const response = await api.get(`/messages/${contactId}`);
  return response.data;
};

/**
 * Busca o histórico de mensagens da própria OSC logada.
 */
export const getMyMessages = async () => {
  const response = await api.get('/messages/my');
  return response.data;
};

/**
 * ENVIO DE MENSAGEM - CORREÇÃO CRÍTICA
 * Esta função agora garante a persistência no banco para todos os perfis.
 */
export const sendMessage = async (arg1, arg2) => {
  let payload = {};

  // Se receber um objeto (Ex: Contador enviando)
  if (typeof arg1 === 'object' && arg1 !== null) {
    payload = {
      receiver_id: arg1.receiver_id || arg1.id,
      content: arg1.content || arg1.text
    };
  } else {
    // Se receber parâmetros soltos (Ex: fallback de componentes antigos)
    payload = {
      receiver_id: arg1,
      content: arg2
    };
  }

  // Validação antes do POST para evitar erro 400/500 no Banco
  if (!payload.receiver_id || !payload.content) {
    console.error("Erro de Validação no Service: Dados ausentes", payload);
    throw new Error("Destinatário ou conteúdo ausente.");
  }

  const response = await api.post('/messages', payload);
  return response.data;
};

export const getMessagesHistory = (oscId) => getMessages(oscId);