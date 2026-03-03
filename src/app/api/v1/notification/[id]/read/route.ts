import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const PATCH = createProxyHandler({
  upstream: (params) => endpoints.notification.markRead(params.id),
  method: 'PATCH',
});
