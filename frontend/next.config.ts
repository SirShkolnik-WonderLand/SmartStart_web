import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for production builds to avoid CSS processing issues
  experimental: {
    turbo: {
      // Only use Turbopack in development
      rules: {}
    }
  },
  // Ensure stable builds
  swcMinify: true,
  // Optimize for production
  compress: true,
  // Handle CSS properly
  cssModules: false,
};

export default nextConfig;
