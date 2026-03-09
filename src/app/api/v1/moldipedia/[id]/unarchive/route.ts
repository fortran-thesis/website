import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

/**
 * PATCH /api/v1/moldipedia/[id]/unarchive – restore archived article (auth required)
 */
export const PATCH = createProxyHandler({
  upstream: (params) => endpoints.moldipedia.restore(params.id),
});
