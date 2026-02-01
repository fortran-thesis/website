import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';

// Increase body size limit for file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/user/profile
 * Proxy to fetch current authenticated user's profile
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔵 GET /api/v1/user/profile called');
    const sessionCookie = req.cookies.get('session')?.value;
    console.log('🍪 Session cookie:', sessionCookie ? 'FOUND' : 'MISSING');
    
    if (!sessionCookie) {
      console.log('❌ No session, returning 403');
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    const upstreamUrl = `${envOptions.apiUrl}${endpoints.user.profile}`;
    console.log('🔗 Upstream URL:', upstreamUrl);

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session=${sessionCookie}`,
      },
      cache: 'no-store',
    });

    console.log('📍 Upstream status:', upstreamRes.status);
    const text = await upstreamRes.text();
    console.log('📥 Upstream response:', text.substring(0, 300));
    
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { data: text };
    }

    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      console.log('❌ Upstream auth error');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    console.log('✅ Returning payload');
    const res = NextResponse.json(payload, { status: upstreamRes.status });

    // Forward Set-Cookie if upstream set one
    const backendSetCookie = upstreamRes.headers.get('set-cookie') || upstreamRes.headers.get('Set-Cookie');
    if (backendSetCookie) {
      const parts = backendSetCookie.split(';').map(p => p.trim()).filter(Boolean);
      const nameValue = parts[0];
      const attrs = parts.slice(1).filter(p => !p.toLowerCase().startsWith('domain='));
      if (!attrs.some(a => a.toLowerCase().startsWith('path='))) attrs.push('Path=/');
      if (!attrs.some(a => a.toLowerCase().startsWith('samesite='))) attrs.push('SameSite=Lax');
      const final = `${nameValue}; ${attrs.join('; ')}`;
      res.headers.set('Set-Cookie', final);
    }

    return res;
  } catch (err) {
    console.error('❌ GET error:', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/user/profile
 * Proxy for updating authenticated user's profile with multipart/form-data
 */
export async function PATCH(req: NextRequest) {
  try {
    console.log('🔵 PATCH /api/v1/user/profile called');
    const sessionCookie = req.cookies.get('session')?.value;
    console.log('🍪 Session cookie:', sessionCookie ? 'FOUND' : 'MISSING');
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    const upstreamUrl = `${envOptions.apiUrl}${endpoints.user.updateProfile}`;
    console.log('🔗 Upstream URL:', upstreamUrl);

    const contentType = req.headers.get('content-type') || '';
    const contentLength = req.headers.get('content-length') || '';
    console.log('📋 Content-Type:', contentType);
    console.log('📏 Content-Length:', contentLength);

    // Forward the body as-is without parsing
    const body = req.body;

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength,
        Cookie: `session=${sessionCookie}`,
      },
      body: body,
      // @ts-ignore - duplex is needed for streaming bodies
      duplex: 'half',
    });

    console.log('📍 Upstream status:', upstreamRes.status);
    const text = await upstreamRes.text();
    console.log('📥 Upstream response:', text.substring(0, 500));
    
    let payload: any = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { data: text }; }

    // Forward Set-Cookie if upstream set one (strip Domain)
    const backendSetCookie = upstreamRes.headers.get('set-cookie') || upstreamRes.headers.get('Set-Cookie');
    const res = NextResponse.json(payload, { status: upstreamRes.status });

    if (backendSetCookie) {
      const parts = backendSetCookie.split(';').map(p => p.trim()).filter(Boolean);
      const nameValue = parts[0];
      const attrs = parts.slice(1).filter(p => !p.toLowerCase().startsWith('domain='));
      if (!attrs.some(a => a.toLowerCase().startsWith('path='))) attrs.push('Path=/');
      if (!attrs.some(a => a.toLowerCase().startsWith('samesite='))) attrs.push('SameSite=Lax');
      const final = `${nameValue}; ${attrs.join('; ')}`;
      res.headers.set('Set-Cookie', final);
    }

    return res;
  } catch (err) {
    console.error('❌ PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
