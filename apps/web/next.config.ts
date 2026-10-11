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
      // The old admin subdomain now points at this project.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'admin.bysahil.dev' }],
        destination: 'https://www.bysahil.dev/admin',
        permanent: true,
      },
      // Short links to thesis PDFs uploaded through the admin (temporary, so the files can be replaced).
      {
        source: '/thesis-summary',
        destination:
          'https://pec5tppdvo6ecvw5.public.blob.vercel-storage.com/uploads/LUVAEvqSFSD5eFDm.pdf',
        permanent: false,
      },
      {
        source: '/thesis',
        destination:
          'https://pec5tppdvo6ecvw5.public.blob.vercel-storage.com/uploads/8x0qIEyFxDLnJSIl.pdf',
        permanent: false,
      },
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
