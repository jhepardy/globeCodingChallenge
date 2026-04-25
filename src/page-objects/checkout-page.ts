import { expect, type Locator, type Page } from '@playwright/test';
import type { Customer } from '../test-data/customer';

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

  async addShippingAddress(customer: Customer): Promise<void> {
    // The checkout page is label/placeholder-driven rather than route-step driven.
    await expect(this.page.getByRole('heading', { name: /contact information/i })).toBeVisible({ timeout: 20000 });
    await expect(this.page.getByRole('heading', { name: /shipping address/i })).toBeVisible();

    const email = this.page.getByLabel(/email address/i);
    // Keep the account email when it is disabled; otherwise populate the generated test account email.
    if (await email.isVisible().catch(() => false) && await email.isEditable().catch(() => false)) {
      await email.fill(customer.email);
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
      await firstName.fill(customer.firstName);
      await firstName.press('Tab');
      await this.page.getByLabel(/last name/i).fill(customer.lastName);
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
        // Use a valid US-format mobile number because checkout is set to United States.
        await phone.fill('2025550143');
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
    // The payment section exposes Credit card as the active radio option on the page itself.
    const paymentMethod = this.page
      .locator('#checkout-section-payment')
      .getByRole('radio')
      .filter({ has: this.page.locator('[data-state="checked"], [data-state="unchecked"]') })
      .first();

    await expect(paymentMethod).toBeVisible({ timeout: 20000 });

    if ((await paymentMethod.getAttribute('aria-checked')) !== 'true') {
      await paymentMethod.click();
    }

    await expect(paymentMethod).toHaveAttribute('aria-checked', 'true');
    await expect(this.page.locator('#checkout-section-payment').getByText(/^credit card$/i)).toBeVisible();
  }

  async fillPaymentDetailsFromHints(): Promise<void> {
    // The demo explicitly shows the Stripe test card details; use those values in the iframe fields.
    await expect(this.page.getById('payment-numberInput')).toBeVisible({ timeout: 20000 });

    const cardFrame = this.paymentFrame();
    const cardNumber = cardFrame.locator('input[name="number"], #payment-numberInput').first();
    const expiry = cardFrame.locator('input[name="expiry"], input[autocomplete="cc-exp"]').first();
    const cvc = cardFrame.locator('input[name="cvc"], input[autocomplete="cc-csc"]').first();

    await expect(cardNumber).toBeVisible({ timeout: 20000 });
    await cardNumber.fill('4242424242424242');
    await expiry.fill('12/30');
    await cvc.fill('123');

    const postalCode = cardFrame.getByPlaceholder(/zip|postal/i);
    if (await postalCode.isVisible().catch(() => false)) {
      await postalCode.fill('10001');
    }
  }

  async placeOrder(): Promise<void> {
    // The live DOM shows a direct Pay Now CTA without an extra policy checkbox in this checkout variant.
    await this.page.getByRole('button', { name: /place order|complete order|pay now/i }).click();
  }
}
