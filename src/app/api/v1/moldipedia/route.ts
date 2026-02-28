import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/**
 * GET /api/v1/moldipedia
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.nextUrl.toString());
    const searchQuery = url.searchParams.get('search') || undefined;
    const limit = url.searchParams.get('limit') || '10';
    const pageToken = url.searchParams.get('pageToken') || undefined;

    const upstreamUrl = new URL(`${envOptions.apiUrl}/moldipedia`);
    if (searchQuery) upstreamUrl.searchParams.set('search', searchQuery);
    if (limit) upstreamUrl.searchParams.set('limit', limit);
    if (pageToken) upstreamUrl.searchParams.set('pageToken', pageToken);

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const text = await upstreamRes.text();
    let payload: any = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { data: text }; }

    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch moldipedia articles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/moldipedia
 */
export async function POST(req: NextRequest) {
  try {
    const upstreamUrl = `${envOptions.apiUrl}/moldipedia`;
    const sessionCookie = req.cookies.get('session')?.value;

    console.log('📤 POST /api/v1/moldipedia proxy');
    console.log('  Upstream URL:', upstreamUrl);
    console.log('  Session cookie:', sessionCookie ? 'FOUND' : 'MISSING');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    // Parse incoming form data
    const incomingForm = await req.formData();
    const detailsRaw = incomingForm.get('details');
    const coverPhoto = incomingForm.get('cover_photo');

    console.log('📋 details field:', detailsRaw);
    console.log('📋 cover_photo field:', coverPhoto ? 'FOUND' : 'MISSING');

    // Rebuild form data fresh
    const outgoingForm = new FormData();
    outgoingForm.append('details', detailsRaw as string);
    if (coverPhoto) {
      outgoingForm.append('cover_photo', coverPhoto as Blob);
    }

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        Cookie: `session=${sessionCookie}`,
      },
      body: outgoingForm,
    });

    console.log('📍 Upstream status:', upstreamRes.status);
    const text = await upstreamRes.text();
    console.log('📥 Upstream response:', text.substring(0, 300));

    let payload: any = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { data: text }; }

    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (error: any) {
    console.error('POST /api/v1/moldipedia proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create moldipedia article' },
      { status: 500 }
    );
  }
}