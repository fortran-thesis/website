/**
 * SWR hooks — Mold Cases
 *
 * Covers: mold-case listing, mold-case by report ID, case metadata counts.
 */

'use client';

import useSWR from 'swr';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CultivationLog {
  type?: string;
  created_at?: { _seconds: number } | string;
  image_urls?: string[];
  characteristics?: { size?: string; color?: string };
  additional_info?: string;
}

export interface MoldCase {
  id?: string;
  priority?: string;
  mycologist_id?: string;
  mycologist_name?: string;
  is_archived?: boolean;
  start_date?: string | { _seconds: number };
  cultivation_details?: {
    in_vitro_details?: {
      growthMedium?: string;
      incubationTemperature?: string;
    };
    in_vivo_details?: {
      environmentalTemperature?: string;
    };
  };
  cultivation_logs?: CultivationLog[];
}

export interface MoldCaseMetadata {
  count: number;
  createdAt?: unknown;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Fetch a mold case by its parent report ID. */
export function useMoldCaseByReport(reportId: string | undefined) {
  return useSWR<ApiResponse<MoldCase>>(
    reportId ? `/api/v1/mold-cases/by-report/${reportId}` : null,
  );
}

/** Fetch mold-case metadata counts. */
export function useMoldCaseCountsMetadata(enabled = true) {
  return useSWR<ApiResponse<MoldCaseMetadata>>(
    enabled ? '/api/v1/mold-cases/counts/metadata' : null,
  );
}

/** Fetch all mold cases (used by assign modal for case-count). */
export function useMoldCases(limit?: number, enabled = true) {
  return useSWR<ApiResponse<PaginatedResponse<MoldCase>>>(
    enabled ? apiUrl('/api/v1/mold-cases', { limit }) : null,
  );
}
