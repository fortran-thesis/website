import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: (params) => endpoints.user.getById(params.id),
  forwardCookies: true,
});

export const PATCH = createProxyHandler({
  upstream: (params) => endpoints.user.getById(params.id),
  forwardCookies: true,
});

export const DELETE = createProxyHandler({
  upstream: (params) => endpoints.user.delete(params.id),
  forwardCookies: true,
});
