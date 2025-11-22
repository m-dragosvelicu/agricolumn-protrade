import api from '@/lib/api/client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  User,
  AuthSession,
  LogoutResponse,
  LogoutOthersResponse,
} from '@/types/auth';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/forgot-password',
      data,
    );
    return response.data;
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/reset-password',
      data,
    );
    return response.data;
  },

  async changePassword(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/change-password',
    );
    return response.data;
  },

  async verifyEmail(data: { token: string }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/verify-email',
      data,
    );
    return response.data;
  },

  async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>('/auth/logout');
    return response.data;
  },

  async logoutOthers(): Promise<LogoutOthersResponse> {
    const response = await api.post<LogoutOthersResponse>('/auth/logout-others');
    return response.data;
  },

  async getSessions(): Promise<AuthSession[]> {
    const response = await api.get<AuthSession[]>('/auth/sessions');
    return response.data;
  },
};
