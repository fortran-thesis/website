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
      credentials: 'include', // Important: allow cookies to be received
    });

    const text = await fbRes.text();
    let fbJson: any = {};
    try { fbJson = text ? JSON.parse(text) : {}; } catch { fbJson = { message: text }; }

    console.log('🔍 Backend response:', fbRes.status, fbJson);

    // Try to get Set-Cookie header from backend (for mobile compatibility)
    // Note: fetch() API may not expose this, so we have multiple strategies
    let backendCookie = null;
    
    // Strategy 1: Try standard headers.get
    backendCookie = fbRes.headers.get('set-cookie') || fbRes.headers.get('Set-Cookie');
    
    // Strategy 2: If available, use raw headers (Node.js specific)
    if (!backendCookie && typeof (fbRes.headers as any).raw === 'function') {
      const rawHeaders = (fbRes.headers as any).raw();
      backendCookie = rawHeaders['set-cookie']?.[0];
    }
    
    console.log('🍪 Backend Set-Cookie header:', backendCookie ? 'FOUND' : 'NOT FOUND');

    const res = NextResponse.json(fbJson, { status: fbRes.status });

    // If we got the cookie from backend, forward it but strip the domain
    if (backendCookie) {
      console.log('✅ Forwarding backend cookie (stripping domain for localhost)');
      // Parse and modify the cookie to work on localhost
      const parts = backendCookie.split(';').map((p: string) => p.trim()).filter(Boolean);
      const nameValue = parts[0]; // e.g., "session=abc123"
      
      // Filter out Domain attribute and keep everything else
      const attrs = parts.slice(1).filter((p: string) => !p.toLowerCase().startsWith('domain='));
      
      // Ensure it has the necessary attributes for localhost
      if (!attrs.some((a: string) => a.toLowerCase().startsWith('path='))) {
        attrs.push('Path=/');
      }
      if (!attrs.some((a: string) => a.toLowerCase().startsWith('samesite='))) {
        attrs.push('SameSite=Lax');
      }
      
      const finalCookie = `${nameValue}; ${attrs.join('; ')}`;
      console.log('🍪 Final cookie:', finalCookie.substring(0, 100) + '...');
      res.headers.set('Set-Cookie', finalCookie);
      return res;
    }

    // Fallback: Try to extract session from response body
    const sessionToken = fbJson?.session || fbJson?.token || fbJson?.sessionId || fbJson?.data?.session || fbJson?.data?.token;
    
    if (sessionToken) {
      console.log('✅ Found session in body, setting cookie manually');
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      const cookieString = `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
      res.headers.set('Set-Cookie', cookieString);
      return res;
    }

    console.error('❌ No session found in Set-Cookie header OR response body');
    console.error('   Backend must either:');
    console.error('   1. Set res.cookie("session", value, {...}), OR');
    console.error('   2. Return { session: "value" } in JSON');
    return res;
  } catch (err) {
    console.error('Login proxy error', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
