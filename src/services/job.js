import api from './api';

export const createJobPost = async (jobData) => {
    const res = await api.post('/job/job-post', jobData);
    return res.data;
};

export const getAllJobPosts = async () => {
    const res = await api.get('/job/getall-jobpost');
    return res.data;
};

export const editJobPost = async (jobData) => {
    return await api.put('/job/job-post', jobData);
};

// Job Applications

export const getAllJobApplication = async () => {
    const res = await api.get('/application/getall-jobapplication');
    return res.data;
};