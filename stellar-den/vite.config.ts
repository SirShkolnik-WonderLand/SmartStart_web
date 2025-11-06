import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createApiServer } from "./api-server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./", "./client", "./shared", "./dist", "./server"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    cssCodeSplit: false, // Extract all CSS into a single file for easier loading
    cssMinify: true,
    rollupOptions: {
      output: {
        // Add nonce placeholder for CSP
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Ensure CSS files get proper naming - use index- prefix to match detection
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            // If it's the main CSS file, name it index-[hash].css to match our detection
            if (assetInfo.name.includes('index') || assetInfo.name.includes('style')) {
              return 'assets/index-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createApiServer();

      // Add API routes to Vite dev server
      // Note: The api-server expects routes without /api prefix, so we mount it at /api
      server.middlewares.use('/api', app);
    },
  };
}
