import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/onboarding'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Token is stored in localStorage (client-side Zustand persist).
  // For SSR protection we check a cookie that the client sets on login.
  const token = request.cookies.get('agent-access-token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*'],
};
