// src/services/authService.js
import api from './api.js'; // Importa axios configurado

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
  // Espera resposta: { data: { user: {...}, token: "..." } }
};

// (validateToken e logout podem ser adicionados/mantidos)
export const validateToken = () => {
  return api.get('/auth/me');
};