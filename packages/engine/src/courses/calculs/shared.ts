// Helpers shared by the courses of the « Calculs » module (doc 06); most serve the 7 « Relatifs » courses.
import { type Expr, evaluate, num, op, toLatex } from '../../math/expr';
import { type Rational, eqRat, rat } from '../../math/rational';
import { type Rng, pick, randInt } from '../../rng';
import type { ErrorFamily } from '../../events';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, Explanation, LessonBlock, Level, LessonPart, PartTexts, WrongResolution } from '../types';
import type { Question } from '../../exercises/types';

/** Number sizes of courses 1, 2 and 4: 1–9, tens, hundreds. */
export const SIZES: Record<Level, [number, number]> = { 1: [1, 9], 2: [10, 99], 3: [100, 999] };

export const MODULE_ID = 'calculs';

/** Up to this many redraws before giving up (property tests make this unreachable). */
const MAX_TRIES = 10_000;

export function redraw<T>(draw: () => T, ok: (t: T) => boolean): T {
  for (let i = 0; i < MAX_TRIES; i++) {
    const t = draw();
    if (ok(t)) return t;
  }
  throw new Error('Tirage impossible');
}

export const chance = (rng: Rng, p: number): boolean => rng() < p;

export const signed = (n: number, negative: boolean): number => (negative ? -n : n);

/** Which of two numbers are negative: at least one negative 3 times in 4 (courses 5 and 6). */
export function signs(rng: Rng): [boolean, boolean] {
  const oneNegative: [boolean, boolean][] = [[true, false], [false, true], [true, true]];
  return chance(rng, 0.75) ? pick(rng, oneNegative) : [false, false];
}

export const makeExercise = (courseId: string, level: Level, expr: Expr): Exercise => ({
  courseId,
  level,
  expr,
  answer: evaluate(expr),
});

/** Left-to-right chain of one operator: a op b op c … */
export const chain = (o: '+' | '*', xs: number[]): Expr =>
  xs.map((x) => num(x)).reduce((acc, e) => op(o, acc, e));

/** Integer leaves of a flat calculation, left to right. */
export function operands(e: Expr): number[] {
  if (e.k === 'num') return [e.v.n];
  if (e.k === 'op') return [...operands(e.a), ...operands(e.b)];
  return operands(e.a);
}

export const intOf = (r: Rational): number => r.n / r.d;
export const is = (given: Rational, x: number): boolean => eqRat(given, rat(x));
export const isOpposite = (ex: Exercise, given: Rational): boolean => is(given, -intOf(ex.answer));
export const absIs = (given: Rational, x: number): boolean => is(given, x) || is(given, -x);

/** Display text of an integer, with the Unicode minus. */
export const txt = (n: number): string => (n < 0 ? `−${-n}` : `${n}`);

export const mathSteps = (lines: string[]): LessonBlock[] =>
  lines.map((latex) => ({ t: 'math', latex, colorize: true }));

export const explanation = (rule: string, lines: string[]): Explanation => ({ rule, steps: mathSteps(lines) });

/** The answer as the last resolution line. */
export const resultLine = (ex: Exercise): string => `= ${toLatex(num(ex.answer))}`;

/** Sign class of a result: 'positif', 'negatif' or 'zero'. */
export function signClassOf(ex: Exercise): string {
  return ex.answer.n > 0 ? 'positif' : ex.answer.n < 0 ? 'negatif' : 'zero';
}

/** « Classer » boxes of the 7 Relatifs courses: résultat + / − / 0. */
export const SIGN_CLASSES: CourseDef['classes'] = [
  { id: 'positif', label: 'Résultat +', of: signClassOf },
  { id: 'negatif', label: 'Résultat −', of: signClassOf },
  { id: 'zero', label: 'Résultat 0', of: signClassOf },
];

export const draw = (rng: Rng, [lo, hi]: [number, number]): number => randInt(rng, lo, hi);

// ——— Lesson part helpers ———

