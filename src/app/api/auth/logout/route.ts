import { NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';

/**
 * Logout proxy route
 * Calls upstream logout if available and clears the same-origin session cookie.
 */
export async function POST() {
  try {
    // try to call upstream logout so backend can clear its cookie if it exists
    try {
      const upstream = `${envOptions.apiUrl}${endpoints.auth.logout}`;
      await fetch(upstream, { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore upstream errors; we still clear our cookie
      console.warn('Upstream logout call failed', e);
    }

    const cookie = `session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    return new NextResponse(null, { status: 204, headers: { 'Set-Cookie': cookie } });
  } catch (err) {
    console.error('Logout proxy error', err);
    return new NextResponse(null, { status: 500 });
  }
}
