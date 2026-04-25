import { expect, type Page } from '@playwright/test';
import type { Customer } from '../data/customer';

export class AccountPage {
  constructor(private readonly page: Page) {}

  async expectLoginPage(): Promise<void> {
    // Scope the checks to the main content so footer links do not create selector collisions.
    await expect(this.page.getByRole('main').getByText(/^my account$/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /sign in/i })).toBeVisible();
  }

  async goToRegistration(): Promise<void> {
    await this.page.getByRole('link', { name: /sign up/i }).click();
    await expect(this.page).toHaveURL(/\/account\/register$/);
    // The first name field is a reliable signal that the registration form is ready.
    await expect(this.page.getByLabel(/first name/i)).toBeVisible();
  }

  async register(customer: Customer): Promise<void> {
    // Fill the registration form from the generated customer data.
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
    // Assert both profile fields so the test proves the newly created user is active.
    await expect(
      this.page.getByText(new RegExp(`${customer.firstName}\\s+${customer.lastName}`, 'i'))
    ).toBeVisible();
    await expect(this.page.getByText(customer.email)).toBeVisible();
  }

  async signOutIfVisible(): Promise<void> {
    // Keep this helper flexible because the demo store exposes sign-out differently across states.
    const signOutButton = this.page.getByRole('button', { name: /sign out|log out/i });
    const signOutLink = this.page.getByRole('link', { name: /sign out|log out/i });

    if (await signOutButton.isVisible().catch(() => false)) {
      await signOutButton.click();
    } else if (await signOutLink.isVisible().catch(() => false)) {
      await signOutLink.click();
    }
  }

  async ensureSignedOut(): Promise<void> {
    await this.signOutIfVisible();
    await this.page.goto('/us/en/account');

    const signInButton = this.page.getByRole('button', { name: /sign in/i });
    if (await signInButton.isVisible().catch(() => false)) {
      return;
    }

    // Fall back to clearing session state when the storefront keeps the account session active.
    await this.page.context().clearCookies();
    await this.page.goto('/us/en');
    await this.page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await this.page.goto('/us/en/account');
  }

  async login(email: string, password: string): Promise<void> {
    // Reuse the same credentials to prove the new account can authenticate again.
    await this.page.getByLabel(/^email$/i).fill(email);
    await this.page.getByLabel(/^password$/i).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
