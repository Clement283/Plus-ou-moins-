// Test helpers for the course tests: read doc 06 display strings.
import { expect } from 'vitest';
import { type Expr, type Op, evaluate, num, op, toLatex } from '../../src/math/expr';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import type { CourseDef, Exercise, Level } from '../../src/courses/types';
import { diagnose } from '../../src/courses';
import { checkAnswer } from '../../src';
import type { Answer, Question } from '../../src/exercises/types';

/** Doc 06 display (Unicode − × ÷) → our LaTeX. */
export const tex = (s: string): string =>
  s.replace(/−/g, '-').replace(/×/g, '\\times').replace(/÷/g, '\\div');

/** Parses a flat doc 06 calculation such as "−3 + (−5)" or "4 × (−3) × 2" (precedence respected). */
export function parseCalc(display: string): Expr {
  const src = display.replace(/\s+/g, '');
  const items: (number | Op)[] = [];
  let i = 0;
  while (i < src.length) {
    const neg = src.startsWith('(−', i) ? 2 : src[i] === '−' && i === 0 ? 1 : 0;
    if (neg > 0 || /\d/.test(src[i] as string)) {
      let j = i + neg;
      while (j < src.length && /\d/.test(src[j] as string)) j++;
      const n = Number(src.slice(i + neg, j));
      items.push(neg > 0 ? -n : n);
      i = neg === 2 ? j + 1 : j;
    } else {
      const map: Record<string, Op> = { '+': '+', '−': '-', '×': '*', '÷': '/' };
      const o = map[src[i] as string];
      if (!o) throw new Error(`bad char ${src[i]} in ${display}`);
      items.push(o);
      i++;
    }
  }
  // precedence: first fold × ÷, then + − (left to right)
  const lvl1: (Expr | Op)[] = [];
  let acc: Expr = num(items[0] as number);
  for (let k = 1; k < items.length; k += 2) {
    const o = items[k] as Op;
    const b = num(items[k + 1] as number);
    if (o === '*' || o === '/') acc = op(o, acc, b);
    else {
      lvl1.push(acc, o);
      acc = b;
    }
  }
  lvl1.push(acc);
  let e = lvl1[0] as Expr;
  for (let k = 1; k < lvl1.length; k += 2) e = op(lvl1[k] as Op, e, lvl1[k + 1] as Expr);
  return e;
}

export const exOf = (course: CourseDef, display: string, level: Level = 1): Exercise => {
  const expr = parseCalc(display);
  return { courseId: course.id, level, expr, answer: evaluate(expr) };
};

/** One row of a doc 06 « Exemples de calculs » table. */
export function checkExample(course: CourseDef, level: Level, display: string, answer: number): void {
  const ex = exOf(course, display, level);
  expect(toLatex(ex.expr)).toBe(tex(display));
  expect(ex.answer).toEqual(rat(answer));
}

/** « Réponse donnée → erreur reconnue »: null expected = « autre ». */
export function checkDiagnosis(course: CourseDef, display: string, given: number, errorType: string): void {
  const ex = exOf(course, display);
  const d = diagnose(course, ex, rat(given));
  expect(d?.errorType, `${display} → ${given}`).toBe(errorType);
  if (errorType === 'autre') expect(d?.family).toBe('autre');
  else expect(d?.family).toBe(course.errors.find((e) => e.id === errorType)?.family);
}

export const LEVELS: Level[] = [1, 2, 3];
export const DRAWS = 1000;
export const TOLERANCE = 0.07;

export const ints = (ex: Exercise): number[] => {
  const out: number[] = [];
  const walk = (e: Expr): void => {
    if (e.k === 'num') {
      expect(e.v.d).toBe(1);
      out.push(e.v.n);
    } else if (e.k === 'op') {
      walk(e.a);
      walk(e.b);
    } else walk(e.a);
  };
  walk(ex.expr);
  return out;
};

export const within = (x: number, [lo, hi]: [number, number]): boolean => Math.abs(x) >= lo && Math.abs(x) <= hi;

/** Every operator of a flat calculation. */
export const opsOf = (e: Expr): Op[] => (e.k === 'op' ? [...opsOf(e.a), e.op, ...opsOf(e.b)] : []);

export interface TrapSpec {
  /** What the doc 06 « Calcul-piège » column asks for. */
  holds(ex: Exercise): boolean;
  /** The typical wrong answer of this error on that calculation. */
  wrong(ex: Exercise): number;
}

/** Review Focus 5: 1,000 draws per level, and every trap at every level. */
export function propertyChecks(
  course: CourseDef,
  fits: (ex: Exercise, level: Level) => boolean,
  traps: Record<string, TrapSpec>,
  seed: number,
): void {
  const rng = seededRng(seed);
  expect(Object.keys(traps)).toEqual(course.errors.map((e) => e.id));
  for (const level of LEVELS) {
    for (let i = 0; i < DRAWS; i++) {
      const ex = course.generate(level, rng);
      expect(ex.courseId).toBe(course.id);
      expect(ex.level).toBe(level);
      expect(evaluate(ex.expr)).toEqual(ex.answer);
      expect(fits(ex, level), `${toLatex(ex.expr)} (niveau ${level})`).toBe(true);
      for (const err of course.errors)
        for (const w of err.wrongValues(ex)) {
          expect(w, `${err.id} on ${toLatex(ex.expr)}`).not.toEqual(ex.answer);
          expect(diagnose(course, ex, w)?.errorType, `${err.id}: ${toLatex(ex.expr)} → ${w.n}`).toBe(err.id);
        }
    }
    for (const err of course.errors) {
      const spec = traps[err.id] as TrapSpec;
      for (let i = 0; i < DRAWS; i++) {
        const ex = err.trap(level, rng);
        const shown = `${err.id}: ${toLatex(ex.expr)} (niveau ${level})`;
        expect(ex.level).toBe(level);
        expect(evaluate(ex.expr)).toEqual(ex.answer);
        expect(fits(ex, level), shown).toBe(true);
        expect(spec.holds(ex), shown).toBe(true);
        expect(diagnose(course, ex, rat(spec.wrong(ex)))?.errorType, shown).toBe(err.id);
        expect(err.wrongValues(ex), shown).toContainEqual(rat(spec.wrong(ex)));
      }
    }
  }
}

/** Share of DRAWS draws (all levels) satisfying `pred`. */
export function share(course: CourseDef, level: Level, seed: number, pred: (ex: Exercise) => boolean): number {
  const rng = seededRng(seed);
  let n = 0;
  for (let i = 0; i < DRAWS; i++) if (pred(course.generate(level, rng))) n++;
  return n / DRAWS;
}

// ——— Tester `feedbackText` : un message par réponse prévisible ———

/** Une réponse tapée au clavier (−12 → touches « - », « 1 », « 2 »). */
export const typed = (n: number): Answer => ({
  raw: { tokens: [...(n < 0 ? `-${-n}` : String(n))].map((c) => ({ t: 'c' as const, c: c as '-' })), cursor: 'root' as const },
});
/** Une question « taper le résultat » sur un calcul écrit comme dans le doc 06 (« −12 ÷ 4 »). */
export const saisieOf = (course: CourseDef, display: string): Question => ({ kind: 'saisie', ex: exOf(course, display), promptLatex: '' }) as Question;
/** Le message que le cours affiche pour cette réponse (null = message du moteur). */
export const say = (course: CourseDef, q: Question, a: Answer): string | null => course.feedbackText?.(q, checkAnswer(course, q, a)) ?? null;
