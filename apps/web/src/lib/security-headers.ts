/**
 * Security headers. Cache Components prerenders a static shell for every
 * route (admin included), and static shells cannot carry a per-request
 * nonce, so script-src allows Next's inline bootstrap scripts — but nothing
 * from other origins. Markdown never passes raw HTML and is sanitized, which
 * is the primary XSS defence.
 */
const BLOB_ORIGIN = 'https://*.public.blob.vercel-storage.com';
const DEV = process.env.NODE_ENV !== 'production';

function join(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(' '))
    .join('; ');
}

export function siteCsp(): string {
  return join({
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(DEV ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', BLOB_ORIGIN, 'https://avatars.githubusercontent.com'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'"],
    'frame-src': ["'self'", BLOB_ORIGIN],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    // GitHub is the OAuth sign-in target.
    'form-action': ["'self'", 'https://github.com'],
    'frame-ancestors': ["'none'"],
    ...(DEV ? {} : { 'upgrade-insecure-requests': [] }),
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
