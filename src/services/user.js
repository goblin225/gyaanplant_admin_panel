import api from './api';

export const addUser = async (userData) => {
  const res = await api.post('/user/add-user', userData);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get('/user/getAllUsers');
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/user/getbyid/${id}`);
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await api.put(`/user/update-profile/${id}`, payload);
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

export const deleteUser = async (id) => {
    const res = await api.delete(`/user/delete-user/${id}`);
    return res.data;
};