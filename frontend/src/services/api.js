import axios from 'axios';

// CORREÇÃO: Usar URL absoluta para evitar que o browser se perca na VPS
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://contacomigo.org.br/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  // Opcional: tempo limite para evitar que a requisição fique "pendurada"
  timeout: 10000, 
});

// Interceptor para Token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Usar a sintaxe padrão de headers
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta (Útil para debugar 404 e 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sessão expirada, redirecionando...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;