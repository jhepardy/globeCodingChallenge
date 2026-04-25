import { test } from '../fixtures/base-test';
import { checkoutSelections } from '../../src/data/checkout-selections';
import { runSpreeCheckoutFlow } from '../flows/spree-checkout-flow';

test.describe('Spree Commerce smoke checkout', () => {
  test('registers, logs in, purchases a product, and confirms the order with Premium shipping', async ({ page, setRunContext }) => {
    test.setTimeout(120000);
    await runSpreeCheckoutFlow(page, test.step, 'Premium', checkoutSelections.automaticPremium, setRunContext);
  });
});
