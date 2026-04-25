import { test } from '../fixtures/base-test';
import { multiItemCheckoutSelections } from '../../src/data/checkout-selections';
import { runSpreeFullCatalogCheckoutFlow } from '../flows/spree-full-catalog-checkout-flow';

// Use a wider regression scenario to validate cart behavior with many catalog items.
test.describe('Spree Commerce regression checkout', () => {
  test('adds one of each configured product and completes checkout', async ({ page, setRunContext }) => {
    // This suite intentionally allows more time because it walks a long product list.
    test.setTimeout(600000);
    await runSpreeFullCatalogCheckoutFlow(page, test.step, multiItemCheckoutSelections.fullCatalogCart, setRunContext);
  });
});
