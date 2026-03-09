import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

/** GET /api/v1/mold/[id] — proxy to backend, requires session (curator) */
export const GET = createProxyHandler({
  upstream: (params) => endpoints.mold.getById(params.id),
  // auth: true // default
});

/** PATCH /api/v1/mold/[id] — update mold (curator, formData optional) */
export const PATCH = createProxyHandler({
  upstream: (params) => endpoints.mold.update(params.id),
  formData: false,
});
