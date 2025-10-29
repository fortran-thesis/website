import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Root-level Next.js Middleware for Route Protection
 *
 * This duplicates `src/middleware.ts` to ensure Next picks up the middleware
 * regardless of project layout. It mirrors the logic used in `src/middleware.ts`.
 */

const publicRoutes = [
  '/auth/log-in',
  '/auth/sign-up',
  '/auth/sign-up-2',
  '/auth/account-recovery',
  '/auth/account-recovery-2',
  '/auth/account-recovery-3',
];

const authRoutePrefix = '/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prefer the same-origin session cookie (set by our proxy). Fallback to authToken.
  const sessionCookie = request.cookies.get('session')?.value;
  const authenticated = !!(sessionCookie);

  // Debug logging (server-side) — useful in dev
  try {
    // eslint-disable-next-line no-console
    console.log('🔍 Middleware check:', { pathname, session: sessionCookie ? 'present' : 'missing', authenticated });
  } catch (e) {
    // ignore
  }

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = pathname.startsWith(authRoutePrefix);

  // Helper to add debug headers in non-production
  const withDebug = (res: Response, action: string) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        // @ts-ignore-next-line - NextResponse.headers exists
        res.headers.set('x-mw-auth', authenticated ? 'present' : 'missing');
        // @ts-ignore-next-line
        res.headers.set('x-mw-token-length', sessionCookie ? String(sessionCookie.length) : authToken ? String(authToken.length) : '0');
        // @ts-ignore-next-line
        res.headers.set('x-mw-path', pathname);
        // @ts-ignore-next-line
        res.headers.set('x-mw-action', action);
      }
    } catch (e) {
      // ignore header setting errors
    }
    return res;
  };

  // If authenticated user tries to access auth pages -> send to dashboard
  if (authenticated && isAuthRoute) {
    const dashboardUrl = new URL('/dashboard', request.url);
    const res = NextResponse.redirect(dashboardUrl);
    return withDebug(res, 'redirect-to-dashboard');
  }

  // If not authenticated and accessing protected pages -> send to login
  if (!authenticated && !isPublicRoute && pathname !== '/') {
    const loginUrl = new URL('/auth/log-in', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(loginUrl);
    return withDebug(res, 'redirect-to-login');
  }

  // If not authenticated and on root -> send to login
  if (!authenticated && pathname === '/') {
    const loginUrl = new URL('/auth/log-in', request.url);
    const res = NextResponse.redirect(loginUrl);
    return withDebug(res, 'redirect-root-to-login');
  }

  // If authenticated and on root -> dashboard
  if (authenticated && pathname === '/') {
    const dashboardUrl = new URL('/dashboard', request.url);
    const res = NextResponse.redirect(dashboardUrl);
    return withDebug(res, 'root-redirect-to-dashboard');
  }

  const res = NextResponse.next();
  return withDebug(res, 'next');
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
