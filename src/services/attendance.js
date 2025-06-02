import api from './api';

export const getAllAttendance = async ({ userId, month, year, fromDate, toDate }) => {
  const params = new URLSearchParams();

  if (userId && userId !== 'all') params.append('userId', userId);
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);

  const res = await api.get(`/attendance/get-allattendance?${params.toString()}`);
  return res.data;
};

export const getFilterAttendance = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const res = await api.get(`/attendance/filter-attendance?${params.toString()}`);
    return res.data?.data;
};