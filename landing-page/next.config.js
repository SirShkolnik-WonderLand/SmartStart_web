/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    buildCache: true,
    optimizeCss: true,
    swcMinify: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['smartstart-python-brain.onrender.com'],
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
  env: {
    NEXT_PUBLIC_MAIN_APP_URL: process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://smartstart-frontend.onrender.com',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-python-brain.onrender.com',
  }
}

module.exports = nextConfig
