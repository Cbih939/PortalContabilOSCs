// src/services/contadorService.js
import api from './api.js'; // Importa a instância Axios configurada

/**
 * Busca as estatísticas para o Dashboard do Contador logado.
 * @returns {Promise<object>} Ex: { activeOSCs: 3, pendingDocs: 2, unreadMessages: 1 }
 */
export const getDashboardStats = () => {
  // Rota: GET /api/contador/dashboard/stats
  return api.get('/contador/dashboard/stats');
};

/**
 * Busca as atividades recentes para o Dashboard do Contador logado.
 * @returns {Promise<Array>} Ex: [{ id: 'doc-1', oscName: '...', type: 'file', content: '...', timestamp: '...' }, ...]
 */
export const getRecentActivity = () => {
  // Rota: GET /api/contador/dashboard/activity
  return api.get('/contador/dashboard/activity');
};

/**
 * Busca as notificações (não lidas ou recentes) para o Contador logado.
 * (Assume endpoint GET /api/contador/notifications no backend)
 * @returns {Promise<Array>} Lista de notificações. Ex: [{ id: 1, oscName: '...', type: 'message', content: '...', timestamp: '...' }, ...]
 */
export const getNotifications = () => {
  // Rota: GET /api/contador/notifications
  return api.get('/contador/notifications');
};