import { expect, type Page } from '@playwright/test';

export class OrderConfirmationAssertions {
  constructor(private readonly page: Page) {}

  async expectSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/\/order|\/orders|\/checkout/i, { timeout: 60000 });

    const bodyText = await this.page.locator('body').innerText().catch(() => '');
    if (/processing/i.test(bodyText) && !/thanks for your order|thank you|order confirmed|email confirmation/i.test(bodyText)) {
      throw new Error('Checkout remained in a processing state instead of reaching an order confirmation page.');
    }

    await expect(
      this.page.getByRole('heading', {
        name: /thanks for your order|thank you|order confirmed|success/i
      })
    ).toBeVisible({ timeout: 60000 });

    const orderNumber = this.page.getByText(/order\s*#\s?[A-Z0-9-]+|order number/i);
    await expect(orderNumber).toBeVisible();
    await expect(this.page.getByText(/email confirmation/i)).toBeVisible();
  }
}
