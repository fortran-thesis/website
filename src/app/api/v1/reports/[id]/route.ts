import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

// Proxy for /api/v1/reports/{id}
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    const upstreamUrl = `${envOptions.apiUrl}/report/${id}`;

    console.log('📤 GET /api/v1/reports/[id] proxy');
    console.log('  Report ID:', id);
    console.log('  Upstream URL:', upstreamUrl);

    const upstreamRes = await fetch(upstreamUrl, {
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

    // If upstream returns unauthorized/forbidden, forward as 403
    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // If upstream returns 404, forward as 404
    if (upstreamRes.status === 404) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    // Forward any other non-success status
    if (!upstreamRes.ok) {
      return NextResponse.json(
        payload || { success: false, error: 'Failed to fetch report' },
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
