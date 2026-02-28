import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: (params) => `/report/${params.id}`,
});

