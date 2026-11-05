import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('banana_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        if (data.success) {
          setUser(data.user);
          setStats(data.stats);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Failed to load user token session:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (identifier, password) => {
    const data = await api.login({ identifier, password });
    if (data.success) {
      localStorage.setItem('banana_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setStats(data.stats);
      return data;
    }
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    if (data.success) {
      localStorage.setItem('banana_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setStats(data.stats);
      return data;
    }
  };

  const logout = () => {
    localStorage.removeItem('banana_token');
    setToken(null);
    setUser(null);
    setStats(null);
  };

  const refreshStats = async () => {
    if (!token) return;
    try {
      const data = await api.getMe();
      if (data.success) {
        setUser(data.user);
        setStats(data.stats);
      }
    } catch (e) {
      console.warn('Could not refresh stats:', e);
    }
  };

  const updateProfile = async (updateData) => {
    const data = await api.updateProfile(updateData);
    if (data.success) {
      setUser(data.user);
      return data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshStats,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
