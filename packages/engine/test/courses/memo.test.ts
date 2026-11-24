import { describe, expect, it } from 'vitest';
import { MEMO_BEFORE_VALIDATION, canOpenMemo, getCourse } from '../../src';

describe('fiche mémo : accès', () => {
  it('la fiche est consultable avant la validation (décision du porteur du projet)', () => {
    expect(MEMO_BEFORE_VALIDATION).toBe(true);
  });
  it('validé avec fiche : oui ; sans fiche : non', () => {
    expect(canOpenMemo('valide', true)).toBe(true);
    expect(canOpenMemo('valide', false)).toBe(false);
  });
  it('en cours : selon MEMO_BEFORE_VALIDATION', () => {
    expect(canOpenMemo('en-cours', true)).toBe(MEMO_BEFORE_VALIDATION);
    expect(canOpenMemo('disponible', true)).toBe(MEMO_BEFORE_VALIDATION);
    expect(canOpenMemo('a-rattraper', true)).toBe(MEMO_BEFORE_VALIDATION);
  });
  it('verrouillé : jamais', () => {
    expect(canOpenMemo('verrouille', true)).toBe(false);
  });
});

describe('fiche mémo du Cours 0', () => {
  const memo = getCourse('c00-bien-ecrire').memo!;
  it('2 exemples, la règle et ses 4 puces', () => {
    expect(memo.examples).toHaveLength(2);
    expect(memo.examples).toEqual(['4 × (−3)', '−3 + 5']);
    expect(memo.ruleBullets).toHaveLength(4);
  });
  it('erreur à éviter et astuce', () => {
    expect(memo.mistake.wrong).toBe('4 × −3');
    expect(memo.mistake.why).toBe('Le × et le − se touchent. On écrit 4 × (−3).');
    expect(memo.tip).toBe("Cherche d'abord les signes qui se touchent, puis demande-toi pour chaque − : il soustrait, ou c'est le signe d'un nombre ?");
  });
});
