/**
 * Gestes communs aux parcours : connexion, déroulé d'un cours en répondant juste (ou avec une erreur voulue),
 * lecture de la base du téléphone (IndexedDB) et du serveur.
 * Les réponses des leçons et des exemples guidés viennent de la définition du cours (données fixes) ;
 * celles des exercices de fin, tirés au hasard, se lisent sur l'écran (annotation KaTeX du calcul affiché).
 */
import { expect, type Locator, type Page } from '@playwright/test';
import { getCourse, type AppEvent, type Question, type Rational } from '@pom/engine';

const isSign = (s: string | undefined): boolean => s === '+' || s === '−' || s === '×' || s === '÷';

/**
 * La case à toucher pour la faute d'une écriture du Cours 0 (une case par symbole), ou null si elle est bien écrite :
 * le « − » après un nombre, deux signes qui se touchent (le premier), une parenthèse sans sa paire.
 */
export function faultBox(symbols: string[]): number | null {
  const open: number[] = [];
  let lonely: number | null = null;
  for (const [k, s] of symbols.entries()) {
    if (s === '(') open.push(k);
    else if (s === ')' && open.pop() === undefined) lonely ??= k;
  }
  lonely ??= open[0] ?? null;
  for (const [k, s] of symbols.entries()) {
    if (isSign(s) && isSign(symbols[k - 1])) return k - 1;
    const after = symbols[k + 1];
    if (s === '−' && /^\d+$/.test(symbols[k - 1] ?? '') && (after === undefined || isSign(after) || after === ')')) return k;
  }
  return lonely;
}

export const NOTE_FIRST = 'Un calcul du même genre reviendra plus loin, et celui-ci à la fin.';

/** Connexion avec le code, puis attente de l'écran d'accueil (élève) ou du suivi (suiveur). */
export async function login(page: Page, code: string, role: 'eleve' | 'suiveur' = 'eleve'): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Ton code').fill(code);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await expect(page.locator(`main[data-screen="${role === 'eleve' ? 'accueil' : 'suivi'}"]`)).toBeVisible();
}

/** Texte « N cours sur M validés » de l'accueil. */
export async function validatedText(page: Page): Promise<string> {
  const el = page.locator('main[data-screen="accueil"] .strip-head .t-caption');
  await expect(el).toBeVisible();
  return (await el.innerText()).replace(/\s+/g, ' ').trim();
}

// --- lecture de l'écran ------------------------------------------------------

/** Calcul affiché, en LaTeX (annotation KaTeX : le texte source du rendu). */
async function promptLatex(page: Page): Promise<string> {
  const t = await page.locator('.q-expr .katex-mathml annotation').first().textContent();
  if (!t) throw new Error('Calcul introuvable sur la page');
  return t;
}

/** Évalue un calcul d'entiers écrit en LaTeX (+, −, ×, ÷, parenthèses). */
export function evalLatex(latex: string): number {
  // Le calcul est suivi de « = \square » : on ne garde que ce qui précède le « = ».
  const js = (latex.split('=')[0] ?? latex)
    .replace(/\\times|\\cdot/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\left|\\right/g, '')
    .replace(/−/g, '-')
    .replace(/\\[,; ]|~|\\!/g, ' ');
  if (!/^[\d\s+\-*/().]+$/.test(js)) throw new Error(`Calcul non pris en charge : ${latex}`);
  const v = new Function(`return (${js});`)() as number;
  if (!Number.isInteger(v)) throw new Error(`Résultat non entier : ${latex} = ${v}`);
  return v;
}

/** Tape un entier au clavier maths de l'appli (« moins » puis les chiffres). */
export async function typeInteger(page: Page, n: number): Promise<void> {
  const pad = page.locator('.keypad');
  if (n < 0) await pad.getByRole('button', { name: 'moins' }).click();
  for (const d of String(Math.abs(n))) await pad.getByRole('button', { name: d, exact: true }).click();
}

const submitKeypad = (page: Page) => page.locator('.keypad').getByRole('button', { name: 'Valider' }).click();

type Screen = 'resultat' | 'retour' | 'etapes' | 'lecon' | 'choix' | 'reecrire' | 'clavier' | 'morceaux' | 'ordre' | 'classer';

