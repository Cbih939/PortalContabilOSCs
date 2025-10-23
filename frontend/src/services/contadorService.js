// src/services/contadorService.js
import api from './api.js'; // Importa a instância Axios configurada

/**
 * Busca as estatísticas para o Dashboard do Contador logado.
 * @returns {Promise<object>} Ex: { activeOSCs: 3, pendingDocs: 2, unreadMessages: 1 }
 */
export const getDashboardStats = () => {
  return api.get('/contador/dashboard/stats');
};

/**
 * Busca as atividades recentes para o Dashboard do Contador logado.
 * @returns {Promise<Array>} Ex: [{ id: 'doc-1', oscName: '...', type: 'file', content: '...', timestamp: '...' }, ...]
 */
export const getRecentActivity = () => {
  return api.get('/contador/dashboard/activity');
};