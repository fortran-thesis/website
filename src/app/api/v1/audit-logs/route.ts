import type { NextRequest } from 'next/server';
import { proxyFetch } from '@/lib/proxy';

/**
 * GET /api/v1/audit-logs
 * ?action=X changes the backend path to /audit-log/{action}.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const action = sp.get('action');

  // Backend: /audit-log or /audit-log/{action}
  let path = '/audit-log';
  if (action) path += `/${action}`;

  return proxyFetch(req, {
    upstream: path,
    forwardParams: ['limit', 'pageToken'],
  });
}
