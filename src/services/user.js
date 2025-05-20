import api from './api';

export const createBooking = async () => {
  return await api.post('/booking/booking-create');
};

export const getAllUsers = async () => {
  const res = await api.get('/user/getAllUsers');
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/user/getbyid/${id}`);
  return res.data;
};

export const updateProfile = async (id, payload) => {
  const res = await api.put(`/user/update-profile/${id}`, payload);
  return res.data;
};

export const getRoles = async () => {
  const res = await api.get('/role/get-roles');
  return res.data;
};