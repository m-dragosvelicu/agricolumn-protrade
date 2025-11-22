'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { User, UserRole } from '@/types/auth';
import type { Subscription } from '@/types/subscription';
import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';
import { subscriptionsApi } from '@/lib/api/subscriptions';

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  isInTrial: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
   const [subscription, setSubscription] = useState<Subscription | null>(null);

  const loadUser = useCallback(async () => {
    try {
      const token = apiClient.getAuthToken();
      if (!token) {
        setUser(null);
        setSubscription(null);
        setLoading(false);
        return;
      }

      const userData = await authApi.getCurrentUser();
      setUser(userData);
      try {
        const subscriptionData = await subscriptionsApi.getCurrentSubscription();
        setSubscription(subscriptionData);
      } catch (subError) {
        console.error('Failed to load subscription:', subError);
        setSubscription(null);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      apiClient.removeAuthToken();
      setUser(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    apiClient.setAuthToken(response.access_token);
    setUser(response.user as User);
    try {
      const subscriptionData = await subscriptionsApi.getCurrentSubscription();
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Failed to load subscription after login:', error);
      setSubscription(null);
    }
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName?: string,
      lastName?: string,
    ) => {
      const response = await authApi.register({
        email,
        password,
        firstName,
        lastName,
      });
      apiClient.setAuthToken(response.access_token);
      setUser(response.user as User);
      try {
        const subscriptionData = await subscriptionsApi.getCurrentSubscription();
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Failed to load subscription after registration:', error);
        setSubscription(null);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    apiClient.removeAuthToken();
    setUser(null);
    setSubscription(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      try {
        const subscriptionData = await subscriptionsApi.getCurrentSubscription();
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Failed to refresh subscription:', error);
        setSubscription(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  }, [logout]);

  const hasRole = useCallback(
    (role: UserRole) => {
      return user?.role === role;
    },
    [user],
  );

  const hasActiveSubscription = useMemo(() => {
    if (!subscription) {
      return false;
    }

    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const withinPeriod = periodEnd.getTime() > now.getTime();

    if (!withinPeriod) {
      return false;
    }

    if (
      subscription.status === 'active' ||
      subscription.status === 'trialing'
    ) {
      return true;
    }

    if (subscription.status === 'canceled') {
      return true;
    }

    return false;
  }, [subscription]);

  const isInTrial = subscription?.status === 'trialing';

  const value: AuthContextType = {
    user,
    subscription,
    loading,
    isAuthenticated: !!user,
    hasActiveSubscription,
    isInTrial,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
