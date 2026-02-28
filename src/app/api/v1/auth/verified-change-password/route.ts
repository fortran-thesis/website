import { createProxyHandler } from '@/lib/proxy';

export const POST = createProxyHandler({
  upstream: '/auth/forgot-password/verify',
  auth: false,
});
