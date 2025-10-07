import BaseApiService from '../api/base';
import { AuthResponse, LoginCredentials, ApiResponse, User } from '@/types';

class AuthService extends BaseApiService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return this.post<ApiResponse<null>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>('/auth/profile');
  }

  async updateProfile(email?: string, password?: string): Promise<ApiResponse<null>> {
    return this.put<ApiResponse<null>>('/auth/profile', {
      email,
      password,
    });
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

export const authService = new AuthService();
