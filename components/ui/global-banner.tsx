'use client';

import React, { useEffect, useState } from 'react';
import { XCircle, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type GlobalErrorEvent = CustomEvent<{ message: string }>;

export function GlobalBanner({ className }: { className?: string }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initialize online status on mount
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleGlobalError = (e: Event) => {
      const ce = e as GlobalErrorEvent;
      if (ce?.detail?.message) {
        setErrorMessage(ce.detail.message);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('protrade:error', handleGlobalError as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('protrade:error', handleGlobalError as EventListener);
    };
  }, []);

  const hasBanner = !isOnline || Boolean(errorMessage);

  if (!hasBanner) return null;

  return (
    <div className={cn('sticky top-0 z-50', className)} role="region" aria-label="Global status banners">
      {/* Offline banner */}
      {!isOnline && (
        <div className="w-full bg-amber-500 text-black border-b border-amber-600 shadow-sm">
          <div className="container mx-auto px-6 py-2.5 text-sm font-medium flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>You are offline.</span>
            <span className="opacity-90">Some data may be outdated until connection is restored.</span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="w-full bg-red-600 text-white border-b border-red-700 shadow-md" role="alert">
          <div className="container mx-auto px-6 py-2.5 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-semibold">Error:</span>
            <span className="flex-1">{errorMessage}</span>
            <button
              aria-label="Dismiss error"
              onClick={() => setErrorMessage(null)}
              className="hover:text-white/90 transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function reportGlobalError(message: string) {
  if (typeof window === 'undefined') return;
  const evt = new CustomEvent('protrade:error', { detail: { message } });
  window.dispatchEvent(evt);
}
