import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto restore session on mount using Remember Me refresh token cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('momcare_access_token');
        if (token) {
          try {
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);
            setLoading(false);
            return;
          } catch (tokenErr) {
            // Token might be expired, will try refresh below
          }
        }

        const response = await api.post('/auth/refresh');
        const { access_token, user: userData } = response.data;
        localStorage.setItem('momcare_access_token', access_token);
        setUser(userData);
      } catch (err) {
        // Cookie expired or missing
        localStorage.removeItem('momcare_access_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    });

    const { access_token, user: userData } = response.data;
    localStorage.setItem('momcare_access_token', access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, fullName) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('momcare_access_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
