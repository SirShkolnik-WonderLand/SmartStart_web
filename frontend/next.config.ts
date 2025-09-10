import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for monorepo - use absolute path
  outputFileTracingRoot: require('path').join(__dirname, '..'),
  
  // Enable build caching for faster deployments
  experimental: {
    // Optimize bundle analysis
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot', '@radix-ui/react-tabs'],
  },
  
  // Enable compression
  compress: true,
  
  // Optimize build performance
  swcMinify: true,
  
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
