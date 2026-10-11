/**
 * Security headers. Public pages are prerendered, so they cannot carry a
 * per-request nonce; their CSP allows Next's inline bootstrap scripts but
 * nothing from other origins. /admin is always dynamic and gets a nonce-based
 * policy from the proxy instead (see adminCsp).
 */
const BLOB_ORIGIN = 'https://*.public.blob.vercel-storage.com';
const ANALYTICS = process.env.NEXT_PUBLIC_ANALYTICS === 'true';
const DEV = process.env.NODE_ENV !== 'production';

function join(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(' '))
    .join('; ');
}

export function publicCsp(): string {
  return join({
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(DEV ? ["'unsafe-eval'"] : []), ...(ANALYTICS ? ['https://va.vercel-scripts.com'] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', BLOB_ORIGIN],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", ...(ANALYTICS ? ['https://va.vercel-scripts.com'] : [])],
    'frame-src': ["'self'", BLOB_ORIGIN],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    ...(DEV ? {} : { 'upgrade-insecure-requests': [] }),
  });
}

export function adminCsp(nonce: string): string {
  return join({
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`, ...(DEV ? ["'unsafe-eval'"] : [])],
    // KaTeX and Shiki emit inline style attributes in the preview.
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', BLOB_ORIGIN, 'https://avatars.githubusercontent.com'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'"],
    'frame-src': ["'self'", BLOB_ORIGIN],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", 'https://github.com'],
    'frame-ancestors': ["'none'"],
  });
}

export const baseHeaders: { key: string; value: string }[] = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];
