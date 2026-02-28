import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/faq',
  auth: false,
  forwardParams: ['search', 'limit', 'pageToken'],
});
