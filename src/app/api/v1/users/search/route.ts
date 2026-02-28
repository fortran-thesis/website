import type { NextRequest } from 'next/server';
import { proxyFetch } from '@/lib/proxy';

/**
 * GET /api/v1/users/search
 * Search and filter users by query, role, and status.
 * Converts frontend ?status=active|disabled → backend ?active=true|false.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // Build custom query string (backend expects `active` boolean, not `status`)
  const params = new URLSearchParams();
  for (const key of ['search', 'role', 'limit', 'pageToken']) {
    const v = sp.get(key);
    if (v) params.set(key, v);
  }
  if (!params.has('limit')) params.set('limit', '10');

  const status = sp.get('status');
  if (status) {
    const s = status.toLowerCase();
    if (s === 'active') params.set('active', 'true');
    else if (s === 'disabled' || s === 'inactive') params.set('active', 'false');
  }

  const qs = params.toString();
  return proxyFetch(req, {
    upstream: `/user/search${qs ? `?${qs}` : ''}`,
    forwardCookies: true,
  });
}
