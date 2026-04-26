import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
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
    const accountLink = this.page.getByRole('link', { name: 'Account', exact: true });

    if (await accountLink.first().isVisible().catch(() => false)) {
      await accountLink.first().click();
      return;
    }

    await this.openNavigationMenu();
    await expect(accountLink.first()).toBeVisible({ timeout: 10000 });
    await accountLink.first().click();
  }

  async openFeaturedProduct(productName: string): Promise<void> {
    // Go to the stable catalog route directly instead of depending on hero or nav entry variants.
    await this.page.goto('/us/en/products');
    await expect(this.page).toHaveURL(/\/products$/);

    await this.scrollProductIntoView(productName);

    const productHeading = this.page.getByRole('heading', { name: new RegExp(`^${productName}$`, 'i') }).first();
    const productImage = this.page.locator(`img[alt="${productName}"]`).first();
    const productLink =
      (await productHeading.isVisible().catch(() => false))
        ? this.page.locator('a[href*="/products/"]').filter({ has: productHeading }).first()
        : this.page.locator('a[href*="/products/"]').filter({ has: productImage }).first();

    await expect(productLink).toBeVisible({ timeout: 15000 });

    const href = await productLink.getAttribute('href');

    await productLink.click();

    const openedFromClick = await this.page
      .waitForURL(/\/products\//, { timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!openedFromClick) {
      if (!href) {
        throw new Error(`Could not resolve a product URL for ${productName}.`);
      }

      await this.page.goto(href);
    }

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

    throw new Error('Could not find a visible navigation menu trigger for the current viewport.');
  }
}
