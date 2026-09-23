import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('precedentiq_token') || null);
  const [loading, setLoading] = useState(true);

  // Load session on startup
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('precedentiq_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('[Session Expired]:', err.message);
          localStorage.removeItem('precedentiq_token');
          localStorage.removeItem('precedentiq_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data && res.data.token) {
      localStorage.setItem('precedentiq_token', res.data.token);
      localStorage.setItem('precedentiq_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error('Invalid login response from server');
  };

  const register = async (fullName, email, password, confirmPassword) => {
    const res = await authAPI.register({ fullName, email, password, confirmPassword });
    if (res.data && res.data.token) {
      localStorage.setItem('precedentiq_token', res.data.token);
      localStorage.setItem('precedentiq_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error('Invalid registration response from server');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore logout network errors
    } finally {
      localStorage.removeItem('precedentiq_token');
      localStorage.removeItem('precedentiq_user');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
