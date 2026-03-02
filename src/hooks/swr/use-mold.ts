/**
 * SWR hooks — Mold (mold genus/species information)
 *
 * Covers: mold listing, single mold by ID.
 */

'use client';

import useSWR from 'swr';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface MoldInfo {
  id: string;
  name?: string;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Fetch all mold entries (for content-management). */
export function useMoldList(limit = 1000) {
  return useSWR<ApiResponse<PaginatedResponse<MoldInfo>>>(
    apiUrl('/api/v1/mold', { limit }),
  );
}

/** Fetch a single mold entry by ID. */
export function useMoldById(id: string | undefined) {
  return useSWR<ApiResponse<MoldInfo>>(id ? `/api/v1/mold/${id}` : null);
}
