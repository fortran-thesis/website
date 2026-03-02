/**
 * SWR hooks — Flag Reports
 */

'use client';

import useSWR from 'swr';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FlagReport {
  content_id?: string;
  content_type?: string;
  details?: string;
  dateFlagged?: string;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Fetch flag reports for the current user. */
export function useFlagReports(limit = 20) {
  return useSWR<ApiResponse<PaginatedResponse<FlagReport>>>(
    apiUrl('/api/v1/flag-report', { limit }),
  );
}
