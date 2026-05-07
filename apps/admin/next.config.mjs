/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@engine-room/ui', '@engine-room/types'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
