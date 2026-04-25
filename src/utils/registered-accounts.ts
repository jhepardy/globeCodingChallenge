import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Customer } from '../data/customer';

type RegisteredAccount = Customer & {
  scenario: string;
  registeredAt: string;
};

// Persist created accounts per run so failed demos can be retried with known credentials if needed.
const registeredAccountsFile = path.resolve(process.cwd(), 'test-results', 'registered-accounts.json');

export async function saveRegisteredAccount(customer: Customer, scenario: string): Promise<void> {
  // Ensure the results folder exists before we append a new registered account entry.
  await mkdir(path.dirname(registeredAccountsFile), { recursive: true });

  const entry: RegisteredAccount = {
    ...customer,
    scenario,
    registeredAt: new Date().toISOString()
  };

  let existingAccounts: RegisteredAccount[] = [];

  try {
    // Reuse the existing JSON history when multiple tests run in the same suite.
    const existingContent = await readFile(registeredAccountsFile, 'utf8');
    existingAccounts = JSON.parse(existingContent) as RegisteredAccount[];
  } catch (error) {
    const fileMissing = (error as NodeJS.ErrnoException).code === 'ENOENT';

    if (!fileMissing) {
      throw error;
    }
  }

  // Append rather than overwrite so every generated account remains traceable in artifacts.
  existingAccounts.push(entry);
  await writeFile(registeredAccountsFile, JSON.stringify(existingAccounts, null, 2));
}
