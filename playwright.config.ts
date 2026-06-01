import { defineConfig, devices } from '@playwright/test';

// Use the full Chromium (supports WebGL for Three.js) rather than the stripped headless-shell.
// The `playwright` package exposes the full binary path; @playwright/test defaults to headless-shell.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fullChromium: string | undefined = (() => {
  try { return require('playwright').chromium.executablePath(); } catch { return undefined; }
})();

const BASE_URL = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:5175';

/** Shared launch options: use full Chromium with GPU disabled for CI stability. */
const chromiumLaunch = {
  executablePath: fullChromium,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'test-reports/html', open: 'never' }]],
  outputDir: 'test-reports/results',
  timeout: 60_000,
  expect: { timeout: 8_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    launchOptions: chromiumLaunch,
  },

  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'laptop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Mini'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 } },
    },
  ],

  // Run `npm run dev -- --host 127.0.0.1 --port 5175` before executing tests.
  // Then: npx playwright test
  // To let Playwright manage the server, uncomment:
  // webServer: {
  //   command: 'npm run dev -- --host 127.0.0.1 --port 5175',
  //   url: BASE_URL,
  //   reuseExistingServer: true,
  //   timeout: 30_000,
  // },
});
