// src/services/oscService.js
import api from './api.js';

/** Busca as OSCs associadas ao Contador logado */
export const getMyOSCs = () => {
  return api.get('/oscs/my');
};

/** Busca detalhes de uma OSC pelo ID */
export const getOSCById = (oscId) => {
  return api.get(`/oscs/${oscId}`); // Rota: GET /api/oscs/:id
};

/** Cria uma nova OSC */
export const createOSC = (oscData) => {
  return api.post('/oscs', oscData);
};

/** Atualiza uma OSC */
export const updateOSC = (oscId, oscData) => {
  return api.put(`/oscs/${oscId}`, oscData);
};

// (Adicionar assignContador, deleteOSC se necessário)