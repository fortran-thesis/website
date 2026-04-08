'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { removeAuthToken, removeUserData } from '@/utils/auth';

/**
 * SWR Error Boundary Component
 *
 * Monitors for 401/403 errors globally and redirects to login.
 * Wraps window.fetch to intercept 401/403 responses and handle auth failures.
 */
export function SwrErrorBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper: Check if currently on an auth page
  const isAuthPage = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const path = window.location.pathname;
    return (
      path.startsWith('/auth') ||
      path.startsWith('/support') ||
      path.startsWith('/wikimold') ||
      path === '/' ||
      path.startsWith('/terms-of-agreement') ||
      path.startsWith('/privacy-policy') ||
      path.startsWith('/about') ||
      path.startsWith('/faq')
    );
  }, []);

  // Intercept fetch responses to detect 401/403 errors
  useEffect(() => {
    if (!isMounted) return;

    const originalFetch = window.fetch;
    let redirectScheduled = false;

    const wrappedFetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await originalFetch(...args);

        // Check for auth errors and handle them
        if ((response.status === 401 || response.status === 403) && !isAuthPage()) {
          console.warn(`🔒 Auth error ${response.status} - clearing session and redirecting`);

          // Clear auth
          removeAuthToken();
          removeUserData();
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('auth:profile:refreshAt');
          }

          // Schedule redirect if not already scheduled
          if (!redirectScheduled) {
            redirectScheduled = true;
            // Use requestAnimationFrame to defer the navigation
            requestAnimationFrame(() => {
              if (!isAuthPage()) {
                router.push('/auth/log-in');
              }
            });
          }

          // Return a cloned response since it might be consumed by the caller
          return response.clone();
        }

        return response;
      } catch (error) {
        throw error;
      }
    };

    // Replace window.fetch with our wrapped version
    (window as any).fetch = wrappedFetch;

    return () => {
      (window as any).fetch = originalFetch;
    };
  }, [isMounted, router, isAuthPage]);

  return <>{children}</>;
}


