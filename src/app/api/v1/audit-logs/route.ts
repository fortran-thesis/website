import type { NextRequest } from 'next/server';
import { proxyFetch } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

/**
 * GET /api/v1/audit-logs
 * ?action=X changes the backend path to /audit-log/{action}.
 */
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action');

  return proxyFetch(req, {
    upstream: action ? endpoints.auditLog.byAction(action) : endpoints.auditLog.list,
    forwardParams: ['limit', 'pageToken', 'userId'],
  });
}
