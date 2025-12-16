import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  // Simple base URL configuration for GitHub Pages
  const base =
    mode === "production" && process.env.NODE_ENV === "production"
      ? "/Portfolio/"
      : "/";

  return {
    base,
    plugins: [tailwindcss(), react(), runtimeErrorOverlay(), themePlugin()],
    define: {
      // Make the base URL available as VITE_PUBLIC_URL for backward compatibility
      "import.meta.env.VITE_PUBLIC_URL": JSON.stringify(base),
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
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
      assetsDir: "assets",
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name]-[hash][extname]",
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
        },
      },
    },
    server: {
      port: parseInt(process.env.PORT || "5000"),
      proxy: {
        "/api": {
          target: `http://localhost:${process.env.PORT || 5000}`,
          changeOrigin: true,
        },
      },
    },
  };
});
