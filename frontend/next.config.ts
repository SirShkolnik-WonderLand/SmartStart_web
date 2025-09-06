import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Output configuration for monorepo - use absolute path
  outputFileTracingRoot: path.join(__dirname, '..'),
  // Disable experimental features that cause issues
  experimental: {
    // Remove deprecated turbo config
  },
  // Enable compression
  compress: true,
};

export default nextConfig;
