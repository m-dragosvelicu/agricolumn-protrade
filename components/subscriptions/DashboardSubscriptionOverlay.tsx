'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import type { SubscriptionPlan } from '@/types/subscription';
import { UserRole } from '@/types/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSubscriptionOverlayProps {
  className?: string;
}

export function DashboardSubscriptionOverlay({
  className,
}: DashboardSubscriptionOverlayProps) {
  const {
    isAuthenticated,
    loading: authLoading,
    hasActiveSubscription,
    hasRole,
    user,
  } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);

  const isAdmin = hasRole(UserRole.ADMIN);
  const mustVerifyEmailFirst =
    isAuthenticated && user && user.emailVerified === false;

  const shouldShowOverlay =
    !authLoading && isAuthenticated && !isAdmin && !hasActiveSubscription;

  useEffect(() => {
    if (
      !shouldShowOverlay ||
      mustVerifyEmailFirst ||
      loadingPlans ||
      plans.length > 0
    ) {
      return;
    }

    const fetchPlans = async () => {
      setLoadingPlans(true);
      setError(null);

      try {
        const data = await subscriptionsApi.getPlans();
        setPlans(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load subscription plans.';
        setError(message);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [shouldShowOverlay, mustVerifyEmailFirst, loadingPlans, plans.length]);

  const handleSubscribe = async (planId: string) => {
    setSubmittingPlanId(planId);
    setError(null);

    try {
      const { paymentUrl } = await subscriptionsApi.createSubscription(planId);
      if (typeof window !== 'undefined') {
        window.location.href = paymentUrl;
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to start subscription. Please try again.';
      setError(message);
      setSubmittingPlanId(null);
    }
  };

  if (!shouldShowOverlay) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-40 flex items-center justify-center px-4',
        className,
      )}
    >
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-3xl">
        <Card className="bg-slate-900 border-slate-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-xl sm:text-2xl">
              {mustVerifyEmailFirst
                ? 'Verify your email to continue'
                : 'Choose a subscription to unlock ProTrade'}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {mustVerifyEmailFirst
                ? 'Please verify your email address before choosing a subscription. Check your inbox for a confirmation email from PRO TRADE.'
                : 'Select a plan to access all dashboard features. Payments are processed securely by NETOPIA.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {mustVerifyEmailFirst && (
              <div className="py-4 text-sm text-slate-300">
                Once your email is verified, refresh the page and you will be
                able to select a plan.
              </div>
            )}

            {loadingPlans && !mustVerifyEmailFirst && (
              <div className="flex items-center justify-center py-8 text-slate-300">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Loading plans...</span>
              </div>
            )}

            {!loadingPlans && !mustVerifyEmailFirst && plans.length === 0 && !error && (
              <div className="py-8 text-center text-slate-300">
                No subscription plans are currently available. Please try again
                later or contact support.
              </div>
            )}

            {!loadingPlans && !mustVerifyEmailFirst && plans.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {plans.map((plan) => {
                  const isSubmitting = submittingPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className="flex flex-col rounded-lg border border-slate-700 bg-slate-800/70 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-lg font-semibold text-white">
                          {plan.name}
                        </div>
                        <Badge
                          variant="outline"
                          className="border-amber-500 text-amber-300"
                        >
                          {plan.interval === 'month' ? 'Monthly' : 'Yearly'}
                        </Badge>
                      </div>
                      <div className="mb-3 text-2xl font-bold text-white">
                        {plan.price.toLocaleString(undefined, {
                          style: 'currency',
                          currency: plan.currency,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      {plan.description && (
                        <p className="mb-4 text-sm text-slate-300">
                          {plan.description}
                        </p>
                      )}
                      <Button
                        className="mt-auto"
                        disabled={isSubmitting}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting to payment...
                          </>
                        ) : (
                          'Subscribe'
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