/** Ce que l'écran montre maintenant (on attend qu'un des écrans connus apparaisse). */
async function screenNow(page: Page): Promise<Screen> {
  let found: Screen | null = null;
  await expect
    .poll(
      async () => {
        found = await page.evaluate((): Screen | null => {
          const q = (s: string) => document.querySelector(s);
          if (q('main[data-screen="resultat"] h1')) return 'resultat';
          if (q('.feedback') || q('.walk')) return 'retour'; // retour de réponse, ou « On le fait ensemble » d'un calcul passé
          if (q('.lesson-screen--etapes')) return 'etapes';
          if (q('.lesson-screen')) return 'lecon';
          if (q('.choice')) return 'choix';
          if (q('.keypad--expr')) return 'reecrire';
          if (q('.keypad')) return 'clavier';
          if (q('.tag--piece')) return 'morceaux';
          if (q('.slots')) return 'ordre';
          if (q('.bins')) return 'classer';
          return null;
        });
        return found;
      },
      { message: "aucun écran d'activité reconnu" },
    )
    .not.toBeNull();
  return found!;
}

const tile = (page: Page, i: number): Locator => page.locator('.tags .tag').nth(i);

/** Répond juste à une question de la définition du cours (leçon ou exemple guidé). */
async function answerPart(page: Page, q: Question): Promise<void> {
  switch (q.kind) {
    case 'saisie':
      await typeInteger(page, (q.ex.answer as Rational).n);
      await submitKeypad(page);
      return;
    case 'trou':
      await typeInteger(page, q.hidden.n);
      await submitKeypad(page);
      return;
    case 'ordre':
      for (const id of q.solution) await tile(page, q.tiles.findIndex((t) => t.id === id)).click();
      await page.getByRole('button', { name: 'Valider' }).click();
      return;
    case 'erreur': {
      const at = q.accept ? (q.accept[0] ?? null) : q.wrongLine;
      if (at === null) await page.getByRole('button', { name: 'Tout est bien écrit' }).click();
      else await page.locator('.tag--piece').nth(at).click();
      return;
    }
    case 'choix':
      await page.locator('.choice').nth(q.correctIndex).click();
      return;
    case 'reecrire': {
      const pad = page.locator('.keypad--expr');
      for (const k of q.expected) await pad.getByRole('button', { name: k, exact: true }).click();
      await pad.getByRole('button', { name: 'Valider' }).click();
      return;
    }
    case 'classer':
      // Les calculs rangés quittent la liste à ranger : le premier restant est toujours le suivant.
      for (const c of q.expected) {
        await page.locator('.tags:not(.bin .tags) > button.tag').first().click();
        await page.getByRole('group', { name: q.classes.find((x) => x.id === c)!.label }).locator('p.t-h6').click(); // l'en-tête de la case : jamais un calcul déjà rangé
      }
      await page.getByRole('button', { name: 'Valider' }).click();
      return;
    default:
      throw new Error(`Question de leçon inattendue : ${q.kind}`);
  }
}

export interface RunOptions {
  /** Se trompe volontairement au premier exercice de fin (la valeur juste + 1). */
  wrongFirstFin?: boolean;
  /** Se trompe volontairement à tous les exercices de fin (touche « Tout est bien écrit » s'il y a une faute, une case sinon). */
  failAllFin?: boolean;
  /** S'arrête sur le retour de la n-ième réponse (leçons et exemples), sans finir le cours. */
  stopAfterAnswers?: number;
}
export interface RunReport {
  /** Exercices de fin posés (rattrapages après une erreur compris). */
  fin: number;
  /** Retour d'erreur vu : explication « Étape par étape » et note de repassage. */
  explained: boolean;
}

/**
 * Déroule un cours (`#/cours/:id`) jusqu'à l'écran de résultat. Les parties de la définition d'abord, puis les
 * exercices de fin lus à l'écran, y compris ceux que l'appli repose après une erreur.
 */
