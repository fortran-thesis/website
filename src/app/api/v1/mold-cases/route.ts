import { createProxyHandler } from '@/lib/proxy';

export const POST = createProxyHandler({
  upstream: '/mold-case',
});
