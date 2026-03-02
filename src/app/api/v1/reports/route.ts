import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: endpoints.report.list,
  forwardParams: ['limit', 'pageToken'],
  forwardCookies: true,
});
