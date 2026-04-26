import { expect, type Page } from '@playwright/test';
import type { Customer } from '../../src/data/customer';

export class AccountAssertions {
  constructor(private readonly page: Page) {}

  async expectLoginPage(): Promise<void> {
    await expect(this.page.getByRole('main').getByText(/^my account$/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /sign in/i })).toBeVisible();
  }

  async expectSignedIn(customer: Customer): Promise<void> {
    await expect(this.page).toHaveURL(/\/account$/);
    await expect(
      this.page.getByText(new RegExp(`${customer.firstName}\\s+${customer.lastName}`, 'i'))
    ).toBeVisible();
    await expect(this.page.getByText(customer.email)).toBeVisible();
  }
}
