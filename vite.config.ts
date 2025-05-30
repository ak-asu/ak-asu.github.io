import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: '/Portfolio',
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  publicDir: path.resolve(__dirname, "client/public"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: parseInt(process.env.PORT || '5000'),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 5000}`,
        changeOrigin: true,
      },
    }
  },
});
