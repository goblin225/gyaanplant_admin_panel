import { data } from 'autoprefixer';
import api from './api';
import { jwtDecode } from 'jwt-decode';

export const sendOTP = async (credentials) => {
  const response = await api.post('/auth/send-otp', credentials);

  return response.data;
};

export const adminLogin = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const data = response.data.data;

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userData: {
      _id: data._id,
      phoneNumber: data.phoneNumber,
      role: data.roleName
    }
  };
};
