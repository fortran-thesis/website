import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/mold-report/counts/monthly',
  forwardParams: ['year'],
});
