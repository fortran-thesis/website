import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';

/**
 * POST /api/v1/auth/change-password
 * Authenticated change password proxy
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    const upstream = `${envOptions.apiUrl}${endpoints.auth.changePassword}`;

    const upstreamRes = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session=${sessionCookie}`,
      },
      body: JSON.stringify(body),
    });

    const text = await upstreamRes.text();
    let payload: any = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { data: text }; }

    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (err) {
    console.error('POST /api/v1/auth/change-password proxy error', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
