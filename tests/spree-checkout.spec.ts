import { expect, test } from '@playwright/test';
import { AccountPage } from '../src/page-objects/account-page';
import { CartPage } from '../src/page-objects/cart-page';
import { CheckoutPage } from '../src/page-objects/checkout-page';
import { HomePage } from '../src/page-objects/home-page';
import { OrderConfirmationPage } from '../src/page-objects/order-confirmation-page';
import { ProductPage } from '../src/page-objects/product-page';
import { createCustomer } from '../src/test-data/customer';

test.describe('Spree Commerce demo checkout', () => {
  test('registers, logs in, purchases a product, and confirms the order', async ({ page }) => {
    // The live demo can be slow during checkout and Stripe initialization.
    test.setTimeout(120000);

    // Generate a fresh shopper so repeated runs do not collide on existing accounts.
    const customer = createCustomer();
    const homePage = new HomePage(page);
    const accountPage = new AccountPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const confirmationPage = new OrderConfirmationPage(page);
    const productName = 'Automatic Espresso Machine';

    await test.step('Navigate to the Spree Commerce demo store', async () => {
      await homePage.goto();
    });

    await test.step('Open the account page and register a new user', async () => {
      await homePage.openAccount();
      await accountPage.expectLoginPage();
      await accountPage.goToRegistration();
      await accountPage.register(customer);
      await accountPage.expectSignedIn(customer);
    });

    await test.step('Log out if needed and log back in with the new user', async () => {
      // Clear browser state to force a clean login without depending on a fragile logout widget.
      await page.context().clearCookies();
      await page.goto('/us/en');
      await page.evaluate(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      });
      await page.goto('/us/en/account');
      await accountPage.expectLoginPage();
      await accountPage.login(customer.email, customer.password);
      await expect(page).toHaveURL(/\/account$/);
    });

    await test.step('Browse products and open the product detail page', async () => {
      await page.goto('/us/en');
      await homePage.openFeaturedProduct(productName);
      await productPage.expectLoaded(productName);
    });

    let productDetails: Awaited<ReturnType<ProductPage['captureProductDetails']>>;

    await test.step('Add the product to the cart', async () => {
      // Store the product values before navigation so cart assertions use the same source values.
      productDetails = await productPage.captureProductDetails();
      await productPage.addToCart();
      await productPage.openCart();
    });

    await test.step('Verify cart product details and proceed to checkout', async () => {
      await cartPage.expectProduct(productDetails);
      await cartPage.proceedToCheckout();
    });

    await test.step('Complete shipping, delivery, payment, and place the order', async () => {
      await checkoutPage.addShippingAddress();
      await checkoutPage.verifyDeliveryOptions();
      await checkoutPage.selectShippingMethod();
      await checkoutPage.selectPaymentMethod();
      await checkoutPage.fillPaymentDetailsFromHints();
      await checkoutPage.placeOrder();
    });

    await test.step('Verify the order confirmation page', async () => {
      await confirmationPage.expectSuccess();
    });
  });
});
