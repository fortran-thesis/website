import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/**
 * GET /api/v1/mold-cases/counts/metadata
 * Proxy to upstream mold cases count with metadata (admin only)
 * Returns: { count: number, createdAt: string }
 */
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    const upstreamUrl = new URL(`${envOptions.apiUrl}/mold-cases/counts/metadata`);

    console.log('📤 GET /api/v1/mold-cases/counts/metadata proxy');
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
    console.log('  Backend metadata:', payload.data);

    // If upstream returns unauthorized/forbidden, forward as 403
    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Forward any other non-success status
    if (!upstreamRes.ok) {
      return NextResponse.json(
        payload || { success: false, error: 'Failed to fetch mold cases metadata' },
        { status: upstreamRes.status }
      );
    }

    // Return successful response
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('  Error in proxy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
