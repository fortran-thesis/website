'use client';

import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/api';

/**
 * Global SWR provider with sensible defaults:
 * - `fetcher`             – typed API client (credentials + JSON parsing)
 * - `revalidateOnFocus`   – disabled globally to avoid focus request bursts
 * - `revalidateIfStale`   – disabled so remounts reuse in-memory cache
 * - `dedupingInterval`    – dedup identical requests within 5 s
 * - `errorRetryCount`     – retry failed requests up to 3 times
 * - `shouldRetryOnError`  – skip retry for 4xx client errors (including 429)
 */
export default function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        dedupingInterval: 5000,
        errorRetryCount: 3,
        shouldRetryOnError(err) {
          // Don't retry on 4xx client errors (auth failures, validation, not-found, rate-limit)
          if (err?.status && err.status >= 400 && err.status < 500) return false;
          return true;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
