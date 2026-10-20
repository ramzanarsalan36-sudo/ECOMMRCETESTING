import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, signAdminToken, ADMIN_COOKIE_NAME, MASTER_ADMIN_UID } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Both Admin ID and Password are required' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(username.trim(), password.trim());

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid Admin ID or Password' },
        { status: 401 }
      );
    }

    const adminName = username.trim() === MASTER_ADMIN_UID ? 'MasterAdmin' : username.trim();
    const token = await signAdminToken(adminName);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: { username: adminName, role: 'admin' }
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
