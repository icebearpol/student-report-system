import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const PUBLIC_PATHS = ['/login', '/signup', '/anonymous', '/_next', '/favicon.ico', '/404', '/_error'];
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/404' || pathname === '/_error') return NextResponse.next();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();
  const token = request.cookies.get('campus_token')?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ['/((?!api|_next/static|_next/image).*)'] };
