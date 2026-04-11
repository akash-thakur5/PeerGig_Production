import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = [
  '/tutor',
  '/student',
  '/dashboard',
  '/wallet',
  '/messages',
  '/profile',
  '/book-session',
  '/connect',
  '/notes',
  '/skillswap',
  '/history',
  '/search',
];

const PUBLIC_PREFIXES = ['/api/auth', '/_next', '/favicon'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow the root landing page and login page
  if (pathname === '/' || pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Check if this is a protected path
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  if (isProtected) {
    const session = req.cookies.get('peergig_session');
    if (!session?.value) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