export const explication = (...blocks: LessonBlock[]): LessonPart => ({ type: 'explication', blocks });
export const text = (t: string): LessonBlock => ({ t: 'text', text: t });
export const math = (latex: string): LessonBlock => ({ t: 'math', latex, colorize: true });
export const lecon = (question: Question): LessonPart => ({ type: 'question', activity: 'lecon', question });
/** Consigne des exemples guidés (doc 09, maquette). */
export const COMPLETE = "Complète, une case après l'autre.";
export const exemple = (question: Question): LessonPart => ({
  type: 'question',
  activity: 'exemple',
  question,
  ...(question.kind === 'trou' ? { consigne: COMPLETE } : {}),
});

/** Une explication pas à pas (écran à « Suite », doc 08 n° 20). */
export const etapes = (title: string, steps: EtapeStep[]): LessonPart => ({ type: 'etapes', title, steps });

/** Une petite question à un toucher : le calcul (LaTeX, ou rien), la question, des options avec leur explication. */
export const choix = (ex: Exercise, prompt: string, options: { label: string; why: string }[], correctIndex: number, calcLatex: string | null = null): Question => ({
  kind: 'choix',
  ex,
  calcLatex,
  prompt,
  options,
  correctIndex,
});

/** Une petite question de leçon : `choix` marquée `small` (repassage 2 étapes plus loin, options remélangées). */
export const smallChoix = (ex: Exercise, prompt: string, options: { label: string; why: string }[], correctIndex: number, calcLatex: string | null = null): Question => ({
  ...choix(ex, prompt, options, correctIndex, calcLatex),
  small: true,
} as Question);

/** Une question « pour découvrir » : elle ne compte jamais (activité `decouverte`). */
export const decouverte = (question: Question): LessonPart => ({ type: 'question', activity: 'decouverte', question });

/** Textes d'écran d'une partie (titre, intro, outro, `joinPrevious`…). */
export const texted = <P extends LessonPart>(part: P, texts: PartTexts): P => ({ ...part, ...texts });

/** Doc 09 : titre (et sous-titre) de l'écran. */
export const titled = <P extends LessonPart>(title: string, subtitle: string | undefined, part: P): P => ({
  ...part,
  title,
  ...(subtitle === undefined ? {} : { subtitle }),
});

/** Doc 09 : consigne propre à une question de leçon. */
export const asking = (consigne: NonNullable<PartTexts['consigne']>, part: LessonPart): LessonPart => ({ ...part, consigne }) as LessonPart;

/** Étiquettes : « Remets les étapes de … dans l'ordre » (doc 09). */
export const ordered = (calc: string, part: LessonPart): LessonPart => titled(`Remets les étapes de ${calc} dans l'ordre`, undefined, part);

/** Lignes de la règle : ✓ vert (`ok`), ✗ rouge (`ko`) et ~ gris (`neutre`), avec leur explication éventuelle. */
export const ok = (t: string): LessonBlock => ({ t: 'text', text: t, tone: 'ok' });
export const ko = (t: string, note: string): LessonBlock => ({ t: 'text', text: t, tone: 'ko', note });
export const neutre = (t: string, note: string): LessonBlock => ({ t: 'text', text: t, tone: 'neutre', note });
export const heading = (t: string): LessonBlock => ({ t: 'heading', text: t });
/** Bloc « Fais attention » de la règle (doc 09). */
export const attention = (...lines: LessonBlock[]): LessonBlock[] => [heading('Fais attention'), ...lines];

export const saisie = (ex: Exercise): Question => ({ kind: 'saisie', ex, promptLatex: `${toLatex(ex.expr)} = \\square` });
export const trou = (ex: Exercise, promptLatex: string, hidden: number): Question => ({
  kind: 'trou',
  ex,
  promptLatex,
  hidden: rat(hidden),
});

/** « Étiquettes à ordonner »: tiles in a fixed mixed order, `solution` = the doc's order. */
export function ordre(ex: Exercise, labels: string[], shownOrder: number[]): Question {
  const tiles = labels.map((l, i) => ({ id: `t${i + 1}`, latex: `\\text{${l}}` }));
  return {
    kind: 'ordre',
    ex,
    tiles: shownOrder.map((i) => tiles[i] as { id: string; latex: string }),
    solution: tiles.map((t) => t.id),
  };
}

/** A « signe du résultat » box: two big buttons « + » and « − ». */
export const signBox = (ex: Exercise, positive: boolean, signErrorId: string): Question => ({
  kind: 'qcm',
  ex,
  choices: [
    { value: rat(1), latex: '+', errorType: positive ? null : signErrorId },
    { value: rat(-1), latex: '-', errorType: positive ? signErrorId : null },
  ],
  correctIndex: positive ? 0 : 1,
  formula: 'debut',
});

