import { createProxyHandler } from '@/lib/proxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET  /api/v1/user/profile – fetch authenticated user's profile */
export const GET = createProxyHandler({
  upstream: '/user/profile',
  forwardCookies: true,
});

/** PATCH /api/v1/user/profile – update profile (multipart/form-data) */
export const PATCH = createProxyHandler({
  upstream: '/user/profile',
  formData: true,
  forwardCookies: true,
});
