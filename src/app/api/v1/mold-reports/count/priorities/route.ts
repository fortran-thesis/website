import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

// Proxy for /api/v1/mold-reports/count/priorities
export async function GET(req: NextRequest) {
  try {
    const upstreamUrl = new URL(`${envOptions.apiUrl}/mold-report/counts/priorities`);
    const sessionCookie = req.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

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

    console.log('📊 Priority breakdown proxy response status:', upstreamRes.status);
    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (err) {
    console.error('GET /api/v1/mold-reports/count/priorities proxy error', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
