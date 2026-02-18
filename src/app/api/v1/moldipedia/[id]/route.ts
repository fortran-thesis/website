import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

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
