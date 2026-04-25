import { defineConfig, devices } from '@playwright/test';

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runOutputDir = `test-results/${runId}`;
const isCI = !!process.env.CI;

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
    ['list'],
    ['html', { open: 'never', outputFolder: `${runOutputDir}/html-report` }],
    ['json', { outputFile: `${runOutputDir}/results.json` }]
  ],
  use: {
    // The demo store redirects to a locale-specific path from this root URL.
    baseURL: 'https://demo.spreecommerce.org',
    // Run headed locally, but stay headless in CI where no display server is available.
    headless: isCI,
    launchOptions: {
      slowMo: isCI ? 0 : 400
    },
    trace: 'on-first-retry',
    // Keep a video for every run and screenshots only when a test fails.
    video: 'on',
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-testid'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        // Lock viewport size so the header and checkout layout stay predictable.
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1100 }
      }
    }
  ]
});
