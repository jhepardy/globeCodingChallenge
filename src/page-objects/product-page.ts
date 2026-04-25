import { expect, type Page } from '@playwright/test';

export class ProductPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(productName: string): Promise<void> {
    // Confirm the product detail page is loaded before capturing values from it.
    await expect(this.page.getByRole('heading', { name: new RegExp(productName, 'i') })).toBeVisible();
    await expect(this.page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
  }

  async captureProductDetails() {
    // Persist the PDP values so we can compare them later in the cart.
    const name = (await this.page.getByRole('heading').filter({ hasText: /.+/ }).first().innerText()).trim();
    const priceText = ((await this.page.getByText(/\$\d+\.\d{2}/).first().innerText()).match(/\$\d+\.\d{2}/) ?? [])[0] ?? '';

    return {
      name,
      quantity: 1,
      priceText
    };
  }

  async addToCart(): Promise<void> {
    // The add-to-cart action opens a drawer, so assert that drawer instead of button text changes.
    const addToCartButton = this.page.getByRole('button', { name: /add to cart/i }).last();
    await addToCartButton.click();
    await expect(this.page.getByRole('dialog', { name: /cart/i })).toBeVisible({ timeout: 15000 });
  }

  async openCart(): Promise<void> {
    // Prefer the cart drawer CTA when it appears because that mirrors the user journey.
    const cartDialog = this.page.getByRole('dialog', { name: /cart/i });
    if (await cartDialog.isVisible().catch(() => false)) {
      await Promise.all([
        this.page.waitForURL(/\/cart$/),
        cartDialog.getByRole('link', { name: /view cart/i }).click()
      ]);
    } else {
      await this.page.goto('/us/en/cart');
    }
    await expect(this.page).toHaveURL(/\/cart$/);
    await expect(this.page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
  }
}
