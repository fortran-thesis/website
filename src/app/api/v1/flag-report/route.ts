import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/flag-report',
  auth: false,
  forwardParams: ['limit', 'pageToken'],
});
