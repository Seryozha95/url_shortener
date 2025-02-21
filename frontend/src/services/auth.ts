import axios, { AxiosError } from 'axios';
import { LoginData, RegisterData, AuthResponse } from '../types/auth';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4001/api',
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      if (response.data.status === 'success' && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        return error.response.data as AuthResponse;
      }
      return {
        status: 'error',
        message: 'Unable to connect to the server. Please try again later.'
      };
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      if (response.data.status === 'success' && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        return error.response.data as AuthResponse;
      }
      return {
        status: 'error',
        message: 'Unable to connect to the server. Please try again later.'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
}; 