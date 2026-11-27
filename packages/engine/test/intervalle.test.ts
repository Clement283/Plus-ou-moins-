import { describe, expect, it } from 'vitest';
import {
  type IntervalInput,
  checkAnswer,
  cst,
  emptyInterval,
  equation,
  getCourse,
  gradeIntervalle,
  intervalLatex,
  intervalOfRelation,
  intervalText,
  intervalleFromInequality,
  intervalleQuestion,
  judgeInterval,
  num,
  parseBound,
  rat,
  readInterval,
  xt,
} from '../src';

const iv = (left: '[' | ']', lo: string, hi: string, right: '[' | ']'): IntervalInput => ({ left, lo, hi, right });
const ex = { courseId: 'c05-multiplier-deux', level: 1 as const, expr: num(0), answer: rat(0) };
const course = getCourse('c05-multiplier-deux');

describe('intervalles', () => {
  it('écrit x rel b en intervalle', () => {
    expect(intervalText(intervalOfRelation('<', rat(3)))).toBe(']−∞ , 3[');
    expect(intervalText(intervalOfRelation('<=', rat(-3)))).toBe(']−∞ , −3]');
    expect(intervalText(intervalOfRelation('>', rat(1, 2)))).toBe(']1/2 , +∞[');
    expect(intervalText(intervalOfRelation('>=', rat(2)))).toBe('[2 , +∞[');
    expect(intervalLatex(intervalOfRelation('>=', rat(2)))).toContain('+\\infty');
  });

  it('lit les bornes tapées', () => {
    expect(parseBound('−3')).toEqual({ kind: 'num', v: rat(-3) });
    expect(parseBound('3/2')).toEqual({ kind: 'num', v: rat(3, 2) });
    expect(parseBound('1,5')).toEqual({ kind: 'num', v: rat(3, 2) });
    expect(parseBound('+∞')).toEqual({ kind: 'inf', sign: 1 });
    expect(parseBound('−∞')).toEqual({ kind: 'inf', sign: -1 });
    expect(parseBound('−')).toEqual({ kind: 'bad' });
    expect(readInterval(emptyInterval())).toEqual({ ok: false, error: 'vide' });
    expect(readInterval(iv('[', '−', '3', ']'))).toEqual({ ok: false, error: 'illisible' });
  });

  it('juge : juste, puis les erreurs nommées', () => {
    const e = intervalOfRelation('<', rat(3)); // ]−∞ , 3[
    expect(judgeInterval(e, iv(']', '−∞', '3', '['))).toEqual({ ok: true });
    expect(judgeInterval(e, iv('[', '−∞', '3', '['))).toEqual({ ok: false, errorId: 'crochet-infini' });
    expect(judgeInterval(e, iv(']', '−∞', '3', ']'))).toEqual({ ok: false, errorId: 'crochet' });
    expect(judgeInterval(e, iv(']', '3', '+∞', '['))).toEqual({ ok: false, errorId: 'cote' });
    expect(judgeInterval(e, iv(']', '−∞', '−3', '['))).toEqual({ ok: false, errorId: 'signe-borne' });
    expect(judgeInterval(e, iv(']', '−∞', '4', '['))).toEqual({ ok: false, errorId: 'borne' });
    expect(judgeInterval(e, iv(']', '3', '−∞', '['))).toEqual({ ok: false, errorId: 'ordre' });
    const g = intervalOfRelation('>=', rat(3)); // [3 , +∞[
    expect(judgeInterval(g, iv('[', '3', '+∞', ']'))).toEqual({ ok: false, errorId: 'crochet-infini' });
    expect(judgeInterval(g, iv(']', '3', '+∞', '['))).toEqual({ ok: false, errorId: 'crochet' });
  });
});

describe('question « intervalle »', () => {
  it('cours 7 : x < 3', () => {
    const q = intervalleQuestion(ex, '<', 3);
    expect(q.promptLatex).toBe('x < 3');
    const a = { interval: iv(']', '−∞', '3', '['), symbol: null, hinted: false };
    expect(checkAnswer(course, q, a)).toMatchObject({ correct: true, helped: false, expected: ']−∞ , 3[' });
    const bad = checkAnswer(course, q, { ...a, interval: iv('[', '−∞', '3', '[') });
    expect(bad).toMatchObject({ correct: false, errorType: 'crochet-infini' });
    expect(bad.message).toContain('toujours ouvert');
  });

  it('cours 8 : −2x ⩾ 6 donne x ⩽ −3, le sens se retourne', () => {
    const q = intervalleFromInequality(ex, equation([xt(-2)], [cst(6)], '>='), { by: -2 });
    expect(q.flip).toEqual({ by: -2, given: '>=', answer: '<=' });
    expect(q.expected).toEqual(intervalOfRelation('<=', rat(-3)));
    const s = iv(']', '−∞', '−3', ']');
    expect(gradeIntervalle(q, s, '<=')).toMatchObject({ correct: true });
    expect(gradeIntervalle(q, s, '>=')).toMatchObject({ correct: false, errorId: 'sens' });
    expect(checkAnswer(course, q, { interval: s, symbol: '>=', hinted: false })).toMatchObject({ correct: false, errorType: 'sens', errorFamily: 'signe' });
  });

  it('sans division par un négatif, pas d’étape « symbole »', () => {
    const q = intervalleFromInequality(ex, equation([xt(2)], [cst(6)], '>'), { by: 2 });
    expect(q.flip).toBeUndefined();
    expect(intervalText(q.expected)).toBe(']3 , +∞[');
  });
});
