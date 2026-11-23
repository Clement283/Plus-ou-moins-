import { describe, expect, it } from 'vitest';
import { MODULES, diagnose, getCourse, getModule } from '../../src';
import { rat } from '../../src/math/rational';
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

  it('every non-zero opposite answer is the sign error (🔴) of courses 1–7', () => {
    for (const id of getModule('calculs').courseIds.slice(1)) {
      const c = getCourse(id);
      expect(c.errors[0]?.family).toBe('signe');
    }
  });
});
