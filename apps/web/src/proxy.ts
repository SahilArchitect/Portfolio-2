import { NextResponse, type NextRequest } from 'next/server';

import { resolveLegacyPath } from '@/lib/legacy-routes';
import { adminCsp } from '@/lib/security-headers';

const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

function gone() {
  return new NextResponse(
    '<!doctype html><meta charset="utf-8"><title>410 Gone</title><p>This page has been removed. <a href="/">Home</a></p>',
    {
      status: 410,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    },
  );
}

/** Mutations must come from our own origin (defence in depth on top of server-action checks). */
function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacy = resolveLegacyPath(pathname);
  if (legacy?.kind === 'gone') return gone();
  if (legacy?.kind === 'redirect') {
    return NextResponse.redirect(new URL(legacy.to, request.url), 308);
  }

  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/admin/');
  if (!isAdmin && !isAdminApi) return NextResponse.next();

  if (request.method !== 'GET' && request.method !== 'HEAD' && !sameOrigin(request)) {
    return new NextResponse('Cross-origin request rejected', { status: 403 });
  }

  // Cheap gate only: pages and actions verify the session against the database.
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasSession && pathname !== '/admin/login') {
    if (isAdminApi) return new NextResponse('Unauthorized', { status: 401 });
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = adminCsp(nonce);
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/work',
    '/work/:path*',
    '/writing',
    '/writing/:path*',
    '/hire',
    '/hire/:path*',
    '/now',
    '/traces',
    '/traces/:path*',
    '/resume/:path*',
  ],
};
