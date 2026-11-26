import { describe, expect, it } from 'vitest';
import { MODULES, courseNumberLabel, courseRank, diagnose, getCourse, getModule } from '../../src';
import { neg, rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { exOf } from './helpers';

describe('Module « Calculs »', () => {
  it('module definition', () => {
    expect(MODULES).toHaveLength(1);
    const m = getModule('calculs');
    expect(m).toEqual({
      id: 'calculs',
      title: 'Calculs',
      theme: 'les bases du calcul, sans lesquelles on perd des points partout (second degré, fractions, équations…).',
      colorVar: '--module-calculs',
      firstNumber: 0,
      courseIds: [
        'c00-bien-ecrire',
        'c01-additionner-meme-signe',
        'c02-additionner-signes-contraires',
        'c03-additionner-plusieurs',
        'c04-soustraire',
        'c05-multiplier-deux',
        'c06-diviser-deux',
        'c07-multiplier-plusieurs',
      ],
    });
  });

  it('courses in order, all in the module', () => {
    const m = getModule('calculs');
    m.courseIds.forEach((id, i) => {
      const c = getCourse(id);
      expect(c.id).toBe(id);
      expect(c.order).toBe(i);
      expect(c.moduleId).toBe('calculs');
      expect(c.parts.length).toBeGreaterThan(0);
    });
  });

  it('unknown ids throw', () => {
    expect(() => getCourse('nope')).toThrow();
    expect(() => getModule('nope')).toThrow();
  });

  it('diagnose: right answer → null, first matching error wins, otherwise « autre »', () => {
    const c = getCourse('c01-additionner-meme-signe');
    const ex = exOf(c, '−3 + (−5)');
    expect(diagnose(c, ex, rat(-8))).toBeNull();
    expect(diagnose(c, ex, rat(8))).toEqual({ errorType: 'signe-oublie', family: 'signe' });
    expect(diagnose(c, ex, rat(-7))).toEqual({ errorType: 'autre', family: 'autre' });
    expect(diagnose(c, ex, rat(-15, 2))).toEqual({ errorType: 'autre', family: 'autre' });
  });

  it('courses 1–7: the opposite of a non-zero answer is the course\'s sign error (🔴)', () => {
    const rng = seededRng(808);
    for (const id of getModule('calculs').courseIds.slice(1)) {
      const c = getCourse(id);
      const signError = c.errors.find((e) => e.family === 'signe');
      for (const level of [1, 2, 3] as const)
        for (let i = 0; i < 1000; i++) {
          const ex = c.generate(level, rng);
          if (ex.answer.n === 0) continue;
          expect(diagnose(c, ex, neg(ex.answer))).toEqual({ errorType: signError?.id, family: 'signe' });
        }
    }
  });
});

describe('Noms courts des cours (bilan de séance)', () => {
  it('ceux de la maquette revisions.html', () => {
    const m = getModule('calculs');
    expect(m.courseIds.map((id) => getCourse(id).shortTitle)).toEqual([
      'Bien écrire',
      'Même signe',
      'Signes contraires',
      'Plusieurs relatifs',
      'Soustraire',
      'Multiplier',
      'Diviser',
      'Multiplier plusieurs',
    ]);
  });
});

describe('Numéro affiché des cours', () => {
  it('calculé : place dans le module, à partir de firstNumber (Relatifs commence au Cours 0)', () => {
    const m = getModule('calculs');
    expect(m.courseIds.map((id) => getCourse(id).order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('étiquette « Cours N » tant qu\'il n\'y a qu\'un module', () => {
    expect(courseNumberLabel('c05-multiplier-deux')).toBe('Cours 5');
    expect(courseRank('c05-multiplier-deux')).toBe(5);
  });
});
