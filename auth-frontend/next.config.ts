import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopackFileSystemCacheForDev: false, // Disable this for full filesystem cache
    turbopackFileSystemCacheForBuild: false, // Disable this for full filesystem cache
  },
  allowedDevOrigins: ['192.168.29.139'],
}

export default nextConfig;
