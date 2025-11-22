'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            Payment cancelled
          </CardTitle>
          <CardDescription className="text-slate-300">
            Your payment was cancelled. Your subscription has not been changed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">
            If this was unintentional or you&apos;d like to try again, you can
            go back to the dashboard and choose a plan.
          </p>
          <Button onClick={() => router.push('/')} className="w-full">
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

