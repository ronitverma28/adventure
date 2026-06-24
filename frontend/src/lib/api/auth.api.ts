import apiClient from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', null, {
      headers: { 'X-Refresh-Token': refreshToken },
    }),

  logout: () => apiClient.post('/auth/logout'),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword, confirmPassword }),

  verifyEmail: (token: string) =>
    apiClient.get(`/auth/verify-email?token=${token}`),

  resendVerification: (email: string) =>
    apiClient.post(`/auth/resend-verification?email=${email}`),

  getMe: () =>
    apiClient.get<ApiResponse<import('@/types/auth.types').User>>('/auth/me'),

  updateProfile: (data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<import('@/types/auth.types').User>>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    apiClient.post('/auth/change-password', { currentPassword, newPassword, confirmPassword }),
};
