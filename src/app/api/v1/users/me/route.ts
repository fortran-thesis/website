import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/user/profile',
  forwardCookies: true,
});
