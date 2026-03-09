import type { NextRequest } from 'next/server';
import { proxyFetch } from '@/lib/proxy';
import { endpoints } from '@/services/endpoints';

/**
 * POST /api/v1/auth/send-verification
 * Sends a verification code to the user's email.
 * Routes to /auth/forgot-password or /auth/forgot-username based on body.type.
 */
export async function POST(req: NextRequest) {
  // Read body to determine the backend endpoint and strip `type`
  const body = await req.clone().json();
  const endpoint =
    body.type === 'forgot-username' ? endpoints.auth.forgotUsername : endpoints.auth.forgotPassword;

  return proxyFetch(req, {
    upstream: endpoint,
    auth: false,
    body: JSON.stringify({ email: body.email }),
  });
}
