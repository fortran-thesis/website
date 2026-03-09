import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: endpoints.flagReports.list,
  forwardParams: ['limit', 'pageToken'],
});
