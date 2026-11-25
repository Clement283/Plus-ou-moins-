/**
 * Serveur des tests bout en bout : construit l'appli, repart d'une base D1 locale vide (migrations),
 * crée les comptes de test avec scripts/create-user.ts (codes écrits dans ACCOUNTS_FILE), puis lance `wrangler dev`.
 * Lancé par le `webServer` de playwright.config.ts ; SKIP_BUILD=1 réutilise apps/web/dist.
 */
import { spawn, spawnSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACCOUNTS_FILE, type Accounts } from './accounts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API = resolve(ROOT, 'apps/api');
const PORT = process.env.E2E_PORT ?? '8787';

function run(cmd: string, args: string[], cwd: string): string {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) {
    process.stderr.write(`${r.stdout}\n${r.stderr}\n`);
    throw new Error(`${cmd} ${args.join(' ')} a échoué (code ${r.status})`);
  }
  return r.stdout;
}

function createUser(name: string, role: 'eleve' | 'suiveur', follows?: string): { id: string; code: string } {
  const out = run('npx', ['tsx', 'scripts/create-user.ts', '--name', name, '--role', role, ...(follows ? ['--follows', follows] : [])], ROOT);
  const id = /id ([0-9a-f-]{36})/.exec(out)?.[1];
  const code = /: ([A-Z0-9]{8})\s*$/m.exec(out)?.[1];
  if (!id || !code) throw new Error(`Sortie de create-user inattendue :\n${out}`);
  return { id, code };
}

if (process.env.SKIP_BUILD !== '1') run('npm', ['run', 'build', '-w', 'web'], ROOT);

run('npx', ['tsx', 'scripts/embed-assets.ts'], ROOT); // la PWA est embarquée dans le Worker

// Base locale neuve : l'état local de wrangler (gitignoré) est effacé.
rmSync(resolve(API, '.wrangler/state'), { recursive: true, force: true });
run('npx', ['wrangler', 'd1', 'migrations', 'apply', 'plus-ou-moins', '--local'], API);

const lea = createUser('Léa', 'eleve');
const hugo = createUser('Hugo', 'eleve');
const claire = createUser('Claire', 'suiveur', lea.id);
const lou = createUser('Lou', 'eleve');
const accounts: Accounts = {
  lea,
  hugo,
  claire,
  noe: createUser('Noé', 'eleve'),
  maya: createUser('Maya', 'eleve'),
  ines: createUser('Inès', 'eleve'),
  jade: createUser('Jade', 'eleve'),
  lou,
  paul: createUser('Paul', 'suiveur', lou.id),
  sam: createUser('Sam', 'eleve'),
  tess: createUser('Tess', 'eleve'),
};
writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts));

const dev = spawn('npx', ['wrangler', 'dev', '--local', '--ip', '127.0.0.1', '--port', PORT], { cwd: API, stdio: 'inherit' });
const stop = () => dev.kill('SIGTERM');
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
process.on('exit', stop);
dev.on('exit', (code) => process.exit(code ?? 0));
