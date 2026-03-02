import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: endpoints.flagReports,
  auth: false,
  forwardParams: ['limit', 'pageToken'],
});
