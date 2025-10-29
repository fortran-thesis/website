/**
 * Logout Hook
 * Custom React hook for handling user logout
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { removeAuthToken } from '@/utils/auth';

export const useLogout = () => {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      // Clear client-side user data
      removeAuthToken(); // This just clears localStorage user data
      
      // Clear the HttpOnly session cookie via Next.js API route
      await fetch('/api/clear-auth-cookie', { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      // Optional: Call backend logout endpoint if it exists
      // await fetch(backendLogoutUrl, { method: 'POST', credentials: 'include' });
      
      // Small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force a hard navigation to ensure middleware runs with cleared cookies
      window.location.href = '/auth/log-in';
    } catch (err) {
      console.warn('Logout error:', err);
      // Still try to redirect even if API call fails
      window.location.href = '/auth/log-in';
    }
  }, [router]);

  return logout;
};
