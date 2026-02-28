import { createProxyHandler } from '@/lib/proxy';

export const PATCH = createProxyHandler({
  upstream: (params) => `/mold-report/${params.id}/assign`,
});
