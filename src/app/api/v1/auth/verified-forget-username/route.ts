import { createProxyHandler } from '@/lib/proxy';

export const POST = createProxyHandler({
  upstream: '/auth/forgot-username/verify',
  auth: false,
});
