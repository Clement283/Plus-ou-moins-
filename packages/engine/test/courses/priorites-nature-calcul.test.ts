import { describe, expect, it } from 'vitest';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { natureQuestion, priorites5 as c } from '../../src/courses/essais/priorites-nature-calcul';
import { textOf } from '../../src/courses/essais/priorites-commun';
import { buildQuestion } from '../../src/exercises/build';
import { checkAnswer, courseRunItems } from '../../src';
import { seededRng } from '../../src/rng';

const NAMES = ['Somme', 'Différence', 'Produit', 'Quotient'];

describe('Priorités, cours 5 — La nature d’un calcul', () => {
  it('est dans le module Essais', () => expect(ESSAIS_COURSES).toContain(c));

  it('la bonne réponse est la dernière opération faite', () => {
    const answerOf = (text: string): string => {
      const q = natureQuestion(text);
      if (q.kind !== 'choix') throw new Error('choix');
      return q.options[q.correctIndex]!.label;
    };
    expect(answerOf('3 + 4 * 2')).toBe('Somme');
    expect(answerOf('(3 + 4) * 2')).toBe('Produit');
    expect(answerOf('10 - 2 * 3')).toBe('Différence');
    expect(answerOf('24 / (3 + 1)')).toBe('Quotient');
    expect(answerOf('12 - 3 * (4 - 2)')).toBe('Différence');
    expect(answerOf('12 / 3 * 2')).toBe('Produit'); // de gauche à droite : le × est le dernier
  });

  it('un mauvais choix est relié à une erreur du cours (et donc à une règle)', () => {
    const typeOf = (text: string, label: string): string | null => {
      const q = natureQuestion(text);
      if (q.kind !== 'choix') throw new Error('choix');
      const i = q.options.findIndex((o) => o.label === label);
      return checkAnswer(c, q, { choice: i }).errorType;
    };
    expect(typeOf('3 + 4 * 2', 'Produit')).toBe('premiere-operation');
    expect(typeOf('(3 + 4) * 2', 'Somme')).toBe('parenthese-nature');
    expect(typeOf('3 + 4 * 2', 'Quotient')).toBe('terme-facteur');
    expect(typeOf('3 + 4 * 2', 'Somme')).toBeNull();
    for (const id of ['premiere-operation', 'parenthese-nature', 'terme-facteur']) expect(c.errors.map((e) => e.id)).toContain(id);
  });

  it('générateur : les quatre natures arrivent, calculs propres, un message par choix', () => {
    const rng = seededRng(5);
    const seen = new Set<string>();
    for (const level of [1, 2, 3] as const) {
      for (let i = 0; i < 200; i++) {
        const q = buildQuestion(c, 'choix', { rng, level, timesSeen: 0 });
        expect(q.kind).toBe('choix');
        if (q.kind !== 'choix') return;
        expect(q.options.map((o) => o.label)).toEqual(NAMES);
        expect(textOf(q.ex).length).toBeLessThanOrEqual(30);
        seen.add(q.options[q.correctIndex]!.label);
        for (const o of q.options) expect(o.why.length).toBeGreaterThan(10);
      }
    }
    expect([...seen].sort()).toEqual([...NAMES].sort());
  });

  it('cinq exercices de fin à choix, notés', () => {
    const fins = courseRunItems(c, seededRng(3)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) expect(f.type === 'question' && f.question.kind).toBe('choix');
    const q = natureQuestion('3 + 4 * 2');
    if (q.kind !== 'choix') return;
    expect(checkAnswer(c, q, { choice: q.correctIndex })).toMatchObject({ correct: true });
    expect(checkAnswer(c, q, { choice: 2 })).toMatchObject({ correct: false });
  });
});
