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
  priority: any;
  id: string;
  case_name?: string;
  host?: string;
  location?: string;
  status?: string;
  user_id?: string;
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

export interface MoldReportPrintSectionPayload {
  fungus_name: string;
  overview: string;
  description: string;
  health_risks: string;
  affected_hosts: string[];
  symptoms_and_signs: string;
  disease_cycle: string;
  impact: string;
  prevention_summary: string;
  physical_control: string;
  cultural_control: string;
  biological_control: string;
  mechanical_control: string;
  chemical_control: string;
}

export interface MoldReportPrintPayload {
  report: {
    report_id: string;
    report_date: string;
    case_name: string;
    host_plant_affected: string;
    case_status: string;
    confidence_level: string;
    location: string;
    date_observed: string;
  };
  identities: {
    reporter_name: string;
    mycologist_name: string;
  };
  sections: MoldReportPrintSectionPayload;
  source: {
    mold_catalog_used: boolean;
    wikimold_used: boolean;
    mold_catalog_id?: string;
    wikimold_id?: string;
  };
  follow_ups?: Array<{
    detail_id: string;
    observed_at?: string;
    timestamp?: string;
    description: string;
    cover_photo?: string[];
    cover_photo_urls?: string[];
  }>;
  investigation?: {
    initial_observation?: {
      microscopic_identification: string;
      microscopic_confidence?: string;
      confidence?: string;
      macroscopic_summary?: string;
      summary?: string;
      observed_at?: string;
      symptoms?: string[];
      signs?: string[];
      characteristics?: string[];
    };
    in_vivo_latest?: {
      identified_mold: string;
      confidence: string;
      summary: string;
      observed_at: string;
      additional_info: string;
      culture_name: string;
    };
    in_vitro_latest?: {
      identified_mold: string;
      confidence: string;
      summary: string;
      observed_at: string;
      additional_info: string;
      culture_name: string;
    };
    cultivation_logs?: Array<{
      log_id: string;
      type: string;
      observed_at?: string;
      created_at?: string;
      summary: string;
      identified_mold: string;
      confidence: string;
      additional_info: string;
      culture_name: string;
      image_url: string;
    }>;
  };
}

export interface StatusCounts {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
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

export interface MoldReportPrintPayload {
  report: {
    report_id: string;
    report_date: string;
    case_name: string;
    host_plant_affected: string;
    case_status: string;
    confidence_level: string;
    location: string;
    date_observed: string;
  };
  identities: {
    reporter_name: string;
    mycologist_name: string;
  };
  sections: {
    fungus_name: string;
    overview: string;
    description: string;
    health_risks: string;
    affected_hosts: string[];
    symptoms_and_signs: string;
    disease_cycle: string;
    impact: string;
    prevention_summary: string;
    physical_control: string;
    cultural_control: string;
    biological_control: string;
    mechanical_control: string;
    chemical_control: string;
  };
  source: {
    mold_catalog_used: boolean;
    wikimold_used: boolean;
    mold_catalog_id?: string;
    wikimold_id?: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Paginated mold-reports with infinite scroll. */
export function useMoldReportsInfinite(
  limit = 10,
  enabled = true,
  scope?: 'own' | 'assigned' | 'all',
) {
  return useSWRInfinite<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    (pageIndex, prev) => {
      if (!enabled) return null;
      if (prev && !prev.data?.nextPageToken) return null;
      if (pageIndex === 0) return apiUrl('/api/v1/mold-reports', { limit, scope });
      return apiUrl('/api/v1/mold-reports', {
        limit,
        scope,
        pageToken: prev!.data!.nextPageToken!,
      });
    },
    { revalidateFirstPage: false, revalidateOnFocus: false },
  );
}

/** Fetch a single mold report by ID. */
export function useMoldReport(id: string | undefined) {
  return useSWR<ApiResponse<MoldReportSnapshot>>(
    id ? `/api/v1/mold-reports/${id}` : null,
  );
}

/** Fetch printable report payload for PDF export. */
export function useMoldReportExport(id: string | undefined) {
  return useSWR<ApiResponse<MoldReportPrintPayload>>(
    id ? `/api/v1/mold-reports/${id}/export` : null,
  );
}

/** Unassigned mold reports. */
export function useUnassignedReports(limit = 50, enabled = true) {
  return useSWR<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    enabled ? apiUrl('/api/v1/mold-reports/unassigned', { limit }) : null,
    { revalidateOnFocus: false },
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
    { revalidateOnFocus: false },
  );
}

/** Closed mold reports. */
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
    { revalidateOnFocus: false },
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
    { revalidateFirstPage: false, revalidateOnFocus: false },
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
    { revalidateFirstPage: false, revalidateOnFocus: false },
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
  scope?: 'own' | 'assigned' | 'all';
  limit?: number;
  pageToken?: string;
}) {
  const { priority, status, scope, ...rest } = params;
  return useSWR<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
    apiUrl('/api/v1/mold-reports/search', {
      ...rest,
      limit: rest.limit ?? 10,
      scope,
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
