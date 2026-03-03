import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const DELETE = createProxyHandler({
  upstream: (params) => endpoints.notification.removeDeviceToken(params.id),
  method: 'DELETE',
});
