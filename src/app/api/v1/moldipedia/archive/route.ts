import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

/**
 * GET /api/v1/moldipedia/archive – retrieve archived moldipedia articles (auth required)
 */
export const GET = createProxyHandler({
  upstream: endpoints.moldipedia.archived,
  forwardParams: ['limit', 'pageToken', 'search'],
});
