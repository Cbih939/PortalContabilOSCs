import api from './api.js';

export const getFilesByCategory = async (category) => {
  const response = await api.get(`/public-files?category=${category}`);
  return response.data;
};

export const uploadFile = async (formData) => {
  // Nota: O content-type multipart é gerido automaticamente pelo browser/axios ao passar FormData
  const response = await api.post('/public-files', formData);
  return response.data;
};

export const deleteFile = async (id) => {
  const response = await api.delete(`/public-files/${id}`);
  return response.data;
};