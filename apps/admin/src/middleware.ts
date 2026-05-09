import { auth } from '@/auth';

const OWNER_EMAIL = 'sahil@bysahil.dev';

function adminEmails() {
  const configured = [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return new Set([...configured, OWNER_EMAIL]);
}

export default auth((req) => {
  const isPublic =
    req.nextUrl.pathname.startsWith('/sign-in') ||
    req.nextUrl.pathname.startsWith('/api/auth') ||
    req.nextUrl.pathname === '/robots.txt';
  if (!req.auth && !isPublic) {
    const url = new URL('/sign-in', req.nextUrl.origin);
    url.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return Response.redirect(url);
  }

  const email = req.auth?.user?.email?.toLowerCase();
  if (email && !isPublic && !adminEmails().has(email)) {
    return Response.redirect(new URL('/sign-in/error', req.nextUrl.origin));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
