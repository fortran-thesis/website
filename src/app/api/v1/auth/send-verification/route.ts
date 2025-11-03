import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/**
 * POST /api/v1/auth/send-verification
 * Send verification code to email (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiUrl = envOptions.apiUrl;
    // Backend has two separate endpoints: /auth/forgot-password and /auth/forgot-username
    // Both use the same controller: sendVerificationCodeEmail
    // Default to forgot-password if not specified
    const endpoint = body.type === 'forgot-username' ? '/auth/forgot-username' : '/auth/forgot-password';
    const backendUrl = `${apiUrl}${endpoint}`;

    // Extract only the email field to send to backend (don't send 'type')
    const backendBody = { email: body.email };

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: 'Invalid response format from backend' };
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
