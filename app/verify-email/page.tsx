'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type VerifyStatus = 'idle' | 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('This verification link is invalid or missing.');
      return;
    }

    let cancelled = false;

    const verify = async () => {
      setStatus('verifying');
      setMessage(null);

      try {
        await authApi.verifyEmail({ token });
        if (!cancelled) {
          setStatus('success');
          setMessage('Your email has been verified successfully.');
        }

        try {
          await refreshUser();
        } catch {
          // ignore; refreshUser already handles failures
        }
      } catch (err: any) {
        if (cancelled) return;

        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'This verification link is invalid or has already been used.';
        setStatus('error');
        setMessage(msg);
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [refreshUser, searchParams]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToDashboard = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            Verify your email
          </CardTitle>
          <CardDescription className="text-slate-300">
            We&apos;re confirming your email address for your ProTrade account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'verifying' && (
            <div className="flex items-center gap-3 text-slate-200">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying your email…</span>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <span>Email verified</span>
              </div>
              <p className="text-sm text-slate-300">
                Your email address has been verified. You can now access your
                dashboard and manage your subscription.
              </p>
            </div>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {message ||
                  'This verification link is invalid or has already been used.'}
              </AlertDescription>
            </Alert>
          )}

          {status !== 'verifying' && (
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleGoToLogin}
                className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                Go to login
              </Button>
            </div>
          )}

          {status === 'verifying' && message && (
            <p className="text-xs text-slate-400">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

