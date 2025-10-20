// backend/src/services/auth.service.js

import api from './api'; // Importa a instância configurada do Axios

/**
 * Envia as credenciais (email/senha) para a API para autenticação.
 *
 * @param {string} email O email do utilizador.
 * @param {string} password A senha do utilizador.
 * @returns {Promise} A resposta da API (axios), que deve conter
 * { data: { user: {...}, token: "..." } }
 */
export const login = (email, password) => {
  // Faz um POST para a rota de login do backend
  // O backend deve validar o email/senha e retornar
  // o objeto do utilizador e um token JWT.
  return api.post('/auth/login', { email, password });
  // Rota no Backend: POST /api/auth/login
};

/**
 * Valida o token JWT armazenado no localStorage.
 *
 * Esta função é chamada pelo AuthContext na inicialização da app.
 * Ela faz uma requisição autenticada (o 'api' interceptor
 * anexa o token automaticamente).
 *
 * @returns {Promise} A resposta da API (axios), que deve conter
 * { data: { user: {...} } }
 */
export const validateToken = () => {
  // Faz um GET para uma rota protegida que retorna os dados
  // do utilizador baseado no token enviado.
  // Se o token for inválido, a API retornará 401,
  // o 'api' (axios) lançará um erro, e o AuthContext
  // fará o logout (catch).
  return api.get('/auth/me');
  // Rota no Backend: GET /api/auth/me (requer autenticação)
};

/**
 * (Opcional) Função de Logout no Backend.
 *
 * Alguns backends (especialmente os que usam 'refresh tokens'
 * em httpOnly cookies) exigem uma chamada de API para invalidar
 * o token no servidor.
 *
 * @returns {Promise} A resposta da API (axios)
 */
export const logout = () => {
  // Se o seu backend for 'stateless' (apenas JWTs), esta
  // função não é necessária, e o logout é feito apenas
  // no frontend (como o AuthContext já faz).
  // Se for 'stateful', você chamaria:
  // return api.post('/auth/logout');
  // Rota no Backend: POST /api/auth/logout
  return Promise.resolve(); // Retorna uma promessa resolvida
};