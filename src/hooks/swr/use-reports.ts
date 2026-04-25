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
  reported_user_name?: string;
  reported_user?: string;
  reported?: {
    name?: string;
    photo?: string;
    avatar?: string;
  };
  reporter_id?: string;
  reporter_name?: string;
  reporterId?: string;
  reporter?: {
    name?: string;
  };
  created_at?: string | { _seconds: number; seconds?: number };
  status?: string;
  report_status?: string;
  resolution_status?: string;
  metadata?: {
    status?: string;
    report_status?: string;
    created_at?: { seconds: number; _seconds?: number };
  };
  // Optional content/image fields used by the report view
  content?: {
    title?: string;
    name?: string;
    body?: string;
    description?: string;
    image?: string;
    cover_photo?: string;
    author?: string;
  };
  image?: string;
  image_url?: string;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Paginated reports with infinite scroll. */
export function useReportsInfinite(limit = 10) {
  return useSWRInfinite<ApiResponse<PaginatedResponse<ReportSnapshot>>>(
    (pageIndex, prev) => {
      if (prev && !prev.data?.nextPageToken) return null;
      if (pageIndex === 0) return apiUrl('/api/v1/flag-report', { limit });
      return apiUrl('/api/v1/flag-report', {
        limit,
        pageToken: prev!.data!.nextPageToken!,
      });
    },
    { revalidateFirstPage: true },
  );
}

/** Fetch a single report by ID. */
export function useReport(reportId: string | undefined) {
  return useSWR<ApiResponse<ReportSnapshot>>(
    reportId ? apiUrl(`/api/v1/flag-report/${reportId}`) : null,
  );
}

/**
 * Fetch all reports (high limit — used by dashboard to get total count).
 * Consider replacing with a dedicated count endpoint in Phase 3.
 */
export function useReportCount(enabled = true) {
  return useSWR<ApiResponse<PaginatedResponse<ReportSnapshot>>>(
    enabled ? apiUrl('/api/v1/flag-report', { limit: 1000 }) : null,
  );
}
