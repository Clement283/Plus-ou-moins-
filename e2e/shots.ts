/**
 * Captures d'écran de l'appli à 390 × 844, en clair et en sombre, pour la « revue téléphone ».
 *
 *   npm run shots -- login            un écran
 *   npm run shots -- login accueil    plusieurs
 *   npm run shots                     tous les écrans du registre
 *
 * Construit l'appli (sauf SHOTS_NO_BUILD=1), la sert avec `vite preview`, remplace `/api/*` par les
 * données de e2e/fixtures.ts (`page.route`), fixe l'horloge au 22 novembre 2026 (12 h, Paris),
 * puis enregistre une image par situation et par thème dans $SHOTS_DIR (défaut : shots/ à la racine).
 * Sort avec un code non nul si une page déborde en largeur (scrollWidth ≠ 390) ou écrit une erreur dans la console.
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLAIRE, LEA, NOW, scenario, type Fixture, type ScenarioName } from './fixtures';

// Playwright est installé globalement (NODE_PATH) : on passe par require, pas par import ESM.
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WIDTH = 390;
const HEIGHT = 844;

type Page = any; // types de playwright non installés dans le dépôt

export interface Shot {
  /** Nom de la situation (sert au nom du fichier). */
  name: string;
  /** Données de la situation ; absent = personne n'est connecté. */
  fixture?: ScenarioName;
  /** Route à ouvrir à la place de celle de l'écran. */
  route?: string;
  /** Gestes à faire après le chargement (ouvrir un volet, saisir…). */
  before?: (page: Page) => Promise<void>;
  /** Sélecteur à attendre avant la capture (défaut : le <main> de l'écran). */
  ready?: string;
  fullPage?: boolean;
}
export interface ScreenDef {
  route: string;
  scenarios: Shot[];
}

/** Registre des écrans : les tâches d'écran y ajoutent une entrée. */
export const SCREENS: Record<string, ScreenDef> = {
  login: { route: '#/', scenarios: [{ name: 'connexion' }] },
};

// --- serveur ---------------------------------------------------------------

function freePort(): Promise<number> {
  return new Promise((ok, fail) => {
    const s = createServer();
    s.once('error', fail);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address() as { port: number };
      s.close(() => ok(port));
    });
  });
}

async function startPreview(): Promise<{ url: string; stop: () => void }> {
  if (!process.env.SHOTS_NO_BUILD) {
    const b = spawnSync('npm', ['run', 'build', '-w', 'web'], { cwd: ROOT, stdio: 'inherit' });
    if (b.status !== 0) throw new Error('La construction de apps/web a échoué.');
  }
  const port = await freePort();
  const child: ChildProcess = spawn(process.execPath, [resolve(ROOT, 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: resolve(ROOT, 'apps/web'),
    stdio: 'ignore',
  });
  const url = `http://127.0.0.1:${port}`;
  const stop = () => void child.kill();
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) return { url, stop };
    } catch {
      /* pas encore prêt */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  stop();
  throw new Error('vite preview ne répond pas.');
}

// --- fausse API ------------------------------------------------------------

const json = (body: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) });

async function mockApi(page: Page, data: Fixture | null): Promise<void> {
  await page.route((u: URL) => u.pathname.startsWith('/api/'), async (route: any) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const method = req.method();
    if (!data) return route.fulfill(json({ error: 'unauthorized' }, 401));
    if (path === '/api/login' && method === 'POST') return route.fulfill(json({ token: 'tok', user: data.user }));
    if (path === '/api/events' && method === 'GET') return route.fulfill(json({ events: data.events }));
    if (path === '/api/events' && method === 'POST') {
      const body = JSON.parse(req.postData() ?? '{}') as { events?: { id: string }[] };
      return route.fulfill(json({ accepted: (body.events ?? []).map((e) => e.id) }));
    }
    if (path === '/api/students' && method === 'GET') return route.fulfill(json({ students: data.students ?? [] }));
    const m = /^\/api\/students\/([^/]+)\/events$/.exec(path);
    if (m && method === 'GET') return route.fulfill(json({ events: data.studentEvents?.[decodeURIComponent(m[1]!)] ?? [] }));
    return route.fulfill(json({ error: 'not found' }, 404));
  });
}

