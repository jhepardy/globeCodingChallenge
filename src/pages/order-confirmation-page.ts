import { expect, type Page } from '@playwright/test';

export class OrderConfirmationPage {
  constructor(private readonly page: Page) {}

  async expectSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/\/order|\/orders|\/checkout/i, { timeout: 30000 });
    // Match the live success copy used by the storefront while still allowing minor wording changes.
    await expect(
      this.page.getByRole('heading', {
        name: /thanks for your order|thank you|order confirmed|success/i
      })
    ).toBeVisible({ timeout: 30000 });

    const orderNumber = this.page.getByText(/order\s*#\s?[A-Z0-9-]+|order number/i);
    await expect(orderNumber).toBeVisible();
    await expect(this.page.getByText(/email confirmation/i)).toBeVisible();
  }
}
