import api from '@/lib/api/client';
import { User } from '@/types/auth';

export interface UserListItem {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
}

export const usersApi = {
  async getAllUsers(): Promise<UserListItem[]> {
    const response = await api.get<UserListItem[]>('/users');
    return response.data;
  },
};

