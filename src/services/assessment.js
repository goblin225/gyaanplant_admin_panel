import api from './api';

export const createQuestion = async (questionData) => {
    return await api.post('/assessment/create-question', questionData);
};

export const getAllQuestions = async () => {
    const res = await api.get('/assessment/get-questions');
    return res.data;
};