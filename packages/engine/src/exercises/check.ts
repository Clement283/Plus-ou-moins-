// checkAnswer: is the first answer right, and which error to record (doc 04, doc 03 §3).
import type { ErrorFamily } from '../events';
import { type RawInput, rawToString, readRaw } from '../input/raw';
import { type Rational, eqRat, neg, rat, ratToString } from '../math/rational';
import { diagnose } from '../courses';
import type { CourseDef } from '../courses/types';
import type { Answer, Outcome, Question } from './types';
import { normalizeCalc } from './rewrite';
import { familyOf, signError } from '../courses/errors-util';
import { gradeResolution, solutionText } from './resoudre';
import { gradeCalcul, verdictText } from './calculer';

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
    if (a.classes.length !== q.expected.length)
      throw new Error(`Réponse incomplète : ${a.classes.length} calculs rangés sur ${q.expected.length}`);
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
      if (q.accept) {
        // « Toucher la faute » : plusieurs cases acceptées (nombre = une case)
        const shown = (line: number | null): string => (line === null ? 'Tout est bien écrit' : (q.lines[line] ?? ''));
        const ok = a.line === null ? q.accept.length === 0 : q.accept.includes(a.line);
        const errorType = q.accept.length === 0 || a.line === null ? 'relecture' : (q.errorType ?? 'autre');
        return judge(course, ok, errorType, shown(a.line), shown(q.accept[0] ?? null));
      }
      const show = (line: number | null): string => (line === null ? ALL_RIGHT : (q.lines[line] ?? ''));
      // the error not spotted; « Tout est juste » on an error, or a line on a right resolution: relecture
      const errorType = q.wrongLine === null || a.line === null ? 'relecture' : (q.errorType ?? 'autre');
      return judge(course, a.line === q.wrongLine, errorType, show(a.line), show(q.wrongLine));
    }

    case 'paires': {
      if (!('pairs' in a)) return mismatch(q);
      const parts = checkParts(course, q, a);
      const firstWrong = parts.find((p) => !p.correct);
      const matched = new Set(a.pairs.filter((_, i) => parts[i]?.correct).map(([l]) => l));
      // the exercise ends when every calculation has its result
      if (matched.size !== q.exs.length)
        throw new Error(`Réponse incomplète : ${matched.size} paires justes sur ${q.exs.length}`);
      const show = (pairs: [number, number][]): string =>
        pairs.map(([l, r]) => `${q.left[l] ?? ''} → ${q.right[r]?.latex ?? ''}`).join(SEP);
      const solution = q.exs.map((e, l): [number, number] => [l, q.right.findIndex((r) => eqRat(r.value, e.answer))]);
      return judge(course, !firstWrong, firstWrong?.errorType ?? 'autre', show(a.pairs), show(solution));
    }

    case 'classer': {
      if (!('classes' in a)) return mismatch(q);
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

    case 'choix': {
      if (!('choice' in a)) return mismatch(q);
      const chosen = q.options[a.choice];
      const answer = q.options[q.correctIndex];
      if (!chosen || !answer) throw new Error('Choix inconnu');
      return { ...(a.choice === q.correctIndex ? right(chosen.label, answer.label) : wrong('autre', 'autre', chosen.label, answer.label)), errorType: null, errorFamily: null, message: chosen.why };
    }

    case 'reecrire': {
      if (!('text' in a)) return mismatch(q);
      const given = normalizeCalc(a.text);
      if (given === q.expected) return { ...right(given, q.expected), message: '' };
      const hit = q.specific.find((s) => s.answer === given);
      if (hit?.correct) return { ...right(given, q.expected), message: hit.message };
      const errorType = hit ? hit.errorType : null;
      return {
        correct: false,
        unfinished: false,
        errorType,
        errorFamily: errorType ? familyOf(course, errorType) : null,
        given,
        expected: q.expected,
        message: hit ? hit.message : q.fallback,
      };
    }

    case 'resoudre': {
      if (!('lines' in a)) return mismatch(q);
      const g = gradeResolution(q.start, a.lines);
      const given = a.lines.at(-1) ?? '';
      const expected = solutionText(q.start);
      if (!g.finished) return { correct: false, unfinished: true, errorType: null, errorFamily: null, given, expected };
      if (g.firstError === null) return { ...right(given, expected), helped: a.hinted, message: '' };
      return {
        correct: false,
        unfinished: false,
        errorType: g.firstError,
        errorFamily: familyOf(course, g.firstError),
        given,
        expected,
        message: g.firstErrorText ? `${g.firstErrorText.title} ${g.firstErrorText.message}` : '',
      };
    }

    case 'calculer': {
      if (!('calcLines' in a)) return mismatch(q);
      const g = gradeCalcul(q, a.calcLines);
      const given = a.calcLines.at(-1) ?? '';
      const expected = verdictText(q.isSolution);
      if (!g.finished) return { correct: false, unfinished: true, errorType: null, errorFamily: null, given, expected };
      const verdictRight = a.firstPick === q.isSolution;
      if (g.firstError === null && verdictRight) return { ...right(given, expected), helped: a.hinted, message: '' };
      const errorType = g.firstError ?? 'verdict';
      const family: ErrorFamily = g.firstError === 'signe' ? 'signe' : g.firstError === 'priorite' ? 'calcul' : 'autre';
      return {
        correct: false,
        unfinished: false,
        errorType,
        errorFamily: family,
        given,
        expected,
        message: g.firstErrorText ? `${g.firstErrorText.title} ${g.firstErrorText.message}` : 'Compare les deux membres : sont-ils égaux ?',
      };
    }

    case 'droite': {
      if (!('point' in a)) return mismatch(q);
      const mark = (n: number): string => `${n}`.replace(/-/g, '−');
      const given = mark(a.point);
      const expected = mark(q.answer);
      if (a.point === q.answer) return right(given, expected);
      const d = diagnose(course, q.ex, rat(a.point));
      return wrong(d?.errorType ?? 'autre', d?.family ?? 'autre', given, expected);
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
