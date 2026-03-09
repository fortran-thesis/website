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
    const res = await serverFetch<Record<string, unknown>>(
      endpoints.moldReport.countStatuses,
      { revalidate: 600, tags: ['resolved-count'] },
    );

    if (res?.data) {
      // Backend returns { total, pending, in_progress, resolved, closed }
      resolvedCount =
        (res.data as any).resolved ??
        (res.data as any).resolved_count ??
        (res.data as any).resolvedCount ??
        0;
    }
  } catch {
    // Fallback to 0
  }

  return <LandingClient resolvedCount={resolvedCount} />;
}
