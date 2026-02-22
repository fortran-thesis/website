import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/**
 * PATCH /api/v1/moldipedia/[id]
 * Update a moldipedia article by ID
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const upstreamUrl = `${envOptions.apiUrl}/moldipedia/${id}`;
    const body = await req.text();

    // Forward session cookie and Authorization header if present
    const sessionCookie = req.cookies.get('session')?.value;
    const authHeader = req.headers.get('authorization');

    console.log('📤 PATCH /api/v1/moldipedia/:id proxy', { id });
    console.log('  Upstream URL:', upstreamUrl);
    console.log('  Session cookie:', sessionCookie ? 'present' : 'MISSING');
    console.log('  Authorization header:', authHeader ? 'present' : 'MISSING');
    console.log('  PATCH request body:', body);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (sessionCookie) headers['Cookie'] = `session=${sessionCookie}`;
    if (authHeader) headers['Authorization'] = authHeader;

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'PATCH',
      headers,
      body,
      // credentials: 'include' // Uncomment if upstream API requires cookies
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
    console.error('PATCH /api/v1/moldipedia/:id proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update moldipedia article' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/moldipedia/[id]
 * Get a single moldipedia article by ID
 * No authentication required - public endpoint
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const upstreamUrl = `${envOptions.apiUrl}/moldipedia/${id}`;

    console.log('📤 GET /api/v1/moldipedia/:id proxy', { id });
    console.log('  Upstream URL:', upstreamUrl);

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    console.error('GET /api/v1/moldipedia/:id proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch moldipedia article' },
      { status: 500 }
    );
  }
}