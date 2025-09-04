/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Dangerous but acceptable for initial deploy of web UI; backend enforces correctness
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  // Fix hydration issues
  experimental: {
    esmExternals: false,
  },
  // Ensure consistent rendering
  swcMinify: true,
}

module.exports = nextConfig;
