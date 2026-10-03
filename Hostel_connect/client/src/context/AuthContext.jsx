import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hc_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user on start if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setStudent(res.data.student);
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      if (res.data.requireOtp) {
        return {
          requireOtp: true,
          email: res.data.email,
          role: res.data.role,
          devOtp: res.data.devOtp,
          message: res.data.message,
        };
      }
      const { token: newToken, user: newUser, student: newStudent } = res.data;
      localStorage.setItem('hc_token', newToken);
      localStorage.setItem('hc_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setStudent(newStudent);
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data.message };
  };

  const setUserFromToken = (newUser, newToken) => {
    if (newToken) {
      localStorage.setItem('hc_token', newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem('hc_user', JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      const { token: newToken, user: newUser, student: newStudent } = res.data;
      localStorage.setItem('hc_token', newToken);
      localStorage.setItem('hc_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setStudent(newStudent);
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    localStorage.removeItem('hc_token');
    localStorage.removeItem('hc_user');
    setToken(null);
    setUser(null);
    setStudent(null);
    window.location.href = '/login';
  };

  const updateUserData = (updatedUser, updatedStudent) => {
    if (updatedUser) setUser(updatedUser);
    if (updatedStudent) setStudent(updatedStudent);
  };

  const value = {
    user,
    student,
    token,
    loading,
    login,
    register,
    logout,
    updateUserData,
    setUserFromToken,
    isAdmin: user?.role === 'admin',
    isWarden: user?.role === 'warden',
    isStudent: user?.role === 'student',
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
