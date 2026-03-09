import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  // Proxy single report fetch to flag-report/{id}
  upstream: (params) => endpoints.flagReports.getById(params.id),
});

