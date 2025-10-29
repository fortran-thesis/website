import { NextResponse } from 'next/server';

// Debug route to echo incoming Cookie header and other basic info.
// Use this to verify what cookies the browser sends to the Next.js server.
export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const origin = req.headers.get('origin') || req.headers.get('referer') || null;

    return NextResponse.json({
      cookieHeader,
      origin,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('debug cookies error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
