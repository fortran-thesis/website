import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';

// GET mold case by mold report ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    const { reportId } = await params;
    const upstreamUrl = `${envOptions.apiUrl}/mold-cases/by-report/${reportId}`;

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
    console.error('GET /mold-cases/by-report/:reportId proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch mold case' },
      { status: 500 }
    );
  }
}
