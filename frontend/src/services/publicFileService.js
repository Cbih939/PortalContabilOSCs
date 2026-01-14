import api from './api';

export const getFilesByCategory = async (category) => {
  const response = await api.get(`/public-files${category ? `?category=${category}` : ''}`);
  return response.data;
};

export const uploadFile = async (formData) => {
  // O Axios identifica automaticamente o FormData e define o Content-Type correto
  // NÃO adicione { headers: { 'Content-Type': 'application/json' } } aqui.
  const response = await api.post('/public-files', formData);
  return response.data;
};

export const deleteFile = async (id) => {
  const response = await api.delete(`/public-files/${id}`);
  return response.data;
};