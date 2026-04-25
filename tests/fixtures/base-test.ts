import { expect, test as base } from '@playwright/test';

type RunContext = Record<string, unknown>;
type RunContextStore = {
  data: RunContext;
};

export const test = base.extend<{
  setRunContext: (context: RunContext) => void;
  runContextStore: RunContextStore;
  captureFailureContext: void;
}>({
  runContextStore: [async ({}, use) => {
    await use({ data: {} });
  }, { scope: 'test' }],

  setRunContext: async ({ runContextStore }, use) => {
    await use((context: RunContext) => {
      runContextStore.data = {
        ...runContextStore.data,
        ...context
      };
    });
  },

  captureFailureContext: [async ({ page, runContextStore }, use, testInfo) => {
    await use();

    if (testInfo.status === testInfo.expectedStatus) {
      return;
    }

    const currentUrl = page.url();
    const pageTitle = await page.title().catch(() => '');
    const mainContent = await page.getByRole('main').innerText().catch(async () =>
      page.locator('body').innerText().catch(() => '')
    );
    const cookies = await page.context().cookies().catch(() => []);
    const localStorage = await page.evaluate(() => {
      const values: Record<string, string> = {};

      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);

        if (!key) {
          continue;
        }

        values[key] = window.localStorage.getItem(key) ?? '';
      }

      return values;
    }).catch(() => ({}));

    await testInfo.attach('current-url', {
      body: currentUrl,
      contentType: 'text/plain'
    });

    await testInfo.attach('page-title', {
      body: pageTitle,
      contentType: 'text/plain'
    });

    await testInfo.attach('run-context', {
      body: JSON.stringify(runContextStore.data, null, 2),
      contentType: 'application/json'
    });

    await testInfo.attach('main-content', {
      body: mainContent,
      contentType: 'text/plain'
    });

    await testInfo.attach('cookies', {
      body: JSON.stringify(cookies, null, 2),
      contentType: 'application/json'
    });

    await testInfo.attach('local-storage', {
      body: JSON.stringify(localStorage, null, 2),
      contentType: 'application/json'
    });
  }, { auto: true }]
});

export { expect };
