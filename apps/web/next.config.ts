import type { NextConfig } from 'next';

import { baseHeaders, siteCsp } from './src/lib/security-headers';

const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  experimental: {
    // Uploads go through server actions; Vercel caps request bodies at 4.5 MB.
    serverActions: { bodySizeLimit: '4.5mb' },
    // Most visitors arrive once (e.g. from an application); styles ship with the HTML.
    inlineCss: true,
  },
  async redirects() {
    return [
      { source: '/tracker', destination: '/tracker/index.html', permanent: false },
      { source: '/trident', destination: '/trident/index.html', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [...baseHeaders, { key: 'Content-Security-Policy', value: siteCsp() }],
      },
      // Unlinked side projects: reachable by direct URL, never indexed.
      { source: '/trident/:path*', headers: noindex },
      { source: '/tracker/:path*', headers: noindex },
      { source: '/harsimran', headers: noindex },
      { source: '/trident-coach', headers: noindex },
      { source: '/admin/:path*', headers: noindex },
      { source: '/preview/:path*', headers: noindex },
      {
        source: '/trident/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
