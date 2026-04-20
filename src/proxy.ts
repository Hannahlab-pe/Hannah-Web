import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('hw_token')?.value;
  const { pathname } = request.nextUrl;

  // Proteger todo lo que esté bajo /dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
