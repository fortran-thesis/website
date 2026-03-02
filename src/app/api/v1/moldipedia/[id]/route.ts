import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

/** GET /api/v1/moldipedia/[id] – public detail */
export const GET = createProxyHandler({
  upstream: (params) => endpoints.moldipedia.getById(params.id),
  auth: false,
});

/** PATCH /api/v1/moldipedia/[id] – update article (FormData, auth required) */
export const PATCH = createProxyHandler({
  upstream: (params) => endpoints.moldipedia.update(params.id),
  formData: true,
});