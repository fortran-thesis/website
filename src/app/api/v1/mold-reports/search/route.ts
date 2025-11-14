import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/**
 * GET /api/v1/mold-reports/search
 * Search and filter mold reports by query, priority, and status
 * Supports pagination via ?limit and ?pageToken
 * 
 * Query parameters:
 * - search: string (optional) - search query for case name/location/reporter
 * - priority: string (optional) - filter by priority (low, medium, high)
 * - status: string (optional) - filter by status (pending, in_progress, resolved, closed)
 * - limit: number (default: 10) - results per page
 * - pageToken: string (optional) - pagination token for next page
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.nextUrl.toString());

    // Extract query parameters
    const searchQuery = url.searchParams.get('search') || undefined;
    const priority = url.searchParams.get('priority') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const limit = url.searchParams.get('limit') || '10';
    const pageToken = url.searchParams.get('pageToken') || undefined;

    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    // Build upstream URL with query params
    const upstreamUrl = new URL(`${envOptions.apiUrl}/mold-report/search`);
    if (searchQuery) upstreamUrl.searchParams.set('search', searchQuery);
    if (priority && priority !== 'all') upstreamUrl.searchParams.set('priority', priority);
    if (status && status !== 'all') upstreamUrl.searchParams.set('status', status);
    if (limit) upstreamUrl.searchParams.set('limit', limit);
    if (pageToken) upstreamUrl.searchParams.set('pageToken', pageToken);

    console.log('📤 GET /api/v1/mold-reports/search proxy');
    console.log('  Query params:', { searchQuery, priority, status, limit, pageToken: pageToken ? `${pageToken.substring(0, 20)}...` : 'NONE' });
    console.log('  Upstream URL:', upstreamUrl.toString());

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${sessionCookie}`,
      },
      cache: 'no-store',
    });

    const text = await upstreamRes.text();
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { data: text };
    }

    console.log('  Backend response status:', upstreamRes.status);
    console.log('  Backend nextPageToken:', payload.data?.nextPageToken ? `${payload.data.nextPageToken.substring(0, 20)}...` : 'NONE');
    console.log('  Backend snapshot length:', payload.data?.snapshot?.length || 0);

    // If upstream returns unauthorized/forbidden, forward as 403
    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const res = NextResponse.json(payload, { status: upstreamRes.status });

    // Forward Set-Cookie if upstream set one (strip Domain)
    const backendSetCookie = upstreamRes.headers.get('set-cookie') || upstreamRes.headers.get('Set-Cookie');
    if (backendSetCookie) {
      const parts = backendSetCookie.split(';').map(p => p.trim()).filter(Boolean);
      const nameValue = parts[0];
      const attrs = parts.slice(1).filter(p => !p.toLowerCase().startsWith('domain='));
      if (!attrs.some(a => a.toLowerCase().startsWith('path='))) attrs.push('Path=/');
      if (!attrs.some(a => a.toLowerCase().startsWith('samesite='))) attrs.push('SameSite=Lax');
      const final = `${nameValue}; ${attrs.join('; ')}`;
      res.headers.set('Set-Cookie', final);
    }

    return res;
  } catch (err) {
    console.error('GET /api/v1/mold-reports/search proxy error', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
