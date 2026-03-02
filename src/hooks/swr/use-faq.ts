/**
 * SWR hooks — FAQ
 */

'use client';

import useSWR from 'swr';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

const FAQ_CACHE_MS = 5 * 60 * 1000;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FaqItem {
  id?: string;
  q?: string;
  question?: string;
  a?: string;
  answer?: string;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/**
 * Fetch FAQ list (public, no auth required).
 * Routes through the proxy at `/api/v1/faq`.
 */
export function useFaqs(params?: { search?: string; limit?: number }) {
  return useSWR<ApiResponse<PaginatedResponse<FaqItem>>>(
    apiUrl('/api/v1/faq', {
      search: params?.search,
      limit: params?.limit,
    }),
    {
      dedupingInterval: FAQ_CACHE_MS,
      revalidateIfStale: false,
      keepPreviousData: true,
    },
  );
}
