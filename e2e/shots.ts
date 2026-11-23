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
import { DB_NAME, DB_SCHEMA, DB_VERSION, SESSION_KEY, SESSION_STORE, type Session } from '../apps/web/src/store/db';
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
  /** Erreurs de console attendues dans cette situation (ex. le 401 d'un code inconnu). */
  expectedConsole?: RegExp;
}
export interface ScreenDef {
  route: string;
  scenarios: Shot[];
}

/** Tape un code dans le champ de connexion (au clavier, comme elle) ; `submit` appuie sur « Entrer ». */
async function typeCode(page: Page, code: string, submit = false): Promise<void> {
  await page.click('.field__code');
  await page.keyboard.type(code);
  if (submit) await page.click('button[type=submit]');
}

/** Touche les touches du clavier maths, dans l'ordre (libellé affiché ou aria-label). */
async function tapKeys(page: Page, ...labels: string[]): Promise<void> {
  for (const l of labels) await page.click(`.keypad button[aria-label="${l}"], .keypad button:text-is("${l}")`);
  // Le curseur clignote : on le fige (visible) pour que la capture soit stable.
  await page.addStyleTag({ content: '.answer__caret{animation:none!important}' });
}

/** Fige le curseur de saisie (visible) pour que la capture soit stable. */
async function freezeCaret(page: Page): Promise<void> {
  await page.addStyleTag({ content: '.answer__caret{animation:none!important}' });
}

/**
 * Joue la séance d'essai « activite » : un nombre = toucher le choix de ce rang, 'c' = « Continuer », 'p' = « Passer ».
 * Séance : Q0 (−3 × (−4), mal répondue avec le choix 4), Q1, Q2, puis le « même genre », Q3 et la répétition de Q0.
 */
async function play(page: Page, moves: (number | 'c' | 'p')[]): Promise<void> {
  for (const m of moves) {
    if (m === 'c') await page.click('button:text-is("Continuer")');
    else if (m === 'p') await page.click('button:text-is("Passer")');
    else await page.click(`.choice-grid .choice:nth-child(${m})`);
    await page.waitForTimeout(80);
  }
}


/** Parcourt le cours 4 réel (#/cours/c04-soustraire) jusqu'à la partie `n` (0 à 8), en répondant juste. */
async function courseTo(page: Page, n: number): Promise<void> {
  const click = (label: string) => page.click(`button:text-is("${label}")`);
  const next = async () => { await page.waitForTimeout(120); };
  const steps: (() => Promise<void>)[] = [
    async () => click('Suivant'),
    async () => click('Suivant'),
    async () => { /* tuiles 3, −, 5, + : on pose 5, + puis 3 */ for (const i of [3, 4, 1]) await page.click(`.tags .tag:nth-child(${i})`); await click('Valider'); await click('Continuer'); },
    async () => { await tapKeys(page, '7', 'Valider'); await click('Continuer'); },
    async () => { await page.click('.copy-line:nth-child(2)'); await click('Continuer'); },
    async () => { await tapKeys(page, '4', 'Valider'); await click('Continuer'); },
  ];
  for (let i = 0; i < n && i < steps.length; i++) { await steps[i]!(); await next(); }
}

