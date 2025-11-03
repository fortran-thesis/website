import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get session cookie from the request
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apiUrl = envOptions.apiUrl;
    const backendUrl = `${apiUrl}/mycologist/register`;

    console.log('Creating mycologist at:', backendUrl);
    console.log('Request body:', body);

    // Forward the request to the backend with the session cookie
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${sessionCookie}`,
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log('Backend response status:', response.status);
    console.log('Backend response text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      console.error('Response was:', responseText.substring(0, 200));
      data = { error: 'Invalid response format from backend' };
    }

    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating mycologist:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
