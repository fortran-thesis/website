import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

export const GET = createProxyHandler({
  upstream: endpoints.faq.list,
  auth: false,
  forwardParams: ['search', 'limit', 'pageToken'],
});
