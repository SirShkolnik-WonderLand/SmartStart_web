/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  images: {
    domains: ['localhost'],
  },
  // Disable static generation completely
  output: 'standalone',
  // Force all pages to be dynamic
  experimental: {
    // Disable static optimization
    workerThreads: false,
    cpus: 1
  }
}

module.exports = nextConfig
