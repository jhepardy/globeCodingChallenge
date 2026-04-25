import { defineConfig, devices } from '@playwright/test';

// Stamp each run with a unique folder so local executions do not overwrite prior artifacts.
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runOutputDir = `test-results/${runId}`;
const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL ?? 'https://demo.spreecommerce.org';

// Central Playwright configuration shared by local runs and CI.
export default defineConfig({
  testDir: './tests',
  outputDir: `${runOutputDir}/artifacts`,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Keep execution single-threaded for easier observation and debugging.
  workers: 1,
  reporter: [
    // Keep human-readable, shareable, and machine-readable reports from the same execution.
    ['list'],
    ['html', { open: 'never', outputFolder: `${runOutputDir}/html-report` }],
    ['json', { outputFile: `${runOutputDir}/results.json` }]
  ],
  use: {
    // Allow CI to point the same test suite at staging, production, or the demo store.
    baseURL,
    // Run headed locally, but stay headless in CI where no display server is available.
    headless: isCI,
    launchOptions: {
      slowMo: isCI ? 0 : 400
    },
    trace: 'retain-on-failure',
    // Keep richer artifacts only when a test fails so local runs stay readable.
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-testid'
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        // Lock viewport size so the header and checkout layout stay predictable.
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1100 }
      }
    },
    {
      name: 'chromium-mobile-sm',
      use: {
        // Keep mobile coverage on Chromium so the suite runs with the installed browser only.
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3
      }
    },
    {
      name: 'chromium-tablet',
      use: {
        // Keep tablet coverage on Chromium while still exercising touch-oriented layouts.
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        viewport: { width: 1024, height: 1366 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2
      }
    }
  ]
});
