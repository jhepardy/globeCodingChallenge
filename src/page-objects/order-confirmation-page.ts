import { expect, type Page } from '@playwright/test';

export class OrderConfirmationPage {
  constructor(private readonly page: Page) {}

  async expectSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/\/order|\/orders|\/checkout/i, { timeout: 30000 });
    // Accept the storefront's success wording variants while still requiring an order identifier.
    await expect(this.page.getByText(/thank you|order confirmed|success/i).first()).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(/order\s*#|order number/i)).toBeVisible();
  }
}
