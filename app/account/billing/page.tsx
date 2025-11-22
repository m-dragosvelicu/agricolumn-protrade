'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { reportGlobalError } from '@/components/ui/global-banner';

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}

function BillingContent() {
  const router = useRouter();
  const {
    subscription,
    hasActiveSubscription,
    isInTrial,
    refreshUser,
  } = useAuth();
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isCancellingChange, setIsCancellingChange] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleCancel = async () => {
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
  };

  const handleCancelScheduledChange = async () => {
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
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusLabel = subscription?.status
    ? subscription.status.replace('_', ' ')
    : 'none';

  const showCancel =
    subscription &&
    (subscription.status === 'active' ||
      subscription.status === 'trialing' ||
      subscription.status === 'past_due' ||
      subscription.status === 'unpaid');
  const isCanceledWithAccess =
    subscription &&
    subscription.status === 'canceled' &&
    new Date(subscription.currentPeriodEnd) > new Date();
  const hasScheduledChange = Boolean(
    subscription?.pendingPlan && subscription.pendingPlan.id,
  );

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Billing
          </h1>
        </div>

        {localError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{localError}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Subscription</CardTitle>
            <CardDescription className="text-slate-400">
              View and manage your subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!subscription ? (
              <div className="text-slate-300">
                You do not have an active subscription.
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">Current plan</p>
                    <p className="text-lg font-semibold text-white">
                      {subscription.plan.name}
                    </p>
                    <p className="text-sm text-slate-300">
                      {subscription.plan.price.toLocaleString(undefined, {
                        style: 'currency',
                        currency: subscription.plan.currency,
                        maximumFractionDigits: 0,
                      })}{' '}
                      /{' '}
                      {subscription.plan.interval === 'month'
                        ? 'month'
                        : 'year'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-amber-500 text-amber-300"
                    >
                      {statusLabel}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Current period</p>
                    <p className="text-sm text-slate-200">
                      {formatDate(subscription.currentPeriodStart)} –{' '}
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">
                      {subscription.status === 'canceled' &&
                      new Date(subscription.currentPeriodEnd) > new Date()
                        ? 'Access until'
                        : 'Next renewal'}
                    </p>
                    <p className="text-sm text-slate-200">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                {hasScheduledChange && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                    <p className="font-semibold">
                      Scheduled plan change at renewal
                    </p>
                    <p className="mt-1">
                      Will switch to{' '}
                      <span className="font-semibold">
                        {subscription.pendingPlan?.name || 'new plan'}
                      </span>{' '}
                      on {formatDate(subscription.pendingPlanEffectiveDate || subscription.currentPeriodEnd)}.
                    </p>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelScheduledChange}
                        disabled={isCancellingChange}
                        className="border-amber-400 text-amber-200 hover:bg-amber-500/20"
                      >
                        {isCancellingChange ? 'Cancelling...' : 'Cancel scheduled change'}
                      </Button>
                    </div>
                  </div>
                )}

                {hasActiveSubscription && !isCanceledWithAccess && (
                  <p className="text-sm text-emerald-300">
                    {isInTrial
                      ? 'Your trial is active.'
                      : 'Your subscription is active.'}{' '}
                    Recurring billing is enabled.
                  </p>
                )}

                {isCanceledWithAccess && (
                  <p className="text-sm text-amber-300">
                    Your subscription will end on{' '}
                    {formatDate(subscription.currentPeriodEnd)}. You still have
                    access until then, but it won&apos;t renew automatically.
                  </p>
                )}

                {subscription.status === 'past_due' && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Your last payment attempt failed. Please update your
                      subscription to restore full access.
                    </AlertDescription>
                  </Alert>
                )}

                {subscription.status === 'unpaid' && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Your subscription is unpaid. Please create a new
                      subscription to regain access.
                    </AlertDescription>
                  </Alert>
                )}

                {!hasActiveSubscription && subscription.status === 'expired' && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Your subscription has expired. Create a new subscription
                      to regain access.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-200 hover:bg-slate-700"
                    onClick={() => router.push('/pricing')}
                  >
                    {subscription ? 'Change plan' : 'Choose a plan'}
                  </Button>

                  {showCancel && (
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        'Cancel subscription'
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