export async function runCourse(page: Page, courseId: string, opts: RunOptions = {}): Promise<RunReport> {
  const course = getCourse(courseId);
  const report: RunReport = { fin: 0, explained: false };
  let part = 0;
  let wrongDone = false;
  let answers = 0;
  // L'ancien écran (résultat du cours d'avant) doit avoir laissé la place à l'activité.
  await expect(page.locator('main[data-screen="activite"]')).toBeVisible();
  for (let guard = 0; guard < 200; guard++) {
    const screen = await screenNow(page);
    if (screen === 'resultat') return report;
    if (screen === 'retour') {
      await page.getByRole('button', { name: 'Continuer' }).click();
      continue;
    }
    if (part < course.parts.length) {
      const p = course.parts[part++]!;
      if (screen === 'etapes') {
        expect(p.type, `partie ${part - 1}`).toBe('etapes');
        // « Suite » montre l'étape suivante, puis le bouton devient « Suivant ».
        while (await page.getByRole('button', { name: 'Suite', exact: true }).isVisible()) await page.getByRole('button', { name: 'Suite', exact: true }).click();
        await page.getByRole('button', { name: 'Suivant', exact: true }).click();
      } else if (screen === 'lecon') {
        expect(p.type, `partie ${part - 1}`).toBe('explication');
        await page.getByRole('button', { name: 'Suivant' }).click();
      } else {
        expect(p.type, `partie ${part - 1}`).toBe('question');
        await answerPart(page, (p as { question: Question }).question);
        // une question « pour découvrir » ne compte pas : son retour n'est pas un succès
        if ((p as { activity?: string }).activity !== 'decouverte') await expect(page.locator('.feedback .alert--success'), `réponse juste, partie ${part - 1}`).toBeVisible();
        if (++answers === opts.stopAfterAnswers) return report;
      }
      continue;
    }
    // Exercices de fin : lus à l'écran. Un calcul raté deux fois peut être passé : compté raté aussi.
    const skip = page.getByRole('button', { name: 'Passer', exact: true });
    if (opts.failAllFin && (await skip.isVisible())) {
      await skip.click();
      continue;
    }
    report.fin++;
    if (screen === 'clavier') {
      const right = evalLatex(await promptLatex(page));
      const wrong: boolean = !!opts.wrongFirstFin && !wrongDone;
      if (wrong) wrongDone = true;
      await typeInteger(page, wrong ? right + 1 : right);
      await submitKeypad(page);
      if (wrong) {
        await expect(page.locator('.feedback .alert--error')).toBeVisible();
        await expect(page.getByText('Étape par étape')).toBeVisible();
        await expect(page.getByText(NOTE_FIRST)).toBeVisible();
        report.explained = true;
      } else await expect(page.locator('.feedback .alert--success')).toBeVisible();
    } else if (screen === 'morceaux') {
      const fault = faultBox(await page.locator('.tag--piece').allTextContents());
      const wrongNow = !!opts.failAllFin;
      // juste : la faute touchée (ou « Tout est bien écrit ») ; exprès faux : l'inverse
      if (fault !== null && !wrongNow) await page.locator('.tag--piece').nth(fault).click();
      else if (fault !== null || !wrongNow) await page.getByRole('button', { name: 'Tout est bien écrit' }).click();
      else await page.locator('.tag--piece').first().click();
      await expect(page.locator(`.feedback .alert--${wrongNow ? 'error' : 'success'}`)).toBeVisible();
    } else throw new Error(`Exercice de fin inattendu : ${screen}`);
  }
  throw new Error('Le cours ne se termine pas');
}

// --- téléphone et serveur ----------------------------------------------------

/** Contenu d'un magasin IndexedDB de l'appli (base « pom »). */
export function idbAll<T>(page: Page, store: 'events' | 'outbox'): Promise<T[]> {
  return page.evaluate(
    (name) =>
      new Promise<unknown[]>((resolve, reject) => {
        const open = indexedDB.open('pom');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const req = db.transaction(name).objectStore(name).getAll();
          req.onsuccess = () => {
            db.close();
            resolve(req.result);
          };
          req.onerror = () => reject(req.error);
        };
      }),
    store,
  ) as Promise<T[]>;
}

/** Jeton de la session enregistrée sur le téléphone. */
export function sessionToken(page: Page): Promise<string> {
  return page.evaluate(
    () =>
      new Promise<string>((resolve, reject) => {
        const open = indexedDB.open('pom');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const req = open.result.transaction('session').objectStore('session').get('current');
          req.onsuccess = () => resolve((req.result as { token: string }).token);
          req.onerror = () => reject(req.error);
        };
      }),
  );
}

/** Événements que le serveur connaît de l'élève connecté sur ce téléphone. */
export async function serverEvents(page: Page): Promise<AppEvent[]> {
  const token = await sessionToken(page);
  const res = await page.request.get('/api/events', { headers: { authorization: `Bearer ${token}` } });
  expect(res.ok()).toBe(true);
  return ((await res.json()) as { events: AppEvent[] }).events;
}
