import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

// Proxy for /api/v1/audit-logs
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.nextUrl.toString());
    const action = url.searchParams.get('action') || undefined;
    const limit = url.searchParams.get('limit') || '10';
    const pageToken = url.searchParams.get('pageToken') || undefined;

    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    // Build upstream URL with query params
    // Backend has /audit-log (singular), with optional /{action} for specific actions
    let upstreamPath = '/audit-log';
    if (action) {
      upstreamPath += `/${action}`;
    }
    
    const upstreamUrl = new URL(`${envOptions.apiUrl}${upstreamPath}`);
    upstreamUrl.searchParams.set('limit', limit);
    if (pageToken) {
      upstreamUrl.searchParams.set('pageToken', pageToken);
    }

    console.log('📤 GET /api/v1/audit-logs proxy');
    console.log('  Query params:', { action: action ? `${action}` : 'NONE', limit, pageToken: pageToken ? `${pageToken.substring(0, 20)}...` : 'NONE' });
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
    console.log('  Backend logs count:', Array.isArray(payload.data) ? payload.data.length : 0);

    // If upstream returns unauthorized/forbidden, forward as 403
    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Forward any other non-success status (except 404 which we treat as empty)
    if (!upstreamRes.ok && upstreamRes.status !== 404) {
      return NextResponse.json(
        payload || { success: false, error: 'Failed to fetch audit logs' },
        { status: upstreamRes.status }
      );
    }

    // Return successful response (200) - even if no logs found, return empty data
    return NextResponse.json(payload || { data: [], success: true }, { status: 200 });
  } catch (error) {
    console.error('  Error in proxy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
