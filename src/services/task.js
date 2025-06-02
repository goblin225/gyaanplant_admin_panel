import api from './api';

export const addTask = async (taskData) => {
  const res = await api.post('/task/add-task', taskData);
  return res.data;
};

export const editTask = async (taskData) => {
  const res = await api.put('/task/add-task', taskData);
  return res.data;
};

export const getAllTask = async () => {
  const res = await api.get('/task/getall-tasks');
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await api.delete(`/task/delete-task/${taskId}`);
  return res.data;
};