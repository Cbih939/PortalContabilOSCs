// src/services/messageService.js

import api from './api'; // Importa a instância configurada do Axios

/**
 * Busca o histórico de mensagens de uma OSC específica.
 * (Usado pelo Contador - Messages.js)
 *
 * @param {string|number} oscId O ID da OSC cuja conversa será carregada.
 * @returns {Promise} A resposta da API (axios) com a lista de mensagens.
 */
export const getMessagesHistory = (oscId) => {
  // A rota espera o ID da OSC como parâmetro
  return api.get(`/messages/${oscId}`);
  // Rota no Backend: GET /api/messages/:oscId
};

/**
 * Busca o histórico de mensagens da OSC logada.
 * (Usado pela OSC - Messages.js)
 *
 * @returns {Promise} A resposta da API (axios) com a lista de mensagens.
 */
export const getMyMessages = () => {
  // O backend usará o token JWT da OSC para encontrar
  // o contador associado e retornar a conversa correta.
  return api.get('/messages/my');
  // Rota no Backend: GET /api/messages/my
};

/**
 * Envia uma nova mensagem.
 * (Usado por Contador e OSC através do hook 'useApi')
 *
 * @param {object} messageData - { to: (string|number), text: string }
 * - 'to' é o ID do utilizador (OSC ou Contador) que receberá a mensagem.
 * - O backend identificará o 'from' (remetente) através do token JWT.
 * @returns {Promise} A resposta da API (axios) com a nova mensagem criada.
 */
export const sendMessage = (messageData) => {
  // messageData = { to: 'ID_DESTINATARIO', text: 'Olá!' }
  return api.post('/messages', messageData);
  // Rota no Backend: POST /api/messages
};