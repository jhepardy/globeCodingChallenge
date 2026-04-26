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
import type { CheckoutSelection } from '../../src/data/checkout-selections';
import { createCustomer } from '../../src/data/customer';
import { HomePage } from '../../src/pages/home-page';
import { MobileHomePage } from '../../src/pages/mobile-home-page';
import { ProductPage } from '../../src/pages/product-page';
import { saveRegisteredAccount } from '../../src/utils/registered-accounts';

type ShippingMethod = 'Standard' | 'Premium';

type TestStep = TestType<{
  page: Page;
}, {
  page: Page;
}>['step'];

// Let the fixture store scenario metadata without coupling the flow to a specific reporter.
type RunContextSetter = (context: Record<string, unknown>) => void;

export async function runSpreeCheckoutFlow(
  page: Page,
  step: TestStep,
  shippingMethod: ShippingMethod,
  selection: CheckoutSelection,
  setRunContext?: RunContextSetter
): Promise<void> {
  // Build all page models up front so the flow reads like the business journey.
  const customer = createCustomer(shippingMethod);
  const homePage = page.viewportSize()?.width === 375 ? new MobileHomePage(page) : new HomePage(page);
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

  // Capture enough run metadata to troubleshoot failures after the browser closes.
  setRunContext?.({
    suite: 'smoke',
    shippingMethod,
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
    await saveRegisteredAccount(customer, `smoke-${shippingMethod.toLowerCase()}`);
  });

  await step('Log out if needed and log back in with the new user', async () => {
    await accountPage.ensureSignedOut();
    await accountAssertions.expectLoginPage();
    await accountPage.login(customer.email, customer.password);
    await expect(page).toHaveURL(/\/account$/);
  });

  await step('Browse products and open the product detail page', async () => {
    await page.goto('/us/en');
    await homePage.openFeaturedProduct(selection.productName);
    await productAssertions.expectLoaded(selection.productName);
  });

  let productDetails: Awaited<ReturnType<ProductPage['captureProductDetails']>>;

  await step(`Select product options and add ${selection.productName} to the cart`, async () => {
    // Save the exact PDP state before the cart reshapes product data into a summary row.
    await productPage.selectColor(selection.color);
    await productPage.setQuantity(selection.quantity);
    productDetails = await productPage.captureProductDetails(selection.color, selection.quantity);
    await productPage.addToCart();
    await productPage.openCart();
  });

  await step('Verify cart product details and proceed to checkout', async () => {
    await cartAssertions.expectProduct(productDetails);
    await cartPage.proceedToCheckout();
    await checkoutAssertions.expectCheckoutLoaded();
  });

  await step(`Complete checkout with ${shippingMethod} shipping`, async () => {
    await checkoutPage.addShippingAddress(customer);
    await checkoutAssertions.expectDeliveryOptions();
    await checkoutPage.selectShippingMethod(shippingMethod);
    await checkoutAssertions.expectShippingMethodSelected(shippingMethod);
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
