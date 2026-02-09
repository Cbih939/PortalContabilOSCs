// src/services/oscService.js
import api from './api.js';

/**
 * [ADMIN] Busca TODAS as OSCs no sistema.
 * Rota: GET /api/oscs
 */
export const getAllOSCs = async () => {
  const response = await api.get('/oscs');
  return response.data;
};

/**
 * [CONTADOR] Busca as OSCs associadas ao Contador logado.
 * Rota: GET /api/oscs/my
 */
export const getMyOSCs = async () => {
  const response = await api.get('/oscs/my');
  return response.data;
};

/**
 * [GERAL] Busca detalhes de uma OSC pelo ID.
 * Usado no Perfil da OSC e na edição pelo Contador/Admin.
 * Rota: GET /api/oscs/:id
 */
export const getOSCById = async (oscId) => {
  const response = await api.get(`/oscs/${oscId}`);
  return response.data;
};

/**
 * [CONTADOR/ADMIN] Cria uma nova OSC.
 * Nota: oscData deve ser um objeto FormData se houver envio de arquivos.
 * Rota: POST /api/oscs
 */
export const createOSC = async (oscData) => {
  const response = await api.post('/oscs', oscData);
  return response.data;
};

/**
 * [GERAL] Atualiza os dados de uma OSC.
 * Rota: PUT /api/oscs/:id
 */
export const updateOSC = async (oscId, oscData) => {
  const response = await api.put(`/oscs/${oscId}`, oscData);
  return response.data;
};

/**
 * [ADMIN] Associa uma OSC a um Contador manualmente.
 * Rota: PATCH /api/oscs/:id/assign
 */
export const assignContador = async (oscId, contadorId) => {
  const response = await api.patch(`/oscs/${oscId}/assign`, { contadorId });
  return response.data;
};

/**
 * [ADMIN] Remove uma OSC do sistema.
 * Rota: DELETE /api/oscs/:id
 */
export const deleteOSC = async (oscId) => {
  const response = await api.delete(`/oscs/${oscId}`);
  return response.data;
};

export const getMeusPagamentos = () => {
  return api.get('/oscs/financeiro/meus-pagamentos');
};