import { createProxyHandler } from '@/lib/proxy';

export const POST = createProxyHandler({
  upstream: '/auth/verify-code',
  auth: false,
});
