import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/**
 * POST /api/v1/auth/verified-forget-username
 * Send username to email after verification (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiUrl = envOptions.apiUrl;
    const backendUrl = `${apiUrl}/auth/forgot-username/verify`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.error('Error retrieving username:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
