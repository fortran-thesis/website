import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: (params) => endpoints.moldCase.logs(params.id),
  forwardSearchParams: true,
});