// ——— Recognised errors ———

export interface ErrorSpec {
  id: string;
  family: ErrorFamily;
  detect(ex: Exercise, given: Rational): boolean;
  /** The « Explication affichée » of doc 06 for this calculation. */
  text(ex: Exercise): string;
  /** A calculation that sets this trap (doc 06 « Calcul-piège »). */
  draw(level: Level, rng: Rng): Exercise;
  /** The typical wrong answer of this error on `ex` (a trap must keep it). */
  sample(ex: Exercise): number;
  /** Other wrong answers of this error on `ex`. */
  alsoWrong?(ex: Exercise): number[];
  /** The resolution lines of a student making this error and finding `wrong`; null if it does not fit. */
  wrongLines?(ex: Exercise, wrong: number): string[] | null;
}

/** Sign written before a parenthesis: « − » for a negative, « + » otherwise. */
export const sg = (x: number): string => (x < 0 ? '-' : '+');

/** The calculation, one step line, then the (wrong) result. */
export const stepped = (ex: Exercise, step: string, result: number): string[] => [
  toLatex(ex.expr),
  `= ${step}`,
  `= ${toLatex(num(result))}`,
];

/** Wrong lines against the model: the first line that differs (never the calculation itself). */
export function against(right: string[], lines: string[]): WrongResolution | null {
  const wrongLine = lines.findIndex((l, i) => l !== right[i]);
  return wrongLine > 0 ? { lines, wrongLine } : null;
}

/**
 * ErrorDefs in detection order. A trap is redrawn until its typical wrong answer
 * is really diagnosed as this error (and not as an earlier one of the list).
 */
export function buildErrors(specs: ErrorSpec[], resolution: (ex: Exercise) => string[]): ErrorDef[] {
  const diagnosedAs = (id: string, ex: Exercise, x: number): boolean => {
    const given = rat(x);
    return !eqRat(given, ex.answer) && errors.find((e) => e.detect(ex, given))?.id === id;
  };
  const errors: ErrorDef[] = specs.map((s) => ({
    id: s.id,
    family: s.family,
    detect: s.detect,
    explain: (ex) => explanation(s.text(ex), resolution(ex)),
    trap: (level, rng) => redraw(() => s.draw(level, rng), (ex) => diagnosedAs(s.id, ex, s.sample(ex))),
    wrongValues: (ex) =>
      [...new Set([s.sample(ex), ...(s.alsoWrong?.(ex) ?? [])])]
        .filter((x) => diagnosedAs(s.id, ex, x))
        .map((x) => rat(x)),
    ...(s.wrongLines
      ? {
          wrongResolution: (ex: Exercise, wrong: Rational) => {
            const lines = wrong.d === 1 ? s.wrongLines?.(ex, wrong.n) : null;
            return lines ? against(resolution(ex), lines) : null;
          },
        }
      : {}),
  }));
  return errors;
}

/** Display text of a calculation (Unicode − × ÷), for explanation sentences. */
export const toText = (e: Expr): string =>
  toLatex(e).replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/-/g, '−');

// ——— Interactive lesson helpers (Cours 1 v2 onwards) ———

/** « Toucher la droite » : les bonds sont dessinés, l'élève touche l'arrivée. */
export const droiteQ = (ex: Exercise, line: { from: number; to: number }, jumps: { from: number; by: number }[]): Question => ({
  kind: 'droite',
  ex,
  promptLatex: toLatex(ex.expr),
  line,
  jumps,
  answer: ex.answer.n,
});

/** Une série de pratique : une question par élément, comptée dans la note sauf `uncounted`. */
export const pratique = (title: string, questions: { question: Question; texts?: PartTexts }[], outro?: string): LessonPart => ({
  type: 'pratique',
  title,
  questions,
  ...(outro ? { outro } : {}),
});

/** Une étape d'un écran « pas à pas ». */
export const step = (text: string | undefined, extra: Omit<EtapeStep, 'text'> = {}): EtapeStep => ({
  ...(text === undefined ? {} : { text }),
  ...extra,
});
