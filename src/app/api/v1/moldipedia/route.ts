import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

/** GET /api/v1/moldipedia – public listing */
export const GET = createProxyHandler({
  upstream: endpoints.moldipedia.list,
  auth: false,
  forwardParams: ['search', 'limit', 'pageToken'],
});

/** POST /api/v1/moldipedia – create article (FormData, auth required) */
export const POST = createProxyHandler({
  upstream: endpoints.moldipedia.create,
  formData: true,
});