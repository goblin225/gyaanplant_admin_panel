import api from './api';

export const createCategory = async (categoryData) => {
    return await api.post('/category/create-category', categoryData);
};

export const getAllCategory = async () => {
    const res = await api.get('/category/get-category');
    return res.data;
};

export const deleteCategory = async (id) => {
    const res = await api.delete(`/category/delete-category/${id}`);
    return res.data;
};