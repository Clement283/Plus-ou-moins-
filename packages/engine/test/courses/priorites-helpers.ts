// Vérifications communes aux cours du module Priorités : générateur propre (étapes entières, largeur de téléphone) et calculs-pièges.
import { expect } from 'vitest';
import { calcSteps, parseCalc, textTokens } from '../../src/math/calcul';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { diagnose } from '../../src/courses';
import { textOf, treeOf } from '../../src/courses/essais/priorites-commun';
import type { CourseDef, Exercise, Level } from '../../src/courses/types';

export const LEVELS: Level[] = [1, 2, 3];

export function generatorChecks(course: CourseDef, fits: (ex: Exercise, level: Level) => boolean, seed = 7, draws = 300): void {
  const rng = seededRng(seed);
  for (const level of LEVELS) {
    for (let i = 0; i < draws; i++) {
      const ex = course.generate(level, rng);
      const text = textOf(ex);
      expect(ex.courseId).toBe(course.id);
      expect(ex.level).toBe(level);
      const p = parseCalc(text);
      expect(p.ok, text).toBe(true);
      if (!p.ok) return;
      expect(ex.answer, text).toEqual(p.value);
      expect(ex.answer.d, text).toBe(1);
      expect(text.length, text).toBeLessThanOrEqual(34);
      const lines = calcSteps(textTokens(text)!);
      for (const l of lines) for (const t of l) if (t.k === 'n') expect(t.v.d, text).toBe(1);
      expect(fits(ex, level), `${text} (niveau ${level})`).toBe(true);
      void treeOf;
    }
    for (const err of course.errors)
      for (let i = 0; i < 100; i++) {
        const ex = err.trap(level, rng);
        const wrong = err.wrongValues(ex);
        expect(wrong.length, `${err.id}: ${textOf(ex)}`).toBeGreaterThan(0);
        for (const w of wrong) {
          expect(w).not.toEqual(ex.answer);
          expect(diagnose(course, ex, w)?.errorType, `${err.id}: ${textOf(ex)} → ${w.n}`).toBe(err.id);
        }
      }
  }
}

/** Réponse donnée à un calcul → erreur reconnue (ou 'autre'). */
export function diag(course: CourseDef, ex: Exercise, given: number): string | undefined {
  return diagnose(course, ex, rat(given))?.errorType;
}
