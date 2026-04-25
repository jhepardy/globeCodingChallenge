import { test } from '../fixtures/base-test';
import { multiItemCheckoutSelections } from '../../src/data/checkout-selections';
import { runSpreeFullCatalogCheckoutFlow } from '../flows/spree-full-catalog-checkout-flow';

// Focus this regression path on variant handling by adding each available color once.
test.describe('Spree Commerce regression checkout', () => {
  test('adds Automatic Espresso Machine in all available colors and completes checkout', async ({ page, setRunContext }) => {
    // Variant-heavy flows need a little extra time for repeated PDP interactions.
    test.setTimeout(300000);
    await runSpreeFullCatalogCheckoutFlow(page, test.step, multiItemCheckoutSelections.automaticAllColors, setRunContext);
  });
});
