import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly accountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // The header account icon is the entry point to sign-in/sign-up flows.
    this.accountLink = page.getByRole('link', { name: 'Account', exact: true });
  }

  async goto(): Promise<void> {
    // Go directly to the intended storefront market to avoid geo-detection redirects.
    await this.page.goto('/us/en');
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/us\/en(?:\/)?$/);
    await expect(this.accountLink).toBeVisible();
  }

  async openAccount(): Promise<void> {
    await this.accountLink.click();
  }

  async openFeaturedProduct(productName: string): Promise<void> {
    // Use the full catalog first so the product link comes from a stable listing instead of a carousel.
    await this.page.getByRole('link', { name: /view all/i }).click();
    await expect(this.page).toHaveURL(/\/products$/);

    const productLink = this.page.getByRole('link', { name: new RegExp(productName, 'i') }).first();
    await Promise.all([this.page.waitForURL(/\/products\//), productLink.click()]);
  }
}
