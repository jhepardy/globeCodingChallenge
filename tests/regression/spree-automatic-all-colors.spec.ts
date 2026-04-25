import { test } from '@playwright/test';
import { multiItemCheckoutSelections } from '../../src/data/checkout-selections';
import { runSpreeFullCatalogCheckoutFlow } from '../flows/spree-full-catalog-checkout-flow';

test.describe('Spree Commerce regression checkout', () => {
  test('adds Automatic Espresso Machine in all available colors and completes checkout', async ({ page }) => {
    test.setTimeout(300000);
    await runSpreeFullCatalogCheckoutFlow(page, test.step, multiItemCheckoutSelections.automaticAllColors);
  });
});
