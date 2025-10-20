// src/services/alertService.js

import api from './api'; // Importa a instância configurada do Axios

/**
 * Busca todos os alertas/avisos para a OSC logada.
 * (Usado pela página da OSC - AlertsModal.js)
 *
 * @returns {Promise} A resposta da API (axios) com a lista de alertas
 */
export const getAlerts = () => {
  // O backend saberá qual OSC está logada através do token JWT.
  return api.get('/alerts');
  // Rota no Backend: GET /api/alerts
};

/**
 * Marca um alerta específico como lido.
 * (Usado pela página da OSC - AlertsModal.js)
 *
 * @param {string|number} alertId O ID do alerta a ser marcado
 * @returns {Promise} A resposta da API (axios)
 */
export const markAlertAsRead = (alertId) => {
  // O backend não precisa de um 'body', apenas o ID na URL.
  return api.patch(`/alerts/${alertId}/read`);
  // Rota no Backend: PATCH /api/alerts/:alertId/read
};

/**
 * Envia um novo aviso (do "Canal de Avisos") para uma ou todas as OSCs.
 * (Usado pela página do Contador - Notices.js)
 *
 * @param {object} noticeData - { oscId: (string|null), type: string, title: string, message: string }
 * @returns {Promise} A resposta da API (axios) com o aviso criado
 */
export const sendNotice = (noticeData) => {
  // O backend (ex: /notices) decidirá se é para 'all' (se oscId=null) ou para um.
  return api.post('/notices', noticeData);
  // Rota no Backend: POST /api/notices
};

/**
 * Envia um alerta de alta prioridade para uma OSC específica.
 * (Usado pela página do Contador - SendAlertModal.js)
 *
 * @param {object} alertData - { oscId: string, title: string, message: string }
 * @returns {Promise} A resposta da API (axios) com o alerta criado
 */
export const sendAlertToOSC = (alertData) => {
  // Esta pode ser uma rota diferente de 'notices' se
  // a lógica de negócio for diferente (ex: prioridade).
  return api.post('/alerts', alertData);
  // Rota no Backend: POST /api/alerts
};