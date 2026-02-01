import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';

/**
 * GET /api/v1/users/me
 * Fetch current authenticated user using session cookie.
 * Uses GET /user/profile endpoint which returns current user based on session.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Missing session' }, { status: 403 });
    }

    // Call backend's /user/profile endpoint which returns current user based on session cookie
    const upstreamUrl = `${envOptions.apiUrl}${endpoints.user.profile}`;
    
    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session=${sessionCookie}`,
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

    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const res = NextResponse.json(payload, { status: upstreamRes.status });

    // Forward Set-Cookie if upstream set one (strip Domain)
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
    console.error('GET /api/v1/users/me proxy error', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
