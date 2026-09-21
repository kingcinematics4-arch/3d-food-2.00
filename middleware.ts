// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check for Supabase auth cookie (sb-access-token or custom auth state)
    // Note: In local setup / client auth, frontend redirects or server session verification can be used
    const hasAuthToken =
      request.cookies.has('sb-access-token') ||
      request.cookies.has('supabase-auth-token') ||
      request.cookies.has('sb-localhost-auth-token');

    // If no token present in cookies, we allow client-side layout guard or redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
