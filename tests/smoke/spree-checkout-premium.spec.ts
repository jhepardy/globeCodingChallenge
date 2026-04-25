import { test } from '../fixtures/base-test';
import { checkoutSelections } from '../../src/data/checkout-selections';
import { runSpreeCheckoutFlow } from '../flows/spree-checkout-flow';

// Reuse the same smoke flow with a different data set to cover premium delivery selection.
test.describe('Spree Commerce smoke checkout', () => {
  test('registers, logs in, purchases a product, and confirms the order with Premium shipping', async ({ page, setRunContext }) => {
    // The live checkout can take a while when shipping and payment widgets finish loading.
    test.setTimeout(120000);
    await runSpreeCheckoutFlow(page, test.step, 'Premium', checkoutSelections.automaticPremium, setRunContext);
  });
});
