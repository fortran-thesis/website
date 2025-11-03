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
      console.log('🚪 Logging out...');
      
      // Clear client-side user data
      removeAuthToken(); // This clears localStorage user data
      
      // Clear the HttpOnly session cookie via the logout proxy
      // This will also call the backend logout endpoint
      const response = await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      const data = await response.json().catch(() => ({}));
      console.log('✅ Logout response:', response.status, data);
      
      // Small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force a hard navigation to ensure middleware runs with cleared cookies
      window.location.href = '/auth/log-in';
    } catch (err) {
      console.warn('⚠️ Logout error:', err);
      // Still try to redirect even if API call fails
      window.location.href = '/auth/log-in';
    }
  }, [router]);

  return logout;
};
