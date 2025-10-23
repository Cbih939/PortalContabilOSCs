// src/services/api.js

import axios from 'axios';

// 1. Define o URL base da sua API
//    Use variáveis de ambiente (.env) para isto em produção
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // Porta do backend

// 2. Cria a instância do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Interceptor para Adicionar o Token JWT Automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// (Opcional) Interceptor de Resposta para tratar erros 401 (token expirado/inválido) globalmente
/*
api.interceptors.response.use(
  (response) => response, // Se a resposta for OK (2xx), apenas a retorna
  async (error) => {
    const originalRequest = error.config;
    // Se for erro 401 E não for uma tentativa de refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('[API Interceptor] Token inválido ou expirado. Tentando deslogar...');
      // Tenta deslogar o utilizador (limpa localStorage, estado)
      // Idealmente, isto chamaria a função logout do AuthContext,
      // mas importar contextos aqui pode causar dependências circulares.
      // Uma solução é usar um event bus ou chamar diretamente localStorage.clear()
      // e depois forçar um reload da página.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redireciona forçadamente para o login
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }
    // Retorna outros erros (400, 404, 500, etc.) para serem tratados pelo useApi/componente
    return Promise.reject(error);
  }
);
*/

// 4. Exporta a instância configurada
export default api;