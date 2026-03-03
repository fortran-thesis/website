/**
 * Auth Hook
 *
 * Thin re-export of the AuthProvider context.
 * All auth state (user, token, loading) is fetched **once** in <AuthProvider>
 * and shared to every consumer via React Context — no duplicate profile fetches.
 */

'use client';

import { useAuthContext } from '@/providers/auth-provider';

/**
 * Drop-in hook that every page / component already imports.
 * Internally delegates to the shared AuthProvider context.
 */
export const useAuth = useAuthContext;
