// src/services/alertService.js

import api from './api.js'; // Importa a instância configurada do Axios

/**
 * Busca todos os alertas/avisos para a OSC logada.
 * (Usado pela página da OSC - AlertsModal.jsx)
 * @returns {Promise} Resposta da API (axios) com a lista de alertas
 */
export const getAlerts = () => {
  return api.get('/alerts');
};

/**
 * Marca um alerta específico como lido.
 * (Usado pela página da OSC - AlertsModal.jsx)
 * @param {string|number} alertId O ID do alerta a ser marcado
 * @returns {Promise} Resposta da API (axios)
 */
export const markAlertAsRead = (alertId) => {
  return api.patch(`/alerts/${alertId}/read`);
};

/**
 * Envia um novo aviso (do "Canal de Avisos") para uma ou todas as OSCs.
 * (Usado pela página do Contador - Notices.jsx)
 * @param {object} noticeData - { oscId: (string|null), type: string, title: string, message: string }
 * @returns {Promise} Resposta da API (axios) com o aviso criado
 */
export const sendNotice = (noticeData) => {
  return api.post('/notices', noticeData); // Backend decide se é 'all' ou específico
};

/**
 * Envia um alerta de alta prioridade para uma OSC específica.
 * (Usado pela página do Contador - OSCs.jsx -> SendAlertModal.jsx)
 * @param {object} alertData - { oscId: string, title: string, message: string }
 * @returns {Promise} Resposta da API (axios) com o alerta criado
 */
export const sendAlertToOSC = (alertData) => {
  return api.post('/alerts', alertData); // Pode usar a mesma rota de /notices se a lógica for igual
};


/**
 * Busca o histórico de avisos enviados pelo Contador logado.
 * (Usado pela página do Contador - Notices.jsx)
 * @returns {Promise<Array>} Lista de avisos enviados.
 */
export const getSentNoticesHistory = () => {
  // Assume que o backend terá esta rota protegida para Contador
  return api.get('/notices/history');
};