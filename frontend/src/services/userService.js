// src/services/userService.js
import api from './api.js'; // Importa a instância Axios configurada

/**
 * Atualiza o perfil do utilizador logado (ex: Contador, OSC).
 * @param {string|number} userId O ID do utilizador a ser atualizado.
 * @param {object} profileData - { name, email } (ou outros campos)
 * @returns {Promise<object>} A resposta da API (axios) com o utilizador atualizado.
 */
export const updateMyProfile = (userId, profileData) => {
  // O backend (user.controller.js) verifica se 'isSelf'
  return api.put(`/users/${userId}`, profileData);
};

/**
 * [ADMIN] Busca todos os utilizadores do sistema.
 * Requer token de Admin.
 * @returns {Promise<Array>} Lista de todos os utilizadores.
 */
export const getAllUsers = () => {
  // Rota: GET /api/users
  return api.get('/users');
};

/**
 * [ADMIN] Cria um novo utilizador (Admin ou Contador).
 * @param {object} userData - { name, email, password, role }
 * @returns {Promise<object>} O novo utilizador criado.
 */
export const createUser = (userData) => {
  // Rota: POST /api/users
  return api.post('/users', userData);
};

/**
 * [ADMIN] Atualiza os dados de um utilizador (diferente de updateMyProfile).
 * @param {string|number} userId O ID do utilizador a atualizar.
 * @param {object} updateData - { name?, email?, role?, status? }
 * @returns {Promise<object>} O utilizador atualizado.
 */
export const updateUser = (userId, updateData) => {
  // Rota: PUT /api/users/:id
  return api.put(`/users/${userId}`, updateData);
};

/**
 * [ADMIN] Apaga um utilizador.
 * @param {string|number} userId O ID do utilizador a apagar.
 * @returns {Promise}
 */
export const deleteUser = (userId) => {
  // Rota: DELETE /api/users/:id
  return api.delete(`/users/${userId}`);
};

// (Outras funções de gestão de utilizador, ex: changePassword, podem vir aqui)