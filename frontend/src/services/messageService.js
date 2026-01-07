import api from './api.js';

/**
 * Busca a lista de contatos (OSCs vinculadas) para a barra lateral do Contador.
 * Rota: GET /api/messages/contacts
 * Retorna: Array de objetos com { id, name, lastMessage, unreadCount, ... }
 */
export const getContacts = async () => {
  const response = await api.get('/messages/contacts');
  return response.data;
};

/**
 * Busca o histórico de mensagens de uma OSC específica.
 * Usado pelo CONTADOR ao clicar em um contato na barra lateral.
 * Rota: GET /api/messages/:oscId
 */
export const getMessages = async (oscId) => {
  const response = await api.get(`/messages/${oscId}`);
  return response.data;
};

/**
 * Busca o histórico de mensagens da própria OSC logada.
 * Usado pela OSC na tela de Mensagens.
 * Rota: GET /api/messages/my
 * Nota: Retorna 404 se a OSC não tiver contador vinculado.
 */
export const getMyMessages = async () => {
  const response = await api.get('/messages/my');
  return response.data;
};

/**
 * Envia uma nova mensagem.
 * Rota: POST /api/messages
 * * @param {number|null} toOscId - ID da OSC destinatária (Obrigatório se for Contador enviando). Null se for OSC.
 * @param {string} text - O conteúdo da mensagem.
 * @param {File|null} file - Arquivo anexo (Preparado para implementação futura).
 */
export const sendMessage = async (toOscId, text, file) => {
  // Prepara o corpo da requisição
  const payload = {
    text: text
  };

  // Se for o Contador enviando, ele precisa especificar para qual OSC é
  if (toOscId) {
    payload.toOscId = toOscId;
  }

  // Nota: Se o backend suportar upload de arquivos na mesma rota no futuro,
  // esta lógica mudará para usar 'FormData'. Por enquanto, envia JSON.
  
  const response = await api.post('/messages', payload);
  return response.data;
};

// Funções auxiliares para compatibilidade (caso algum componente antigo as chame)
export const getMessagesHistory = (oscId) => getMessages(oscId);