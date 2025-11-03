import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    const body = await req.json();

    const upstreamUrl = `${envOptions.apiUrl}/mold-case`;

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${sessionCookie}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await upstreamRes.text();
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { data: text };
    }

    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (error: any) {
    console.error('POST /mold-cases proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create mold case' },
      { status: 500 }
    );
  }
}
