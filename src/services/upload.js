import api from './api';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return res.data.file.filePath;
};