/** Registre des écrans : les tâches d'écran y ajoutent une entrée. */
export const SCREENS: Record<string, ScreenDef> = {
  login: {
    route: '#/',
    scenarios: [
      { name: 'depart' },
      { name: 'code-tape', before: (page) => typeCode(page, 'k7m2 9qxp') },
      // Sans fixture, /api/login répond 401 : « code inconnu ».
      { name: 'code-inconnu', expectedConsole: /status of 401/, before: async (page) => { await typeCode(page, 'k7m2 9qxq', true); await page.waitForSelector('.field__help.is-error'); } },
      {
        name: 'hors-ligne',
        expectedConsole: /ERR_INTERNET_DISCONNECTED/,
        before: async (page) => {
          await page.route('**/api/login', (r: any) => r.abort('internetdisconnected'));
          await typeCode(page, 'k7m2 9qxp', true);
          await page.waitForSelector('.alert--neutral');
        },
      },
      {
        name: 'serveur',
        expectedConsole: /status of 500/,
        before: async (page) => {
          await page.route('**/api/login', (r: any) => r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"server"}' }));
          await typeCode(page, 'k7m2 9qxp', true);
          await page.waitForSelector('.alert--neutral');
        },
      },
    ],
  },
  clavier: {
    route: '#/essai/clavier',
    scenarios: [
      { name: 'rien-ecrit', fixture: 'debut-de-journee', before: (page) => tapKeys(page) },
      { name: 'nombre-negatif', fixture: 'debut-de-journee', before: (page) => tapKeys(page, '−', '8') },
      { name: 'fraction-en-cours', fixture: 'debut-de-journee', before: (page) => tapKeys(page, 'fraction', '−', '1', '2', 'case suivante') },
      { name: 'fraction-finie', fixture: 'debut-de-journee', before: (page) => tapKeys(page, 'fraction', '−', '1', '2', 'case suivante', '4', 'case suivante') },
      { name: 'fraction-vide-validee', fixture: 'debut-de-journee', before: async (page) => { await tapKeys(page, 'fraction', 'Valider'); } },
    ],
  },
  feedback: {
    route: '#/essai/retour?case=tons',
    scenarios: [
      { name: 'tons', fixture: 'debut-de-journee', fullPage: true },
      { name: 'corrige-qcm', fixture: 'debut-de-journee', route: '#/essai/retour?case=qcm', before: async (page) => { await page.click('.choice:nth-child(1)'); await page.waitForSelector('.resolution'); } },
      { name: 'corrige-erreur', fixture: 'debut-de-journee', route: '#/essai/retour?case=erreur', before: async (page) => { await page.click('.copy-line:nth-child(3)'); await page.waitForSelector('.resolution'); } },
      {
        name: 'corrige-classer',
        fixture: 'debut-de-journee',
        route: '#/essai/retour?case=classer',
        before: async (page) => {
          for (const bin of [2, 1, 1, 1]) {
            await page.click('.stack > .tags > .tag:nth-child(1)');
            await page.click(`.bin:nth-child(${bin}) .t-h6`);
          }
          await page.click('.q-foot .btn');
          await page.waitForSelector('.resolution');
        },
      },
      { name: 'corrige-fraction', fixture: 'debut-de-journee', route: '#/essai/retour?case=fraction', before: async (page) => { await freezeCaret(page); await tapKeys(page, '1', '2', 'Valider'); await page.waitForSelector('.resolution'); } },
    ],
  },
  lecon: {
    route: '#/essai/lecon?course=c04&part=0',
    scenarios: [
      // Les animations durent jusqu'à ~3 s : la capture attend leur état final.
      ...[0, 1, 2].map((part): Shot => ({ name: `c04-partie-${part + 1}`, fixture: 'debut-de-journee', route: `#/essai/lecon?course=c04&part=${part}`, before: (page) => page.waitForTimeout(3500) })),
      { name: 'c04-animation-debut', fixture: 'debut-de-journee', route: '#/essai/lecon?course=c04&part=0', before: (page) => page.waitForTimeout(0) },
      { name: 'c00-regle-neutre', fixture: 'debut-de-journee', route: '#/essai/lecon?course=c00&part=2', before: (page) => page.waitForTimeout(500) },
      { name: 'c00-signes-qui-se-cognent', fixture: 'debut-de-journee', route: '#/essai/lecon?course=c00&part=0', before: (page) => page.waitForTimeout(3000) },
      { name: 'c07-compter-les-moins', fixture: 'debut-de-journee', route: '#/essai/lecon?course=c07&part=0', before: (page) => page.waitForTimeout(4000) },
      { name: 'c01-droite-graduee-finale', fixture: 'debut-de-journee', route: '#/essai/lecon?course=c01&part=0', before: async (page) => { await page.waitForSelector('.number-line[data-state="final"]', { timeout: 6000 }); await page.waitForTimeout(1200); } },
      { name: 'c02-droite-graduee-finale', fixture: 'debut-de-journee', route: '#/essai/lecon?course=c02&part=0', before: async (page) => { await page.waitForSelector('.number-line[data-state="final"]', { timeout: 6000 }); await page.waitForTimeout(1200); } },
    ],
  },
  activite: {
    route: '#/essai/activite?cas=revision',
    scenarios: [
      { name: 'question', fixture: 'debut-de-journee', before: (page) => play(page, []) },
      { name: 'qcm-rate', fixture: 'debut-de-journee', before: (page) => play(page, [4]) },
      { name: 'meme-genre', fixture: 'debut-de-journee', before: (page) => play(page, [4, 'c', 2, 'c', 2, 'c']) },
      { name: 'repetition', fixture: 'debut-de-journee', before: (page) => play(page, [4, 'c', 2, 'c', 2, 'c', 1, 'c', 2, 'c']) },
      { name: 'echec2', fixture: 'debut-de-journee', before: (page) => play(page, [4, 'c', 2, 'c', 2, 'c', 1, 'c', 2, 'c', 4]) },
      { name: 'troisieme-passer', fixture: 'debut-de-journee', before: (page) => play(page, [4, 'c', 2, 'c', 2, 'c', 1, 'c', 2, 'c', 4, 'c']) },
      { name: 'apres-passer', fixture: 'debut-de-journee', before: (page) => play(page, [4, 'c', 2, 'c', 2, 'c', 1, 'c', 2, 'c', 4, 'c', 'p']) },
      { name: 'quitter', fixture: 'debut-de-journee', before: async (page) => { await page.click('.appbar .icon-btn'); await page.waitForSelector('[role=dialog]'); } },
      { name: 'simplifie', fixture: 'debut-de-journee', route: '#/essai/activite?cas=simplifie', before: async (page) => { await tapKeys(page, 'fraction', '−', '1', '2', 'case suivante', '4', 'Valider'); await page.waitForSelector('.alert--info'); } },
      { name: 'mal-ecrite', fixture: 'debut-de-journee', route: '#/essai/activite?cas=ecriture', before: async (page) => { await tapKeys(page, '8', '−', 'Valider'); await page.waitForSelector('.alert--error'); } },
    ],
  },
  cours: {
    route: '#/cours/c04-soustraire',
    scenarios: [
      { name: 'lecon-image', fixture: 'debut-de-journee', before: (page) => page.waitForTimeout(3500) },
      { name: 'lecon-regle', fixture: 'debut-de-journee', before: async (page) => { await courseTo(page, 1); await page.waitForTimeout(600); } },
      { name: 'question-guidee', fixture: 'debut-de-journee', before: (page) => courseTo(page, 2) },
      { name: 'exemple-guide', fixture: 'debut-de-journee', before: async (page) => { await courseTo(page, 5); await freezeCaret(page); } },
      { name: 'quitter-le-cours', fixture: 'debut-de-journee', before: async (page) => { await page.click('.appbar .icon-btn'); await page.waitForSelector('[role=dialog]'); } },
      { name: 'relire', fixture: 'debut-de-journee', route: '#/cours/c04-soustraire/relire', before: (page) => page.waitForTimeout(3500) },
      { name: 'resultat-valide', fixture: 'debut-de-journee', route: '#/essai/cours?cas=valide' },
      { name: 'resultat-non-valide', fixture: 'debut-de-journee', route: '#/essai/cours?cas=non-valide' },
      { name: 'resultat-dernier-cours', fixture: 'debut-de-journee', route: '#/essai/cours?cas=dernier' },
      { name: 'rattrapage-serie', fixture: 'debut-de-journee', route: '#/rattrapage/c04-soustraire', before: async (page) => { for (let i = 0; i < 2; i++) { await tapKeys(page, '1', 'Valider'); await page.click('button:text-is("Continuer")'); await page.waitForTimeout(80); } await freezeCaret(page); } },
      { name: 'rattrapage-quitter-relire', fixture: 'debut-de-journee', route: '#/rattrapage/c04-soustraire', before: async (page) => { await page.click('.chip-action'); await page.waitForSelector('[role=dialog]'); } },
      { name: 'rattrapage-4-sur-5', fixture: 'debut-de-journee', route: '#/essai/cours?cas=rattrapage-ok' },
      { name: 'rattrapage-3-sur-5', fixture: 'debut-de-journee', route: '#/essai/cours?cas=rattrapage-ko' },
    ],
  },
  accueil: {
    route: '#/',
    scenarios: (['debut-de-journee', 'apres-une-seance', 'objectif-atteint', 'cours-a-rattraper', 'module-termine'] as const).map((fixture): Shot => ({ name: fixture, fixture, before: (page) => page.waitForTimeout(500) })),
  },
  'mes-cours': {
    route: '#/cours',
    scenarios: [
      { name: 'debut-du-module', fixture: 'debut-du-module', before: (page) => page.waitForTimeout(500) },
      { name: 'en-cours', fixture: 'debut-de-journee', before: (page) => page.waitForTimeout(500) },
      { name: 'en-cours-valide-ouvert', fixture: 'debut-de-journee', before: async (page) => { await page.waitForTimeout(500); await page.click('details.crow:nth-of-type(2) summary'); } },
      { name: 'a-rattraper', fixture: 'cours-a-rattraper', before: (page) => page.waitForTimeout(500) },
      { name: 'module-termine', fixture: 'module-termine', before: async (page) => { await page.waitForTimeout(500); await page.click('details.crow:nth-of-type(3) summary'); } },
    ],
  },
  entrainement: {
    route: '#/entrainement',
    scenarios: [
      { name: 'tout-melange', fixture: 'debut-de-journee', before: (page) => page.waitForTimeout(500) },
      { name: 'cours-choisis', fixture: 'cours-a-rattraper', before: async (page) => { await page.waitForTimeout(500); await page.click('button:text-is("Mes cours")'); await page.click('input[aria-label="Cours 1"]'); await page.click('input[aria-label="Cours 3"]'); } },
      { name: 'aucun-choisi', fixture: 'cours-a-rattraper', before: async (page) => { await page.waitForTimeout(500); await page.click('button:text-is("Mes cours")'); } },
      { name: 'rien-a-travailler', fixture: 'debut-du-module', before: (page) => page.waitForTimeout(500) },
    ],
  },
  revisions: {
    route: '#/revisions',
    scenarios: [
      // Vraie séance (5 cours dus, tirage au hasard) : la première question, avec sa pastille.
      { name: 'question', fixture: 'debut-de-journee', before: (page) => page.waitForTimeout(500) },
      // Question à calculs fixes (même déroulé) : un QCM raté, bonne réponse et explication.
      { name: 'qcm-rate', fixture: 'debut-de-journee', route: '#/essai/activite?cas=revision', before: (page) => play(page, [4]) },
      { name: 'bilan-encore', fixture: 'debut-de-journee', route: '#/essai/bilan?cas=encore' },
      { name: 'bilan-faites', fixture: 'debut-de-journee', route: '#/essai/bilan?cas=faites' },
    ],
  },
  questions: {
    route: '#/essai/questions?type=saisie',
    scenarios: [
      ...(['saisie', 'trou', 'ordre', 'erreur', 'paires', 'classer', 'qcm', 'vraifaux', 'signe', 'ecriture', 'qcm-ecriture'] as const).map((type): Shot => ({
        name: type,
        fixture: 'debut-de-journee',
        route: `#/essai/questions?type=${type}`,
        before: freezeCaret,
      })),
      { name: 'trou-tape', fixture: 'debut-de-journee', route: '#/essai/questions?type=trou', before: (page) => tapKeys(page, '−', '1', '2') },
      { name: 'ordre-place', fixture: 'debut-de-journee', route: '#/essai/questions?type=ordre', before: async (page) => { await page.click('.tags .tag:nth-child(4)'); await page.click('.tags .tag:nth-child(2)'); } },
      { name: 'paires-touche', fixture: 'debut-de-journee', route: '#/essai/questions?type=paires', before: async (page) => { await page.click('.pairs__col:first-child .tag:nth-child(1)'); } },
      { name: 'classer-touche', fixture: 'debut-de-journee', route: '#/essai/questions?type=classer', before: async (page) => { await page.click('.stack > .tags > .tag:nth-child(1)'); } },
      { name: 'corrige-qcm', fixture: 'debut-de-journee', route: '#/essai/questions?type=qcm', before: async (page) => { await page.click('.choice:nth-child(1)'); await page.waitForSelector('.choice.is-correct'); } },
      { name: 'corrige-erreur', fixture: 'debut-de-journee', route: '#/essai/questions?type=erreur', before: async (page) => { await page.click('.copy-line:nth-child(3)'); await page.waitForSelector('.lesson-line--ko'); } },
      {
        name: 'corrige-classer',
        fixture: 'debut-de-journee',
        route: '#/essai/questions?type=classer',
        before: async (page) => {
          // −2 × 3 dans Résultat −, puis les trois autres dans Résultat + (7 × (−1) est mal rangé)
          for (const bin of [2, 1, 1, 1]) {
            await page.click('.stack > .tags > .tag:nth-child(1)');
            await page.click(`.bin:nth-child(${bin}) .t-h6`);
          }
          await page.click('.q-foot .btn');
          await page.waitForSelector('.tag.is-wrong');
        },
      },
    ],
  },
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
    const b = spawnSync('npm', ['run', 'build', '-w', 'web'], { cwd: ROOT, stdio: 'inherit', env: { ...process.env, VITE_ESSAI: '1' } }); // les pages d'essai (#/essai/...) ne sont compilées que pour les captures
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

/** Écrit la session dans IndexedDB avant de charger l'appli ; le schéma vient de apps/web/src/store/db.ts. */
const SEED_HTML = (session: Session) => `<!doctype html><meta charset="utf-8"><title>seed</title><script>
const schema = ${JSON.stringify(DB_SCHEMA)};
const req = indexedDB.open(${JSON.stringify(DB_NAME)}, ${DB_VERSION});
req.onupgradeneeded = () => {
  const db = req.result;
  for (const s of schema) {
    const st = db.createObjectStore(s.name, s.keyPath ? { keyPath: s.keyPath } : undefined);
    for (const i of s.indexes) st.createIndex(i.name, i.keyPath);
  }
};
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(${JSON.stringify(SESSION_STORE)}, 'readwrite');
  tx.objectStore(${JSON.stringify(SESSION_STORE)}).put(${JSON.stringify(session)}, ${JSON.stringify(SESSION_KEY)});
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
              await page.route(`${preview.url}/__seed`, (r: any) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: SEED_HTML({ token: 'tok', user: data.user }) }));
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
            for (const e of errors.filter((m) => !shot.expectedConsole?.test(m))) problems.push(`${label} : erreur console : ${e}`);
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
