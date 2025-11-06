'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/types/auth';

interface UseRequireAuthOptions {
  redirectTo?: string;
  requiredRole?: UserRole;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/login', requiredRole } = options;
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && !hasRole(requiredRole)) {
        router.push('/');
        return;
      }
    }
  }, [loading, isAuthenticated, hasRole, requiredRole, redirectTo, router]);

  return { user, loading, isAuthenticated };
}

