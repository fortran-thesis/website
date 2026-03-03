/**
 * SWR hooks — Flag Reports
 */

'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FlagReport {
  content_id?: string;
  content_type?: string;
  reporter_id?: string;
  reason?: string;
  details?: string;
  status?: string;
  dateFlagged?: string;
  created_at?: { _seconds: number } | string;
  metadata?: { created_at?: { _seconds: number } | string };
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Fetch one page of flag reports. */
export function useFlagReports(params?: { limit?: number; pageToken?: string }, enabled = true) {
  return useSWR<ApiResponse<PaginatedResponse<FlagReport>>>(
    enabled
      ? apiUrl('/api/v1/flag-report', {
          limit: params?.limit ?? 20,
          pageToken: params?.pageToken,
        })
      : null,
  );
}

/** Paginated flag reports with infinite scroll. */
export function useFlagReportsInfinite(limit = 50, enabled = true) {
  return useSWRInfinite<ApiResponse<PaginatedResponse<FlagReport>>>(
    (pageIndex, prev) => {
      if (!enabled) return null;
      if (prev && !prev.data?.nextPageToken) return null;
      if (pageIndex === 0) return apiUrl('/api/v1/flag-report', { limit });
      return apiUrl('/api/v1/flag-report', {
        limit,
        pageToken: prev.data?.nextPageToken,
      });
    },
    { revalidateFirstPage: false },
  );
}
