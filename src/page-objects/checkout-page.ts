import { expect, type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  private shippingMethodSection(): Locator {
    return this.page.locator('section, div').filter({
      has: this.page.getByText(/^shipping method$/i)
    }).first();
  }

  private paymentFrame() {
    return this.page.frameLocator('iframe[src*="componentName=payment"]').first();
  }

  async addShippingAddress(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /contact information/i })).toBeVisible({ timeout: 20000 });
    await expect(this.page.getByRole('heading', { name: /shipping address/i })).toBeVisible();

    const email = this.page.getByLabel(/email address/i);
    if (await email.isVisible().catch(() => false)) {
      await email.fill('qa.checkout@example.com');
      await email.press('Tab');
    }

    const firstName = this.page.getByLabel(/first name/i);
    if (await firstName.isVisible().catch(() => false)) {
      await firstName.fill('QA');
      await firstName.press('Tab');
      await this.page.getByLabel(/last name/i).fill('Architect');
      await this.page.getByLabel(/last name/i).press('Tab');
      await this.page.getByLabel(/^address$/i).fill('221B Test Street');
      await this.page.getByLabel(/^address$/i).press('Tab');
      await this.page.getByLabel(/city/i).fill('New York');
      await this.page.getByLabel(/city/i).press('Tab');

      const state = this.page.getByLabel(/state|province|region/i);
      if (await state.isVisible().catch(() => false)) {
        await state.fill('New York');
        await state.press('Tab');
      }

      const zipcode = this.page.getByLabel(/zip|postal code/i);
      if (await zipcode.isVisible().catch(() => false)) {
        await zipcode.fill('10001');
        await zipcode.press('Tab');
      }

      const phone = this.page.getByLabel(/phone/i);
      if (await phone.isVisible().catch(() => false)) {
        await phone.fill('09171234567');
        await phone.press('Tab');
      }
    }
  }

  async verifyDeliveryOptions(): Promise<void> {
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
  }

  async selectShippingMethod(): Promise<void> {
    const shippingMethods = this.shippingMethodSection().getByRole('radio');
    const count = await shippingMethods.count();
    expect(count).toBeGreaterThan(0);
    await shippingMethods.first().check();
  }

  async selectPaymentMethod(): Promise<void> {
    const paymentMethod = this.page.getByRole('radio').last();
    await expect(paymentMethod).toBeVisible({ timeout: 20000 });
    await paymentMethod.check();
  }

  async fillPaymentDetailsFromHints(): Promise<void> {
    await expect(this.page.getByText(/test card:\s*4242/i)).toBeVisible({ timeout: 20000 });

    const cardFrame = this.paymentFrame();
    await cardFrame.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242');
    await cardFrame.getByPlaceholder('MM / YY').fill('12/34');
    await cardFrame.getByPlaceholder('CVC').fill('123');

    const postalCode = cardFrame.getByPlaceholder(/zip|postal/i);
    if (await postalCode.isVisible().catch(() => false)) {
      await postalCode.fill('10001');
    }
  }

  async placeOrder(): Promise<void> {
    const policyAgreement = this.page.getByText(/i agree to the privacy policy and terms of service/i);
    if (await policyAgreement.isVisible().catch(() => false)) {
      await policyAgreement.click();
    }

    await this.page.getByRole('button', { name: /place order|complete order|pay now/i }).click();
  }
}
