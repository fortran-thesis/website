import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: (params) => endpoints.notification.getById(params.id),
});

export const DELETE = createProxyHandler({
  upstream: (params) => endpoints.notification.delete(params.id),
  method: 'DELETE',
});
