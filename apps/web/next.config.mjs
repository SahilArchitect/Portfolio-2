/** @type {import('next').NextConfig} */
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  '',
);

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@engine-room/ui', '@engine-room/types'],
  experimental: {
    typedRoutes: true,
  },
  async redirects() {
    return [{ source: '/trident', destination: '/trident/index.html', permanent: false }];
  },
  async headers() {
    return [
      {
        source: '/trident/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/trident/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
