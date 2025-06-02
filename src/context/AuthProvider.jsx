import React, { useState, useEffect, createContext, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminUserLogin = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userData');
    setUser(null);
  };

  const checkToken = async () => {
    try {
      
      const accessToken = Cookies.get('accessToken');
      const userData = sessionStorage.getItem('userData');

      if (accessToken && userData) {
        // await validateToken();

        setUser(JSON.parse(userData));
      } else {
        const refreshToken = sessionStorage.getItem('accessToken');

        if (refreshToken) {
          // await refreshAccessToken();

          const newAccessToken = Cookies.get('accessToken');

          if (newAccessToken) {
            setUser(jwtDecode(newAccessToken));
          } else {
            logout();
          }
        } else {
          logout();
        }
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, adminUserLogin, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);