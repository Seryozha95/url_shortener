import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginData, RegisterData } from '../types/auth';
import { authApi } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setError(null);
      const response = await authApi.login(data);
      if (response.status === 'success' && response.data) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Failed to login');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      return false;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      const response = await authApi.register(data);
      if (response.status === 'success' && response.data) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Failed to register');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      return false;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 