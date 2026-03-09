/**
 * Dashboard Summary — BFF Batch Proxy
 *
 * Aggregates 6 backend count/stats endpoints into a single response.
 * This replaces 6 separate client-side SWR calls with 1, reducing
 * HTTP round-trips from the browser and improving dashboard load time.
 *
 * Backend calls (executed in parallel, server-side):
 *   1. User role counts       → /user/counts/roles
 *   2. Mold case count        → /mold-case/counts/metadata
 *   3. Report list count      → /report (count snapshot length)
 *   4. Monthly report counts  → /mold-report/counts/monthly
 *   5. Priority breakdown     → /mold-report/counts/priorities
 *   6. Moldipedia list count  → /moldipedia (count snapshot length)
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
): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${envOptions.apiUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      cache: 'no-store',
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

  // Fire all 6 backend requests in parallel
  const [
    roleCountsRes,
    caseMetadataRes,
    reportsRes,
    monthlyRes,
    prioritiesRes,
    moldipediaRes,
  ] = await Promise.all([
    backendFetch(endpoints.user.countsRoles, cookie),
    backendFetch(endpoints.moldCase.countMetadata, cookie),
    backendFetch(`${endpoints.flagReports.list}?limit=1000`, cookie),
    backendFetch(endpoints.moldReport.countMonthly, cookie),
    backendFetch(endpoints.moldReport.countPriorities, cookie),
    backendFetch(`${endpoints.moldipedia.list}?limit=1000`, cookie),
  ]);

  // Extract and normalize the data
  const roleCounts = roleCountsRes?.data ?? null;
  const caseCount = caseMetadataRes?.data?.count ?? 0;

  // Report count: extract from paginated snapshot
  const reportSnapshot = reportsRes?.data?.snapshot;
  const reportCount = Array.isArray(reportSnapshot) ? reportSnapshot.length : 0;

  // Monthly counts
  const monthlyCounts = monthlyRes?.data ?? null;

  // Priority breakdown
  const priorityCounts = prioritiesRes?.data ?? { high: 0, medium: 0, low: 0 };

  // Moldipedia count: extract from paginated snapshot
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
