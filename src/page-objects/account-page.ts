import { expect, type Page } from '@playwright/test';
import type { Customer } from '../test-data/customer';

export class AccountPage {
  constructor(private readonly page: Page) {}

  async expectLoginPage(): Promise<void> {
    await expect(this.page.getByRole('main').getByText(/^my account$/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /sign in/i })).toBeVisible();
  }

  async goToRegistration(): Promise<void> {
    await this.page.getByRole('link', { name: /sign up/i }).click();
    await expect(this.page).toHaveURL(/\/account\/register$/);
    await expect(this.page.getByLabel(/first name/i)).toBeVisible();
  }

  async register(customer: Customer): Promise<void> {
    await this.page.getByLabel(/first name/i).fill(customer.firstName);
    await this.page.getByLabel(/last name/i).fill(customer.lastName);
    await this.page.getByLabel(/^email$/i).fill(customer.email);
    await this.page.getByLabel(/^password$/i).fill(customer.password);
    await this.page.getByLabel(/confirm password/i).fill(customer.password);
    await this.page.getByRole('checkbox').check();
    await this.page.getByRole('button', { name: /create account/i }).click();
  }

  async expectSignedIn(customer: Customer): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/account$/);
    await expect(
      this.page.getByText(new RegExp(`${customer.firstName}\\s+${customer.lastName}`, 'i'))
    ).toBeVisible();
    await expect(this.page.getByText(customer.email)).toBeVisible();
  }

  async signOutIfVisible(): Promise<void> {
    const signOutButton = this.page.getByRole('button', { name: /sign out|log out/i });
    const signOutLink = this.page.getByRole('link', { name: /sign out|log out/i });

    if (await signOutButton.isVisible().catch(() => false)) {
      await signOutButton.click();
    } else if (await signOutLink.isVisible().catch(() => false)) {
      await signOutLink.click();
    }
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByLabel(/^email$/i).fill(email);
    await this.page.getByLabel(/^password$/i).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
