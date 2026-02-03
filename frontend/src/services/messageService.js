import api from './api.js';

/**
 * LISTAR CONTATOS
 * Retorna sempre um Array para evitar erro .map()
 */
export const getContacts = async () => {
  try {
    const response = await api.get('/messages/contacts');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Erro ao carregar contatos:", err);
    return [];
  }
};

/**
 * OBTER MENSAGENS (CORRIGIDO)
 * Adicionada trava de segurança para retornar apenas o array de dados
 */
export const getMessages = async (contactId) => {
  try {
    if (!contactId) return [];
    const response = await api.get(`/messages?contactId=${contactId}`);
    // O React quebra se receber a resposta bruta do Axios. 
    // Esta linha garante que ele receba apenas a lista de mensagens.
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
    return [];
  }
};

/**
 * BUSCAR MINHAS MENSAGENS
 */
export const getMyMessages = async () => {
  try {
    const response = await api.get('/messages/my');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
};

/**
 * ENVIO DE MENSAGEM
 */
export const sendMessage = async (arg1, arg2) => {
  let payload = {};

  if (typeof arg1 === 'object' && arg1 !== null) {
    payload = {
      receiver_id: arg1.receiver_id || arg1.id,
      content: arg1.content || arg1.text
    };
  } else {
    payload = {
      receiver_id: arg1,
      content: arg2
    };
  }

  if (!payload.receiver_id || !payload.content) {
    throw new Error("Erro: Destinatário ou conteúdo ausente.");
  }

  const response = await api.post('/messages', payload);
  return response.data;
};

// Mantém compatibilidade com nomes antigos
export const getMessagesHistory = (contactId) => getMessages(contactId);