# QE code challenge New

This project contains a Playwright + TypeScript UI automation suite for the 
Spree Commerce (https://demo.spreecommerce.org/)

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

Intended default:

- `npm test` runs the desktop/web project only
- mobile and tablet are run explicitly with dedicated scripts
- `:all` scripts run all configured viewports

## Common commands

```bash
# Run the default desktop/web suite
npm test
npm run test:web

# Run a specific viewport only
npm run test:mobile #Needs checking whether bug was platform side or automation, @checkout page, email is not filled up, even though run ensures login. Shipping selection doesn't load
npm run test:tablet

# Run the smoke suite
npm run test:smoke
npm run test:smoke:web
npm run test:smoke:mobile
npm run test:smoke:tablet
npm run test:smoke:all

# Run the regression suite
npm run test:regression
npm run test:regression:web
npm run test:regression:mobile
npm run test:regression:tablet
npm run test:regression:all

# Run the desktop/web smoke suite in parallel
npm run test:parallel
npm run test:parallel:4

# Run CI-style smoke checks
npm run test:ci
npm run test:ci:all

# Open the HTML report
npm run report

# Run a single shipping scenario
npx playwright test tests/smoke/spree-checkout-standard.spec.ts --project=chromium-desktop
npx playwright test tests/smoke/spree-checkout-standard.spec.ts --project=chromium-mobile-sm
npx playwright test tests/smoke/spree-checkout-standard.spec.ts --project=chromium-tablet
```

## Notes

- The suite generates a unique customer for every run, with shipping-specific identities such as `QAUser / Standard-<timestamp>` and `QAUser / Premium-<timestamp>`.
- The test uses stable labels and role-based selectors where possible.
- The default `npm test` command is intentionally conservative and runs desktop/web only.
- Mobile and tablet coverage are opt-in through their dedicated scripts so viewport-specific failures are easier to isolate.
- `test:smoke:all`, `test:regression:all`, and `test:ci:all` are the explicit multi-viewport entry points.
- `test:parallel` and `test:parallel:4` are available for faster desktop/web smoke runs.
- The live Spree demo may occasionally vary by region redirect or client-side routing behavior, so CI keeps retries enabled and stores artifacts for debugging.
