/**
 * Auth service – all token management is handled server-side via httpOnly cookies.
 * This service is a thin wrapper around the API; it stores NO sensitive data
 * in localStorage or sessionStorage.
 */

import api from './api';
import type { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

class AuthService {
  /** Attempt to restore session by asking the server who we are. */
  async initializeAuth(): Promise<User | null> {
    try {
      const res = await api.get<AuthResponse>('/auth/profile');
      return res.user ?? null;
    } catch {
      return null;
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: true; user: User }> {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    if (!res.success || !res.user) throw new Error(res.message ?? 'Login failed');
    return { success: true, user: res.user };
  }

  async register(data: RegisterData): Promise<{ success: true; user: User }> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    if (!res.success || !res.user) throw new Error(res.message ?? 'Registration failed');
    return { success: true, user: res.user };
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore – we always clear local state regardless
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await api.get<AuthResponse>('/auth/profile');
      return res.user ?? null;
    } catch {
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.put<AuthResponse>('/auth/profile', data);
    if (!res.user) throw new Error('Failed to update profile');
    return res.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/password', { currentPassword, newPassword });
  }

  async updateNotificationPrefs(prefs: Record<string, boolean>): Promise<void> {
    await api.put('/auth/notifications', prefs);
  }

  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    const res = await api.post<{ success: boolean; data: string }>('/auth/export', { format });
    return res.data;
  }
}

const authService = new AuthService();
export default authService;
