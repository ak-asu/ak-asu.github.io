import express from "express";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables with defaults
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Check if this script was called with a build argument
const shouldBuild = process.argv.includes("--build");

if (shouldBuild) {
  buildProductionAssets();
} else {
  startServer();
}

function buildProductionAssets() {
  // Ensure the public directory exists
  const publicDir = path.resolve(__dirname, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  log("Building production assets...", "build");

  // Run the Vite build
  exec("npx vite build", (error, stdout, stderr) => {
    if (error) {
      log(`Build error: ${error.message}`, "build");
      process.exit(1);
      return;
    }

    console.log(stdout);

    if (stderr) {
      console.error(stderr);
    }

    log(
      "Build complete! You can now deploy the content of the server/public directory.",
      "build",
    );
    process.exit(0);
  });
}

function startServer() {
  const app = express();

  // Minimal middleware needed
  app.use(express.json());

  // Set environment explicitly
  app.set("env", NODE_ENV);

  (async () => {
    // Create basic HTTP server
    const server = app.listen(
      {
        port: PORT,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${PORT} in ${NODE_ENV} mode`);
      },
    );

    // Only setup vite in development or serve static files in production
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  })();
}
