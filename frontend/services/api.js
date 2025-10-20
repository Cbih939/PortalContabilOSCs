// src/services/api.js

import axios from 'axios';

// 1. Define o URL base da sua API
//    O Vite usa 'VITE_API_URL' das variáveis de ambiente (.env)
//    Para desenvolvimento: 'http://localhost:5000/api'
//    Para produção: 'http://[IP_DA_SUA_VPS]:[PORTA]/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 2. Cria a instância do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Interceptor (Magia Automática)
//    Este interceptor é executado *antes* de CADA requisição.
//    Ele lê o 'token' do localStorage (que o AuthContext salvou)
//    e o adiciona ao cabeçalho 'Authorization'.
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

// 4. Exporta a instância configurada
export default api;