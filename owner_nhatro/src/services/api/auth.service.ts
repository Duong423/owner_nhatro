// Authentication service
import { axiosInstance } from './axios.config';
import type { LoginRequest, LoginResponse } from '@/types/auth.types';

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response as any;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  },

  // Get current access token
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  // Set access token
  setAccessToken: (token: string): void => {
    localStorage.setItem('accessToken', token);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },
};
