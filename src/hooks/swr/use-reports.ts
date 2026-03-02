/**
 * SWR hooks — Reports (user reports / moderation reports)
 *
 * Covers: paginated report listing, single report by ID.
 */

'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ReportSnapshot {
  id: string;
  reason?: string;
  title?: string;
  description?: string;
  details?: string;
  reported_user_id?: string;
  reporter_id?: string;
  created_at?: string | { _seconds: number; seconds?: number };
  status?: string;
  report_status?: string;
  resolution_status?: string;
  metadata?: {
    status?: string;
    report_status?: string;
    created_at?: { seconds: number; _seconds?: number };
  };
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Paginated reports with infinite scroll. */
export function useReportsInfinite(limit = 10) {
  return useSWRInfinite<ApiResponse<PaginatedResponse<ReportSnapshot>>>(
    (pageIndex, prev) => {
      if (prev && !prev.data?.nextPageToken) return null;
      if (pageIndex === 0) return apiUrl('/api/v1/reports', { limit });
      return apiUrl('/api/v1/reports', {
        limit,
        pageToken: prev!.data!.nextPageToken!,
      });
    },
    { revalidateFirstPage: false },
  );
}

/** Fetch a single report by ID. */
export function useReport(reportId: string | undefined) {
  return useSWR<ApiResponse<ReportSnapshot>>(
    reportId ? `/api/v1/reports/${reportId}` : null,
  );
}

/**
 * Fetch all reports (high limit — used by dashboard to get total count).
 * Consider replacing with a dedicated count endpoint in Phase 3.
 */
export function useReportCount(enabled = true) {
  return useSWR<ApiResponse<PaginatedResponse<ReportSnapshot>>>(
    enabled ? apiUrl('/api/v1/reports', { limit: 1000 }) : null,
  );
}
