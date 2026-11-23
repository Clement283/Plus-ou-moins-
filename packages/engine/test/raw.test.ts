import { describe, expect, it } from 'vitest';
import {
  canSubmit,
  emptyRaw,
  pressKey,
  rawToLatex,
  rawToString,
  readRaw,
  type Key,
  type RawInput,
} from '../src/input/raw';
import { rat } from '../src/math/rational';
import { pick, seededRng } from '../src/rng';

/** Short key names: digits as themselves, '-', '(', ')', 'F' (fraction), '>' (next), '<' (back). */
const KEY: Record<string, Key> = {
  '-': 'minus', '(': 'lpar', ')': 'rpar', F: 'frac', '>': 'next', '<': 'back',
};
const keysOf = (s: string): Key[] =>
  [...s].map((ch) => (/\d/.test(ch) ? (`digit:${ch}` as Key) : (KEY[ch] as Key)));
const type = (s: string, from: RawInput = emptyRaw()): RawInput => keysOf(s).reduce(pressKey, from);

const value = (n: number, d = 1, note: 'zero-signe' | 'zero-tete' | null = null) =>
  ({ kind: 'value', value: rat(n, d), note });
const werr = (errorType: string, divZero = false) => ({ kind: 'writing-error', errorType, divZero });

describe('doc 03 — table « Exemples »', () => {
  const rows: [keys: string, shown: string, expected: object][] = [
    ['-8', '-8', value(-8)],
    ['8-', '8-', werr('moins-apres')],
    ['--8', '--8', werr('double-signe')],
    ['8', '8', value(8)], // valeur 8 : l'appelant y verra l'erreur de calcul (bonne réponse −8)
    ['(-8)', '(-8)', value(-8)],
    ['(-8', '(-8', werr('parenthese')],
    ['07', '07', value(7, 1, 'zero-tete')],
    ['-0', '-0', value(0, 1, 'zero-signe')],
    ['F-12>4', '[-12/4]', { kind: 'unfinished' }],
    ['-F12>4', '-[12/4]', { kind: 'unfinished' }],
    ['F3>', '[3/]', werr('ecriture-invalide')],
    ['F5>0', '[5/0]', werr('ecriture-invalide', true)],
    ['-', '-', werr('ecriture-invalide')],
    ['3<4', '4', value(4)],
  ];
  it.each(rows)('touches %s → affiché %s', (keys, shown, expected) => {
    const input = type(keys);
    expect(rawToString(input)).toBe(shown);
    expect(readRaw(input, true)).toEqual(expected);
  });

  it('▭/▭ 3 → 4 → ⌫ : le 4 est effacé, le curseur est revenu dans le dénominateur', () => {
    const input = type('F3>4><');
    expect(rawToString(input)).toBe('[3/]');
    expect(input.cursor).toBe('den');
    expect(rawToString(pressKey(input, 'digit:5'))).toBe('[3/5]');
  });

  it('(rien) : Valider grisé', () => {
    expect(canSubmit(emptyRaw())).toBe(false);
    expect(canSubmit(type('-'))).toBe(true);
    expect(canSubmit(type('F'))).toBe(false); // une fraction vide ne contient aucun caractère
    expect(canSubmit(type('F>3'))).toBe(true);
  });

  it('13 touches : la 13e est sans effet', () => {
    expect(rawToString(type('1234567890123'))).toBe('123456789012');
    expect(rawToString(type('123456789012-'))).toBe('123456789012');
    expect(rawToString(type('123456789012('))).toBe('123456789012');
  });
});

describe('doc 03 §3 — écritures acceptées, calcul pas fini, erreurs d’écriture', () => {
  it('écritures acceptées', () => {
    expect(readRaw(type('-8'), true)).toEqual(value(-8));
    expect(readRaw(type('(-8)'), true)).toEqual(value(-8));
    expect(readRaw(type('-0'), true)).toEqual(value(0, 1, 'zero-signe'));
    expect(readRaw(type('07'), true)).toEqual(value(7, 1, 'zero-tete'));
  });
  it('calcul pas fini', () => {
    expect(readRaw(type('F-12>4'), true)).toEqual({ kind: 'unfinished' });
    expect(readRaw(type('F6>2'), true)).toEqual({ kind: 'unfinished' });
  });
  it('erreurs d’écriture', () => {
    expect(readRaw(type('3-'), true)).toEqual(werr('moins-apres'));
    expect(readRaw(type('--3'), true)).toEqual(werr('double-signe'));
    expect(readRaw(type('(-3'), true)).toEqual(werr('parenthese'));
    expect(readRaw(type('-3)'), true)).toEqual(werr('parenthese'));
    expect(readRaw(type('F3>0'), true)).toEqual(werr('ecriture-invalide', true));
    expect(readRaw(type('F3>'), true)).toEqual(werr('ecriture-invalide')); // dénominateur vide
    expect(readRaw(type('F>4'), true)).toEqual(werr('ecriture-invalide')); // numérateur vide
    expect(readRaw(type('-'), true)).toEqual(werr('ecriture-invalide'));
    expect(readRaw(type('3(4'), true)).toEqual(werr('ecriture-invalide'));
  });
});

