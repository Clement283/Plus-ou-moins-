import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Comptes de test créés par e2e/serve.ts (fichier hors du dépôt). */
export const ACCOUNTS_FILE = join(tmpdir(), 'pom-e2e-accounts.json');
export type Account = { id: string; code: string };
export type Accounts = { lea: Account; hugo: Account; claire: Account };

export const accounts = (): Accounts => JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf8')) as Accounts;
