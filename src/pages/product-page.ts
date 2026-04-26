import { expect, type Locator, type Page } from '@playwright/test';

type ProductDetails = {
  name: string;
  color?: string;
  quantity: number;
  priceText: string;
};

export class ProductPage {
  constructor(private readonly page: Page) {}

  private quantityValue(): Locator {
    // The quantity display sits between the decrease and increase controls.
    return this.page.getByRole('button', { name: /increase quantity/i }).locator('xpath=preceding-sibling::span[1]');
  }

  async selectColor(colorName: string): Promise<void> {
    // Color swatches expose the chosen variant through the button title.
    const colorButton = this.page.locator(`button[title="${colorName}"]`).first();
    await expect(colorButton).toBeVisible({ timeout: 15000 });
    await colorButton.click();
    await expect(this.page.getByText(new RegExp(`^${colorName}$`, 'i')).last()).toBeVisible();
  }

  async setQuantity(quantity: number): Promise<void> {
    expect(quantity).toBeGreaterThan(0);

    // Compare against the current PDP quantity so the helper can increase or decrease as needed.
    const decreaseQuantityButton = this.page.getByRole('button', { name: /decrease quantity/i });
    const increaseQuantityButton = this.page.getByRole('button', { name: /increase quantity/i });
    const quantityValue = this.quantityValue();

    await expect(quantityValue).toBeVisible({ timeout: 15000 });
    const currentQuantity = Number((await quantityValue.innerText()).trim());

    if (quantity === currentQuantity) {
      return;
    }

    const quantityButton = quantity > currentQuantity ? increaseQuantityButton : decreaseQuantityButton;
    const steps = Math.abs(quantity - currentQuantity);

    // Click one step at a time because the component updates after each interaction.
    for (let step = 0; step < steps; step += 1) {
      await quantityButton.click();
    }

    await expect(quantityValue).toHaveText(String(quantity));
  }

  async captureProductDetails(selectedColor?: string, selectedQuantity = 1): Promise<ProductDetails> {
    // Persist the PDP values so we can compare them later in the cart.
    const name = (await this.page.getByRole('heading').filter({ hasText: /.+/ }).first().innerText()).trim();
    const priceText = ((await this.page.getByText(/\$\d+\.\d{2}/).first().innerText()).match(/\$\d+\.\d{2}/) ?? [])[0] ?? '';

    return {
      name,
      color: selectedColor,
      quantity: selectedQuantity,
      priceText
    };
  }

  async addToCart(): Promise<void> {
    // The storefront usually opens a cart drawer, but in some cases only the cart state changes.
    const addToCartButton = this.page.getByRole('button', { name: /add to cart/i }).last();
    const cartDialog = this.page.getByRole('dialog', { name: /cart/i });

    await addToCartButton.click();

    const drawerOpened = await cartDialog
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!drawerOpened) {
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  async openCart(): Promise<void> {
    // Prefer the cart drawer CTA when it appears because that mirrors the user journey.
    const cartDialog = this.page.getByRole('dialog', { name: /cart/i });
    if (await cartDialog.isVisible().catch(() => false)) {
      await Promise.all([
        this.page.waitForURL(/\/cart$/),
        cartDialog.getByRole('link', { name: /view cart/i }).click()
      ]);
    } else {
      await this.page.goto('/us/en/cart');
    }
    await expect(this.page).toHaveURL(/\/cart$/);
    await expect(this.page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
  }
}