/** Écrit la session dans IndexedDB avant de charger l'appli (même schéma que apps/web/src/store/db.ts, version 3). */
const SEED_HTML = (user: unknown) => `<!doctype html><title>seed</title><script>
const req = indexedDB.open('pom', 3);
req.onupgradeneeded = () => {
  const db = req.result;
  for (const s of ['events', 'outbox']) { const st = db.createObjectStore(s, { keyPath: 'id' }); st.createIndex('byUser', 'userId'); }
  db.createObjectStore('session'); db.createObjectStore('progress');
};
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction('session', 'readwrite');
  tx.objectStore('session').put({ token: 'tok', user: ${JSON.stringify(user)} }, 'current');
  tx.oncomplete = () => { db.close(); document.title = 'seeded'; };
};
req.onerror = () => { document.title = 'seed-error'; };
</script>`;

// --- captures --------------------------------------------------------------

async function main(): Promise<number> {
  const asked = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const names = asked.length ? asked : Object.keys(SCREENS);
  const unknown = names.filter((n) => !SCREENS[n]);
  if (unknown.length) {
    console.error(`Écran inconnu : ${unknown.join(', ')}. Écrans connus : ${Object.keys(SCREENS).join(', ')}.`);
    return 2;
  }
  const outDir = resolve(process.env.SHOTS_DIR ?? resolve(ROOT, 'shots'));
  mkdirSync(outDir, { recursive: true });

  const preview = await startPreview();
  const browser = await chromium.launch();
  const problems: string[] = [];
  let count = 0;
  try {
    for (const screen of names) {
      const def = SCREENS[screen]!;
      for (const shot of def.scenarios) {
        const data = shot.fixture ? scenario(shot.fixture) : null;
        for (const colorScheme of ['light', 'dark'] as const) {
          const label = `${screen}-${shot.name}-${colorScheme === 'light' ? 'clair' : 'sombre'}`;
          const context = await browser.newContext({
            viewport: { width: WIDTH, height: HEIGHT },
            deviceScaleFactor: 1,
            colorScheme,
            locale: 'fr-FR',
            timezoneId: 'Europe/Paris',
            serviceWorkers: 'block',
          });
          const page = await context.newPage();
          const errors: string[] = [];
          page.on('console', (m: any) => m.type() === 'error' && errors.push(m.text()));
          page.on('pageerror', (e: Error) => errors.push(String(e)));
          try {
            await page.clock.setFixedTime(NOW);
            await mockApi(page, data);
            if (data) {
              await page.route(`${preview.url}/__seed`, (r: any) => r.fulfill({ contentType: 'text/html', body: SEED_HTML(data.user) }));
              await page.goto(`${preview.url}/__seed`);
              await page.waitForFunction(() => document.title.startsWith('seed') && document.title !== 'seed');
              if ((await page.title()) !== 'seeded') throw new Error('session non écrite');
            }
            await page.goto(`${preview.url}/${shot.route ?? def.route}`);
            await page.waitForSelector(shot.ready ?? '#root main', { timeout: 10_000 });
            await page.evaluate(() => document.fonts.ready);
            await page.waitForLoadState('networkidle');
            await shot.before?.(page);
            await page.waitForTimeout(300);
            const width = await page.evaluate(() => document.documentElement.scrollWidth);
            if (width !== WIDTH) problems.push(`${label} : scrollWidth ${width} au lieu de ${WIDTH}`);
            for (const e of errors) problems.push(`${label} : erreur console : ${e}`);
            await page.screenshot({ path: resolve(outDir, `${label}.png`), fullPage: shot.fullPage ?? false });
            count++;
            console.log(`  ${label}.png`);
          } catch (e) {
            problems.push(`${label} : ${(e as Error).message}`);
          } finally {
            await context.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
    preview.stop();
  }
  console.log(`${count} capture(s) dans ${outDir}`);
  if (problems.length) {
    console.error(`\n${problems.length} problème(s) :\n- ${problems.join('\n- ')}`);
    return 1;
  }
  return 0;
}

// `LEA` et `CLAIRE` restent exportés pour les futurs scénarios à gestes (connexion par code).
export { LEA, CLAIRE };

main().then((code) => process.exit(code), (e) => {
  console.error(e);
  process.exit(1);
});
