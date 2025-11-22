import type { Subscription, SubscriptionStatus } from '@/types/subscription';

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  createdAt: string;
  subscription?: Subscription | null;
  subscriptionStatus?: SubscriptionStatus;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    subscription?: Subscription | null;
    subscriptionStatus?: SubscriptionStatus;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceName?: string;
  forceLogoutOthers?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface AuthSession {
  id: string;
  sessionId: string;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  isCurrent: boolean;
}

export interface LogoutResponse {
  message: string;
}

export interface LogoutOthersResponse {
  message: string;
  revokedCount: number;
}
