// src/services/oscService.js

import api from './api'; // Importa a instância configurada do Axios

/**
 * Busca a lista de TODAS as OSCs no sistema.
 * (Usado pelo Admin - ManageOSCs.js)
 *
 * @returns {Promise} A resposta da API (axios) com a lista de OSCs.
 */
export const getAllOSCs = () => {
  return api.get('/oscs');
  // Rota no Backend: GET /api/oscs
};

/**
 * Busca a lista de OSCs associadas ao Contador logado.
 * (Usado pelo Contador - OSCs.js)
 *
 * @returns {Promise} A resposta da API (axios) com a lista de OSCs.
 */
export const getMyOSCs = () => {
  // O backend usará o token JWT do Contador para filtrar as OSCs.
  return api.get('/oscs/my');
  // Rota no Backend: GET /api/oscs/my
};

/**
 * Busca os detalhes de uma única OSC pelo ID.
 * (Usado pelo Admin ou Contador para preencher modais)
 *
 * @param {string|number} oscId O ID da OSC.
 * @returns {Promise} A resposta da API (axios) com os dados da OSC.
 */
export const getOSCById = (oscId) => {
  return api.get(`/oscs/${oscId}`);
  // Rota no Backend: GET /api/oscs/:id
};

/**
 * Cria uma nova OSC no sistema.
 * (Usado pelo Admin ou Contador - OSCs.js)
 *
 * @param {object} oscData Os dados do formulário da nova OSC.
 * @returns {Promise} A resposta da API (axios) com a nova OSC criada.
 */
export const createOSC = (oscData) => {
  return api.post('/oscs', oscData);
  // Rota no Backend: POST /api/oscs
};

/**
 * Atualiza os dados de uma OSC existente.
 * (Usado pelo Contador (EditOSCModal.js) ou OSC (Profile.js))
 *
 * @param {string|number} oscId O ID da OSC a ser atualizada.
 * @param {object} oscData Os dados atualizados do formulário.
 * @returns {Promise} A resposta da API (axios) com a OSC atualizada.
 */
export const updateOSC = (oscId, oscData) => {
  return api.put(`/oscs/${oscId}`, oscData);
  // Rota no Backend: PUT /api/oscs/:id
};

/**
 * (Opcional) Associa uma OSC a um Contador.
 * (Usado pelo Admin - ManageOSCs.js)
 *
 * @param {string|number} oscId O ID da OSC.
 * @param {string|number} contadorId O ID do Contador.
 * @returns {Promise} A resposta da API (axios).
 */
export const assignContador = (oscId, contadorId) => {
  return api.patch(`/oscs/${oscId}/assign`, { contadorId });
  // Rota no Backend: PATCH /api/oscs/:id/assign
};

/**
 * (Opcional) Desativa (ou apaga) uma OSC.
 *
 * @param {string|number} oscId O ID da OSC.
 * @returns {Promise} A resposta da API (axios).
 */
export const deleteOSC = (oscId) => {
  return api.delete(`/oscs/${oscId}`);
  // Rota no Backend: DELETE /api/oscs/:id
};