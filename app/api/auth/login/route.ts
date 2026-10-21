import { NextRequest, NextResponse } from 'next/server';
import {
  signInWithFirebaseAuth,
  signAdminToken,
  ADMIN_COOKIE_NAME,
  FB_TOKEN_COOKIE_NAME
} from '@/lib/auth';
import { setRuntimeAuthToken } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Both Admin Email / ID and Password are required' },
        { status: 400 }
      );
    }

    const authResult = await signInWithFirebaseAuth(username.trim(), password.trim());

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const adminName = authResult.user.email || authResult.user.displayName || 'MasterAdmin';
    const token = await signAdminToken(adminName, authResult.user.uid);

    // Save ID token in runtime cache so RTDB queries pass security rules
    if (authResult.idToken) {
      setRuntimeAuthToken(authResult.idToken);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        username: adminName,
        email: authResult.user.email,
        uid: authResult.user.uid,
        role: 'admin'
      }
    });

    // 1. Set secure HttpOnly cookie for admin session (7 days)
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    // 2. Set Firebase Auth ID Token cookie for RTDB authentication
    if (authResult.idToken) {
      response.cookies.set({
        name: FB_TOKEN_COOKIE_NAME,
        value: authResult.idToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
