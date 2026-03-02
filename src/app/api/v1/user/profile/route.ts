import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET  /api/v1/user/profile – fetch authenticated user's profile */
export const GET = createProxyHandler({
  upstream: endpoints.user.profile,
  forwardCookies: true,
});

/** PATCH /api/v1/user/profile – update profile (multipart/form-data) */
export const PATCH = createProxyHandler({
  upstream: endpoints.user.profile,
  formData: true,
  forwardCookies: true,
});
