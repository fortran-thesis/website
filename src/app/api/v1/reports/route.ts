import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/report',
  forwardParams: ['limit', 'pageToken'],
  forwardCookies: true,
});
