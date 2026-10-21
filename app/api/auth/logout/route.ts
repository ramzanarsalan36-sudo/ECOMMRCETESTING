import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, FB_TOKEN_COOKIE_NAME } from '@/lib/auth';
import { setRuntimeAuthToken } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  setRuntimeAuthToken(null);

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  response.cookies.set({
    name: FB_TOKEN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
}
