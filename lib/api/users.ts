import api from '@/lib/api/client';
import type { Subscription, SubscriptionStatus } from '@/types/subscription';

export interface UserListItem {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  subscription?: Subscription | null;
  subscriptionStatus?: SubscriptionStatus | null;
}

export interface UserDetail extends UserListItem {
  updatedAt: string;
}

export const usersApi = {
  async getAllUsers(): Promise<UserListItem[]> {
    const response = await api.get<UserListItem[]>('/users');
    return response.data;
  },

  async getUser(id: string): Promise<UserDetail> {
    const response = await api.get<UserDetail>(`/users/${id}`);
    return response.data;
  },

  async makeAdmin(id: string): Promise<UserDetail> {
    const response = await api.patch<UserDetail>(`/users/${id}/promote`);
    return response.data;
  },
};
