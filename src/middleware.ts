import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/investigation', '/user', '/support', '/api/v1'];
const publicRoutes = ['/auth/log-in', '/auth/sign-up', '/auth', '/auth/account-recovery'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ALWAYS log - this should appear for EVERY request
  console.log('\n============================================');
  console.log('🔥 MIDDLEWARE EXECUTING FOR:', pathname);
  console.log('============================================\n');
  
  const normalizedPath = pathname.replace(/\/$/, '').toLowerCase();
  
  const isPublic = publicRoutes.some(route => normalizedPath.startsWith(route));
  const isProtected = protectedRoutes.some(route => normalizedPath.startsWith(route));
  const authToken = request.cookies.get('session')?.value;

  console.log('Auth Status:', {
    isProtected,
    isPublic,
    hasAuth: !!authToken,
  });

  // Redirect unauthenticated users away from protected routes
  if (!authToken && isProtected) {
    console.log('❌ BLOCKING - Redirecting to login');
    const loginUrl = new URL('/auth/log-in', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public routes
  if (authToken && isPublic) {
    console.log('✅ REDIRECTING - To dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('✅ ALLOWING request to pass through\n');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/investigation/:path*',
    '/user/:path*',
    '/support/:path*',
    '/auth/:path*',
    '/api/v1/:path*'
  ],
};