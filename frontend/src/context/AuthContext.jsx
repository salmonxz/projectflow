import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('projectflow_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user: userData } = res.data.data;
      localStorage.setItem('projectflow_token', token);
      localStorage.setItem('projectflow_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const updateUserProfile = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('projectflow_user', JSON.stringify(updatedUserData));
  };

  const quickLoginAs = async (email) => {
    return login(email, 'password123');
  };

  const logout = () => {
    localStorage.removeItem('projectflow_token');
    localStorage.removeItem('projectflow_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, updateUserProfile, quickLoginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
