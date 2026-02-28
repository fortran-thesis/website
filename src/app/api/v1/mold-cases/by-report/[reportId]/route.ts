import { createProxyHandler } from '@/lib/proxy';

export const GET = createProxyHandler({
  upstream: (params) => `/mold-case/by-report/${params.reportId}`,
});
