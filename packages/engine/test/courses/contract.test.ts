// Contrat commun à tout cours écrit « une phrase à la fois » (unePhrase) : la forme, pas les textes.
// Ajouté automatiquement pour chaque nouveau cours du module : rien à écrire dans un cXX.test.ts pour ces points.
// Les textes ne sont pas testés (l'auteur du projet relit chaque cours) ; le générateur et les calculs-pièges
// restent dans le test propre au cours (propertyChecks de helpers.ts), car ils dépendent des maths du cours.
import { describe, expect, it } from 'vitest';
import { CALCULS_COURSES } from '../../src/courses/calculs';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { courseRunItems } from '../../src';
import { lessonStep, type CourseDef, type LessonPart } from '../../src/courses/types';
import { seededRng } from '../../src/rng';

const COURSES = [...CALCULS_COURSES, ...ESSAIS_COURSES].filter((c) => c.unePhrase === true);
const isAnnonce = (p: LessonPart): boolean => p.type === 'etapes' && p.title.startsWith('Place aux');
/** Les écrans : une partie `joinPrevious` partage l'écran de la précédente. */
const isScreen = (p: LessonPart): boolean => !(p.type === 'question' && p.joinPrevious === true);

describe.each(COURSES.map((c) => [c.id, c] as [string, CourseDef]))('contrat de forme — %s', (_id, c) => {
  it('exercices de fin, fiche mémo, annonce de la fin en dernier', () => {
    expect(c.endExercises.count).toBe(5);
    expect(c.memo?.examples.length).toBeGreaterThan(0);
    expect(c.memo?.mistake.wrong).toBeTruthy();
    expect(isAnnonce(c.parts[c.parts.length - 1] as LessonPart)).toBe(true);
  });

  // 8 à 15 : les cours du module Équations visent environ 10 blocs (règles de rédaction de docs/modules/02-equations-inequations/module.md, 2026-11-26)
  it('8 à 15 écrans pour apprendre ; jamais plus de 2 lectures d’affilée ; 5 étapes au plus', () => {
    const before = c.parts.slice(0, c.parts.length - 1);
    const n = before.filter(isScreen).length;
    expect(n, 'écrans pour apprendre').toBeGreaterThanOrEqual(8);
    expect(n, 'écrans pour apprendre').toBeLessThanOrEqual(15);
    for (const p of c.parts) {
      if (p.type !== 'etapes' || isAnnonce(p)) continue;
      let run = 0;
      for (const s of p.steps) {
        run = s.action ? 0 : run + 1;
        if (s.text === undefined) run--; // l'encadré de règle n'est pas une lecture de plus
        expect(run, p.title).toBeLessThanOrEqual(2);
      }
      expect(p.steps.length, p.title).toBeLessThanOrEqual(5);
    }
  });

  it('chaque étape à phrase à trous montre ce dont elle parle (hl dans la scène après l’action)', () => {
    for (const p of c.parts)
      if (p.type === 'etapes')
        for (const s of p.steps.filter((x) => x.action?.type === 'trou'))
          expect([...(s.after?.calcs ?? [])].some((k) => k.tokens.some((t) => t.hl)), p.title).toBe(true);
  });

  it('chaque erreur reconnue renvoie à une règle qui existe (« Relire la règle N »)', () => {
    expect(c.errors.length).toBeGreaterThan(0);
    for (const e of c.errors) {
      expect(e.rule, e.id).toBeDefined();
      const p = c.parts[e.rule!.partIndex];
      expect(p?.type === 'etapes' && p.title, e.id).toBe(e.rule!.label);
      expect(p?.type === 'etapes' && p.steps.find((s) => s.rule)?.rule?.n, e.id).toBe(e.rule!.n);
    }
  });

  it('pastille d’étape cohérente, la série de pratique n’en fait pas partie', () => {
    const len = c.lessonLength as number;
    expect(len).toBeGreaterThan(0);
    const total = c.parts.slice(0, len).filter(isScreen).length;
    expect(lessonStep(c, 0)).toEqual({ n: 1, total });
    expect(lessonStep(c, len - 1)).toEqual({ n: total, total });
    expect(lessonStep(c, len)).toBeNull();
    const pratique = c.parts.findIndex((p) => p.type === 'pratique');
    expect(pratique, 'une série de pratique').toBeGreaterThanOrEqual(len - 1);
    const p = c.parts[pratique];
    expect(p?.type === 'pratique' && p.questions.length).toBe(4);
  });

  it('exercices de fin : 5, niveau 1, sur la méthode de ce cours seulement', () => {
    const fins = courseRunItems(c, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) {
      if (f.type !== 'question' || !('ex' in f.question)) throw new Error('question');
      expect(f.question.ex.level).toBe(1);
      expect(f.question.ex.courseId).toBe(c.id);
    }
  });
});
