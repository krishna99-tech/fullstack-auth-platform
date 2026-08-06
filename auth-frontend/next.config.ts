import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopackFileSystemCacheForDev: false, // Disable this for full filesystem cache
    turbopackFileSystemCacheForBuild: false, // Disable this for full filesystem cache
  },
  allowedDevOrigins: ['192.168.29.139'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all external image hostnames
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig;
