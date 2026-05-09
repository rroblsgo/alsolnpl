import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typedRoutes: true,
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    // unoptimized: process.env.NODE_ENV === 'development',
    // unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jdzc3jyqjv.ufs.sh',
      },
      // Wildcard para cubrir cualquier app futura de UploadThing
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
      },
    ],
  },
};

export default nextConfig;
