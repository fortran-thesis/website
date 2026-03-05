import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

/**
 * PATCH /api/v1/moldipedia/[id]/archive – archive article (auth required)
 */
export const PATCH = createProxyHandler({
  upstream: (params) => endpoints.moldipedia.archive(params.id),
  // archive requests are simple JSON bodies; keep default behaviour
  formData: false,
});
