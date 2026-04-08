import { createProxyHandler } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

/** GET /api/v1/moldipedia/[id]/cases – linked case evidence (public) */
export const GET = createProxyHandler({
  upstream: (params) => endpoints.moldipedia.casesById(params.id),
  auth: false,
  forwardParams: ['includeEvidence'],
});
