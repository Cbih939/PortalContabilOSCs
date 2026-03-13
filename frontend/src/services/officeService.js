import api from './api';

export const getOffices = async () => {
  const response = await api.get('/offices');
  return response.data;
};

export const createOffice = async (officeData) => {
  const response = await api.post('/offices', officeData);
  return response.data;
};