import { expect, type Locator, type Page } from '@playwright/test';

export class CheckoutAssertions {
  constructor(private readonly page: Page) {}

  private shippingMethodSection(): Locator {
    return this.page.locator('section, div').filter({
      has: this.page.getByText(/^shipping method$/i)
    }).first();
  }

  private shippingOptionLabels(): Locator {
    return this.shippingMethodSection().locator('label, [role="radio"]').filter({
      hasText: /\$\d+\.\d{2}|free/i
    });
  }

  private shippingMethodRadio(methodName: string): Locator {
    return this.shippingMethodSection().getByRole('radio', { name: new RegExp(methodName, 'i') }).first();
  }

  async expectCheckoutLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout/);
    await expect(this.page.getByRole('heading', { name: /contact information/i })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /payment method/i })).toBeVisible();
  }

  async expectDeliveryOptions(): Promise<void> {
    await expect(this.page.getByText(/^shipping method$/i)).toBeVisible();

    await expect
      .poll(
        async () => {
          const body = await this.page.locator('body').innerText();
          const hasUnavailableMessage = /enter your shipping address to view available shipping methods/i.test(body);
          const pricingMatches = body.match(/\$\d+\.\d{2}|free/gi) ?? [];

          return hasUnavailableMessage ? `unavailable:${pricingMatches.length}` : `available:${pricingMatches.length}`;
        },
        {
          timeout: 15000,
          message: 'Expected the checkout to surface shipping pricing after the address was entered.'
        }
      )
      .toMatch(/^available:/);

    const shippingOptions = this.shippingOptionLabels();
    await expect(shippingOptions.first()).toBeVisible({ timeout: 15000 });

    const optionCount = await shippingOptions.count();
    expect(optionCount).toBeGreaterThan(0);

    const optionTexts = (await shippingOptions.allInnerTexts())
      .map((text) => text.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    expect(optionTexts.length).toBeGreaterThan(0);

    for (const optionText of optionTexts) {
      expect(optionText).toMatch(/\$\d+\.\d{2}|free/i);
    }

    await expect(shippingOptions.filter({ hasText: /standard/i }).first()).toBeVisible();
    await expect(shippingOptions.filter({ hasText: /premium/i }).first()).toBeVisible();
  }

  async expectShippingMethodSelected(methodName: 'Standard' | 'Premium'): Promise<void> {
    await expect(this.shippingMethodRadio(methodName)).toHaveAttribute('aria-checked', 'true');
  }

  async expectPaymentMethodSelected(): Promise<void> {
    const paymentMethod = this.page
      .locator('#checkout-section-payment')
      .getByRole('radio')
      .filter({ has: this.page.locator('[data-state="checked"], [data-state="unchecked"]') })
      .first();

    await expect(paymentMethod).toHaveAttribute('aria-checked', 'true');
    await expect(this.page.locator('#checkout-section-payment').getByText(/^credit card$/i)).toBeVisible();
  }

  async expectPaymentHintsVisible(): Promise<void> {
    await expect(this.page.getByText(/test card:\s*4242/i)).toBeVisible({ timeout: 20000 });
    await expect(this.page.getByText(/loading payment form/i)).not.toBeVisible({ timeout: 30000 });
    await expect(this.page.locator('iframe[src*="componentName=payment"]').first()).toBeVisible({ timeout: 30000 });
  }
}
