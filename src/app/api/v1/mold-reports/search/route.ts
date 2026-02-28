import type { NextRequest } from 'next/server';
import { proxyFetch } from '@/lib/proxy';

/**
 * GET /api/v1/mold-reports/search
 * Search and filter mold reports by query, priority, and status.
 * Strips priority/status when value is 'all' (backend treats absence as no filter).
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const params = new URLSearchParams();
  for (const key of ['search', 'limit', 'pageToken']) {
    const v = sp.get(key);
    if (v) params.set(key, v);
  }
  if (!params.has('limit')) params.set('limit', '10');

  // Only forward priority/status when they have a real filter value
  const priority = sp.get('priority');
  if (priority && priority !== 'all') params.set('priority', priority);
  const status = sp.get('status');
  if (status && status !== 'all') params.set('status', status);

  const qs = params.toString();
  return proxyFetch(req, {
    upstream: `/mold-report/search${qs ? `?${qs}` : ''}`,
    forwardCookies: true,
  });
}
