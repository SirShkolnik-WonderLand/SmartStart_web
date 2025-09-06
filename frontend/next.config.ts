import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for monorepo
  outputFileTracingRoot: '../',
  // Disable experimental features that cause issues
  experimental: {
    // Remove deprecated turbo config
  },
  // Enable compression
  compress: true,
};

export default nextConfig;
