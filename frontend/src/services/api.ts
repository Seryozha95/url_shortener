import axios from 'axios';
import { Url, ApiResponse } from '../types/url';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4001/api';

// API instance for authenticated requests
const api = axios.create({
  baseURL: BASE_URL,
});

// API instance for public requests (no auth required)
const publicApi = axios.create({
  baseURL: BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const urlApi = {
  create: async (url: string, customSlug?: string): Promise<ApiResponse<Url>> => {
    // Use different endpoints and API instances based on authentication status
    const isAuthenticated = !!localStorage.getItem('token');
    const endpoint = isAuthenticated ? '/urls' : '/urls/public';
    // Use the authenticated api instance when logged in
    const response = await (isAuthenticated ? api : publicApi).post<ApiResponse<Url>>(endpoint, { url, customSlug });
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<Url[]>> => {
    const response = await api.get<ApiResponse<Url[]>>('/urls');
    return response.data;
  },

  update: async (id: string, customSlug: string): Promise<ApiResponse<Url>> => {
    const response = await api.patch<ApiResponse<Url>>(`/urls/${id}`, { customSlug });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/urls/${id}`);
  }
}; 