import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

// Proxy for GET /api/v1/mold-report/unassigned
export async function GET(req: NextRequest) {
  try {
    const upstreamUrl = new URL(`${envOptions.apiUrl}/mold-report/unassigned`);
    
    // Forward pagination parameters
    const limit = req.nextUrl.searchParams.get('limit');
    const pageToken = req.nextUrl.searchParams.get('pageToken');
    
    if (limit) {
      upstreamUrl.searchParams.set('limit', limit);
    }
    if (pageToken) {
      upstreamUrl.searchParams.set('pageToken', pageToken);
    }
    
    const sessionCookie = req.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    console.log('📋 Fetching unassigned mold reports from:', upstreamUrl.toString());
    
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${sessionCookie}`,
      },
      cache: 'default',
    });

    const text = await upstreamRes.text();
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { data: text };
    }

    console.log('📋 Unassigned mold reports proxy response status:', upstreamRes.status);
    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (err) {
    console.error('GET /api/v1/mold-reports/unassigned proxy error', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
