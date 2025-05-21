import api from './api';

export const createCompany = async (roomData) => {
    return await api.post('/company/add-company', roomData);
};

export const getAllCompany = async () => {
    const res = await api.get('/company/getall');
    return res.data;
};

export const getByIdCompany = async (id) => {
    const res = await api.get(`/company/getbyid/${id}`);
    return res.data;
};

export const updateCompany = async (id, payload) => {
    const res = await api.put(`/company/update/${id}`, payload);
    return res;
};

export const deleteCompany = async (id) => {
    const res = await api.delete(`/company/delete/${id}`);
    return res.data;
};