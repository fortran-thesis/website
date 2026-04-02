/**
 * Landing Page — React Server Component
 *
 * Fetches the resolved case count directly from the backend at
 * build/ISR time (revalidates every 10 minutes), then passes the
 * count to the client component for animations and interactivity.
 *
 * Benefits over the previous "use client" + SWR approach:
 *   - Zero client-side fetch on initial load
 *   - ISR cache shared across all visitors
 *   - Smaller client JS bundle
 */

import { serverFetch } from '@/lib/server-fetch';
import { endpoints } from '@/services/endpoints';
import LandingClient from './landing-client';

/* ISR: regenerate this page at most every 10 minutes */
export const revalidate = 600;

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default async function LandingPage() {
  let resolvedCount = 0;

  try {
    const payload = await serverFetch<{
      resolved_count?: number | string;
      resolvedCount?: number | string;
      resolved?: number | string;
    }>(
      endpoints.moldReport.publicResolvedCount,
      { revalidate: false },
    );

    console.log('[LandingPage] publicResolvedCount response:', payload);

    if (payload?.success && payload?.data) {
      const rawResolved =
        payload.data.resolved_count ??
        payload.data.resolvedCount ??
        payload.data.resolved ??
        0;
      const parsedResolved =
        typeof rawResolved === 'number' ? rawResolved : Number(rawResolved);

      resolvedCount = Number.isFinite(parsedResolved) ? parsedResolved : 0;
      console.log('[LandingPage] parsed resolvedCount:', resolvedCount);
    } else {
      console.warn('[LandingPage] API response invalid:', { success: payload?.success, data: payload?.data });
    }
  } catch (error) {
    console.error('[LandingPage] Fetch error:', error);
  }

  return <LandingClient resolvedCount={resolvedCount} />;
}
