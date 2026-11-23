// checkAnswer: is the first answer right, and which error to record (doc 04, doc 03 §3).
import type { ErrorFamily } from '../events';
import { type RawInput, rawToString, readRaw } from '../input/raw';
import { type Rational, eqRat, neg, ratToString } from '../math/rational';
import { diagnose } from '../courses';
import type { CourseDef } from '../courses/types';
import type { Answer, Outcome, Question } from './types';
import { familyOf, signError } from './build/common';

const ALL_RIGHT = 'Tout est juste';
const SEP = ' · ';

const right = (given: string, expected: string): Outcome => ({
  correct: true,
  unfinished: false,
  errorType: null,
  errorFamily: null,
  given,
  expected,
});

const wrong = (errorType: string, errorFamily: ErrorFamily, given: string, expected: string): Outcome => ({
  correct: false,
  unfinished: false,
  errorType,
  errorFamily,
  given,
  expected,
});

/** Right, or wrong with the error and its family in the course (« autre » outside it). */
const judge = (course: CourseDef, correct: boolean, errorType: string, given: string, expected: string): Outcome =>
  correct ? right(given, expected) : wrong(errorType, familyOf(course, errorType), given, expected);

/**
 * A typed answer, read as written (doc 03 §3): a writing error first, then the value (right,
 * or « Simplifie »), then the error of a wrong value.
 */
function checkTyped(
  course: CourseDef,
  raw: RawInput,
  expectedValue: Rational,
  errorOf: (given: Rational) => { errorType: string; family: ErrorFamily },
): Outcome {
  const given = rawToString(raw);
  const expected = ratToString(expectedValue);
  const read = readRaw(raw, course.expectInteger);
  if (read.kind === 'writing-error') return wrong(read.errorType, 'ecriture', given, expected);
  if (read.kind === 'unfinished') return { ...right(given, expected), correct: false, unfinished: true };
  if (eqRat(read.value, expectedValue)) return right(given, expected);
  const e = errorOf(read.value);
  return wrong(e.errorType, e.family, given, expected);
}

const mismatch = (q: Question): never => {
  throw new Error(`Réponse inattendue pour un exercice « ${q.kind} »`);
};

/**
 * One Outcome per element of a multi-element exercise:
 * - « Relier les paires »: `a.pairs` lists every pair she tried, in order, wrong ones included
 *   (a wrong pair is shown and she tries again), so it tells the first try;
 * - « Classer »: `a.classes[i]` is the box where she first put calculation i.
 */
export function checkParts(course: CourseDef, q: Question, a: Answer): Outcome[] {
  if (q.kind === 'paires' && 'pairs' in a)
    return a.pairs.map(([l, r]) => {
      const ex = q.exs[l];
      const chosen = q.right[r];
      if (!ex || !chosen) throw new Error('Paire inconnue');
      const expected = ratToString(ex.answer);
      const given = ratToString(chosen.value);
      const d = diagnose(course, ex, chosen.value);
      return d ? wrong(d.errorType, d.family, given, expected) : right(given, expected);
    });
  if (q.kind === 'classer' && 'classes' in a) {
    const label = (id: string | undefined): string => q.classes.find((c) => c.id === id)?.label ?? id ?? '';
    const sign = signError(course)?.id ?? 'autre';
    return q.expected.map((id, i) => judge(course, a.classes[i] === id, sign, label(a.classes[i]), label(id)));
  }
  return mismatch(q);
}

export function checkAnswer(course: CourseDef, q: Question, a: Answer): Outcome {
  const custom = course.customCheck?.(q, a);
  if (custom) return custom;

  switch (q.kind) {
    case 'saisie':
      if (!('raw' in a)) return mismatch(q);
      return checkTyped(course, a.raw, q.ex.answer, (v) => {
        const d = diagnose(course, q.ex, v);
        return d ?? { errorType: 'autre', family: 'autre' };
      });

    case 'trou':
      if (!('raw' in a)) return mismatch(q);
      return checkTyped(course, a.raw, q.hidden, (v) => {
        // the opposite of the hidden number: the course's sign error
        const sign = signError(course);
        return sign && q.hidden.n !== 0 && eqRat(v, neg(q.hidden))
          ? { errorType: sign.id, family: sign.family }
          : { errorType: 'autre', family: 'autre' };
      });

    case 'ordre': {
      if (!('order' in a)) return mismatch(q);
      const text = (id: string): string => q.tiles.find((t) => t.id === id)?.latex ?? '';
      const placed = a.order.map(text);
      const solution = q.solution.map(text);
      const same = (x: string[], y: string[]): boolean => x.join('\n') === y.join('\n');
      const errorType =
        q.trapTile && placed.includes(q.trapTile.latex)
          ? q.trapTile.errorType
          : same([...placed].sort(), [...solution].sort())
            ? 'ordre-etapes'
            : 'autre';
      return judge(course, same(placed, solution), errorType, placed.join(SEP), solution.join(SEP));
    }

    case 'erreur': {
      if (!('line' in a)) return mismatch(q);
      const show = (line: number | null): string => (line === null ? ALL_RIGHT : (q.lines[line] ?? ''));
      // the error not spotted; « Tout est juste » on an error, or a line on a right resolution: relecture
      const errorType = q.wrongLine === null || a.line === null ? 'relecture' : (q.errorType ?? 'autre');
      return judge(course, a.line === q.wrongLine, errorType, show(a.line), show(q.wrongLine));
    }

    case 'paires': {
      const parts = checkParts(course, q, a);
      if (!('pairs' in a)) return mismatch(q);
      const firstWrong = parts.find((p) => !p.correct);
      const matched = new Set(a.pairs.filter((_, i) => parts[i]?.correct).map(([l]) => l));
      const show = (pairs: [number, number][]): string =>
        pairs.map(([l, r]) => `${q.left[l] ?? ''} → ${q.right[r]?.latex ?? ''}`).join(SEP);
      const solution = q.exs.map((e, l): [number, number] => [l, q.right.findIndex((r) => eqRat(r.value, e.answer))]);
      const correct = !firstWrong && matched.size === q.exs.length;
      return judge(course, correct, firstWrong?.errorType ?? 'autre', show(a.pairs), show(solution));
    }

    case 'classer': {
      const parts = checkParts(course, q, a);
      const firstWrong = parts.find((p) => !p.correct);
      const given = parts.map((p) => p.given).join(SEP);
      const expected = parts.map((p) => p.expected).join(SEP);
      return judge(course, !firstWrong, firstWrong?.errorType ?? 'autre', given, expected);
    }

    case 'qcm': {
      if (!('choice' in a)) return mismatch(q);
      const chosen = q.choices[a.choice];
      const answer = q.choices[q.correctIndex];
      if (!chosen || !answer) throw new Error('Choix inconnu');
      return judge(course, a.choice === q.correctIndex, chosen.errorType ?? 'autre', chosen.latex, answer.latex);
    }

    case 'vraifaux': {
      if (!('bool' in a)) return mismatch(q);
      const say = (b: boolean): string => (b ? 'Vrai' : 'Faux');
      // « Faux » on a right result: autre; « Vrai » on a trap: the trap's error
      const errorType = q.isTrue ? 'autre' : (q.errorType ?? 'autre');
      return judge(course, a.bool === q.isTrue, errorType, say(a.bool), say(q.isTrue));
    }
  }
}
