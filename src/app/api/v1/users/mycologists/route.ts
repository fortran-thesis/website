import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }
    
    const upstreamUrl = `${envOptions.apiUrl}/user/mycologists`;
    
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

    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (error: any) {
    console.error('Mycologists proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch mycologists' },
      { status: 500 }
    );
  }
}
