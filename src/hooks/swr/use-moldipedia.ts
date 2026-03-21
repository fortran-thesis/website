/**
 * SWR hooks — Moldipedia (wiki articles)
 *
 * Covers: paginated listing, single article by ID/slug.
 * All reads go through the Next.js proxy (not direct to backend).
 */

'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

const MOLDIPEDIA_CACHE_MS = 5 * 60 * 1000;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface MoldipediaArticle {
  id: string;
  title?: string;
  author?: string;
  author_id?: string;
  author_photo?: string;
  cover_photo?: string;
  body?: string;
  description?: string;
  content?: string;
  created_at?: string;
  tags?: string[];
  treatment?: string;
  mold_type?: string;
  affected_crops?: string;
  symptoms?: string;
  disease_cycle?: string;
  impact?: string;
  treatment_mechanical?: string;
  treatment_cultural?: string;
  treatment_biological?: string;
  treatment_physical?: string;
  treatment_chemical?: string;
  metadata?: {
    created_at?: { _seconds: number } | string;
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Defensively extract article array from the response.
 * Backend returns data in inconsistent shapes across endpoints.
 */
export function extractArticles(data: any): MoldipediaArticle[] {
  if (!data) return [];
  // data.snapshot (paginated standard)
  if (Array.isArray(data.snapshot)) return data.snapshot;
  // data.data (double nested)
  if (Array.isArray(data.data)) return data.data;
  // plain array
  if (Array.isArray(data)) return data;
  // named keys
  for (const key of ['items', 'records', 'articles']) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Paginated moldipedia listing with infinite scroll. */
export function useMoldipediaInfinite(limit = 50) {
  return useSWRInfinite<ApiResponse<PaginatedResponse<MoldipediaArticle>>>(
    (pageIndex, prev) => {
      if (prev && !prev.data?.nextPageToken) return null;
      if (pageIndex === 0) return apiUrl('/api/v1/moldipedia', { limit });
      return apiUrl('/api/v1/moldipedia', {
        limit,
        pageToken: prev!.data!.nextPageToken!,
      });
    },
    {
      revalidateFirstPage: false,
      revalidateIfStale: false,
      dedupingInterval: MOLDIPEDIA_CACHE_MS,
      persistSize: true,
    },
  );
}

/** Fetch a single moldipedia article by ID. */
export function useMoldipediaArticle(id: string | undefined) {
  return useSWR<ApiResponse<MoldipediaArticle>>(
    id ? `/api/v1/moldipedia/${id}` : null,
    {
      dedupingInterval: MOLDIPEDIA_CACHE_MS,
      revalidateIfStale: false,
    },
  );
}

/** Fetch moldipedia listing (flat, single page — for dashboard count / content-management). */
export function useMoldipediaList(limit = 1000, enabled = true) {
  return useSWR<ApiResponse<PaginatedResponse<MoldipediaArticle>>>(
    enabled ? apiUrl('/api/v1/moldipedia', { limit }) : null,
    {
      dedupingInterval: MOLDIPEDIA_CACHE_MS,
      revalidateIfStale: false,
      keepPreviousData: true,
    },
  );
}
