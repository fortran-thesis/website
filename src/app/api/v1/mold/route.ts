import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.nextUrl.toString());
    const limit = url.searchParams.get('limit') || '10';
    const pageToken = url.searchParams.get('pageToken');

    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const backendUrl = new URL(`${envOptions.apiUrl}/mold`);
    backendUrl.searchParams.set('limit', limit);
    if (pageToken) backendUrl.searchParams.set('pageToken', pageToken);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Cookie': `session=${sessionCookie}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const body = await response.json();
    return NextResponse.json(body, { status: 200 });
  } catch (error: any) {
    console.error('Mold proxy error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
