import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

// Proxy for /api/v1/mold-reports/count/monthly
export async function GET(req: NextRequest) {
  try {
    const upstreamUrl = new URL(`${envOptions.apiUrl}/mold-report/counts/monthly`);
    
    // Forward year parameter if provided
    const year = req.nextUrl.searchParams.get('year');
    if (year) {
      upstreamUrl.searchParams.set('year', year);
    }
    
    const sessionCookie = req.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    console.log('📊 Fetching monthly totals from:', upstreamUrl.toString());
    
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

    console.log('📊 Monthly totals proxy response status:', upstreamRes.status);
    console.log('📊 Monthly totals raw response:', text);
    console.log('📊 Monthly totals parsed payload:', payload);
    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (err) {
    console.error('GET /api/v1/mold-reports/count/monthly proxy error', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
