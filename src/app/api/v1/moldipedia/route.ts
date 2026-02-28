import { createProxyHandler } from '@/lib/proxy';

/** GET /api/v1/moldipedia – public listing */
export const GET = createProxyHandler({
  upstream: '/moldipedia',
  auth: false,
  forwardParams: ['search', 'limit', 'pageToken'],
});

/** POST /api/v1/moldipedia – create article (FormData, auth required) */
export const POST = createProxyHandler({
  upstream: '/moldipedia',
  formData: true,
});