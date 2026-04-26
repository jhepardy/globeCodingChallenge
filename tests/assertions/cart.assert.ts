import { expect, type Locator, type Page } from '@playwright/test';

type ProductDetails = {
  name: string;
  color?: string;
  quantity: number;
  priceText: string;
};

export class CartAssertions {
  constructor(private readonly page: Page) {}

  private main(): Locator {
    return this.page.getByRole('main');
  }

  async expectProduct(details: ProductDetails): Promise<void> {
    const actualItems = await this.readCartItems();
    const matchingIndex = this.findMatchingCartItemIndex(actualItems, details);

    expect(
      matchingIndex,
      `Expected cart to contain "${details.name}"${details.color ? ` in ${details.color}` : ''} with quantity ${details.quantity}.`
    ).toBeGreaterThan(-1);

    expect(
      actualItems[matchingIndex]?.priceText,
      `Expected "${details.name}" to show price ${details.priceText} in the cart.`
    ).toContain(details.priceText);
  }

  async expectProducts(detailsList: ProductDetails[]): Promise<void> {
    const unmatchedItems = [...await this.readCartItems()];

    for (const details of detailsList) {
      const matchingRowIndex = this.findMatchingCartItemIndex(unmatchedItems, details);

      expect(
        matchingRowIndex,
        `Expected cart to contain "${details.name}"${details.color ? ` in ${details.color}` : ''} with quantity ${details.quantity}.`
      ).toBeGreaterThan(-1);

      unmatchedItems.splice(matchingRowIndex, 1);
    }
  }

  private findMatchingCartItemIndex(actualItems: ProductDetails[], expectedItem: ProductDetails): number {
    return actualItems.findIndex((item) => {
      const nameMatches = item.name === expectedItem.name;
      const colorMatches = !expectedItem.color || item.color === expectedItem.color;
      const quantityMatches = item.quantity === expectedItem.quantity;

      return nameMatches && colorMatches && quantityMatches;
    });
  }

  private async readCartItems(): Promise<ProductDetails[]> {
    const main = this.main();
    await expect(main.getByRole('heading', { name: /shopping cart/i })).toBeVisible();

    const cartItems = await main.locator('h3').evaluateAll((headings) => {
      const normalize = (value: string | null | undefined) => value?.replace(/\s+/g, ' ').trim() ?? '';

      return headings
        .map((heading) => {
          let row: HTMLElement | null = heading.parentElement;

          while (row && row !== document.body) {
            const hasRemoveButton = Boolean(row.querySelector('button[aria-label^="Remove "]'));
            const hasQuantityControls = Boolean(row.querySelector('button[aria-label="Increase quantity"]'));

            if (hasRemoveButton && hasQuantityControls) {
              break;
            }

            row = row.parentElement;
          }

          if (!row) {
            return null;
          }

          const name = normalize(heading.textContent);
          const colorLabel = normalize(
            Array.from(row.querySelectorAll('p'))
              .map((paragraph) => paragraph.textContent)
              .find((text) => /^Color:/i.test(normalize(text)))
          );
          const quantityText = normalize(row.querySelector('button[aria-label="Decrease quantity"] + span')?.textContent);
          const priceCandidates = Array.from(row.querySelectorAll('p, span'))
            .map((node) => normalize(node.textContent))
            .filter((text) => /\$\d[\d,]*\.\d{2}/.test(text))
            .map((text) => (text.match(/\$\d[\d,]*\.\d{2}/) ?? [''])[0])
            .filter(Boolean);

          if (!name) {
            return null;
          }

          return {
            name,
            color: colorLabel.replace(/^Color:\s*/i, '').trim(),
            quantity: Number(quantityText),
            priceText: priceCandidates.at(-1) ?? ''
          };
        })
        .filter((item): item is { name: string; color: string; quantity: number; priceText: string } => Boolean(item));
    });

    return cartItems;
  }
}
