/**
 * SWR hooks — Users
 *
 * Covers: user listing (paged), single user, role/disabled counts, mycologists.
 */

'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RoleCounts {
  farmer: number;
  mycologist: number;
  admin: number;
}

export interface DisabledCounts {
  active: number;
  inactive: number;
}

export interface UserSnapshot {
  id: string;
  user?: {
    role?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    id?: string;
  };
  details?: {
    displayName?: string;
    email?: string;
    disabled?: boolean;
    phone_number?: string;
    photo_url?: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Fetch role-based user counts (farmer / mycologist / admin). */
export function useUserRoleCounts(enabled = true) {
  return useSWR<ApiResponse<RoleCounts>>(
    enabled ? '/api/v1/users/counts/roles' : null,
  );
}

/** Fetch active/disabled user counts. */
export function useUserDisabledCounts(enabled = true) {
  return useSWR<ApiResponse<DisabledCounts>>(
    enabled ? '/api/v1/users/counts/disabled' : null,
  );
}

/**
 * Paginated user listing with infinite scroll.
 *
 * ```tsx
 * const { data, size, setSize, isLoading } = useUsersInfinite(100);
 * const users = data?.flatMap(p => p.data?.snapshot ?? []) ?? [];
 * const loadMore = () => setSize(s => s + 1);
 * ```
 */
export function useUsersInfinite(limit = 100) {
  return useSWRInfinite<ApiResponse<PaginatedResponse<UserSnapshot>>>(
    (pageIndex, previousPageData) => {
      // No more pages
      if (previousPageData && !previousPageData.data?.nextPageToken) return null;
      // First page
      if (pageIndex === 0) return apiUrl('/api/v1/users', { limit });
      // Subsequent pages
      return apiUrl('/api/v1/users', {
        limit,
        pageToken: previousPageData!.data!.nextPageToken!,
      });
    },
    { revalidateFirstPage: false },
  );
}

/** Fetch a single user by ID. */
export function useUser(userId: string | undefined) {
  return useSWR<ApiResponse<{ user: any; details: any }>>(
    userId ? `/api/v1/user/${userId}` : null,
  );
}

/** Fetch the list of mycologists. */
export function useMycologists(enabled = true) {
  return useSWR<ApiResponse<PaginatedResponse<UserSnapshot>>>(
    enabled ? '/api/v1/users/mycologists' : null,
  );
}
