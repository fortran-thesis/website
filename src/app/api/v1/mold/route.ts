import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: endpoints.mold.list,
  forwardParams: ['limit', 'pageToken'],
});
