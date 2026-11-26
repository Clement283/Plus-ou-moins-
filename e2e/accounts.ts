import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Comptes de test créés par e2e/serve.ts (fichier hors du dépôt). */
export const ACCOUNTS_FILE = join(tmpdir(), 'pom-e2e-accounts.json');
export type Account = { id: string; code: string };
/** Léa, Hugo et Claire : eleve.spec, offline.spec, resultat.spec, suivi.spec. Les autres : un compte neuf par parcours (voir serve.ts). */
export type Accounts = {
  lea: Account;
  hugo: Account;
  claire: Account;
  noe: Account; // cours0.spec : Cours 0 en entier
  maya: Account; // cours0.spec : Cours 0 raté
  ines: Account; // cours1.spec : Cours 1 en entier (Cours 0 déjà validé)
  jade: Account; // cours1.spec : Cours 1 raté
  lou: Account; // fonctions.spec : fiche, Clément, Écouter
  paul: Account; // suiveur de Lou
  sam: Account; // fonctions.spec : échauffement répondu (Cours 0 déjà validé)
  tess: Account; // fonctions.spec : échauffement passé
  apercu: Account; // tous-les-cours.spec : compte « aperçu », tous les cours ouverts
};

export const accounts = (): Accounts => JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf8')) as Accounts;
