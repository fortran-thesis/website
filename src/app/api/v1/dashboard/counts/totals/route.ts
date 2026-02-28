import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: '/dashboard/counts/totals',
});
