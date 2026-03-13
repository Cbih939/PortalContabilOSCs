// src/services/officeService.js
import api from './api';

export const getOffices = async () => {
  const response = await api.get('/offices');
  return response.data;
};

export const createOffice = async (officeData) => {
  const response = await api.post('/offices', officeData);
  return response.data;
};

export const updateOffice = async (id, officeData) => {
  const response = await api.put(`/offices/${id}`, officeData);
  return response.data;
};

export const deleteOffice = async (id) => {
  const response = await api.delete(`/offices/${id}`);
  return response.data;
};