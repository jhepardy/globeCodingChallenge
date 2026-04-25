import { test } from '@playwright/test';
import { multiItemCheckoutSelections } from '../../src/data/checkout-selections';
import { runSpreeFullCatalogCheckoutFlow } from '../flows/spree-full-catalog-checkout-flow';

test.describe('Spree Commerce regression checkout', () => {
  test('adds one of each configured product and completes checkout', async ({ page }) => {
    test.setTimeout(600000);
    await runSpreeFullCatalogCheckoutFlow(page, test.step, multiItemCheckoutSelections.fullCatalogCart);
  });
});
