import { describe, expect, it } from 'vitest';
import { equationExercise, equationsAjouterRetirer as c } from '../../src/courses/essais/equations-ajouter-retirer';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Exercise, Level } from '../../src/courses/types';
import { seededRng } from '../../src/rng';
import { propertyChecks, within } from './helpers';

const RANGE: Record<Level, [number, number]> = { 1: [2, 9], 2: [10, 30], 3: [10, 99] };
const meta = (ex: Exercise): { b: number; c: number } => ex.meta as { b: number; c: number };
/** L'exercice x + b = cc (réponse cc − b), construit comme le générateur. */
const mkEx = (b: number, cc: number): Exercise => equationExercise(1, b, cc);
const q = (ex: Exercise): Question => ({ kind: 'saisie', ex, promptLatex: '' }) as Question;
const o = (errorType: string | null): Outcome =>
  ({ correct: false, unfinished: false, errorType, errorFamily: errorType ? 'calcul' : null, given: '', expected: '' }) as Outcome;

describe('Cours équations — Retirer ou ajouter le même nombre', () => {
  it('résolution type', () => {
    expect(c.resolution(mkEx(3, 7))).toEqual(['x + 3 = 7', 'x + 3 - 3 = 7 - 3', 'x = 4']);
    expect(c.resolution(mkEx(-3, 5))).toEqual(['x - 3 = 5', 'x - 3 + 3 = 5 + 3', 'x = 8']);
    expect(c.resolution(mkEx(9, 4))).toEqual(['x + 9 = 4', 'x + 9 - 9 = 4 - 9', 'x = -5']);
  });

  it('une erreur reconnue par réponse fausse typique', () => {
    const diag = (b: number, cc: number, given: number): string =>
      c.errors.find((e) => e.detect(mkEx(b, cc), { n: given, d: 1 }))?.id ?? 'autre';
    expect(diag(3, 7, 7)).toBe('un-seul-cote');
    expect(diag(3, 7, 10)).toBe('mauvais-sens');
    expect(diag(-3, 5, 2)).toBe('mauvais-sens');
    expect(diag(9, 4, 5)).toBe('signe-calcul');
    expect(diag(3, 7, 100)).toBe('autre');
  });

  it('un message de retour par erreur prévisible (saisie)', () => {
    const ex = mkEx(3, 7);
    expect(c.feedbackText?.(q(ex), o('un-seul-cote'))).toContain('seulement le membre de gauche');
    expect(c.feedbackText?.(q(ex), o('mauvais-sens'))).toContain('au lieu de le retirer');
    expect(c.feedbackText?.(q(mkEx(-3, 5)), o('mauvais-sens'))).toContain('au lieu de l’ajouter');
    expect(c.feedbackText?.(q(mkEx(9, 4)), o('signe-calcul'))).toContain('4 − 9 = −5');
    expect(c.feedbackText?.(q(ex), o(null))).toContain('7 − 3');
    expect(c.feedbackText?.(q(ex), { ...o(null), correct: true })).toBeNull();
  });

  it('les questions construites montrent l’équation', () => {
    const ctx = { rng: seededRng(3), level: 1 as Level, timesSeen: 0 };
    const s = c.customQuestion?.('saisie', ctx);
    expect(s?.kind === 'saisie' && s.promptLatex).toContain('x');
    const t = c.customQuestion?.('trou', ctx);
    expect(t?.kind === 'trou' && t.promptLatex).toMatch(/^x [+-] \d+ [+-] \d+ = /);
    expect(c.customQuestion?.('resoudre', ctx)?.kind).toBe('resoudre');
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c,
      (ex, level) => {
        const { b, c: cc } = meta(ex);
        const x = ex.answer.n;
        return within(b, RANGE[level]) && cc === x + b && x !== 0 && cc !== 0 && (level > 1 || (cc > 0 && x > 0));
      },
      {
        'un-seul-cote': { holds: (ex) => ex.answer.n !== meta(ex).c, wrong: (ex) => meta(ex).c },
        'mauvais-sens': { holds: () => true, wrong: (ex) => meta(ex).c + meta(ex).b },
        'signe-calcul': { holds: (ex) => ex.answer.n !== 0, wrong: (ex) => -ex.answer.n },
      },
      42,
    ));
});
