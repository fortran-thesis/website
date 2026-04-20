import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

const proxy = createProxyHandler({
  upstream: (params) => endpoints.moldCase.endCultureSessionEarly(params.id, params.cultureId),
});

export const PATCH = proxy;
export const POST = proxy;