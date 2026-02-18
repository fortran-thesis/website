import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/**
 * GET /api/v1/moldipedia
 * Get all moldipedia articles with optional search
 * No authentication required - public endpoint
 * 
 * Query parameters:
 * - search: string (optional) - search query for title/body
 * - limit: number (default: 10) - results per page
 * - pageToken: string (optional) - pagination token for next page
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.nextUrl.toString());

    // Extract query parameters
    const searchQuery = url.searchParams.get('search') || undefined;
    const limit = url.searchParams.get('limit') || '10';
    const pageToken = url.searchParams.get('pageToken') || undefined;

    // Build upstream URL with query params
    const upstreamUrl = new URL(`${envOptions.apiUrl}/moldipedia`);
    if (searchQuery) upstreamUrl.searchParams.set('search', searchQuery);
    if (limit) upstreamUrl.searchParams.set('limit', limit);
    if (pageToken) upstreamUrl.searchParams.set('pageToken', pageToken);

    console.log('📤 GET /api/v1/moldipedia proxy');
    console.log('  Query params:', { searchQuery, limit, pageToken: pageToken ? `${pageToken.substring(0, 20)}...` : 'NONE' });
    console.log('  Upstream URL:', upstreamUrl.toString());

    const upstreamRes = await fetch(upstreamUrl.toString(), {
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
    console.error('GET /api/v1/moldipedia proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch moldipedia articles' },
      { status: 500 }
    );
  }
}
