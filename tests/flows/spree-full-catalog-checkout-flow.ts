import { expect, type Page, type TestType } from '@playwright/test';
import { AccountAssertions } from '../assertions/account.assert';
import { CartAssertions } from '../assertions/cart.assert';
import { CheckoutAssertions } from '../assertions/checkout.assert';
import { HomeAssertions } from '../assertions/home.assert';
import { OrderConfirmationAssertions } from '../assertions/order-confirmation.assert';
import { ProductAssertions } from '../assertions/product.assert';
import { AccountPage } from '../../src/pages/account-page';
import { CartPage } from '../../src/pages/cart-page';
import { CheckoutPage } from '../../src/pages/checkout-page';
import type { MultiItemCheckoutSelection } from '../../src/data/checkout-selections';
import { createCustomer } from '../../src/data/customer';
import { HomePage } from '../../src/pages/home-page';
import { ProductPage } from '../../src/pages/product-page';
import { saveRegisteredAccount } from '../../src/utils/registered-accounts';

type TestStep = TestType<{
  page: Page;
}, {
  page: Page;
}>['step'];

// Mirror the smoke flow contract so specs can share the same fixture helpers.
type RunContextSetter = (context: Record<string, unknown>) => void;

export async function runSpreeFullCatalogCheckoutFlow(
  page: Page,
  step: TestStep,
  selection: MultiItemCheckoutSelection,
  setRunContext?: RunContextSetter
): Promise<void> {
  // Reuse the same page object model for the heavier regression scenarios.
  const customer = createCustomer('Regression');
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const homeAssertions = new HomeAssertions(page);
  const accountAssertions = new AccountAssertions(page);
  const productAssertions = new ProductAssertions(page);
  const cartAssertions = new CartAssertions(page);
  const checkoutAssertions = new CheckoutAssertions(page);
  const confirmationAssertions = new OrderConfirmationAssertions(page);

  // Persist scenario details so failed catalog runs are easier to reconstruct from artifacts.
  setRunContext?.({
    suite: 'regression',
    shippingMethod: 'Standard',
    selection,
    customer
  });

  await step('Navigate to the Spree Commerce demo store', async () => {
    await homePage.goto();
    await homeAssertions.expectStorefrontLoaded();
  });

  await step('Open the account page and register a new user', async () => {
    await homePage.openAccount();
    await accountAssertions.expectLoginPage();
    await accountPage.goToRegistration();
    await accountPage.register(customer);
    await accountAssertions.expectSignedIn(customer);
    await saveRegisteredAccount(customer, 'regression');
  });

  await step('Log out if needed and log back in with the new user', async () => {
    await accountPage.ensureSignedOut();
    await accountAssertions.expectLoginPage();
    await accountPage.login(customer.email, customer.password);
    await expect(page).toHaveURL(/\/account$/);
  });

  const addedProducts: Awaited<ReturnType<ProductPage['captureProductDetails']>>[] = [];

  await step('Add one of each configured product to the cart', async () => {
    // Loop through the configured products instead of hard-coding repeated steps in the spec.
    for (const item of selection.items) {
      await page.goto('/us/en');
      await homePage.openFeaturedProduct(item.productName);
      await productAssertions.expectLoaded(item.productName);

      if (item.color) {
        await productPage.selectColor(item.color);
      }

      await productPage.setQuantity(item.quantity);
      await productAssertions.expectQuantity(item.quantity);
      addedProducts.push(await productPage.captureProductDetails(item.color, item.quantity));
      await productPage.addToCart();
    }

    await page.goto('/us/en/cart');
  });

  await step('Verify the cart contains the configured products and proceed to checkout', async () => {
    await cartAssertions.expectProducts(addedProducts);
    await cartPage.proceedToCheckout();
    await checkoutAssertions.expectCheckoutLoaded();
  });

  await step('Complete checkout with Standard shipping', async () => {
    await checkoutPage.addShippingAddress(customer);
    await checkoutAssertions.expectDeliveryOptions();
    await checkoutPage.selectShippingMethod('Standard');
    await checkoutAssertions.expectShippingMethodSelected('Standard');
    await checkoutPage.selectPaymentMethod();
    await checkoutAssertions.expectPaymentMethodSelected();
    await checkoutAssertions.expectPaymentHintsVisible();
    await checkoutPage.fillPaymentDetailsFromHints();
    await checkoutPage.ensureSameAsShippingAddressChecked();
    await checkoutPage.placeOrder();
  });

  await step('Verify the order confirmation page', async () => {
    await confirmationAssertions.expectSuccess();
  });
}
