/**
 * Auth Hook
 * Custom React hook for checking authentication status
 */

'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated, getUserData, getAuthToken } from '@/utils/auth';

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check auth status on mount
    setIsAuth(isAuthenticated());
    setUser(getUserData());
    setToken(getAuthToken());
    setLoading(false);
  }, []);

  return {
    isAuthenticated: isAuth,
    user,
    token,
    loading,
  };
};
