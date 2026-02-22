/**
 * Auth Hook
 * Custom React hook for checking authentication status
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { isAuthenticated, getUserData, getAuthToken, setUserData } from '@/utils/auth';

let sharedRefreshPromise: Promise<any> | null = null;
let sharedLastRefreshAt = 0;

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const lastRefreshRef = useRef<number>(0);
  const refreshKey = 'auth:profile:refreshAt';

  useEffect(() => {
    // Check auth status on mount
    setIsAuth(isAuthenticated());
    setUser(getUserData());
    setToken(getAuthToken());
    // Don't set loading to false yet - wait for refresh attempt below
  }, []);

  // Refresh user data from backend via proxy GET /api/v1/user/profile
  const refreshUser = useCallback(async () => {
    const now = Date.now();
    const minIntervalMs = 60000;

    if (typeof window !== 'undefined') {
      const lastStored = Number(sessionStorage.getItem(refreshKey) || 0);
      if (now - lastStored < minIntervalMs) return null;
    }

    if (now - lastRefreshRef.current < minIntervalMs) return null;
    if (now - sharedLastRefreshAt < minIntervalMs) return null;

    if (sharedRefreshPromise) return sharedRefreshPromise;

    lastRefreshRef.current = now;
    sharedLastRefreshAt = now;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(refreshKey, String(now));
    }

    const storedUser = getUserData();
    if (!storedUser) return null;

    sharedRefreshPromise = (async () => {
      try {
        const res = await fetch('/api/v1/user/profile', { cache: 'no-store', credentials: 'include' });
        if (res.status === 429) {
          console.warn('⚠️ Rate limit exceeded on profile fetch');
          return null;
        }
        if (!res.ok) return null;
        const text = await res.text();
        let payload: any = {};
        try { payload = text ? JSON.parse(text) : {}; } catch { payload = { data: text }; }
        const newUser = payload?.data || payload?.user || payload;
        setUser(newUser);
        setUserData(newUser);
        return newUser;
      } catch {
        return null;
      } finally {
        sharedRefreshPromise = null;
      }
    })();

    return sharedRefreshPromise;
  }, [refreshKey]);

  // Try to refresh user once on mount if we have stored user data
  useEffect(() => {
    const storedUser = getUserData();
    if (storedUser) {
      // Fire and forget, but mark loading complete when done
      refreshUser().finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isAuthenticated: isAuth,
    user,
    token,
    loading,
    setUser, // allow components to update user state
    refreshUser,
  };
};
