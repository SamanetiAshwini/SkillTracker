import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (login: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login/', { login, password });
    return res.data;
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const res = await api.post('/auth/register/', data);
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get('/auth/me/');
    return res.data;
  },

  updateProfile: async (data: Partial<User['profile']> & { first_name?: string; last_name?: string }): Promise<User> => {
    const res = await api.patch('/auth/me/', data);
    return res.data;
  },

  changePassword: async (old_password: string, new_password: string, new_password_confirm: string) => {
    const res = await api.post('/auth/change-password/', {
      old_password,
      new_password,
      new_password_confirm,
    });
    return res.data;
  },

  requestPasswordReset: async (email: string) => {
    const res = await api.post('/auth/password-reset/', { email });
    return res.data;
  },

  confirmPasswordReset: async (uid: string, token: string, new_password: string) => {
    const res = await api.post('/auth/password-reset-confirm/', {
      uid,
      token,
      new_password,
    });
    return res.data;
  },

  // Admin user management
  getUsers: async (params?: { role?: string; is_active?: boolean; search?: string }) => {
    const res = await api.get('/auth/admin/users/', { params });
    return res.data;
  },

  updateUserAdmin: async (userId: number, data: { role?: string; is_active?: boolean }) => {
    const res = await api.patch(`/auth/admin/users/${userId}/`, data);
    return res.data;
  },
};
