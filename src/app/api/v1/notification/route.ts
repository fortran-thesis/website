import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: endpoints.notification.list,
  forwardParams: ['limit', 'pageToken', 'is_read', 'type'],
});
