import { expect, type Page } from '@playwright/test';

type ProductDetails = {
  name: string;
  quantity: number;
  priceText: string;
};

export class CartPage {
  constructor(private readonly page: Page) {}

  async expectProduct(details: ProductDetails): Promise<void> {
    // Scope cart checks to the main panel so product recommendations do not interfere.
    const main = this.page.getByRole('main');
    await expect(main.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
    await expect(main.getByRole('heading', { name: new RegExp(details.name, 'i') })).toBeVisible();
    await expect(main.getByText(details.priceText, { exact: false }).first()).toBeVisible();
    await expect(main.getByText(details.quantity.toString(), { exact: true }).first()).toBeVisible();
  }

  async proceedToCheckout(): Promise<void> {
    // Support both cart CTA labels used by the storefront variants.
    const proceedToCheckoutLink = this.page.getByRole('link', { name: /^proceed to checkout$/i });
    const checkoutLink = this.page.getByRole('link', { name: /^checkout$/i });
    const checkoutCta =
      (await proceedToCheckoutLink.count()) > 0 ? proceedToCheckoutLink.first() : checkoutLink.first();

    await Promise.all([
      this.page.waitForURL(/\/checkout\//),
      checkoutCta.click()
    ]);
    await expect(this.page).toHaveURL(/\/checkout/);
    await expect(this.page.getByRole('heading', { name: /contact information/i })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /payment method/i })).toBeVisible();
  }
}
