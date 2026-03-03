/**
 * SWR hooks — Mold Reports
 *
 * Covers: mold report listing (paged), single report, assigned/unassigned,
 * search, status counts, monthly counts, priority counts.
 */

'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

const PUBLIC_COUNT_CACHE_MS = 10 * 60 * 1000;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface MoldReportSnapshot {
  id: string;
  case_name?: string;
  host?: string;
  location?: string;
  status?: string;
  user_id?: string;
  priority?: string;
  date_observed?: { _seconds: number } | string;
  mold_case?: { priority?: string; location?: string; user_id?: string };
  assigned_mycologist_id?: string;
  assigned_mycologist?: { details?: { displayName?: string } };
  reporter?: {
    name?: string;
    address?: string;
    details?: {
      displayName?: string;
      email?: string;
      phone_number?: string;
      photo_url?: string;
    };
  };
  case_details?: Array<{
    description?: string;
    cover_photo?: string;
    metadata?: { created_at?: { _seconds: number } };
  }>;
  metadata?: { created_at?: { _seconds: number } };
}

export interface StatusCounts {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface MonthlyCounts {
  month: string;
  total: number;
}

export interface PriorityCounts {
  high: number;
  medium: number;
  low: number;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Paginated mold-reports with infinite scroll. */
export function useMoldReportsInfinite(limit = 10, enabled = true) {
  return useSWRInfinite<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    (pageIndex, prev) => {
      if (!enabled) return null;
      if (prev && !prev.data?.nextPageToken) return null;
      if (pageIndex === 0) return apiUrl('/api/v1/mold-reports', { limit });
      return apiUrl('/api/v1/mold-reports', {
        limit,
        pageToken: prev!.data!.nextPageToken!,
      });
    },
    { revalidateFirstPage: false },
  );
}

/** Fetch a single mold report by ID. */
export function useMoldReport(id: string | undefined) {
  return useSWR<ApiResponse<MoldReportSnapshot>>(
    id ? `/api/v1/mold-reports/${id}` : null,
  );
}

/** Unassigned mold reports. */
export function useUnassignedReports(limit = 50, enabled = true) {
  return useSWR<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    enabled ? apiUrl('/api/v1/mold-reports/unassigned', { limit }) : null,
  );
}

/** Assigned mold reports (optionally pass query params). */
export function useAssignedReports(
  params?: { limit?: number; pageToken?: string },
  enabled = true,
) {
  return useSWR<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    enabled
      ? apiUrl('/api/v1/mold-reports/assigned', {
          limit: params?.limit ?? 50,
          pageToken: params?.pageToken,
        })
      : null,
  );
}

/** Closed mold reports (includes rejected). */
export function useClosedReports(
  params?: { limit?: number; pageToken?: string },
  enabled = true,
) {
  return useSWR<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    enabled
      ? apiUrl('/api/v1/mold-reports/closed', {
          limit: params?.limit ?? 10,
          pageToken: params?.pageToken,
        })
      : null,
  );
}

/** Paginated closed mold reports with infinite scroll. */
export function useClosedReportsInfinite(limit = 50, enabled = true) {
  return useSWRInfinite<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    (pageIndex, prev) => {
      if (!enabled) return null;
      if (prev && !prev.data?.nextPageToken) return null;
      if (pageIndex === 0) return apiUrl('/api/v1/mold-reports/closed', { limit });
      return apiUrl('/api/v1/mold-reports/closed', {
        limit,
        pageToken: prev!.data!.nextPageToken!,
      });
    },
    { revalidateFirstPage: false },
  );
}

/** Paginated assigned mold reports with infinite scroll. */
export function useAssignedReportsInfinite(limit = 100) {
  return useSWRInfinite<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    (pageIndex, prev) => {
      if (prev && !prev.data?.nextPageToken) return null;
      if (pageIndex === 0) return apiUrl('/api/v1/mold-reports/assigned', { limit });
      return apiUrl('/api/v1/mold-reports/assigned', {
        limit,
        pageToken: prev!.data!.nextPageToken!,
      });
    },
    { revalidateFirstPage: false },
  );
}

/** Mold-report status counts (admin). */
export function useMoldReportStatusCounts(enabled = true) {
  return useSWR<ApiResponse<StatusCounts>>(
    enabled ? '/api/v1/mold-reports/count/status' : null,
  );
}

/** Monthly mold-report counts. Pass `year` to filter. */
export function useMoldReportMonthlyCounts(year?: number, enabled = true) {
  return useSWR<ApiResponse<MonthlyCounts[]>>(
    enabled ? apiUrl('/api/v1/mold-reports/count/monthly', { year }) : null,
  );
}

/** Priority breakdown counts. */
export function useMoldReportPriorityCounts(enabled = true) {
  return useSWR<ApiResponse<PriorityCounts>>(
    enabled ? '/api/v1/mold-reports/count/priorities' : null,
  );
}

/**
 * Search mold reports with filters.
 * Params with value 'all' are excluded (backend treats absence as no filter).
 */
export function useMoldReportSearch(params: {
  search?: string;
  priority?: string;
  status?: string;
  limit?: number;
  pageToken?: string;
}) {
  const { priority, status, ...rest } = params;
  return useSWR<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    apiUrl('/api/v1/mold-reports/search', {
      ...rest,
      limit: rest.limit ?? 10,
      priority: priority !== 'all' ? priority : undefined,
      status: status !== 'all' ? status : undefined,
    }),
  );
}

/** Public resolved-count for landing page (no auth). */
export function useResolvedCount() {
  return useSWR<ApiResponse<{ resolvedCount: number; resolved?: number }>>(
    '/api/v1/mold-reports/public/resolved-count',
    {
      dedupingInterval: PUBLIC_COUNT_CACHE_MS,
      revalidateIfStale: false,
    },
  );
}
