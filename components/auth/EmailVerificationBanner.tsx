'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailVerificationBannerProps {
  className?: string;
}

export function EmailVerificationBanner({
  className,
}: EmailVerificationBannerProps) {
  const { user, loading } = useAuth();

  if (loading || !user || user.emailVerified) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full bg-amber-500 text-black border-b border-amber-600 shadow-sm',
        className,
      )}
    >
      <div className="container mx-auto px-6 py-2.5 text-sm font-medium flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Please verify your email address.</span>
        <span className="opacity-90">
          Check your inbox for a confirmation email from <span className="font-semibold">PRO TRADE</span>.
        </span>
      </div>
    </div>
  );
}

