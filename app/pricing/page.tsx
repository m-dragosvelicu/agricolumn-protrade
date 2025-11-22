'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import type { SubscriptionPlan } from '@/types/subscription';
import { useAuth } from '@/lib/auth/auth-context';
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

export default function PricingPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    hasActiveSubscription,
    user,
    subscription,
    refreshUser,
  } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.emailVerified === false) {
      setError(
        'Please verify your email address before subscribing. Check your inbox for a confirmation email from PRO TRADE.',
      );
      return;
    }

    setSubmittingPlanId(planId);
    setError(null);
    setInfo(null);

    try {
      if (hasActiveSubscription && subscription) {
        // Schedule the change at the next renewal (backend applies it at currentPeriodEnd)
        const updated = await subscriptionsApi.schedulePlanChange(planId);
        await refreshUser();
        const effective =
          updated.pendingPlanEffectiveDate || subscription.currentPeriodEnd;
        const selectedPlan = plans.find((p) => p.id === planId);
        setInfo(
          `Scheduled change to "${
            updated.pendingPlan?.name || selectedPlan?.name || 'new plan'
          }" at your next renewal (${new Date(effective).toLocaleDateString()}).`,
        );
      } else {
        const { paymentUrl } = await subscriptionsApi.createSubscription(planId);
        if (typeof window !== 'undefined') {
          window.location.href = paymentUrl;
        }
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to start subscription. Please try again.';
      setError(message);
      setSubmittingPlanId(null);
      return;
    }

    setSubmittingPlanId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="mb-4 flex justify-start">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            <span aria-hidden>←</span>
            Back
          </button>
        </div>
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Plans & Pricing
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Choose the plan that fits your trading workflow. Payments are
            processed securely by NETOPIA.
          </p>
          {hasActiveSubscription && (
            <div className="mt-3 text-sm text-emerald-300">
              You already have an active subscription.
            </div>
          )}
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {info && (
          <Alert className="mb-6">
            <AlertDescription>{info}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-300">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Loading plans...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-16 text-center text-slate-300">
            No subscription plans are currently available. Please try again
            later or contact support.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {plans.map((plan) => {
              const isSubmitting = submittingPlanId === plan.id;
              const isCurrentPlan =
                subscription && subscription.plan.id === plan.id;
              const isPending =
                subscription &&
                subscription.pendingPlan &&
                subscription.pendingPlan.id === plan.id;

              const buttonDisabled = isSubmitting || isCurrentPlan || isPending;

              return (
                <Card
                  key={plan.id}
                  className="bg-slate-800 border-slate-700 flex flex-col"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-white text-xl">
                        {plan.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="border-amber-500 text-amber-300"
                      >
                        {plan.interval === 'month' ? 'Monthly' : 'Yearly'}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-300">
                      {plan.description ||
                        'Full access to the ProTrade dashboard.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-white">
                        {plan.price.toLocaleString(undefined, {
                          style: 'currency',
                          currency: plan.currency,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      disabled={buttonDisabled}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {hasActiveSubscription
                            ? 'Scheduling...'
                            : 'Redirecting to payment...'}
                        </>
                      ) : isCurrentPlan ? (
                        'Current plan'
                      ) : isPending ? (
                        'Scheduled'
                      ) : hasActiveSubscription ? (
                        'Schedule change at renewal'
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
