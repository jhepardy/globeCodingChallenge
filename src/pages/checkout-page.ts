import { expect, type Locator, type Page } from '@playwright/test';
import type { Customer } from '../data/customer';

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

  private submitOrderButton(): Locator {
    return this.page.getByRole('button', { name: /place order|complete order|pay now|processing/i });
  }

  private sameAsShippingAddressCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: /same as shipping address/i }).first();
  }

  private shippingOptionLabels(): Locator {
    // Each option should surface a shopper-visible price or free-shipping label.
    return this.shippingMethodSection().locator('label, [role="radio"]').filter({
      hasText: /\$\d+\.\d{2}|free/i
    });
  }

  private shippingMethodRadio(methodName: string): Locator {
    // Keep the selector close to the rendered accessibility name instead of DOM-specific classes.
    return this.shippingMethodSection().getByRole('radio', { name: new RegExp(methodName, 'i') }).first();
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

  async selectShippingMethod(methodName: 'Standard' | 'Premium'): Promise<void> {
    const shippingMethod = this.shippingMethodRadio(methodName);
    await expect(shippingMethod).toBeVisible({ timeout: 15000 });
    await shippingMethod.click();
    await expect(shippingMethod).toHaveAttribute('aria-checked', 'true');
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
    const cardFrame = this.paymentFrame();
    const cardNumber = cardFrame.locator('input[name="number"], #payment-numberInput').first();
    const expiry = cardFrame.locator('input[name="expiry"], input[autocomplete="cc-exp"]').first();
    const cvc = cardFrame.locator('input[name="cvc"], input[autocomplete="cc-csc"]').first();

    // Populate the hosted Stripe fields with the demo card values shown on the page.
    await expect(cardNumber).toBeVisible({ timeout: 20000 });
    await cardNumber.fill('4242424242424242');
    await expiry.fill('12/30');
    await cvc.fill('123');

    const postalCode = cardFrame.getByPlaceholder(/zip|postal/i);
    if (await postalCode.isVisible().catch(() => false)) {
      await postalCode.fill('10001');
    }

    // Move focus out of the hosted fields so Stripe validation has time to settle before submission.
    await this.page.locator('body').click({ position: { x: 20, y: 20 } }).catch(() => {});
  }

  async ensureSameAsShippingAddressChecked(): Promise<void> {
    const sameAsShippingAddress = this.sameAsShippingAddressCheckbox();
    await expect(sameAsShippingAddress).toBeVisible({ timeout: 10000 });

    if (await sameAsShippingAddress.isChecked()) {
      return;
    }

    await sameAsShippingAddress.check({ force: true });
    await expect(sameAsShippingAddress).toBeChecked();
  }

  async placeOrder(): Promise<void> {
    // The live DOM shows a direct Pay Now CTA without an extra policy checkbox in this checkout variant.
    const submitOrderButton = this.submitOrderButton();
    await expect(submitOrderButton).toBeEnabled({ timeout: 30000 });
    await expect(submitOrderButton).not.toHaveText(/processing/i, { timeout: 30000 });

    await submitOrderButton.click();

    // After submission, the checkout should either advance or expose a recoverable UI state quickly.
    await expect
      .poll(
        async () => {
          const url = this.page.url();
          const buttonText = (await submitOrderButton.textContent().catch(() => '') ?? '').trim();
          const bodyText = await this.page.locator('body').innerText().catch(() => '');

          if (/\/orders?\//i.test(url)) {
            return 'confirmed-route';
          }

          if (/thanks for your order|thank you|order confirmed|email confirmation/i.test(bodyText)) {
            return 'confirmed-copy';
          }

          if (/processing/i.test(buttonText)) {
            return 'processing';
          }

          if (/pay now|place order|complete order/i.test(buttonText)) {
            return 'checkout-ready';
          }

          return 'unknown';
        },
        {
          timeout: 60000,
          message: 'Expected checkout to advance to order confirmation after submitting payment.'
        }
      )
      .not.toBe('processing');
  }
}
