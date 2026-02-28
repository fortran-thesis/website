import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/**
 * GET /api/v1/flag-reports
 */
export async function GET(req: NextRequest) {
     console.log('[flag-reports route] HIT');
  console.log('[flag-reports route] upstreamUrl:', `${envOptions.apiUrl}/flag-reports`);
  try {
    const url = new URL(req.nextUrl.toString());
    const limit = url.searchParams.get('limit') || '20';
    const pageToken = url.searchParams.get('pageToken') || undefined;

    const upstreamUrl = new URL(`${envOptions.apiUrl}/flag-report`);
    upstreamUrl.searchParams.set('limit', limit);
    if (pageToken) upstreamUrl.searchParams.set('pageToken', pageToken);

    const sessionCookie = req.cookies.get('session')?.value;

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(sessionCookie ? { Cookie: `session=${sessionCookie}` } : {}),
      },
      cache: 'no-store',
    });

    const text = await upstreamRes.text();
    console.log('[flag-reports route] upstream status:', upstreamRes.status);
console.log('[flag-reports route] upstream response:', text.substring(0, 500));
    let payload: any = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { data: text }; }

    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch flag reports' },
      { status: 500 }
    );
  }
}