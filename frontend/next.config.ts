import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression
  compress: true,
  
  // Enable static optimization
  trailingSlash: false,
  
  // Optimize images
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
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
      };
    }
    return config;
  },
};

export default nextConfig;
