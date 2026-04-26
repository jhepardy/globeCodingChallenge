import { expect, type Page } from '@playwright/test';

export class HomeAssertions {
  constructor(private readonly page: Page) {}

  async expectStorefrontLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/us\/en(?:\/)?$/);
    await expect(this.page.getByRole('main')).toBeVisible();
  }
}
