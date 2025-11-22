'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { reportGlobalError } from '@/components/ui/global-banner';
import type { CreateBillingInfoDto } from '@/types/subscription';
import type { BillingViewModel } from '@/types/viewModels/billing.types';

/**
 * ViewModel hook for BillingPage
 * Manages all state, business logic, and data transformations
 */
export function useBillingViewModel(): BillingViewModel {
  const router = useRouter();
  const { subscription, hasActiveSubscription, isInTrial, refreshUser } = useAuth();

  // State
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancellingChange, setIsCancellingChange] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingViewModel['billingInfo']>(null);
  const [billingInfoLoading, setBillingInfoLoading] = useState(false);
  const [billingInfoError, setBillingInfoError] = useState<string | null>(null);
  const [isSavingBillingInfo, setIsSavingBillingInfo] = useState(false);

  // Computed: status label
  const statusLabel = useMemo(() => {
    return subscription?.status ? subscription.status.replace('_', ' ') : 'none';
  }, [subscription?.status]);

  // Computed: show cancel button
  const showCancel = useMemo(() => {
    return Boolean(
      subscription &&
        (subscription.status === 'active' ||
          subscription.status === 'trialing' ||
          subscription.status === 'past_due' ||
          subscription.status === 'unpaid')
    );
  }, [subscription]);

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

  const reloadBillingInfo = useCallback(async () => {
    setBillingInfoLoading(true);
    setBillingInfoError(null);
    try {
      const info = await subscriptionsApi.getBillingInfo();
      setBillingInfo(info);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load billing information.';
      setBillingInfo(null);
      setBillingInfoError(message);
    } finally {
      setBillingInfoLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadBillingInfo();
  }, [reloadBillingInfo]);

  // Actions
  const handleCancel = useCallback(async () => {
    if (!subscription) return;
    setIsCancelling(true);
    setLocalError(null);

    try {
      await subscriptionsApi.cancelSubscription();
      await refreshUser();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to cancel subscription. Please try again.';
      setLocalError(message);
      reportGlobalError(message);
    } finally {
      setIsCancelling(false);
    }
  }, [subscription, refreshUser]);

  const handleCancelScheduledChange = useCallback(async () => {
    setIsCancellingChange(true);
    setLocalError(null);

    try {
      await subscriptionsApi.cancelScheduledChange();
      await refreshUser();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to cancel the scheduled plan change. Please try again.';
      setLocalError(message);
      reportGlobalError(message);
    } finally {
      setIsCancellingChange(false);
    }
  }, [refreshUser]);

  const saveBillingInfo = useCallback(
    async (data: CreateBillingInfoDto) => {
      setIsSavingBillingInfo(true);
      setBillingInfoError(null);
      try {
        const updated = await subscriptionsApi.upsertBillingInfo(data);
        setBillingInfo(updated);
      } catch (err: any) {
        const apiError = err?.response?.data;
        const message =
          (Array.isArray(apiError?.message)
            ? apiError.message.join(' ')
            : apiError?.message) ||
          err?.message ||
          'Failed to save billing information. Please check your details and try again.';
        setBillingInfoError(message);
        reportGlobalError(message);
      } finally {
        setIsSavingBillingInfo(false);
      }
    },
    [],
  );

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateToPricing = useCallback(() => {
    router.push('/pricing');
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
    subscription,
    isCancelling,
    isCancellingChange,
    localError,
    billingInfo,
    billingInfoLoading,
    billingInfoError,
    isSavingBillingInfo,

    // Computed
    statusLabel,
    showCancel,
    isCanceledWithAccess,
    hasScheduledChange,
    hasActiveSubscription,
    isInTrial,

    // Actions
    handleCancel,
    handleCancelScheduledChange,
    navigateBack,
    navigateToPricing,
    formatDate,
    reloadBillingInfo,
    saveBillingInfo,
  };
}
