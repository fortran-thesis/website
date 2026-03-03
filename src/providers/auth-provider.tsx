/**
 * AuthProvider
 *
 * Single source of truth for authentication state.
 * Fetches /api/v1/user/profile **once** on mount and shares the result
 * to every descendant via React Context — no matter how many components
 * call `useAuth()`.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  isAuthenticated,
  getUserData,
  getAuthToken,
  setUserData,
} from '@/utils/auth';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AuthContextValue {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  refreshUser: () => Promise<any>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const lastRefreshRef = useRef(0);
  const refreshPromiseRef = useRef<Promise<any> | null>(null);
  const refreshKey = 'auth:profile:refreshAt';

  /* ── Hydrate from localStorage on mount ── */
  useEffect(() => {
    setIsAuth(isAuthenticated());
    setUser(getUserData());
    setToken(getAuthToken());
  }, []);

  /* ── Refresh profile from backend (deduped, 60 s throttle) ── */
  const refreshUser = useCallback(async () => {
    const now = Date.now();
    const minInterval = 60_000;

    // Check sessionStorage timestamp
    if (typeof window !== 'undefined') {
      const last = Number(sessionStorage.getItem(refreshKey) || 0);
      if (now - last < minInterval) return null;
    }
    if (now - lastRefreshRef.current < minInterval) return null;

    // Dedup concurrent calls
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    lastRefreshRef.current = now;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(refreshKey, String(now));
    }

    refreshPromiseRef.current = (async () => {
      try {
        const res = await fetch('/api/v1/user/profile', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (res.status === 429) {
          console.warn('Rate limit exceeded on profile fetch');
          return null;
        }
        if (!res.ok) return null;

        const text = await res.text();
        let payload: any = {};
        try {
          payload = text ? JSON.parse(text) : {};
        } catch {
          payload = { data: text };
        }

        const newUser = payload?.data || payload?.user || payload;
        setUser(newUser);
        setUserData(newUser);
        return newUser;
      } catch {
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  /* ── Refresh once on mount if stored user exists ── */
  useEffect(() => {
    if (getUserData()) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: isAuth, user, token, loading, setUser, refreshUser }),
    [isAuth, user, token, loading, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * Consume the AuthProvider context.
 * Throws if called outside <AuthProvider>.
 */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
