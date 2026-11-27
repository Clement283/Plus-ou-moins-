import { describe, expect, it } from 'vitest';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { priorites7 as c } from '../../src/courses/essais/priorites-moins-devant-parenthese';
import { mkEx, textOf } from '../../src/courses/essais/priorites-commun';
import { calculerCalcul, courseCalcLines, judgeTypedCalcLine } from '../../src/exercises/calculer';
import { type EcrireQuestion, courseRunItems, gradeEcrire, judgeEcrire } from '../../src';
import { buildQuestion } from '../../src/exercises/build';
import { collect } from '../../src/math/equation';
import { parseEquation } from '../../src/math/parse-equation';
import { seededRng } from '../../src/rng';
import { diag, generatorChecks, LEVELS } from './priorites-helpers';

const LETTRES_ERRORS = ['un-seul-signe', 'moins-oublie', 'expression-fausse'];

const ex = (text: string) => mkEx(c.id, 1, text);

describe('Priorités, cours 7 — Un moins devant une parenthèse (nombres)', () => {
  it('est dans le module Essais', () => expect(ESSAIS_COURSES).toContain(c));

  it('générateur : une parenthèse précédée de + ou −, un − devant une parenthèse qui change la valeur', () => {
    generatorChecks(c, (e, level) => /[+-] \(/.test(textOf(e)) && (level > 1 || e.answer.n >= 0), 7, 300, LETTRES_ERRORS);
  });

  it('erreurs reconnues', () => {
    expect(diag(c, ex('8 - (3 - 2)'), 3)).toBe('moins-parenthese'); // 8 − 3 − 2
    expect(diag(c, ex('8 - (3 + 2)'), 7)).toBe('moins-parenthese'); // 8 − 3 + 2
    expect(diag(c, ex('8 - (3 - 2)'), 7)).toBeUndefined();
    expect(diag(c, ex('8 + (3 - 2)'), 13)).toBe('signe'); // 8 + (3 + 2)
  });

  it('en lignes : les deux chemins sont acceptés', () => {
    const q = calculerCalcul(ex('15 - (4 - 9)'), '15 - (4 - 9)');
    expect(courseCalcLines(q)).toEqual(['15 - (4 - 9)', '15 - (-5)', '15 + 5', '20']);
    expect(judgeTypedCalcLine(q, null, '15 − (−5)')).toMatchObject({ kind: 'juste' });
    expect(judgeTypedCalcLine(q, null, '15 − 4 + 9')).toMatchObject({ kind: 'juste' }); // parenthèse enlevée, signes changés
    expect(judgeTypedCalcLine(q, null, '15 − 4 − 9')).toMatchObject({ kind: 'fausse', errorId: 'moins-parenthese', title: 'Le − change le signe de chaque terme.' });
  });
});

const lettres = (seed: number, level: 1 | 2 | 3 = 1, index?: number, trap?: string): EcrireQuestion => {
  const q = buildQuestion(c, 'ecrire', { rng: seededRng(seed), level, timesSeen: 0, index, trapErrorType: trap });
  if (q.kind !== 'ecrire') throw new Error('ecrire');
  return q;
};
const coef = (t: string) => {
  const r = parseEquation(`${t.replace(/\s+/g, '').replace(/−/g, '-')}=0`);
  if (!r.ok) throw new Error(t);
  const { a, b } = collect(r.eq.left);
  return { a: a.n, b: b.n };
};

describe('Priorités, cours 7 — partie lettres', () => {
  it('l’expression attendue est celle de la parenthèse sans le −, un seul x, jamais de terme en x à réduire', () => {
    for (const level of LEVELS)
      for (let seed = 1; seed <= 150; seed++) {
        const q = lettres(seed, level, seed % 5);
        const L = q.linear!;
        const latex = (q.context as { latex: string }).latex;
        expect(latex.match(/x/g)).toHaveLength(1);
        expect(L.p).toBeGreaterThanOrEqual(1);
        // départ lu avec x = 1 et x = 2 : k op (p x + q) a bien pour coefficients a et b
        const val = (x: number): number => {
          const inner = L.p * x + L.q;
          return L.op === '-' ? L.k - inner : L.k + inner;
        };
        expect(val(2) - val(1)).toBe(L.a);
        expect(val(0)).toBe(L.b);
        // l'écriture « signes changés » est jugée juste, avec ou sans réduire
        const body = L.op === '-' ? `${L.k === 0 ? '' : L.k}-${L.p === 1 ? '' : L.p}x${L.q < 0 ? '+' : '-'}${Math.abs(L.q)}` : `${L.k}+${L.p === 1 ? '' : L.p}x${L.q < 0 ? '-' : '+'}${Math.abs(L.q)}`;
        expect(coef(body)).toEqual({ a: L.a, b: L.b });
        expect(judgeEcrire(q, 0, body).kind).toBe('juste');
      }
  });

  it('erreurs reconnues : un seul signe changé, moins oublié ; parenthèse gardée = gris', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const q = lettres(seed, 1, undefined, 'un-seul-signe');
      const L = q.linear!;
      expect(L.op).toBe('-');
      const x = L.p === 1 ? 'x' : `${L.p}x`;
      expect(judgeEcrire(q, 0, `${L.k === 0 ? '' : L.k}-${x}${L.q < 0 ? '-' : '+'}${Math.abs(L.q)}`)).toMatchObject({ kind: 'faux', errorId: 'un-seul-signe' });
      expect(judgeEcrire(q, 0, `${L.k === 0 ? '' : `${L.k}+`}${x}${L.q < 0 ? '-' : '+'}${Math.abs(L.q)}`)).toMatchObject({ kind: 'faux', errorId: 'moins-oublie' });
      expect(judgeEcrire(q, 0, (q.context as { latex: string }).latex).kind).toBe('gris');
    }
    const q = lettres(1);
    expect(gradeEcrire({ ...q, linear: { a: -1, b: 8, k: 5, op: '-', p: 1, q: -3 } }, ['5−x+3'])).toMatchObject({ correct: true, message: 'Tu peux encore réduire : 8 − x.' });
  });

  it('exercices de fin : 3 calculs par lignes puis 2 écritures avec lettres ; les erreurs renvoient à une règle du cours', () => {
    const fins = courseRunItems(c, seededRng(4)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins.map((f) => f.type === 'question' && f.question.kind)).toEqual(['calculer', 'calculer', 'calculer', 'ecrire', 'ecrire']);
    expect(c.formats).toContain('ecrire');
    for (const id of LETTRES_ERRORS) expect(c.errors.find((e) => e.id === id)?.rule).toMatchObject({ n: 4, label: 'Avec une lettre', partIndex: 7 });
  });
});