describe('readRaw — autres lectures', () => {
  it('lit une réponse vide comme une écriture invalide', () => {
    expect(readRaw(emptyRaw(), true)).toEqual(werr('ecriture-invalide'));
  });
  it('lit les signes placés dans la fraction, sans rien déplacer', () => {
    expect(readRaw(type('F12>-4'), true)).toEqual({ kind: 'unfinished' });
    expect(readRaw(type('-F-12>4'), true)).toEqual({ kind: 'unfinished' });
    expect(readRaw(type('F-12>4'), false)).toEqual(value(-3));
    expect(readRaw(type('-F-12>-4'), false)).toEqual(value(-3));
  });
  it('une fraction non entière est une valeur (réponse fausse, l’appelant compare)', () => {
    expect(readRaw(type('F7>2'), true)).toEqual(value(7, 2));
    expect(readRaw(type('-F7>2'), true)).toEqual(value(-7, 2));
  });
  it('une fraction entre parenthèses se lit aussi', () => {
    expect(readRaw(type('(-F6>2>)'), true)).toEqual({ kind: 'unfinished' });
  });
  it('dénominateur nul écrit autrement', () => {
    expect(readRaw(type('F3>-0'), true)).toEqual(werr('ecriture-invalide', true));
    expect(readRaw(type('F3>00'), true)).toEqual(werr('ecriture-invalide', true));
  });
  it('erreurs dans une case de la fraction', () => {
    expect(readRaw(type('F3->4'), true)).toEqual(werr('moins-apres'));
    expect(readRaw(type('F--3>4'), true)).toEqual(werr('double-signe'));
    expect(readRaw(type('F3>4-'), true)).toEqual(werr('moins-apres'));
    expect(readRaw(type('F(3)>4'), true)).toEqual(werr('ecriture-invalide'));
  });
  it('erreurs autour d’une fraction', () => {
    expect(readRaw(type('F3>4>-'), true)).toEqual(werr('moins-apres'));
    expect(readRaw(type('--F3>4'), true)).toEqual(werr('double-signe'));
    expect(readRaw(type('3F3>4'), true)).toEqual(werr('ecriture-invalide'));
    expect(readRaw(type('F3>4>F'), true)).toEqual(werr('ecriture-invalide'));
    expect(readRaw(type('(F3>4>'), true)).toEqual(werr('parenthese'));
  });
  it('autres erreurs', () => {
    expect(readRaw(type('3-4'), true)).toEqual(werr('moins-apres'));
    expect(readRaw(type('-3-'), true)).toEqual(werr('moins-apres'));
    expect(readRaw(type('3--'), true)).toEqual(werr('double-signe'));
    expect(readRaw(type('()'), true)).toEqual(werr('ecriture-invalide'));
    expect(readRaw(type('('), true)).toEqual(werr('ecriture-invalide'));
    expect(readRaw(type('((-3))'), true)).toEqual(werr('ecriture-invalide'));
    expect(readRaw(type('(3-)'), true)).toEqual(werr('moins-apres'));
    expect(readRaw(type('-(3)'), true)).toEqual(werr('ecriture-invalide'));
  });
  it('notes sur les zéros', () => {
    expect(readRaw(type('(-0)'), true)).toEqual(value(0, 1, 'zero-signe'));
    expect(readRaw(type('-00'), true)).toEqual(value(0, 1, 'zero-signe'));
    expect(readRaw(type('00'), true)).toEqual(value(0, 1, 'zero-tete'));
    expect(readRaw(type('-07'), true)).toEqual(value(-7, 1, 'zero-tete'));
    expect(readRaw(type('(07)'), true)).toEqual(value(7, 1, 'zero-tete'));
    expect(readRaw(type('0'), true)).toEqual(value(0));
  });
});

