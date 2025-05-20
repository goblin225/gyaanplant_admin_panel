import api from './api';

export const createCourse = async (roomData) => {
    return await api.post('/course/create-course', roomData);
};

export const getAllCourses = async () => {
    const res = await api.get('/course/get-course');
    return res.data;
};

export const deleteCourse = async (id) => {
    const res = await api.delete(`/course/delete-course/${id}`);
    return res.data;
};

export const editCourse = async (id, payload) => {
    const res = await api.put(`/course/edit-course/${id}`, payload);
    return res.data;
};