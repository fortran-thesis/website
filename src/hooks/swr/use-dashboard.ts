/**
 * SWR hooks — Dashboard Summary
 *
 * Single batch hook that replaces 6 individual SWR calls:
 *   - useUserRoleCounts
 *   - useMoldCaseCountsMetadata
 *   - useReportCount
 *   - useMoldReportMonthlyCounts
 *   - useMoldReportPriorityCounts
 *   - useMoldipediaList (for count only)
 *
 * The batch proxy at `/api/v1/dashboard/summary` aggregates all 6
 * backend requests server-side in parallel, returning a single response.
 */

'use client';

import useSWR from 'swr';
import type { ApiResponse } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DashboardSummary {
  /** User role counts: { farmer, mycologist, admin } */
  roleCounts: Record<string, number> | null;
  /** Total mold case count */
  caseCount: number;
  /** Total general report count */
  reportCount: number;
  /** Monthly mold report counts */
  monthlyCounts: Array<{ month: string; total: number }> | null;
  /** Priority breakdown: { high, medium, low } */
  priorityCounts: { high: number; medium: number; low: number };
  /** Total moldipedia article count */
  moldipediaCount: number;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/**
 * Fetch the aggregated dashboard summary (6 backend calls → 1 client call).
 *
 * ```tsx
 * const { data, isLoading } = useDashboardSummary(canLoadDashboardData);
 * const totalUsers = (data?.data?.roleCounts?.farmer ?? 0) + ...;
 * ```
 */
export function useDashboardSummary(enabled = true) {
  return useSWR<ApiResponse<DashboardSummary>>(
    enabled ? '/api/v1/dashboard/summary' : null,
    { dedupingInterval: 30_000 },
  );
}
