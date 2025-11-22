'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';

type StatusState = 'checking' | 'success' | 'failed';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const { hasActiveSubscription, refreshUser } = useAuth();
  const [status, setStatus] = useState<StatusState>('checking');

  useEffect(() => {
    let cancelled = false;

    const checkSubscription = async () => {
      setStatus('checking');

      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          // Query backend directly for the latest subscription state
          const subscription = await subscriptionsApi.getCurrentSubscription();

          if (cancelled) {
            return;
          }

          if (subscription) {
            const now = new Date();
            const periodEnd = new Date(subscription.currentPeriodEnd);
            const withinPeriod = periodEnd.getTime() > now.getTime();
            const isActiveLike =
              subscription.status === 'active' ||
              subscription.status === 'trialing' ||
              subscription.status === 'past_due' ||
              subscription.status === 'unpaid';

            if (withinPeriod && isActiveLike) {
              // Refresh global auth/subscription state once we know it's active
              try {
                await refreshUser();
              } catch {
                // ignore, refreshUser already handles errors
              }
              setStatus('success');
              return;
            }
          }
        } catch {
          // ignore, we'll retry below
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!cancelled) {
        setStatus('failed');
      }
    };

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const handleGoToDashboard = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            Subscription payment
          </CardTitle>
          <CardDescription className="text-slate-300">
            We&apos;re confirming your subscription with NETOPIA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'checking' && (
            <div className="flex items-center gap-3 text-slate-200">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Checking subscription status…</span>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <span>Your subscription is active.</span>
              </div>
              <p className="text-sm text-slate-300">
                You can now access the ProTrade dashboard. If you don&apos;t see
                changes immediately, try refreshing the page.
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="space-y-4">
              <p className="text-sm text-red-300">
                We couldn&apos;t confirm your subscription yet. This may be due
                to a delay in the payment confirmation.
              </p>
              <p className="text-sm text-slate-300">
                You can go back to the dashboard and check your subscription
                status in the Billing section.
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
