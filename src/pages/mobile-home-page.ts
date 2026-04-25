import { expect, type Locator, type Page } from '@playwright/test';

export class MobileHomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    // Go directly to the intended storefront market to avoid geo-detection redirects.
    await this.page.goto('/us/en');
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/us\/en(?:\/)?$/);
    await expect(this.page.getByRole('main')).toBeVisible();
  }

  async openAccount(): Promise<void> {
    await this.openNavigationMenu();

    const myAccountButton = this.page.getByRole('button', { name: /my account/i }).first();
    const myAccountLink = this.page.getByRole('link', { name: /my account/i }).first();
    const accountEntry = await this.firstVisible([myAccountButton, myAccountLink]);

    await expect(accountEntry).toBeVisible({ timeout: 10000 });
    await accountEntry.click();
  }

  async openFeaturedProduct(productName: string): Promise<void> {
    await this.openNavigationMenu();

    const allProductsLink = this.page.getByRole('link', { name: /all products/i }).first();
    await expect(allProductsLink).toBeVisible({ timeout: 10000 });
    await allProductsLink.click();
    await expect(this.page).toHaveURL(/\/products$/);

    await this.scrollProductIntoView(productName);

    const productHeading = this.page.getByRole('heading', { name: new RegExp(`^${productName}$`, 'i') }).first();
    const productImage = this.page.locator(`img[alt="${productName}"]`).first();
    const productLink =
      (await productHeading.isVisible().catch(() => false))
        ? this.page.locator('a[href*="/products/"]').filter({ has: productHeading }).first()
        : this.page.locator('a[href*="/products/"]').filter({ has: productImage }).first();

    await expect(productLink).toBeVisible({ timeout: 15000 });
    await productLink.click();
    await expect(this.page).toHaveURL(/\/products\//);
  }

  private async scrollProductIntoView(productName: string): Promise<void> {
    const productHeading = this.page.getByRole('heading', { name: new RegExp(`^${productName}$`, 'i') }).first();
    const productImage = this.page.locator(`img[alt="${productName}"]`).first();

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const headingVisible = await productHeading.isVisible().catch(() => false);
      const imageVisible = await productImage.isVisible().catch(() => false);

      if (headingVisible || imageVisible) {
        return;
      }

      await this.page.mouse.wheel(0, 1400);
      await this.page.waitForTimeout(500);
    }
  }

  private async openNavigationMenu(): Promise<void> {
    const menuTriggers = [
      this.page.getByRole('button', { name: /menu|open menu|navigation/i }).first(),
      this.page.getByLabel(/menu|open menu|navigation/i).first(),
      this.page.locator('button[aria-label*="menu" i], button[title*="menu" i]').first()
    ];

    for (const trigger of menuTriggers) {
      if (!await trigger.isVisible().catch(() => false)) {
        continue;
      }

      await trigger.click();
      return;
    }

    throw new Error('Could not find a visible navigation menu trigger for the mobile viewport.');
  }

  private async firstVisible(locators: Locator[]): Promise<Locator> {
    for (const locator of locators) {
      if (await locator.isVisible().catch(() => false)) {
        return locator;
      }
    }

    return locators[0];
  }
}
