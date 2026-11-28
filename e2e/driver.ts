/**
 * Gestes communs aux parcours : connexion, déroulé d'un cours en répondant juste (ou avec une erreur voulue),
 * lecture de la base du téléphone (IndexedDB) et du serveur.
 * Les réponses des leçons et des exemples guidés viennent de la définition du cours (données fixes) ;
 * celles des exercices de fin, tirés au hasard, se lisent sur l'écran (annotation KaTeX du calcul affiché).
 */
import { expect, type Locator, type Page } from '@playwright/test';
import { getCourse, type AppEvent, type EtapeStep, type Question, type Rational } from '@pom/engine';
import { scenario } from './fixtures';

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

/**
 * Connexion avec le code, puis attente de l'écran d'accueil (élève) ou du suivi (suiveur).
 * Un élève qui a déjà validé un cours et n'a rien fait aujourd'hui arrive sur l'échauffement : `warmup: 'skip'` le passe
 * (défaut), `'stay'` reste sur l'écran d'échauffement.
 */
export async function login(page: Page, code: string, role: 'eleve' | 'suiveur' = 'eleve', warmup: 'skip' | 'stay' = 'skip'): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Ton code').fill(code);
  await page.getByRole('button', { name: 'Entrer' }).click();
  if (role === 'suiveur') return void (await expect(page.locator('main[data-screen="suivi"]')).toBeVisible());
  const home = page.locator('main[data-screen="accueil"]');
  const echauffement = page.locator('main[data-screen="echauffement"]');
  await expect(home.or(echauffement)).toBeVisible();
  if (warmup === 'stay') return void (await expect(echauffement).toBeVisible());
  if (await echauffement.isVisible()) await page.getByRole('button', { name: 'Passer', exact: true }).click();
  await expect(home).toBeVisible();
}

/**
 * Donne à un élève le Cours 0 déjà validé, dans le passé (événements des maquettes, réécrits à son nom) : il peut
 * commencer le Cours 1 sans refaire le Cours 0. À faire une fois connecté (le jeton de la session sert à l'envoi).
 */
