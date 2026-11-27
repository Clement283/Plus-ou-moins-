import { describe, expect, it } from 'vitest';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { priorites6 as c } from '../../src/courses/essais/priorites-ecrire-un-calcul';
import { textOf } from '../../src/courses/essais/priorites-commun';
import { type EcrireQuestion, courseRunItems, gradeEcrire, judgeEcrire } from '../../src';
import { courseCalcLines } from '../../src/exercises/calculer';
import { ecrireCalcul } from '../../src/exercises/ecrire';
import { parseCalc } from '../../src/math/calcul';
import { buildQuestion } from '../../src/exercises/build';
import { seededRng } from '../../src/rng';
import { LEVELS } from './priorites-helpers';

const question = (level: 1 | 2 | 3, seed: number, index?: number, trap?: string): EcrireQuestion => {
  const q = buildQuestion(c, 'ecrire', { rng: seededRng(seed), level, timesSeen: 0, index, trapErrorType: trap });
  if (q.kind !== 'ecrire') throw new Error('ecrire');
  return q;
};
const flat = (t: string): string => t.replace(/[\s()]/g, '');

describe('Priorités, cours 6 — Écrire un calcul d’un seul coup', () => {
  it('est dans le module Essais, entre le cours 5 et le cours 7', () => {
    const ids = ESSAIS_COURSES.map((x) => x.id);
    expect(ids.indexOf(c.id)).toBe(ids.indexOf('priorites-nature-calcul') + 1);
    expect(ids.indexOf('priorites-moins-devant-parenthese')).toBe(ids.indexOf(c.id) + 1);
  });

  it('chaque écriture juste est lue, a la valeur attendue et est jugée juste ; la valeur est un entier', () => {
    for (const level of LEVELS)
      for (let seed = 1; seed <= 150; seed++) {
        const q = question(level, seed, seed % 5);
        expect(q.ex.answer.d).toBe(1);
        expect(textOf(q.ex).length).toBeLessThanOrEqual(26);
        q.steps.forEach((s, k) => {
          const target = parseCalc(s.accepted[0]!);
          expect(target.ok, s.accepted[0]).toBe(true);
          for (const a of s.accepted) {
            const p = parseCalc(a);
            expect(p.ok, a).toBe(true);
            if (p.ok && target.ok) expect(p.value, a).toEqual(target.value);
            expect(judgeEcrire(q, k, a).kind, a).toBe('juste');
          }
        });
        const last = q.steps.at(-1)!;
        expect(parseCalc(textOf(q.ex)).ok).toBe(true);
        expect(last.accepted).toContain(textOf(q.ex));
      }
  });

  it('un rang par sorte : phrase, programme, phrase, problème, programme', () => {
    const sorts = [0, 1, 2, 3, 4].map((i) => {
      const q = question(1, 3, i);
      return q.context.kind === 'programme' ? 'programme' : q.compute ? 'probleme' : 'phrase';
    });
    expect(sorts).toEqual(['phrase', 'programme', 'phrase', 'probleme', 'programme']);
    const fins = courseRunItems(c, seededRng(4)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) expect(f.type === 'question' && f.question.kind).toBe('ecrire');
  });

  it('parenthèses oubliées : le calcul sans parenthèses est reconnu, un résultat ou un calcul de même valeur est gris', () => {
    for (const level of LEVELS)
      for (let seed = 1; seed <= 100; seed++) {
        const q = question(level, seed, undefined, 'parentheses-oubliees');
        const k = q.steps.findIndex((s, i) => flat(s.accepted[0]!) !== s.accepted[0]!.replace(/\s/g, '') || i > 0);
        const s = q.steps[Math.max(0, k)]!;
        const bare = s.accepted.filter((a) => a.includes('('))[0];
        if (!bare) continue;
        const typed = bare.replace(/[()]/g, '');
        if (s.accepted.some((a) => flat(a) === flat(typed)) && !s.accepted.includes(typed)) {
          const v = judgeEcrire(q, Math.max(0, k), typed);
          expect(['faux', 'gris'], `${bare} → ${typed}`).toContain(v.kind);
        }
        const value = parseCalc(s.accepted[0]!);
        if (value.ok) expect(judgeEcrire(q, Math.max(0, k), String(value.value.n)).kind).toBe('gris');
      }
  });

  it('ordre inversé : calcul-piège sur une différence ou un quotient', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const q = question(1, seed, undefined, 'ordre');
      const p = parseCalc(q.steps[0]!.accepted[0]!);
      expect(p.ok && p.tree.t === 'b' && (p.tree.o === '-' || p.tree.o === '/')).toBe(true);
    }
  });

  it('exemple de la maquette : 30 − (2 + 7), programme, problème en deux temps', () => {
    const q: EcrireQuestion = { ...question(1, 1, 0), steps: [{ instr: null, accepted: ['30 - (2 + 7)'] }], context: { kind: 'phrase', text: 'D est la différence de 30 et de la somme de 2 et de 7.' } };
    expect(gradeEcrire(q, ['30−(2+7)'])).toMatchObject({ finished: true, correct: true });
    expect(gradeEcrire(q, ['30−2−7'])).toMatchObject({ finished: false }); // même valeur : gris, on recommence
    expect(gradeEcrire(q, ['30−2+7'])).toMatchObject({ correct: false, errorId: 'parentheses-oubliees' });
    const pb = question(1, 5, 3);
    expect(pb.compute).toBe(true);
    const lines = courseCalcLines(ecrireCalcul(pb)).slice(1).map((l) => l.replace(/\\times/g, '×'));
    expect(gradeEcrire(pb, [pb.steps[0]!.accepted[0]!], lines.map((l) => l.replace(/\s+/g, '')))).toMatchObject({ finished: true, correct: true });
  });

  it('les erreurs renvoient à une règle du cours', () => {
    expect(c.errors.map((e) => e.id).sort()).toEqual(['ordre', 'parentheses-oubliees']);
  });
});
