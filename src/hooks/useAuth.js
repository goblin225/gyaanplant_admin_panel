import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verifyOTP } from '../services/auth';
import { useAuth } from '../context/AuthProvider';
import Cookies from 'js-cookie';

export const useLoginStore = () => {
  const queryClient = useQueryClient();
  const { userVerifyOTP } = useAuth();

  return useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      const userData = data.userData;

      Cookies.set('accessToken', accessToken, {
        expires: 1,
        secure: false,
        sameSite: 'Lax'
      });

      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('userData', JSON.stringify(userData));

      userVerifyOTP(userData);

      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Login failed:', error);
      throw error;
    }
  });
};