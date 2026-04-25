# ShopSphere QA Architect Case Study

This project contains a Playwright + TypeScript UI automation suite for the Spree Commerce demo store.

## Coverage

- Navigate to the Spree demo storefront
- Register a new customer account
- Log in with the newly created user
- Browse to a product detail page
- Add the product to cart
- Validate product name, quantity, and price in cart
- Complete checkout with Standard and Premium shipping, payment, and order placement
- Validate the order confirmation state

## Project structure

- `tests/flows/` contains the shared end-to-end checkout flow
- `tests/smoke/` contains the runnable smoke specs for Standard and Premium shipping
- `tests/fixtures/` contains shared Playwright test setup
- `src/pages/` contains reusable page models
- `src/components/` is reserved for reusable UI parts extracted from pages when needed
- `src/data/` contains dynamic test data generation
- `src/utils/` is reserved for shared framework utilities
- `.github/workflows/playwright.yml` enables GitHub Actions execution
- `.gitlab-ci.yml` enables GitLab CI execution

## Run locally

```bash
npm install
npx playwright install chromium
npm test
```

## Common commands

```bash
# Run the smoke suite only
npm run test:smoke

# Run the smoke suite in parallel
npm run test:parallel
npm run test:parallel:4

# Run a single shipping scenario
npx playwright test tests/smoke/spree-checkout-standard.spec.ts
npx playwright test tests/smoke/spree-checkout-premium.spec.ts

# Run in CI-style headless mode
CI=1 npm run test:ci
```

## Notes

- The suite generates a unique customer for every run, with shipping-specific identities such as `QAUser / Standard-<timestamp>` and `QAUser / Premium-<timestamp>`.
- The test uses stable labels and role-based selectors where possible.
- The default `npm test` command keeps execution conservative, while `test:parallel` and `test:parallel:4` are available for faster smoke runs.
- The live Spree demo may occasionally vary by region redirect or client-side routing behavior, so CI keeps retries enabled and stores artifacts for debugging.
