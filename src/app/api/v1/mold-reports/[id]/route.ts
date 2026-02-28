import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: (params) => `/mold-report/${params.id}`,
});
