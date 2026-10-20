import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const admin = await verifyAdminToken(token);

    if (!admin) {
      // Immediate server-side redirect to /admin/login before sending any page HTML
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and visits /admin/login, redirect to /admin
  if (pathname === '/admin/login') {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const admin = await verifyAdminToken(token);
    if (admin) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
