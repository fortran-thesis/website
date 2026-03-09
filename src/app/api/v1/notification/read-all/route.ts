import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const PATCH = createProxyHandler({
  upstream: endpoints.notification.markAllRead,
  method: 'PATCH',
});
