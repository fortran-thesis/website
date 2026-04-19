/**
 * Dashboard Summary — BFF Batch Proxy
 *
 * Aggregates the combined totals endpoint plus the remaining chart/count
 * reads into a single response. This keeps the browser on one client request
 * while the server-side proxy fans out only where the backend still lacks a
 * dedicated summary endpoint.
 *
 * Backend calls (executed in parallel, server-side):
 *   1. Combined totals       → /mold-report/counts/totals
 *   2. Monthly report counts → /mold-report/counts/monthly
 *   3. Priority breakdown    → /mold-report/counts/priorities
 *   4. Moldipedia list count → /moldipedia (count snapshot length)
 */

import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function backendFetch(
  endpoint: string,
  cookie: string,
  cacheStrategy: RequestCache | { next: { revalidate: number } } = 'no-store',
): Promise<Record<string, any> | null> {
  try {
    const fetchOpts: RequestInit =
      typeof cacheStrategy === 'string'
        ? { cache: cacheStrategy }
        : (cacheStrategy as RequestInit);

    const res = await fetch(`${envOptions.apiUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      ...fetchOpts,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Route Handler                                                      */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';

  if (!cookie) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 },
    );
  }

  // Fire the dashboard summary requests in parallel.
  // The moldipedia list fetch remains count-only for now; it is revalidated on a
  // 30-second server-side window to avoid large payload fetches on every load.
  const countCache = { next: { revalidate: 30 } };

  const [
    totalsRes,
    monthlyRes,
    prioritiesRes,
    moldipediaRes,
  ] = await Promise.all([
    backendFetch(endpoints.moldReport.countTotals, cookie),
    backendFetch(endpoints.moldReport.countMonthly, cookie),
    backendFetch(endpoints.moldReport.countPriorities, cookie),
    backendFetch(`${endpoints.moldipedia.list}?limit=1000`, cookie, countCache),
  ]);

  const totals = totalsRes?.data as
    | {
        users?: Record<string, number> | null;
        userStatus?: { active: number; inactive: number } | null;
        moldReports?: {
          total: number;
          pending: number;
          in_progress: number;
          resolved: number;
          rejected: number;
        } | null;
        moldCases?: { low: number; medium: number; high: number } | null;
      }
    | undefined;

  // Extract and normalize the data
  const roleCounts = totals?.users ?? null;

  const moldCases = totals?.moldCases ?? null;
  const caseCount = moldCases
    ? (moldCases.low ?? 0) + (moldCases.medium ?? 0) + (moldCases.high ?? 0)
    : 0;

  const reportCount = totals?.moldReports?.total ?? 0;

  // Monthly counts
  const monthlyCounts = monthlyRes?.data ?? null;

  // Priority breakdown
  const priorityCounts = moldCases ?? prioritiesRes?.data ?? { high: 0, medium: 0, low: 0 };

  // Moldipedia count: still derived from the paginated snapshot for now.
  const moldipediaSnapshot = moldipediaRes?.data?.snapshot;
  const moldipediaCount = Array.isArray(moldipediaSnapshot)
    ? moldipediaSnapshot.length
    : 0;

  return NextResponse.json({
    success: true,
    data: {
      roleCounts,
      caseCount,
      reportCount,
      monthlyCounts,
      priorityCounts,
      moldipediaCount,
    },
  });
}
