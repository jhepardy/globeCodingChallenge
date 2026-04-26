# Selector Review Against Live Demo Site

Inspected on: 2026-04-26
Demo site: `https://demo.spreecommerce.org/us/en`
Viewports checked:
- Desktop Chromium `1440x1100`
- Mobile Chromium emulation `375x812`

Legend:
- `Yes`: a practical user-level counterpart exists on the live demo
- `Partial`: there is some user-level signal, but it is broader or less reliable than the current DOM selector
- `No`: no clear user-level counterpart was found during inspection
- `None found`: no `data-testid` counterpart was found on the live demo page during inspection

## Home Page

| File | Current DOM-level selector | Purpose | User-level counterpart on live site? | User-level counterpart found | Test-level counterpart? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `src/pages/home-page.ts` | `img[alt="${productName}"]` | Find product card/image in listing | Yes | `getByRole('img', { name: productName })` or use it indirectly inside a link filter | None found | The product image alt exists and matched `Automatic Espresso Machine` on the live listing. |
| `src/pages/home-page.ts` | `a[href*="/products/"]` filtered by heading | Open PDP from listing card | Partial | `getByRole('link', { name: /Automatic Espresso Machine/i })` may work only if the accessible name includes card text | None found | On the inspected listing, heading-based lookup did **not** resolve for `Automatic Espresso Machine`, while the image-based link did. |
| `src/pages/home-page.ts` | `a[href*="/products/"]` filtered by image | Open PDP from listing card | Partial | `getByRole('link', { name: /Automatic Espresso Machine/i })` if the card/link accessible name is stable | None found | The image-based link exists and currently works better than the heading path. |
| `src/pages/home-page.ts` | `button[aria-label*="menu" i], button[title*="menu" i]` | Fallback open mobile/tablet navigation | Yes | `getByRole('button', { name: /menu|open menu|navigation/i })` and `getByLabel(/menu|open menu|navigation/i)` | None found | On mobile, both role/label alternatives exist; the DOM fallback is not the only option. |

## Mobile Home Page

| File | Current DOM-level selector | Purpose | User-level counterpart on live site? | User-level counterpart found | Test-level counterpart? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `src/pages/mobile-home-page.ts` | `img[alt="${productName}"]` | Find product card/image in mobile listing | Yes | `getByRole('img', { name: productName })` | None found | Same finding as desktop listing. |
| `src/pages/mobile-home-page.ts` | `a[href*="/products/"]` filtered by heading | Open PDP from mobile listing card | Partial | Possible role-based link by accessible name if stable | None found | Not verified as a reliable live counterpart for `Automatic Espresso Machine`. |
| `src/pages/mobile-home-page.ts` | `a[href*="/products/"]` filtered by image | Open PDP from mobile listing card | Partial | Possible role-based link by accessible name if stable | None found | The current DOM path is still the more concrete one from observed behavior. |
| `src/pages/mobile-home-page.ts` | `button[aria-label*="menu" i], button[title*="menu" i]` | Fallback open mobile navigation | Yes | `getByRole('button', { name: /menu|open menu|navigation/i })` and `getByLabel(/menu|open menu|navigation/i)` | None found | Mobile menu button had both role and label-based matches. |

## Product Page

| File | Current DOM-level selector | Purpose | User-level counterpart on live site? | User-level counterpart found | Test-level counterpart? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `src/pages/product-page.ts` | `xpath=preceding-sibling::span[1]` from increase button | Read current quantity | Partial | `getByRole('spinbutton')` would be ideal, but not observed; visible quantity text exists near controls | None found | The current quantity text exists, but no stronger accessible control was confirmed from the live page. |
| `src/pages/product-page.ts` | `button[title="${colorName}"]` | Select color swatch | Yes | `getByRole('button', { name: /Silver/i })` | None found | The live PDP exposed a role-based button name for color (`Silver`). |

## Cart Page

