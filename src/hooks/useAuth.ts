/**
 * Auth Hook
 * Custom React hook for checking authentication status
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { isAuthenticated, getUserData, getAuthToken, setUserData } from '@/utils/auth';

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const lastRefreshRef = useRef<number>(0);

  useEffect(() => {
    // Check auth status on mount
    setIsAuth(isAuthenticated());
    setUser(getUserData());
    setToken(getAuthToken());
    // Don't set loading to false yet - wait for refresh attempt below
  }, []);

  // Refresh user data from backend via proxy GET /api/v1/user/profile
  const refreshUser = useCallback(async () => {
    console.log('🔄 refreshUser called');
    
    // Prevent duplicate refreshes within 1 second
    const now = Date.now();
    if (now - lastRefreshRef.current < 1000) {
      console.log('⏱️ Refresh called too soon, skipping');
      return null;
    }
    lastRefreshRef.current = now;
    
    const storedUser = getUserData();
    if (!storedUser) {
      console.warn('⚠️ No stored user');
      return null;
    }
    console.log('📍 Fetching fresh profile...');

    try {
      const res = await fetch('/api/v1/user/profile', { cache: 'no-store', credentials: 'include' });
      console.log('📍 Response status:', res.status);
      if (!res.ok) {
        console.warn('❌ Failed, status:', res.status);
        return null;
      }
      const text = await res.text();
      console.log('📥 Response:', text.substring(0, 200));
      let payload: any = {};
      try { payload = text ? JSON.parse(text) : {}; } catch { payload = { data: text }; }
      
      // Extract the full data object which contains both user and details
      // Backend structure: {success: true, data: {id, user: {...}, details: {...}}}
      let newUser = payload?.data || payload?.user || payload;
      console.log('✅ Got user:', newUser);
      setUser(newUser);
      setUserData(newUser);
      return newUser;
    } catch (err) {
      console.error('❌ Error:', err);
      return null;
    }
  }, [lastRefreshRef]);

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
  }, [refreshUser]);

  return {
    isAuthenticated: isAuth,
    user,
    token,
    loading,
    setUser, // allow components to update user state
    refreshUser,
  };
};
