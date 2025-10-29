import { NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';

/**
 * Proxy login route
 * Forwards credentials to the upstream auth endpoint (Firebase function or API)
 * and sets a same-origin HttpOnly `session` cookie when possible so middleware
 * running on this origin can read it.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const upstream = `${envOptions.apiUrl}${endpoints.auth.login}`;

    const fbRes = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // do not include credentials to upstream unless upstream expects them
    });

    const text = await fbRes.text();
    let fbJson: any = {};
    try { fbJson = text ? JSON.parse(text) : {}; } catch { fbJson = { message: text }; }

    const res = NextResponse.json(fbJson, { status: fbRes.status });

    // If upstream returned Set-Cookie header, try to mirror it on our origin
    const upstreamSetCookie = fbRes.headers.get('set-cookie') || fbRes.headers.get('Set-Cookie');
    if (upstreamSetCookie) {
      // Strip any Domain= attributes so cookie is set for our origin
      // and forward the rest of the attributes (Secure, HttpOnly, SameSite, Max-Age)
      const parts = upstreamSetCookie.split(';').map(p => p.trim()).filter(Boolean);
      const nameValue = parts[0];
      const attrs = parts.slice(1).filter(p => !p.toLowerCase().startsWith('domain='));
      const cookieHeader = `${nameValue}; ${attrs.join('; ')}`;
      res.headers.set('Set-Cookie', cookieHeader);
      return res;
    }

    // Otherwise, if upstream returned a token/session in body, set same-origin cookie
    const token = fbJson?.token || fbJson?.session || fbJson?.sessionId || fbJson?.data?.token;
    if (token) {
      const maxAge = 60 * 60 * 24 * 5; // 7 days
      const cookie = `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
      res.headers.set('Set-Cookie', cookie);
      return res;
    }

    return res;
  } catch (err) {
    console.error('Login proxy error', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
