import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: (params) => endpoints.moldReport.exportById(params.id),
});