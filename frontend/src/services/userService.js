// src/services/userService.js
import api from './api.js'; // Importa a instância Axios configurada

/**
 * Atualiza o perfil do utilizador logado.
 * O backend (controlador) deve verificar se o ID do utilizador logado
 * é o mesmo do ID na URL (ou se é um Admin).
 *
 * @param {string|number} userId O ID do utilizador a ser atualizado.
 * @param {object} profileData - { name, email } (ou outros campos)
 * @returns {Promise<object>} A resposta da API (axios) com o utilizador atualizado.
 */
export const updateMyProfile = (userId, profileData) => {
  // Usa a rota PUT /api/users/:id que já definimos no backend
  // (O controlador user.controller.js precisa permitir que o próprio utilizador se edite)
  return api.put(`/users/${userId}`, profileData);
};

// (Outras funções de gestão de utilizador, ex: changePassword, podem vir aqui)