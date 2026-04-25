import { expect, type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  private shippingMethodSection(): Locator {
    // Shipping options may render inside different containers, so locate the section by its label.
    return this.page.locator('section, div').filter({
      has: this.page.getByText(/^shipping method$/i)
    }).first();
  }

  private paymentFrame() {
    // Stripe mounts the card inputs inside a dedicated iframe with the payment component name.
    return this.page.frameLocator('iframe[src*="componentName=payment"]').first();
  }

  async addShippingAddress(): Promise<void> {
    // The checkout page is label/placeholder-driven rather than route-step driven.
    await expect(this.page.getByRole('heading', { name: /contact information/i })).toBeVisible({ timeout: 20000 });
    await expect(this.page.getByRole('heading', { name: /shipping address/i })).toBeVisible();

    const email = this.page.getByLabel(/email address/i);
    if (await email.isVisible().catch(() => false)) {
      await email.fill('qa.checkout@example.com');
      await email.press('Tab');
    }

    const country = this.page.getByLabel(/^country$/i).first();
    if (await country.isVisible().catch(() => false)) {
      await country.selectOption({ label: 'United States' });
      await expect(country).toHaveValue(/US|us/, { timeout: 10000 });
    }

    const firstName = this.page.getByLabel(/first name/i);
    if (await firstName.isVisible().catch(() => false)) {
      // Tab between fields to trigger blur-based validation used by the live demo.
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
        const tagName = await state.evaluate((element) => element.tagName.toLowerCase());

        if (tagName === 'select') {
          await expect(state).toBeEnabled({ timeout: 10000 });
          await state.selectOption({ label: 'New York' });
        } else {
          await state.fill('New York');
          await state.press('Tab');
        }
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

    // Poll the live page because shipping methods are loaded asynchronously after address updates.
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
    // Once shipping methods exist, pick the first valid option to continue the happy path.
    const shippingMethods = this.shippingMethodSection().getByRole('radio');
    const count = await shippingMethods.count();
    expect(count).toBeGreaterThan(0);
    await shippingMethods.first().check();
  }

  async selectPaymentMethod(): Promise<void> {
    // The payment option is the last radio currently exposed on the page after shipping controls.
    const paymentMethod = this.page.getByRole('radio').last();
    await expect(paymentMethod).toBeVisible({ timeout: 20000 });
    await paymentMethod.check();
  }

  async fillPaymentDetailsFromHints(): Promise<void> {
    // The demo explicitly shows the Stripe test card details; use those values in the iframe fields.
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
    // Accept the storefront policies when the consent control is rendered as clickable text.
    const policyAgreement = this.page.getByText(/i agree to the privacy policy and terms of service/i);
    if (await policyAgreement.isVisible().catch(() => false)) {
      await policyAgreement.click();
    }

    await this.page.getByRole('button', { name: /place order|complete order|pay now/i }).click();
  }
}
