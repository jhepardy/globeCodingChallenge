import { expect, type Page } from '@playwright/test';

export class ProductAssertions {
  constructor(private readonly page: Page) {}

  async expectLoaded(productName: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: new RegExp(productName, 'i') })).toBeVisible();
    await expect(this.page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
  }

  async expectQuantity(quantity: number): Promise<void> {
    const quantityValue = this.page
      .getByRole('button', { name: /increase quantity/i })
      .locator('xpath=preceding-sibling::span[1]');

    await expect(quantityValue).toHaveText(String(quantity));
  }
}
