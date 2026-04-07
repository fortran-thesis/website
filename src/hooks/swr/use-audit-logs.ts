/**
 * SWR hooks — Audit Logs
 */

'use client';

import useSWR from 'swr';
import { apiUrl, type ApiResponse } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AuditLogEntry {
  timestamp?: string | { _seconds: number };
  action?: string;
  description?: string;
  [key: string]: unknown;
}

export interface AuditLogPage {
  snapshot: AuditLogEntry[];
  nextPageToken: string | null;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/**
 * Fetch audit logs, optionally filtered by action.
 * `?action=X` results in backend path `/audit-log/{action}`.
 */
export function useAuditLogs(params?: { action?: string; userId?: string; limit?: number }) {
  return useSWR<ApiResponse<AuditLogPage | AuditLogEntry[]>>(
    apiUrl('/api/v1/audit-logs', {
      action: params?.action,
      userId: params?.userId,
      limit: params?.limit ?? 10,
    }),
  );
}
