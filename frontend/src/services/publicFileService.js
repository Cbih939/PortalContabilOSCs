import api from './api';

export const getFilesByCategory = async (category) => {
  const response = await api.get(`/public-files${category ? `?category=${category}` : ''}`);
  return response.data;
};

export const uploadFile = async (formData) => {
  // IMPORTANTE: Não defina 'Content-Type' manualmente aqui se estiver usando FormData.
  // O Axios/Navegador fará isso automaticamente com o 'boundary' correto.
  const response = await api.post('/public-files', formData);
  return response.data;
};

export const deleteFile = async (id) => {
  const response = await api.delete(`/public-files/${id}`);
  return response.data;
};