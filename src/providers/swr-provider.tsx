'use client';

import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/api';
import { SwrErrorBoundary } from '@/components/swr-error-boundary';

/**
 * Global SWR provider with sensible defaults:
 * - `fetcher`             – typed API client (credentials + JSON parsing)
 * - `revalidateOnFocus`   – disabled globally to avoid focus request bursts
 * - `revalidateIfStale`   – disabled so remounts reuse in-memory cache
 * - `dedupingInterval`    – dedup identical requests within 5 s
 * - `errorRetryCount`     – retry failed requests up to 3 times
 * - `shouldRetryOnError`  – skip retry for 4xx client errors (including 429)
 * - `onError`             – handle auth errors (401, 403) and redirect to login
 */
export default function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SwrErrorBoundary>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          revalidateIfStale: true,
          dedupingInterval: 5000,
          errorRetryCount: 3,
          shouldRetryOnError(err) {
            const status = err?.status;
            if (!status) return true;

            // Respect hard auth and validation failures.
            if (status === 401 || status === 403 || status === 404 || status === 422) return false;

            // Allow adaptive retries for throttling and transient upstream errors.
            if (status === 429) return true;
            if (status >= 500) return true;

            // Default for other 4xx: do not retry.
            if (status >= 400 && status < 500) return false;
            return true;
          },
          onErrorRetry(err, _key, _config, revalidate, { retryCount }) {
            if (retryCount >= 3) return;

            const status = err?.status;
            if (status === 401 || status === 403 || status === 404 || status === 422) return;

            const retryAfterMs = typeof err?.retryAfterMs === 'number' ? err.retryAfterMs : null;
            const baseDelayMs = retryAfterMs ?? Math.min(1000 * Math.pow(2, retryCount), 10000);
            const jitterMs = Math.floor(Math.random() * 250);

            setTimeout(() => {
              revalidate({ retryCount });
            }, baseDelayMs + jitterMs);
          },
        }}
      >
        {children}
      </SWRConfig>
    </SwrErrorBoundary>
  );
}
