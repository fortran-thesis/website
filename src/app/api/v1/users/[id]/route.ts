import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: (params) => `/user/${params.id}`,
  forwardCookies: true,
});
