import { createProxyHandler } from '@/lib/proxy';

/** GET /api/v1/moldipedia/[id] – public detail */
export const GET = createProxyHandler({
  upstream: (params) => `/moldipedia/${params.id}`,
  auth: false,
});

/** PATCH /api/v1/moldipedia/[id] – update article (FormData, auth required) */
export const PATCH = createProxyHandler({
  upstream: (params) => `/moldipedia/${params.id}`,
  formData: true,
});