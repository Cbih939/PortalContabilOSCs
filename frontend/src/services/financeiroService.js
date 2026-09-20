import api from './api.js';

// Financeiro (Admin: global | ADM Contador: somente o próprio escritório — o escopo é aplicado no servidor)
export const getStats = async () => (await api.get('/financeiro/stats')).data;
export const listOscs = async (query = '') => (await api.get('/financeiro/oscs', { params: { query } })).data;
export const setDebtStatus = async (id, isInDebt) => (await api.patch(`/financeiro/oscs/${id}/status`, { is_in_debt: isInDebt })).data;
export const getPaymentHistory = async () => (await api.get('/financeiro/historico')).data;

// Somente Admin
export const getStripeConfig = async () => (await api.get('/financeiro/config')).data;
export const saveStripeConfig = async (config) => (await api.post('/financeiro/config', config)).data;
