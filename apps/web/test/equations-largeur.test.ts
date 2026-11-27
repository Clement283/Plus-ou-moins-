import { describe, expect, it } from 'vitest';
import { getCourse, buildQuestion, seededRng, type CourseDef, type Level } from '@pom/engine';
import { QUESTION_FONT, RESOLUTION_FONT, lessonMaths, mathLines, sceneOverflows, scenesOf } from './phoneWidth';

const COURSES = ['equations-diviser', 'equations-resoudre-premier-degre'];

describe.each(COURSES)('Largeur du téléphone — %s', (id) => {
  const course: CourseDef = getCourse(id);
  it('les scènes de la leçon tiennent dans la largeur', () => expect(scenesOf(course.parts).flatMap((s) => sceneOverflows(s))).toEqual([]));
  it('les calculs de la leçon tiennent sur une ou deux lignes', () => {
    for (const latex of lessonMaths(course.parts)) expect(mathLines(latex, QUESTION_FONT), latex).toBeLessThanOrEqual(2);
  });
  it('calculs tirés aux trois niveaux : question et lignes de résolution', () => {
    const rng = seededRng(4);
    for (const level of [1, 2, 3] as Level[])
      for (let i = 0; i < 200; i++) {
        const q = buildQuestion(course, 'saisie', { rng, level, timesSeen: 0 });
        if (q.kind !== 'saisie') throw new Error('saisie');
        expect(mathLines(q.promptLatex, QUESTION_FONT), q.promptLatex).toBeLessThanOrEqual(2);
        for (const l of course.resolution(q.ex)) expect(mathLines(l, RESOLUTION_FONT), l).toBe(1);
      }
  });
});