describe('pressKey — clavier du doc 03 §2', () => {
  it('chaque touche écrit son caractère à la fin, sans correction', () => {
    expect(rawToString(type('8-'))).toBe('8-');
    expect(rawToString(type('(-3'))).toBe('(-3');
    expect(rawToString(type(')007('))).toBe(')007(');
  });
  it('▭/▭ pose une fraction vide, curseur au numérateur ; → passe au dénominateur puis après', () => {
    const f = type('F');
    expect(f.cursor).toBe('num');
    expect(rawToString(f)).toBe('[/]');
    expect(type('F1').cursor).toBe('num');
    expect(type('F1>').cursor).toBe('den');
    expect(type('F1>2>').cursor).toBe('root');
    expect(rawToString(type('F1>2>3'))).toBe('[1/2]3');
  });
  it('pas de fraction dans une fraction', () => {
    expect(rawToString(type('F1F2'))).toBe('[12/]');
    expect(rawToString(type('F1>F2'))).toBe('[1/2]');
  });
  it('→ hors d’une fraction ne fait rien', () => {
    expect(type('3>')).toEqual(type('3'));
    expect(type('>')).toEqual(emptyRaw());
  });
  it('⌫ efface le dernier caractère de la case', () => {
    expect(rawToString(type('12<'))).toBe('1');
    expect(rawToString(type('F12<'))).toBe('[1/]');
    expect(rawToString(type('F1>23<'))).toBe('[1/2]');
    expect(type('<')).toEqual(emptyRaw());
  });
  it('⌫ dans un dénominateur vide revient au numérateur', () => {
    const r = type('F12><');
    expect(r.cursor).toBe('num');
    expect(rawToString(r)).toBe('[12/]');
    expect(rawToString(pressKey(r, 'digit:3'))).toBe('[123/]');
  });
  it('⌫ dans un numérateur vide efface la fraction', () => {
    const r = type('-F<');
    expect(r.cursor).toBe('root');
    expect(rawToString(r)).toBe('-');
    expect(rawToString(type('-F1>2<<<<'))).toBe('-');
  });
  it('⌫ juste après une fraction revient dans son dénominateur', () => {
    const s = type('F3>>'); // dénominateur vide : on y revient seulement
    expect(s.cursor).toBe('root');
    expect(pressKey(s, 'back').cursor).toBe('den');
    expect(rawToString(pressKey(s, 'back'))).toBe('[3/]');
  });
  it('12 caractères au plus, numérateur et dénominateur compris ; la fraction ne compte pas', () => {
    expect(rawToString(type('F123456>789012345'))).toBe('[123456/789012]');
    expect(rawToString(type('-(1234567890F'))).toBe('-(1234567890[/]');
    expect(rawToString(type('-(123456789F2>3'))).toBe('-(123456789[2/]');
  });
  it('ne modifie pas l’entrée reçue', () => {
    const a = type('F1>2');
    const before = JSON.stringify(a);
    pressKey(a, 'digit:3');
    pressKey(a, 'back');
    pressKey(type('F1>2>'), 'back');
    expect(JSON.stringify(a)).toBe(before);
  });
});

describe('rawToLatex — affichage copie', () => {
  it('fraction empilée, case vide en \\square, curseur non affiché', () => {
    expect(rawToLatex(emptyRaw())).toBe('');
    expect(rawToLatex(type('(-8)'))).toBe('(-8)');
    expect(rawToLatex(type('-F12>4'))).toBe('-\\frac{12}{4}');
    expect(rawToLatex(type('F3>'))).toBe('\\frac{3}{\\square}');
    expect(rawToLatex(type('F'))).toBe('\\frac{\\square}{\\square}');
    expect(rawToLatex(type('8-'))).toBe('8-');
  });
});

describe('non-plantage', () => {
  it('10 000 séquences de touches aléatoires', () => {
    const rng = seededRng(20261122);
    const keys: Key[] = [
      ...keysOf('0123456789'), 'minus', 'lpar', 'rpar', 'frac', 'next', 'back',
    ];
    const countChars = (s: string) => s.replace(/[[\]/]/g, '').length;
    for (let i = 0; i < 10_000; i++) {
      let input = emptyRaw();
      const len = Math.floor(rng() * 30);
      for (let k = 0; k < len; k++) {
        input = pressKey(input, pick(rng, keys));
        expect(countChars(rawToString(input))).toBeLessThanOrEqual(12);
      }
      expect(() => readRaw(input, true)).not.toThrow();
      expect(() => readRaw(input, false)).not.toThrow();
      expect(() => rawToLatex(input)).not.toThrow();
      expect(() => canSubmit(input)).not.toThrow();
    }
  });
});
