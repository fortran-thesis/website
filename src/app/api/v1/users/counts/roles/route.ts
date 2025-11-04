import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

// Proxy for /api/v1/users/counts/roles
export async function GET(req: NextRequest) {
  try {
    const upstreamUrl = new URL(`${envOptions.apiUrl}/user/counts/roles`);
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
      cache: 'no-store',
    });
    const text = await upstreamRes.text();
    let payload: any = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { data: text }; }
    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (err) {
    console.error('GET /api/v1/users/counts/roles proxy error', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
