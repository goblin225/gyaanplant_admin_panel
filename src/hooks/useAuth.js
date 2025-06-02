import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminLogin } from '../services/auth';
import { useAuth } from '../context/AuthProvider';
import Cookies from 'js-cookie';

export const useLoginStore = () => {
  
  const queryClient = useQueryClient();
  const { adminUserLogin } = useAuth();

  return useMutation({
    mutationFn: adminLogin,
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

      adminUserLogin(userData);

      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Login failed:', error);
      throw error;
    }
  });
};