import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  // Proxy the old /api/v1/reports to the flag-report upstream
  upstream: endpoints.flagReports.list,
  forwardParams: ['limit', 'pageToken'],
  forwardCookies: true,
});
