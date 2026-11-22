/**
 * Crée un utilisateur et affiche son code UNE SEULE FOIS (seul le hachage SHA-256 est stocké).
 *   npx tsx scripts/create-user.ts --name Alice --role eleve [--remote]
 *   npx tsx scripts/create-user.ts --name Prof --role suiveur --follows <eleveId> [--remote]
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Sans caractères ambigus : ni 0/O, ni 1/I/L.
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 8;

export function generateCode(random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  // Rejet des octets >= plus grand multiple de la taille de l'alphabet : tirage uniforme.
  const limit = 256 - (256 % CODE_ALPHABET.length);
  let out = '';
  while (out.length < CODE_LENGTH) {
    for (const b of random(CODE_LENGTH * 2)) {
      if (b < limit && out.length < CODE_LENGTH) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
    }
  }
  return out;
}

export async function sha256Hex(s: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const sqlString = (s: string): string => `'${s.replaceAll("'", "''")}'`;

export type NewUser = { id: string; name: string; role: 'eleve' | 'suiveur'; codeHash: string; createdAt: number; follows?: string };

export function buildInsertSql(u: NewUser): string {
  const stmts = [
    `INSERT INTO users (id, name, role, code_hash, created_at) VALUES (${sqlString(u.id)}, ${sqlString(u.name)}, ${sqlString(u.role)}, ${sqlString(u.codeHash)}, ${Math.trunc(u.createdAt)});`,
  ];
  if (u.follows) {
    stmts.push(`INSERT INTO follows (suiveur_id, eleve_id) VALUES (${sqlString(u.id)}, ${sqlString(u.follows)});`);
  }
  return stmts.join(' ');
}

export type Args = { name: string; role: 'eleve' | 'suiveur'; follows?: string; remote: boolean };

export function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const name = get('--name')?.trim();
  const role = get('--role');
  const follows = get('--follows');
  if (!name) throw new Error('--name requis');
  if (role !== 'eleve' && role !== 'suiveur') throw new Error("--role doit valoir 'eleve' ou 'suiveur'");
  if (follows !== undefined && (role !== 'suiveur' || !follows || follows.startsWith('--'))) {
    throw new Error("--follows <eleveId> s'utilise avec --role suiveur");
  }
  return { name, role, follows, remote: argv.includes('--remote') };
}

const DB_NAME = 'plus-ou-moins';

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const code = generateCode();
  const id = crypto.randomUUID();
  const sql = buildInsertSql({
    id,
    name: args.name,
    role: args.role,
    codeHash: await sha256Hex(code),
    createdAt: Date.now(),
    follows: args.follows,
  });
  execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', DB_NAME, args.remote ? '--remote' : '--local', '--command', sql],
    { stdio: 'inherit', cwd: new URL('../apps/api', import.meta.url).pathname },
  );
  console.log(`\nUtilisateur créé : ${args.name} (${args.role}), id ${id}`);
  console.log(`Code de connexion (affiché une seule fois) : ${code}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
