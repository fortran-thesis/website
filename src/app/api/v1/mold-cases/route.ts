import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: endpoints.moldCase.list,
  forwardSearchParams: true,
});

export const POST = createProxyHandler({
  upstream: endpoints.moldCase.create,
});
