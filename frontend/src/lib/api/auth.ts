import apiClient from './client';
import type {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  User,
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data, { skipAuth: true }),

  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data, { skipAuth: true }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', undefined, {
      skipAuth: true,
      headers: { 'X-Refresh-Token': refreshToken },
    }),

  logout: () => apiClient.post<ApiResponse<null>>('/auth/logout'),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/forgot-password', data, { skipAuth: true }),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', data, { skipAuth: true }),

  verifyEmail: (token: string) =>
    apiClient.get<ApiResponse<null>>('/auth/verify-email', { skipAuth: true, params: { token } }),

  resendVerification: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/resend-verification', undefined, {
      skipAuth: true,
      params: { email },
    }),

  getMe: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/change-password', data),
};
