// src/services/api.js
import axios from 'axios';

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  // REMOVIDO: 'Content-Type': 'application/json'
  // Deixe que o Axios defina o Content-Type automaticamente com base nos dados enviados.
});

// Interceptor para Token JWT
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

export default api;