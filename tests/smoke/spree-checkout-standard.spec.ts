import { test } from '../fixtures/base-test';
import { checkoutSelections } from '../../src/data/checkout-selections';
import { runSpreeCheckoutFlow } from '../flows/spree-checkout-flow';

// Keep the public smoke entrypoint tiny and delegate the browser work to the shared flow.
test.describe('Spree Commerce smoke checkout', () => {
  test('registers, logs in, purchases a product, and confirms the order with Standard shipping', async ({ page, setRunContext }) => {
    // Allow enough time for the full live registration and checkout journey.
    test.setTimeout(120000);
    await runSpreeCheckoutFlow(page, test.step, 'Standard', checkoutSelections.automaticStandard, setRunContext);
  });
});
