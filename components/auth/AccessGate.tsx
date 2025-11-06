'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'protrade_access_hash_v1';

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function useExpectedHash() {
  // Read env at build-time; available to client because prefixed with NEXT_PUBLIC_
  const protect = process.env.NEXT_PUBLIC_PREVIEW_PROTECT;
  const code = process.env.NEXT_PUBLIC_PREVIEW_CODE;
  const codeHash = process.env.NEXT_PUBLIC_PREVIEW_CODE_HASH;

  const enabled = protect === '1' || protect === 'true';

  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!enabled) {
        setHash(null);
        return;
      }
      if (codeHash && codeHash.length > 0) {
        if (!cancelled) setHash(codeHash.toLowerCase());
      } else if (code && code.length > 0) {
        const computed = await sha256Hex(code);
        if (!cancelled) setHash(computed.toLowerCase());
      } else {
        // Nothing configured
        if (!cancelled) setHash('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, code, codeHash]);

  return { enabled, hash };
}

export function AccessGate({ children }: { children: React.ReactNode }) {
  const { enabled, hash: expectedHash } = useExpectedHash();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    // Wait until expected hash is known
    if (expectedHash === null) return; // still computing

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && expectedHash && saved.toLowerCase() === expectedHash.toLowerCase()) {
      setAuthorized(true);
    }
    setLoading(false);
  }, [enabled, expectedHash]);

  const onSubmit = useCallback(async () => {
    setError(null);
    if (!expectedHash) {
      setError('Access code is not configured.');
      return;
    }
    const enteredHash = await sha256Hex(codeInput.trim());
    if (enteredHash.toLowerCase() === expectedHash.toLowerCase()) {
      localStorage.setItem(STORAGE_KEY, expectedHash);
      setAuthorized(true);
    } else {
      setError('Invalid code. Please try again.');
    }
  }, [codeInput, expectedHash]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );

  if (!enabled) return <>{children}</>;
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-200">
        <div className="text-sm opacity-80">Preparing protected preview…</div>
      </div>
    );
  }
  if (authorized) return <>{children}</>;

  const notConfigured = expectedHash === '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700/60 shadow-xl">
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary grid place-items-center">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Protected Preview</h2>
              <p className="text-sm text-slate-400">Enter the access code to continue.</p>
            </div>
          </div>

          {notConfigured && (
            <div className="flex items-start gap-2 rounded-md bg-amber-500/15 text-amber-200 border border-amber-600/40 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div>
                Access code is not configured. Set <code className="font-mono">NEXT_PUBLIC_PREVIEW_PROTECT=1</code> and either <code className="font-mono">NEXT_PUBLIC_PREVIEW_CODE</code> or <code className="font-mono">NEXT_PUBLIC_PREVIEW_CODE_HASH</code> in your .env.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="access-code">Access code</label>
            <Input
              id="access-code"
              type="password"
              autoFocus
              placeholder="Enter code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="bg-slate-800 border-slate-700 focus-visible:ring-primary"
            />
          </div>

          {error && (
            <div className="text-sm text-red-300">{error}</div>
          )}

          <div className="flex justify-end">
            <Button onClick={onSubmit} className="px-5">
              Continue
            </Button>
          </div>

          <div className="text-[11px] text-slate-500">
            Tip: set <code className="font-mono">NEXT_PUBLIC_PREVIEW_CODE_HASH</code> to a SHA-256 of your code to avoid exposing it in plaintext on the client.
          </div>
        </div>
      </Card>
    </div>
  );
}

