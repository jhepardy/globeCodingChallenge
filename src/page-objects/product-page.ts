import { expect, type Page } from '@playwright/test';

export class ProductPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(productName: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: new RegExp(productName, 'i') })).toBeVisible();
    await expect(this.page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
  }

  async captureProductDetails() {
    const name = (await this.page.getByRole('heading').filter({ hasText: /.+/ }).first().innerText()).trim();
    const priceText = ((await this.page.getByText(/\$\d+\.\d{2}/).first().innerText()).match(/\$\d+\.\d{2}/) ?? [])[0] ?? '';

    return {
      name,
      quantity: 1,
      priceText
    };
  }

  async addToCart(): Promise<void> {
    const addToCartButton = this.page.getByRole('button', { name: /add to cart/i }).last();
    await addToCartButton.click();
    await expect(this.page.getByRole('dialog', { name: /cart/i })).toBeVisible({ timeout: 15000 });
  }

  async openCart(): Promise<void> {
    const cartDialog = this.page.getByRole('dialog', { name: /cart/i });
    if (await cartDialog.isVisible().catch(() => false)) {
      await cartDialog.getByRole('link', { name: /view cart/i }).click();
    } else {
      await this.page.goto('/us/en/cart');
    }
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/cart$/);
  }
}
