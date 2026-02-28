import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/mold-report',
  forwardSearchParams: true,
  forwardCookies: true,
});
