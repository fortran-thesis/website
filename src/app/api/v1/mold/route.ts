import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/mold',
  forwardParams: ['limit', 'pageToken'],
});
