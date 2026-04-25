import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Customer } from '../data/customer';

type RegisteredAccount = Customer & {
  scenario: string;
  registeredAt: string;
};

const registeredAccountsFile = path.resolve(process.cwd(), 'test-results', 'registered-accounts.json');

export async function saveRegisteredAccount(customer: Customer, scenario: string): Promise<void> {
  await mkdir(path.dirname(registeredAccountsFile), { recursive: true });

  const entry: RegisteredAccount = {
    ...customer,
    scenario,
    registeredAt: new Date().toISOString()
  };

  let existingAccounts: RegisteredAccount[] = [];

  try {
    const existingContent = await readFile(registeredAccountsFile, 'utf8');
    existingAccounts = JSON.parse(existingContent) as RegisteredAccount[];
  } catch (error) {
    const fileMissing = (error as NodeJS.ErrnoException).code === 'ENOENT';

    if (!fileMissing) {
      throw error;
    }
  }

  existingAccounts.push(entry);
  await writeFile(registeredAccountsFile, JSON.stringify(existingAccounts, null, 2));
}
