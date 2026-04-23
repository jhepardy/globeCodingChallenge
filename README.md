# ShopSphere QA Architect Case Study

This project contains a Playwright + TypeScript UI automation suite for the Spree Commerce demo store.

## Coverage

- Navigate to the Spree demo storefront
- Register a new customer account
- Log in with the newly created user
- Browse to a product detail page
- Add the product to cart
- Validate product name, quantity, and price in cart
- Complete checkout with shipping, delivery, payment, and order placement
- Validate the order confirmation state

## Project structure

- `tests/` contains the end-to-end spec
- `src/page-objects/` contains reusable page models
- `src/test-data/` contains dynamic test data generation
- `.github/workflows/playwright.yml` enables GitHub Actions execution
- `.gitlab-ci.yml` enables GitLab CI execution

## Run locally

```bash
npm install
npx playwright install chromium
npm test
```

## Notes

- The suite generates a unique email address for every run.
- The test uses stable labels and role-based selectors where possible.
- The live Spree demo may occasionally vary by region redirect or payment widget behavior, so retries are enabled in CI.
