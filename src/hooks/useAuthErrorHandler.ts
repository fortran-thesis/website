'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { removeAuthToken, removeUserData } from '@/utils/auth';

/**
 * Hook for handling authentication errors (401, 403)
 * Clears stored auth data and redirects to login page
 */
export function useAuthErrorHandler() {
  const router = useRouter();

  const handleAuthError = useCallback(
    (error: any) => {
      // Check if error has a status property (ApiError) or is a response
      const status = error?.status;

      // Handle 401 (Unauthorized) and 403 (Forbidden)
      if (status === 401 || status === 403) {
        console.warn(`🔒 Authentication error (${status}) - redirecting to login`);

        // Clear all stored auth data
        removeAuthToken();
        removeUserData();

        // Clear session storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('auth:profile:refreshAt');
        }

        // Redirect to login
        router.push('/auth/log-in');
        return true;
      }

      return false;
    },
    [router],
  );

  return { handleAuthError };
}
