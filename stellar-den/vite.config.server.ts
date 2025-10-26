import { defineConfig } from "vite";
import path from "path";
import { copyFileSync, mkdirSync, existsSync } from "fs";

// Plugin to copy data files to dist
const copyDataFiles = () => {
  return {
    name: "copy-data-files",
    closeBundle() {
      const srcDir = path.resolve(__dirname, "server/data");
      const destDir = path.resolve(__dirname, "dist/server/data");
      
      // Create destination directory if it doesn't exist
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      
      // Copy JSON files
      const files = ["iso-controls.json", "story-bot-questions.json"];
      files.forEach((file) => {
        const src = path.join(srcDir, file);
        const dest = path.join(destDir, file);
        if (existsSync(src)) {
          copyFileSync(src, dest);
          console.log(`✓ Copied ${file} to dist/server/data/`);
        }
      });
    },
  };
};

// Server build configuration
export default defineConfig({
  plugins: [copyDataFiles()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/node-build.ts"),
      name: "server",
      fileName: "production",
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        // Node.js built-ins
        "fs",
        "path",
        "url",
        "http",
        "https",
        "os",
        "crypto",
        "stream",
        "util",
        "events",
        "buffer",
        "querystring",
        "child_process",
        // External dependencies that should not be bundled
        "express",
        "cors",
      ],
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
      },
    },
    minify: false, // Keep readable for debugging
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
