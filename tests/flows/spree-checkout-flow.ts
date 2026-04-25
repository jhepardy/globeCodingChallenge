import { expect, type Page, type TestType } from '@playwright/test';
import { AccountPage } from '../../src/pages/account-page';
import { CartPage } from '../../src/pages/cart-page';
import { CheckoutPage } from '../../src/pages/checkout-page';
import type { CheckoutSelection } from '../../src/data/checkout-selections';
import { createCustomer } from '../../src/data/customer';
import { HomePage } from '../../src/pages/home-page';
import { OrderConfirmationPage } from '../../src/pages/order-confirmation-page';
import { ProductPage } from '../../src/pages/product-page';
import { saveRegisteredAccount } from '../../src/utils/registered-accounts';

type ShippingMethod = 'Standard' | 'Premium';

type TestStep = TestType<{
  page: Page;
}, {
  page: Page;
}>['step'];

type RunContextSetter = (context: Record<string, unknown>) => void;

export async function runSpreeCheckoutFlow(
  page: Page,
  step: TestStep,
  shippingMethod: ShippingMethod,
  selection: CheckoutSelection,
  setRunContext?: RunContextSetter
): Promise<void> {
  const customer = createCustomer(shippingMethod);
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const confirmationPage = new OrderConfirmationPage(page);

  setRunContext?.({
    suite: 'smoke',
    shippingMethod,
    selection,
    customer
  });

  await step('Navigate to the Spree Commerce demo store', async () => {
    await homePage.goto();
  });

  await step('Open the account page and register a new user', async () => {
    await homePage.openAccount();
    await accountPage.expectLoginPage();
    await accountPage.goToRegistration();
    await accountPage.register(customer);
    await accountPage.expectSignedIn(customer);
    await saveRegisteredAccount(customer, `smoke-${shippingMethod.toLowerCase()}`);
  });

  await step('Log out if needed and log back in with the new user', async () => {
    await accountPage.ensureSignedOut();
    await accountPage.expectLoginPage();
    await accountPage.login(customer.email, customer.password);
    await expect(page).toHaveURL(/\/account$/);
  });

  await step('Browse products and open the product detail page', async () => {
    await page.goto('/us/en');
    await homePage.openFeaturedProduct(selection.productName);
    await productPage.expectLoaded(selection.productName);
  });

  let productDetails: Awaited<ReturnType<ProductPage['captureProductDetails']>>;

  await step(`Select product options and add ${selection.productName} to the cart`, async () => {
    await productPage.selectColor(selection.color);
    await productPage.setQuantity(selection.quantity);
    productDetails = await productPage.captureProductDetails(selection.color, selection.quantity);
    await productPage.addToCart();
    await productPage.openCart();
  });

  await step('Verify cart product details and proceed to checkout', async () => {
    await cartPage.expectProduct(productDetails);
    await cartPage.proceedToCheckout();
  });

  await step(`Complete checkout with ${shippingMethod} shipping`, async () => {
    await checkoutPage.addShippingAddress(customer);
    await checkoutPage.verifyDeliveryOptions();
    await checkoutPage.selectShippingMethod(shippingMethod);
    await checkoutPage.selectPaymentMethod();
    await checkoutPage.fillPaymentDetailsFromHints();
    await checkoutPage.placeOrder();
  });

  await step('Verify the order confirmation page', async () => {
    await confirmationPage.expectSuccess();
  });
}
