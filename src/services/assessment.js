import api from './api';

export const createCourse = async (roomData) => {
    return await api.post('/course/create-course', roomData);
};

export const getAllQuestions = async () => {
    const res = await api.get('/assessment/get-questions');
    return res.data;
};