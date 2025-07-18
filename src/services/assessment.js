import api from './api';

export const createQuestion = async (questionData) => {
    return await api.post('/assessment/create-question', questionData);
};

export const getAllQuestions = async () => {
    const res = await api.get('/assessment/get-questions');
    return res.data;
};

export const deleteAssessment = async (assessmentId) => {
    const res = await api.delete(`/assessment/delete-assessment/${assessmentId}`);
    return res.data;
};