export async function seedCourse0Validated(page: Page, userId: string, warmup: 'skip' | 'stay' = 'skip'): Promise<void> {
  const token = await sessionToken(page);
  const source = scenario('debut-de-journee').events.filter((e) => 'courseId' in e && e.courseId === 'c00-bien-ecrire' && 'activityId' in e && e.activityId.startsWith('run-'));
  const events = source.map((e, i) => ({ ...e, id: `${userId}-seed-${String(i).padStart(3, '0')}`, userId, ...('activityId' in e ? { activityId: `${userId}-${e.activityId}` } : {}) }));
  const res = await page.request.post('/api/events', { headers: { authorization: `Bearer ${token}` }, data: { events } });
  expect(res.ok(), 'les événements de départ sont acceptés').toBe(true);
  // le téléphone relit le serveur au 1er rechargement ; l'échauffement du jour est proposé au suivant (les événements sont alors sur le téléphone)
  await page.reload();
  await expect(page.locator('main[data-screen="accueil"]').or(page.locator('main[data-screen="echauffement"]'))).toBeVisible();
  await expect.poll(async () => (await idbAll<AppEvent>(page, 'events')).length, { message: 'le téléphone a reçu les événements' }).toBeGreaterThan(5);
  await page.reload();
  const echauffement = page.locator('main[data-screen="echauffement"]');
  await expect(page.locator('main[data-screen="accueil"]').or(echauffement)).toBeVisible();
  if (warmup === 'stay') return void (await expect(echauffement).toBeVisible());
  if (await echauffement.isVisible()) await page.getByRole('button', { name: 'Passer', exact: true }).click();
  await expect(page.locator('main[data-screen="accueil"]')).toBeVisible();
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

type Screen = 'resultat' | 'retour' | 'etapes' | 'lecon' | 'choix' | 'reecrire' | 'clavier' | 'morceaux' | 'ordre' | 'classer' | 'droite' | 'vraifaux';

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
          if (q('.droite')) return 'droite';
          if (q('.toggle-group')) return 'vraifaux';
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
/** Les pastilles à toucher « respirent » (elles bougent sans cesse) : le toucher est forcé, au centre de la cible. */
const TOUCH = { force: true } as const;
/** Le « − » des graduations est le vrai signe moins (U+2212). */
const gradLabel = (v: number): string => `Graduation ${v < 0 ? `−${-v}` : v}`;

/** Répond à une question de la définition du cours (leçon, série de pratique ou exemple guidé) : juste, ou faux exprès. */
async function answerPart(page: Page, q: Question, wrong = false): Promise<void> {
  switch (q.kind) {
    case 'saisie':
      await typeInteger(page, (q.ex.answer as Rational).n + (wrong ? 1 : 0));
      await submitKeypad(page);
      return;
    case 'trou':
      await typeInteger(page, q.hidden.n + (wrong ? 1 : 0));
      await submitKeypad(page);
      return;
    case 'ordre':
      for (const id of q.solution) await tile(page, q.tiles.findIndex((t) => t.id === id)).click();
      await page.getByRole('button', { name: 'Valider' }).click();
      return;
    case 'erreur': {
      const at = q.accept ? (q.accept[0] ?? null) : q.wrongLine;
      if (wrong) await page.locator('.tag--piece').nth(at === 0 ? 1 : 0).click();
      else if (at === null) await page.getByRole('button', { name: 'Tout est bien écrit' }).click();
      else await page.locator('.tag--piece').nth(at).click();
      return;
    }
    case 'choix':
      await page.locator('.choice').nth(wrong ? (q.correctIndex + 1) % q.options.length : q.correctIndex).click();
      return;
    case 'qcm':
      await page.locator('.choice').nth(wrong ? (q.correctIndex + 1) % q.choices.length : q.correctIndex).click();
      return;
    case 'vraifaux':
      await page.locator('.toggle-group').getByRole('button', { name: q.isTrue !== wrong ? 'Vrai' : 'Faux', exact: true }).click();
      return;
    case 'droite':
      await page.locator(`.droite [aria-label="${gradLabel(q.answer + (wrong ? 1 : 0))}"]`).click(TOUCH);
      return;
    case 'reecrire': {
      // le clavier du calcul est collé en bas de l'écran : le clic est envoyé à la touche elle-même (le défilement de la page ne la déplace pas)
      const pad = page.locator('.keypad--expr');
      const key = (name: string) => pad.getByRole('button', { name, exact: true }).dispatchEvent('click');
      for (const k of q.expected) await key(k);
      if (wrong) await key('1');
      await key('Valider');
      return;
    }
    case 'classer':
      // Les calculs rangés quittent la liste à ranger : le premier restant est toujours le suivant.
      for (const c of q.expected) {
        await page.locator('.tags:not(.bin .tags) > button.tag').first().click();
        await page.locator(`[data-bin="${c}"] p.t-h6`).click(); // l'en-tête de la case : jamais un calcul déjà rangé
      }
      await page.getByRole('button', { name: 'Valider' }).click();
      return;
    default:
      throw new Error(`Question de leçon inattendue : ${q.kind}`);
  }
}

/** Nombre de morceaux « hl » (surligneur) d'une scène : ce que l'écran doit montrer une fois le toucher réussi. */
const highlighted = (scene: NonNullable<EtapeStep['scene']>): number => scene.calcs.reduce((n, c) => n + c.tokens.filter((t) => t.hl).length, 0);

/**
 * Une explication pas à pas : chaque étape interactive est jouée (trou, graduation, morceau, endroit), avec d'abord un mauvais
 * toucher exprès si `wrong` (un message « Pas tout à fait. » doit alors apparaître, sans « Suite »), puis le bon ;
 * « Je comprends » avance tout seul, « Suite » ou « Suivant » sinon. `onStep` est appelé après chaque étape.
 */
async function playEtapes(page: Page, steps: EtapeStep[], wrong: boolean, onStep?: (stepIndex: number) => Promise<void>): Promise<void> {
  const suite = page.getByRole('button', { name: 'Suite', exact: true });
  const suivant = page.getByRole('button', { name: 'Suivant', exact: true });
  for (const [i, s] of steps.entries()) {
    const last = i === steps.length - 1;
    const a = s.action;
    let advanced = false;
    if (a) {
      const bad = page.locator('.etape-error');
      const mustFail = async (): Promise<void> => {
        await expect(bad, `étape ${i + 1} : message d'erreur après un mauvais toucher`).toContainText('Pas tout à fait.');
        await expect(suite).toBeHidden();
        await expect(suivant).toBeHidden();
      };
      switch (a.type) {
        case 'trou':
          if (wrong) {
            await page.locator('.etape-action .choice').nth((a.correct + 1) % a.choices.length).click();
            await mustFail();
          }
          await page.locator('.etape-action .choice').nth(a.correct).click();
          break;
        case 'graduation': {
          const target = a.target;
          if (wrong) {
            await page.locator(`[aria-label="${gradLabel(target === 0 ? 1 : 0)}"]`).click(TOUCH);
            await mustFail();
          }
          await page.locator(`[aria-label="${gradLabel(target)}"]`).click(TOUCH);
          break;
        }
        case 'morceau':
          if (wrong) {
            await page.locator('.touch-token').nth(a.target[0] === 0 ? 1 : 0).click(TOUCH);
            await mustFail();
          }
          await page.locator('.touch-token').nth(a.target[0]!).click(TOUCH);
          break;
        case 'endroit': {
          const gap = (g: number) => page.locator(`.touch-gap[aria-label="Endroit ${g + 1}"]`);
          if (wrong) {
            const other = (a.gaps ?? Array.from({ length: 8 }, (_, k) => k)).find((g) => g !== a.target[0])!;
            await gap(other).click(TOUCH);
            await mustFail();
          }
          await gap(a.target[0]!).click(TOUCH);
          break;
        }
        case 'comprends':
          await page.getByRole('button', { name: a.label ?? 'Je comprends', exact: true }).click();
          advanced = true;
          break;
      }
      if (a.type !== 'comprends') {
        await expect(bad).toBeHidden();
        // la scène montre le résultat tout de suite : les morceaux surlignés de la scène « après », le bond dessiné
        if (s.after) {
          await expect(page.locator('.stage .scene-hl'), `étape ${i + 1} : la scène « après » est affichée`).toHaveCount(highlighted(s.after));
          if (s.after.line) await expect(page.locator('.stage .line-view__arc.is-shown').first()).toBeVisible();
        }
      }
    }
    if (onStep) await onStep(i);
    if (!advanced) await (last ? suivant : suite).click();
  }
}

export interface RunOptions {
  /** Se trompe volontairement au premier exercice de fin (la valeur juste + 1). */
  wrongFirstFin?: boolean;
  /** Se trompe volontairement à tous les exercices de fin (touche « Tout est bien écrit » s'il y a une faute, une case sinon ; au clavier, le signe oublié). */
  failAllFin?: boolean;
  /** S'arrête sur le retour de la n-ième réponse (leçons et exemples), sans finir le cours. */
  stopAfterAnswers?: number;
  /** Rang (à partir de 1, parmi les réponses des parties) des réponses fausses exprès. */
  wrongAnswers?: number[];
  /** Mauvais toucher exprès avant le bon à chaque étape interactive. */
  wrongTaps?: boolean;
  /** Appelé à chaque écran (partie, étape de l'explication) : mesures, pastille, débordement. */
  onScreen?: (page: Page, at: { part: number; step: number | null; type: string }) => Promise<void>;
}
export interface RunReport {
  /** Exercices de fin posés (rattrapages après une erreur compris). */
  fin: number;
  /** Retour d'erreur vu : explication « Étape par étape » et note de repassage. */
  explained: boolean;
  /** Questions de la série de pratique ratées exprès, revenues avant les exercices de fin. */
  repassed: number;
}

export const LESSON_REPEAT = 'Tu retrouveras ce calcul à la fin de la leçon.';

/**
 * Déroule un cours (`#/cours/:id`) jusqu'à l'écran de résultat. Les parties de la définition d'abord, puis les
 * exercices de fin lus à l'écran, y compris ceux que l'appli repose après une erreur.
 */
export async function runCourse(page: Page, courseId: string, opts: RunOptions = {}): Promise<RunReport> {
  const course = getCourse(courseId);
  const report: RunReport = { fin: 0, explained: false, repassed: 0 };
  let part = 0;
  let wrongDone = false;
  let answers = 0;
  let series: { question: Question; at: number }[] = []; // la suite de la série de pratique en cours
  let seriesOf = 0;
  const retries: Question[] = []; // questions de la leçon ratées : elles reviennent avant les exercices de fin
  // L'ancien écran (résultat du cours d'avant) doit avoir laissé la place à l'activité.
  await expect(page.locator('main[data-screen="activite"]')).toBeVisible();
  const seen = async (at: number, step: number | null, type: string) => opts.onScreen?.(page, { part: at, step, type });
  /** Répond à une question de la leçon et vérifie son retour. */
  const ask = async (q: Question, at: number, counted: boolean, retry = false): Promise<boolean> => {
    await seen(at, null, 'question');
    const wrong = !retry && opts.wrongAnswers?.includes(answers + 1) === true;
    await answerPart(page, q, wrong);
    if (wrong) {
      if (counted) {
        await expect(page.locator('.feedback .alert--error'), `réponse fausse exprès, partie ${at}`).toBeVisible();
        // une petite question de la leçon a sa propre règle (elle repasse 2 étapes plus loin, sans cette note)
        if (!(q.kind === 'choix' && q.small)) {
          await expect(page.getByText(LESSON_REPEAT)).toBeVisible();
          retries.push(q);
        }
      } else await expect(page.locator('.feedback'), `retour d'une question qui ne compte pas, partie ${at}`).toBeVisible();
    } else if (counted || retry) await expect(page.locator('.feedback .alert--success'), `réponse juste, partie ${at}`).toBeVisible();
    return wrong;
  };
  for (let guard = 0; guard < 250; guard++) {
    const screen = await screenNow(page);
    if (screen === 'resultat') return report;
    if (screen === 'retour') {
      // après la dernière question de la série : l'encadré « N sur 4 » et la phrase de transition
      const summary = page.locator('.series-summary');
      if (seriesOf > 0 && series.length === 0 && (await summary.count()) > 0) {
        await expect(summary).toContainText(new RegExp(`^\\d sur ${seriesOf}`));
        await expect(summary).toContainText('Maintenant, deux exemples');
        seriesOf = 0;
      }
      await page.getByRole('button', { name: 'Continuer' }).click();
      continue;
    }
    // la suite d'une série de pratique : une question par écran
    if (series.length > 0) {
      const next = series.shift()!;
      await ask(next.question, next.at, true);
      answers++;
      if (answers === opts.stopAfterAnswers) return report;
      continue;
    }
    if (part < course.parts.length) {
      const at = part++;
      const p = course.parts[at]!;
      if (screen === 'etapes') {
        expect(p.type, `partie ${at}`).toBe('etapes');
        await seen(at, null, 'etapes');
        await playEtapes(page, (p as { steps: EtapeStep[] }).steps, !!opts.wrongTaps, (i) => seen(at, i, 'etapes'));
      } else if (screen === 'lecon') {
        expect(['explication', 'autres'], `partie ${at}`).toContain(p.type);
        await seen(at, null, p.type);
        // « Autres façons de faire » : on peut continuer sans essayer de technique
        await page.getByRole('button', { name: p.type === 'autres' ? 'Continuer' : 'Suivant', exact: true }).click();
      } else if (p.type === 'pratique') {
        seriesOf = p.questions.length;
        series = p.questions.map((x) => ({ question: x.question, at }));
        const first = series.shift()!;
        await ask(first.question, at, true);
        answers++;
        if (answers === opts.stopAfterAnswers) return report;
      } else {
        expect(p.type, `partie ${at}`).toBe('question');
        const qp = p as { question: Question; activity?: string; uncounted?: true };
        // une question « pour découvrir » ou non notée ne compte pas : une erreur n'y repasse pas
        const counted = qp.activity !== 'decouverte' && qp.uncounted !== true;
        const wrong = await ask(qp.question, at, counted);
        // « Comparer deux cas » : le retour est dans la page (celui du pied d'écran fait doublon et reste caché)
        if (qp.activity === 'decouverte' && !wrong) await expect(page.locator((p as { compare?: unknown }).compare ? '.compare-feedback' : '.feedback')).toBeVisible();
        answers++;
        if (answers === opts.stopAfterAnswers) return report;
      }
      continue;
    }
    // les questions de la leçon ratées reviennent avant les exercices de fin (même question, juste cette fois)
    if (retries.length > 0) {
      await ask(retries.shift()!, part, true, true);
      report.repassed++;
      continue;
    }
    // Exercices de fin : lus à l'écran. Un calcul raté deux fois peut être passé : compté raté aussi.
    const skip = page.getByRole('button', { name: 'Passer', exact: true });
    if (opts.failAllFin && (await skip.isVisible())) {
      await skip.click();
      continue;
    }
    report.fin++;
    await seen(part, null, 'fin');
    if (screen === 'clavier') {
      const right = evalLatex(await promptLatex(page));
      const wrong: boolean = !!opts.failAllFin || (!!opts.wrongFirstFin && !wrongDone);
      if (wrong) wrongDone = true;
      // exprès faux : « signe oublié » pour les exercices de fin, sinon la valeur juste + 1
      await typeInteger(page, wrong ? (opts.failAllFin ? -right : right + 1) : right);
      await submitKeypad(page);
      if (wrong) {
        await expect(page.locator('.feedback .alert--error')).toBeVisible();
        await expect(page.getByText('Étape par étape')).toBeVisible();
        if (!opts.failAllFin) await expect(page.getByText(NOTE_FIRST)).toBeVisible(); // aux répétitions, la note change
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

/** Aucune page ne déborde en largeur (ni défilement horizontal) à 360 et à 390 px ; la fenêtre revient à sa taille. */
export async function expectNoOverflow(page: Page, where: string): Promise<void> {
  const original = page.viewportSize() ?? { width: 390, height: 664 };
  try {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: original.height });
      const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(wide, `${where} : la page déborde à ${width} px`).toBeLessThanOrEqual(0);
      // la scène coupe ce qui dépasse (overflow: hidden) : un débordement y est invisible pour la page, on le mesure à part
      const sceneWide = await page.evaluate(() =>
        Math.max(0, ...[...document.querySelectorAll<HTMLElement>('[data-scene]')].map((s) => s.scrollWidth - s.clientWidth)),
      );
      expect(sceneWide, `${where} : la scène déborde à ${width} px`).toBeLessThanOrEqual(1);
    }
  } finally {
    await page.setViewportSize(original);
  }
}

/** Réponses enregistrées sur le téléphone (une par événement `answer`). */
export const answerEvents = async (page: Page): Promise<Extract<AppEvent, { kind: 'answer' }>[]> =>
  (await idbAll<AppEvent>(page, 'events')).filter((e): e is Extract<AppEvent, { kind: 'answer' }> => e.kind === 'answer');

// --- téléphone et serveur ----------------------------------------------------

/** Contenu d'un magasin IndexedDB de l'appli (base « pom »). */
export function idbAll<T>(page: Page, store: 'events' | 'outbox' | 'asks' | 'questions'): Promise<T[]> {
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

/** Jeton d'une session, pour appeler l'API du serveur local à sa place. */
export const authHeaders = async (page: Page) => ({ authorization: `Bearer ${await sessionToken(page)}` });

/** Événements que le serveur connaît de l'élève connecté sur ce téléphone. */
export async function serverEvents(page: Page): Promise<AppEvent[]> {
  const token = await sessionToken(page);
  const res = await page.request.get('/api/events', { headers: { authorization: `Bearer ${token}` } });
  expect(res.ok()).toBe(true);
  return ((await res.json()) as { events: AppEvent[] }).events;
}
