import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/mold-report/unassigned',
  forwardParams: ['limit', 'pageToken'],
});
