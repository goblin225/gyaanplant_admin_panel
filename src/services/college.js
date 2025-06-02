import api from './api';

export const registerCollege = async (credentials) => {
  const response = await api.post('/auth/college/reg-college', credentials);

  return response.data;
};