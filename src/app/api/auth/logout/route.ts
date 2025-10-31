import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';

/**
 * Logout proxy route
 * Calls upstream logout if available and clears the same-origin session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    // Get session cookie from the request
    const sessionCookie = req.cookies.get('session')?.value;
    
    console.log('🔍 Logout - Session cookie:', sessionCookie ? 'present' : 'missing');

    // Call upstream logout with the session in the request body
    if (sessionCookie) {
      try {
        const upstream = `${envOptions.apiUrl}${endpoints.auth.logout}`;
        const response = await fetch(upstream, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Send session as Bearer token since backend expects it
            'Authorization': `Bearer ${sessionCookie}`
          },
          body: JSON.stringify({ session: sessionCookie })
        });
        
        console.log('✅ Backend logout response:', response.status);
      } catch (e) {
        // ignore upstream errors; we still clear our cookie
        console.warn('⚠️ Upstream logout call failed', e);
      }
    }

    // Clear the session cookie on this origin
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
    
    // Clear the cookie with the exact same attributes as when it was set
    // Must match Path, Domain, and other attributes exactly
    const clearCookie = `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    response.headers.set('Set-Cookie', clearCookie);
    
    console.log('🍪 Session cookie CLEARED with header:', clearCookie);
    console.log('🍪 Response Set-Cookie header:', response.headers.get('Set-Cookie'));
    
    return response;
  } catch (err) {
    console.error('❌ Logout proxy error', err);
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
  }
}
