import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const POST = createProxyHandler({
  upstream: endpoints.notification.deviceToken,
  method: 'POST',
});
