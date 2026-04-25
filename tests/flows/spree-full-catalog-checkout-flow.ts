import { expect, type Page, type TestType } from '@playwright/test';
import { AccountPage } from '../../src/pages/account-page';
import { CartPage } from '../../src/pages/cart-page';
import { CheckoutPage } from '../../src/pages/checkout-page';
import type { MultiItemCheckoutSelection } from '../../src/data/checkout-selections';
import { createCustomer } from '../../src/data/customer';
import { HomePage } from '../../src/pages/home-page';
import { OrderConfirmationPage } from '../../src/pages/order-confirmation-page';
import { ProductPage } from '../../src/pages/product-page';
import { saveRegisteredAccount } from '../../src/utils/registered-accounts';

type TestStep = TestType<{
  page: Page;
}, {
  page: Page;
}>['step'];

export async function runSpreeFullCatalogCheckoutFlow(
  page: Page,
  step: TestStep,
  selection: MultiItemCheckoutSelection
): Promise<void> {
  const customer = createCustomer('Regression');
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const confirmationPage = new OrderConfirmationPage(page);

  await step('Navigate to the Spree Commerce demo store', async () => {
    await homePage.goto();
  });

  await step('Open the account page and register a new user', async () => {
    await homePage.openAccount();
    await accountPage.expectLoginPage();
    await accountPage.goToRegistration();
    await accountPage.register(customer);
    await accountPage.expectSignedIn(customer);
    await saveRegisteredAccount(customer, 'regression');
  });

  await step('Log out if needed and log back in with the new user', async () => {
    await accountPage.ensureSignedOut();
    await accountPage.expectLoginPage();
    await accountPage.login(customer.email, customer.password);
    await expect(page).toHaveURL(/\/account$/);
  });

  const addedProducts: Awaited<ReturnType<ProductPage['captureProductDetails']>>[] = [];

  await step('Add one of each configured product to the cart', async () => {
    for (const item of selection.items) {
      await page.goto('/us/en');
      await homePage.openFeaturedProduct(item.productName);
      await productPage.expectLoaded(item.productName);

      if (item.color) {
        await productPage.selectColor(item.color);
      }

      await productPage.setQuantity(item.quantity);
      await productPage.expectQuantity(item.quantity);
      addedProducts.push(await productPage.captureProductDetails(item.color, item.quantity));
      await productPage.addToCart();
    }

    await page.goto('/us/en/cart');
  });

  await step('Verify the cart contains the configured products and proceed to checkout', async () => {
    await cartPage.expectProducts(addedProducts);
    await cartPage.proceedToCheckout();
  });

  await step('Complete checkout with Standard shipping', async () => {
    await checkoutPage.addShippingAddress(customer);
    await checkoutPage.verifyDeliveryOptions();
    await checkoutPage.selectShippingMethod('Standard');
    await checkoutPage.selectPaymentMethod();
    await checkoutPage.fillPaymentDetailsFromHints();
    await checkoutPage.placeOrder();
  });

  await step('Verify the order confirmation page', async () => {
    await confirmationPage.expectSuccess();
  });
}
