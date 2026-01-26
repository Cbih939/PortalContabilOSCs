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
 * ENVIO DE MENSAGEM CORRIGIDO
 * Garante que o Contador consiga salvar no banco identificando a OSC selecionada.
 */
export const sendMessage = async (arg1, arg2) => {
  let payload = {};

  // Se receber um objeto (Padrão novo)
  if (typeof arg1 === 'object' && arg1 !== null) {
    payload = {
      receiver_id: arg1.receiver_id || arg1.id,
      content: arg1.content || arg1.text
    };
  } else {
    // Se receber parâmetros soltos (Padrão antigo/fallback)
    payload = {
      receiver_id: arg1,
      content: arg2
    };
  }

  // Validação Crítica: Impede envio sem destinatário
  if (!payload.receiver_id || !payload.content) {
    console.error("Falha no payload:", payload);
    throw new Error("Dados insuficientes: receiver_id ou content ausente.");
  }

  // Dispara o POST para o banco de dados
  const response = await api.post('/messages', payload);
  return response.data;
};

export const getMessagesHistory = (oscId) => getMessages(oscId);