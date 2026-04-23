import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly accountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountLink = page.getByRole('link', { name: 'Account', exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/[a-z]{2}\/en(?:\/)?$/);
    await expect(this.accountLink).toBeVisible();
  }

  async openAccount(): Promise<void> {
    await this.accountLink.click();
  }

  async openFeaturedProduct(productName: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(productName, 'i') }).first().click();
    await expect(this.page).toHaveURL(/\/products\//);
  }
}
