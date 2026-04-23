import { expect, type Page } from '@playwright/test';

type ProductDetails = {
  name: string;
  quantity: number;
  priceText: string;
};

export class CartPage {
  constructor(private readonly page: Page) {}

  async expectProduct(details: ProductDetails): Promise<void> {
    const main = this.page.getByRole('main');
    await expect(main.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
    await expect(main.getByRole('heading', { name: new RegExp(details.name, 'i') })).toBeVisible();
    await expect(main.getByText(details.priceText, { exact: false }).first()).toBeVisible();
    await expect(main.getByText(details.quantity.toString(), { exact: true }).first()).toBeVisible();
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByRole('link', { name: /proceed to checkout|checkout/i }).click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/checkout/);
  }
}
