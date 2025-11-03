import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }
    
    // Forward query params if any (limit, pageToken, etc.)
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const upstreamUrl = `${envOptions.apiUrl}/mold-report/assigned${queryString ? `?${queryString}` : ''}`;
    
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
    console.error('Assigned mold-reports proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch assigned reports' },
      { status: 500 }
    );
  }
}