| File | Current DOM-level selector | Purpose | User-level counterpart on live site? | User-level counterpart found | Test-level counterpart? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `src/pages/cart-page.ts` | `locator('h3').evaluateAll(...)` | Gather cart item rows | Partial | `getByRole('heading', { name: /Automatic Espresso Machine/i })` exists for the product name | None found | Product heading exists on the cart page, but not enough by itself to replace the full row parsing logic. |
| `src/pages/cart-page.ts` | `heading.parentElement` walk-up | Find owning row container | No | No clear row-level accessible container was confirmed | None found | This is structural DOM traversal, not mirrored by a visible semantic container in the inspected cart. |
| `src/pages/cart-page.ts` | `button[aria-label^="Remove "]` | Detect/remove item row | Yes | `getByRole('button', { name: /^Remove /i })` | None found | A role-based remove button exists on the live cart. |
| `src/pages/cart-page.ts` | `button[aria-label="Increase quantity"]` | Detect quantity controls for row parsing | Yes | `getByRole('button', { name: /increase quantity/i })` | None found | Two matching buttons were present on the inspected cart page. |
| `src/pages/cart-page.ts` | `querySelectorAll('p')` to find `Color:` text | Extract color from row | Partial | `getByText(/^Color:/i)` exists as visible text | None found | Visible text exists, but row-scoped extraction still needs container logic. |
| `src/pages/cart-page.ts` | `button[aria-label="Decrease quantity"] + span` | Read quantity text | Partial | Quantity is visible to users, but no strong accessible quantity value control was confirmed | None found | The DOM selector currently gives a precise quantity value; no cleaner accessible equivalent was confirmed. |
| `src/pages/cart-page.ts` | `querySelectorAll('p, span')` for price scan | Extract row price | Partial | Visible price text exists; heading and summary text are user-visible | None found | Price text is present, but row-scoped price extraction still depends on structure. |

## Checkout Page

| File | Current DOM-level selector | Purpose | User-level counterpart on live site? | User-level counterpart found | Test-level counterpart? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `src/pages/checkout-page.ts` | `locator('section, div').filter({ has: getByText(/^shipping method$/i) })` | Find shipping method section container | Partial | `getByText(/^shipping method$/i)` exists | None found | The text exists once, but filtering `section, div` matched multiple containers (`8` in inspection), so the current DOM scoping is still broad. |
| `src/pages/checkout-page.ts` | `frameLocator('iframe[src*="componentName=payment"]')` | Find payment iframe | Partial | No user-level iframe label was confirmed; iframe source pattern exists | None found | Payment iframe exists once, but this is still DOM-level infrastructure. |
| `src/pages/checkout-page.ts` | `locator('label, [role="radio"]')` filtered by price text | Gather shipping options | Yes | `getByRole('radio', { name: /Standard/i })` and `getByRole('radio', { name: /Premium/i })` | None found | Individual shipping radios already have accessible names. |
| `src/pages/checkout-page.ts` | `locator('body').innerText()` | Poll whole page for shipping availability/pricing | Partial | Could poll scoped visible text like `getByText(/^shipping method$/i)` plus radio visibility | None found | This is broad DOM scraping; there are user-level signals, but they may not cover every fallback message. |
| `src/pages/checkout-page.ts` | `locator('#checkout-section-payment')` | Scope payment section | Partial | Payment section contains visible `Credit card` text and a radio | None found | The section id exists, but there is not an obviously stronger section-level accessible landmark confirmed. |
| `src/pages/checkout-page.ts` | `locator('[data-state="checked"], [data-state="unchecked"]')` | Identify rendered payment radio wrapper | Partial | `getByRole('radio')` exists | None found | The `data-state` markers are implementation detail; the user-level radio exists. |
| `src/pages/checkout-page.ts` | `locator('iframe[src*="componentName=payment"]')` | Assert payment iframe visible | Partial | No user-level iframe selector confirmed | None found | Same finding as the frame locator above. |
| `src/pages/checkout-page.ts` | `input[name="number"], #payment-numberInput` inside iframe | Card number field | Yes | `getByLabel(/card number/i)` | None found | Live Stripe iframe exposed a label-based card number field. |
| `src/pages/checkout-page.ts` | `input[name="expiry"], input[autocomplete="cc-exp"]` inside iframe | Expiry field | Yes | `getByLabel(/expiration|expiry/i)` | None found | Live Stripe iframe exposed a label-based expiry field. |
| `src/pages/checkout-page.ts` | `input[name="cvc"], input[autocomplete="cc-csc"]` inside iframe | CVC field | No | No label-based CVC field was found during inspection | None found | DOM-level selector still appears necessary for this field on the current demo. |

## Fixtures / Diagnostics

| File | Current DOM-level selector | Purpose | User-level counterpart on live site? | User-level counterpart found | Test-level counterpart? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `tests/fixtures/base-test.ts` | `locator('body')` | Fallback artifact capture for full page text | No | Not applicable | None found | This is diagnostic capture, so a DOM-level fallback is reasonable here. |

## Summary

| Category | Result |
| --- | --- |
| `data-testid` usage on inspected live pages | None found |
| DOM selectors with clear user-level replacements | Mobile menu button, color swatch button, remove button, quantity increment button, shipping radios, card number field, expiry field |
| DOM selectors with only partial user-level coverage | Product listing link/card lookup, product quantity value, cart row parsing, shipping section scoping, payment section scoping, payment iframe scoping, whole-page shipping polling |
| DOM selectors that still appear necessary on current live demo | Cart row container traversal, CVC iframe field, some row-scoped extraction details |
