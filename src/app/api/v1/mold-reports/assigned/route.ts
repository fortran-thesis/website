import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/mold-report/assigned',
  forwardSearchParams: true,
});
