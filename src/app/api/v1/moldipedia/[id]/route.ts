import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/**
 * GET /api/v1/moldipedia/[id]
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const upstreamUrl = `${envOptions.apiUrl}/moldipedia/${id}`;

    const upstreamRes = await fetch(upstreamUrl, {
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
      { success: false, error: error?.message || 'Failed to fetch moldipedia article' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/moldipedia/[id]
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const upstreamUrl = `${envOptions.apiUrl}/moldipedia/${id}`;
    const sessionCookie = req.cookies.get('session')?.value;

    console.log('📤 PATCH /api/v1/moldipedia/[id] proxy');
    console.log('  Upstream URL:', upstreamUrl);
    console.log('  Session cookie:', sessionCookie ? 'FOUND' : 'MISSING');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    // Parse incoming FormData
    const incomingForm = await req.formData();
    const detailsRaw = incomingForm.get('details');
    const coverPhoto = incomingForm.get('cover_photo');

    console.log('📋 details field:', detailsRaw);
    console.log('📋 cover_photo field:', coverPhoto ? 'FOUND' : 'MISSING');

    // Rebuild FormData to forward upstream — identical to POST route
    const outgoingForm = new FormData();
    outgoingForm.append('details', detailsRaw as string);
    if (coverPhoto) {
      outgoingForm.append('cover_photo', coverPhoto as Blob);
    }

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
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
    console.error('PATCH /api/v1/moldipedia/[id] proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update moldipedia article' },
      { status: 500 }
    );
  }
}