'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { authApi } from '@/lib/api/auth';
import type { ProfileViewModel } from '@/types/viewModels/profile.types';

/**
 * ViewModel hook for ProfilePage
 * Manages all state, business logic, and data transformations
 */
export function useProfileViewModel(): ProfileViewModel {
  const router = useRouter();
  const { user, logout: authLogout, subscription, hasActiveSubscription, isInTrial } = useAuth();

  // State
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Computed: initials from email
  const initials = useMemo(() => {
    if (!user?.email) return '';
    return user.email
      .split('@')[0]
      .substring(0, 2)
      .toUpperCase();
  }, [user?.email]);

  // Computed: is subscription canceled but still has access
  const isCanceledWithAccess = useMemo(() => {
    return Boolean(
      subscription &&
        subscription.status === 'canceled' &&
        new Date(subscription.currentPeriodEnd) > new Date()
    );
  }, [subscription]);

  // Computed: has scheduled plan change
  const hasScheduledChange = useMemo(() => {
    return Boolean(subscription?.pendingPlan && subscription.pendingPlan.id);
  }, [subscription]);

  // Actions
  const openChangePasswordDialog = useCallback(() => {
    setIsChangePasswordDialogOpen(true);
    setError(null);
    setSuccess(false);
  }, []);

  const closeChangePasswordDialog = useCallback(() => {
    setIsChangePasswordDialogOpen(false);
    setError(null);
    setSuccess(false);
  }, []);

  const handleChangePassword = useCallback(async () => {
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await authApi.changePassword();
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to send password reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
  }, [authLogout]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateToBilling = useCallback(() => {
    router.push('/account/billing');
  }, [router]);

  const formatDate = useCallback((value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return {
    // State
    user,
    subscription,
    isChangePasswordDialogOpen,
    isLoading,
    error,
    success,

    // Computed
    initials,
    isCanceledWithAccess,
    hasScheduledChange,
    hasActiveSubscription,
    isInTrial,

    // Actions
    openChangePasswordDialog,
    closeChangePasswordDialog,
    handleChangePassword,
    logout,
    navigateBack,
    navigateToBilling,
    formatDate,
  };
}
