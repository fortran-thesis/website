import { NextResponse } from 'next/server';

// Clears the authToken cookie for logout
export async function POST() {
  const authCookie = `authToken=; Path=/; Max-Age=0; SameSite=Lax`;

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Set-Cookie': authCookie,
    },
  });
}
