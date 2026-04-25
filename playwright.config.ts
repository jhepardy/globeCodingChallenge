import { defineConfig, devices } from '@playwright/test';

// Central Playwright configuration shared by local runs and CI.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    // The demo store redirects to a locale-specific path from this root URL.
    baseURL: 'https://demo.spreecommerce.org',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
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
