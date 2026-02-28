import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: (params) => `/faq/${params.id}`,
  auth: false,
});
