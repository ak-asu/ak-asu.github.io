import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

// ESM equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // GitHub Pages base URL - matches your repository name
  const base = mode === "production" ? "/Portfolio/" : "/";

  return {
    base,
    plugins: [tailwindcss(), react()],
    define: {
      "import.meta.env.VITE_PUBLIC_URL": JSON.stringify(base),
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
    publicDir: "public",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      assetsDir: "assets",
      rollupOptions: {
        external: [/^\.claude/, /^docs/],
        output: {
          assetFileNames: "assets/[name]-[hash][extname]",
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
        },
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
