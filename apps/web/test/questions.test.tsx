import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, act } from '@testing-library/react';
import {
  buildQuestion, getCourse, num, op, rat, seededRng,
  type Answer, type CourseDef, type Exercise, type Outcome, type Question,
} from '@pom/engine';
import { QuestionView } from '../src/components/questions/QuestionView';
import { calcLatex, writingLatex } from '../src/components/questions/calc';
import { prettyCalc } from '../src/components/questions/Reecrire';

afterEach(cleanup);

const C05 = getCourse('c05-multiplier-deux');
const ex = (a: number, b: number, answer: number): Exercise => ({ courseId: 'c05-multiplier-deux', level: 1, expr: op('*', num(a), num(b)), answer: rat(answer) });

function setup(q: Question, course: CourseDef = C05, locked = false) {
  const calls: [Answer, Outcome][] = [];
  const view = render(<QuestionView question={q} course={course} locked={locked} onAnswer={(a, o) => calls.push([a, o])} />);
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s)!;
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const key = (...ks: string[]) => {
    for (const k of ks) {
      const b = $$('.keypad button').find((x) => (x.getAttribute('aria-label') ?? x.textContent) === k)!;
      fireEvent.click(b);
    }
  };
  const valider = () => $$('button').find((b) => b.textContent === 'Valider')!;
  return { ...view, calls, $, $$, key, valider, rerender: (l: boolean) => view.rerender(<QuestionView question={q} course={course} locked={l} onAnswer={(a, o) => calls.push([a, o])} />) };
}

const saisie: Question = { kind: 'saisie', ex: ex(-3, -4, 12), promptLatex: '-3 \\times (-4)' };
const trou: Question = { kind: 'trou', ex: ex(-3, 0, 8), promptLatex: '-3 + \\square = 5', hidden: rat(8) };
const ordre: Question = {
  kind: 'ordre',
  ex: ex(-3, -4, 12),
  tiles: [
    { id: 'a', latex: '= 12' },
    { id: 'b', latex: '= +(3 \\times 4)' },
    { id: 'c', latex: '= -12' },
    { id: 'd', latex: '-3 \\times (-4)' },
  ],
  solution: ['d', 'b', 'a'],
  trapTile: { latex: '= -12', errorType: 'regle-signes' },
};
const erreur: Question = { kind: 'erreur', ex: ex(-3, -4, 12), lines: ['-3 \\times (-4)', '= -(3 \\times 4)', '= -12'], wrongLine: 1, errorType: 'regle-signes' };
const erreurJuste: Question = { ...erreur, lines: ['-3 \\times (-4)', '= +(3 \\times 4)', '= 12'], wrongLine: null, errorType: null };
const exs = [ex(-3, -4, 12), ex(6, -2, -12), ex(-5, -2, 10), ex(3, -3, -9)];
const paires: Question = {
  kind: 'paires',
  exs,
  left: ['-3 \\times (-4)', '6 \\times (-2)', '-5 \\times (-2)', '3 \\times (-3)'],
  right: [
    { latex: '-9', value: rat(-9) },
    { latex: '12', value: rat(12) },
    { latex: '10', value: rat(10) },
    { latex: '-12', value: rat(-12) },
  ],
};
const classer: Question = {
  kind: 'classer',
  exs: [ex(-2, 3, -6), ex(-4, -5, 20), ex(7, -1, -7), ex(2, 8, 16)],
  classes: [{ id: 'plus', label: 'Résultat +' }, { id: 'moins', label: 'Résultat −' }],
  expected: ['moins', 'plus', 'moins', 'plus'],
};
const qcm: Question = {
  kind: 'qcm',
  ex: ex(-3, -3, 9),
  choices: [
    { value: rat(-9), latex: '-9', errorType: 'regle-signes' },
    { value: rat(6), latex: '6', errorType: 'autre' },
    { value: rat(9), latex: '9', errorType: null },
    { value: rat(8), latex: '8', errorType: 'autre' },
  ],
  correctIndex: 2,
  formula: 'debut',
};
const signe: Question = {
  kind: 'qcm',
  ex: ex(-5, -6, 30),
  choices: [{ value: rat(1), latex: '+', errorType: null }, { value: rat(-1), latex: '-', errorType: 'regle-signes' }],
  correctIndex: 0,
  formula: 'debut',
};
const vraifaux: Question = { kind: 'vraifaux', ex: ex(-3, -4, 12), shown: rat(-12), isTrue: false, errorType: 'regle-signes' };

describe('consignes', () => {
  it.each([
    [saisie, 'Calcule.'],
    [trou, 'Complète.'],
    [ordre, "Remets les étapes dans l'ordre."],
    [erreur, 'Une ligne est fausse. Touche-la.'],
    [paires, 'Relie chaque calcul à son résultat.'],
    [classer, 'Fais glisser chaque calcul du bas de l\'écran vers la bonne case.'],
    [qcm, 'Choisis la bonne réponse.'],
    [vraifaux, 'Vrai ou faux ?'],
  ] as [Question, string][])('%# : %s', (q, text) => {
    const { container } = setup(q);
    expect(container.textContent).toContain(text);
  });
});

describe('Réponse écrite', () => {
  it('juste : 12 pour −3 × (−4)', () => {
    const t = setup(saisie);
    t.key('1', '2');
    fireEvent.click(t.valider());
    expect(t.calls).toHaveLength(1);
    expect(t.calls[0]![1]).toMatchObject({ correct: true, errorType: null, given: '12' });
  });
  it('fausse : −12 est l’erreur de signe du cours', () => {
    const t = setup(saisie);
    t.key('moins', '1', '2');
    fireEvent.click(t.valider());
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'regle-signes' });
  });
  it('Valider est inactif tant que rien n’est écrit', () => {
    const t = setup(saisie);
    expect((t.valider() as HTMLButtonElement).disabled).toBe(true);
  });
  it('« Simplifie » : la réponse part, le champ reste modifiable', () => {
    const t = setup({ kind: 'saisie', ex: ex(-12, 4, -3), promptLatex: '-12 \\div 4' }, getCourse('c06-diviser-deux'));
    t.key('fraction', 'moins', '1', '2', 'case suivante', '4');
    fireEvent.click(t.valider());
    expect(t.calls[0]![1].unfinished).toBe(true);
    expect(t.$$('.keypad').length).toBe(1);
  });
  it('verrouillée : plus de clavier, le champ est marqué', () => {
    const t = setup(saisie);
    t.key('1', '2');
    fireEvent.click(t.valider());
    t.rerender(true);
    expect(t.$$('.keypad')).toHaveLength(0);
    expect(t.$('.answer').classList.contains('answer--success')).toBe(true);
  });
});

describe('Compléter le trou', () => {
  it('la case est dans le calcul, à la place du carré', () => {
    const t = setup(trou);
    expect(t.$('.hole')).not.toBeNull();
    expect(t.$('[data-copie] .hole')).not.toBeNull();
    expect(t.$$('.answer')).toHaveLength(0);
    t.key('8');
    expect(t.$('.hole').textContent).toContain('8');
  });
  it('juste : 8', () => {
    const t = setup(trou);
    t.key('8');
    fireEvent.click(t.valider());
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('fausse : l’opposé du nombre caché donne l’erreur de signe', () => {
    const t = setup(trou);
    t.key('moins', '8');
    fireEvent.click(t.valider());
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'regle-signes' });
  });
});

describe('Étiquettes à ordonner', () => {
  const tiles = (t: ReturnType<typeof setup>) => t.$$('.tags .tag');
  const placed = (t: ReturnType<typeof setup>) => t.$$('.slots .tag');
  it('toucher place à la fin, toucher une étiquette placée la renvoie', () => {
    const t = setup(ordre);
    fireEvent.click(tiles(t)[3]!);
    fireEvent.click(tiles(t)[1]!);
    expect(placed(t)).toHaveLength(2);
    expect(t.$$('.slots .slot')).toHaveLength(1);
    fireEvent.click(placed(t)[0]!);
    expect(placed(t)).toHaveLength(1);
    expect(t.$$('.slots .slot')).toHaveLength(2);
  });
  it('Valider devient actif quand le bon nombre est placé (3 sur 4 étiquettes)', () => {
    const t = setup(ordre);
    expect((t.valider() as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(tiles(t)[3]!);
    fireEvent.click(tiles(t)[1]!);
    expect((t.valider() as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(tiles(t)[0]!);
    expect((t.valider() as HTMLButtonElement).disabled).toBe(false);
    // plus de place : une quatrième étiquette ne se pose pas
    fireEvent.click(tiles(t)[2]!);
    expect(placed(t)).toHaveLength(3);
  });
  it('ordre juste', () => {
    const t = setup(ordre);
    for (const i of [3, 1, 0]) fireEvent.click(tiles(t)[i]!);
    fireEvent.click(t.valider());
    expect(t.calls[0]![0]).toEqual({ order: ['d', 'b', 'a'] });
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('étiquette en trop : fausse avec l’erreur du piège', () => {
    const t = setup(ordre);
    for (const i of [3, 1, 2]) fireEvent.click(tiles(t)[i]!);
    fireEvent.click(t.valider());
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'regle-signes' });
  });
});

describe('Trouver l’erreur', () => {
  const lines = (t: ReturnType<typeof setup>) => t.$$('.copy-line');
  it('toutes les lignes sont touchables, la ligne de départ comprise', () => {
    const t = setup(erreur);
    expect(lines(t)).toHaveLength(3);
    for (const l of lines(t)) expect((l as HTMLButtonElement).disabled).toBe(false);
  });
  it('toucher la première ligne fausse : juste', () => {
    const t = setup(erreur);
    fireEvent.click(lines(t)[1]!);
    expect(t.calls[0]![0]).toEqual({ line: 1 });
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('toucher la ligne de départ : fausse', () => {
    const t = setup(erreur);
    fireEvent.click(lines(t)[0]!);
    expect(t.calls[0]![0]).toEqual({ line: 0 });
    expect(t.calls[0]![1].correct).toBe(false);
  });
  it('« Tout est juste » sur une résolution juste', () => {
    const t = setup(erreurJuste);
    fireEvent.click(t.$$('button').find((b) => b.textContent === 'Tout est juste')!);
    expect(t.calls[0]![0]).toEqual({ line: null });
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('corrigé : ligne fausse, ligne corrigée, suite', () => {
    const t = setup(erreur, C05, true);
    expect(t.$$('.lesson-line')).toHaveLength(4);
    expect(t.$('.lesson-line--ko').textContent).toContain('ligne fausse');
    expect(t.$('.lesson-line--ok').textContent).toContain('corrigée');
  });
});

describe('Trouver l’erreur d’écriture (cours 0)', () => {
  const c00 = getCourse('c00-bien-ecrire');
  const q = buildQuestion(c00, 'erreur', { rng: seededRng(3), level: 1, timesSeen: 0 });
  if (q.kind !== 'erreur') throw new Error('erreur attendue');
  it('consigne et pièces touchables', () => {
    const t = setup(q, c00);
    expect(t.$('[data-copie]').textContent).toBeTruthy();
    expect(t.container.textContent).toContain('Ce calcul est-il bien écrit ?');
    expect(t.container.textContent).toContain("S'il est mal écrit, touche l'endroit de la faute dans les cases en bas. Chaque symbole du calcul a sa case.");
    expect(t.$$('.tag--piece')).toHaveLength(q.lines.length);
  });
  it('toucher le mauvais endroit', () => {
    const t = setup(q, c00);
    const fault = q.wrongLine;
    const other = q.lines.findIndex((_, i) => i !== fault);
    fireEvent.click(t.$$('.tag--piece')[other]!);
    expect(t.calls[0]![0]).toEqual({ line: other });
    expect(t.calls[0]![1].correct).toBe(false);
  });
  it('toucher le bon endroit, ou « Tout est bien écrit »', () => {
    // 5 tirages : au moins une résolution fausse et, par construction, le bouton existe
    const t = setup(q, c00);
    if (q.wrongLine !== null) {
      fireEvent.click(t.$$('.tag--piece')[q.wrongLine]!);
      expect(t.calls[0]![1].correct).toBe(true);
    }
    expect(t.$$('button').some((b) => b.textContent === 'Tout est bien écrit')).toBe(true);
  });
  it('« Tout est bien écrit » sur un calcul faux : relecture ou faute non repérée', () => {
    const t = setup(q, c00);
    fireEvent.click(t.$$('button').find((b) => b.textContent === 'Tout est bien écrit')!);
    expect(t.calls[0]![0]).toEqual({ line: null });
    expect(t.calls[0]![1].correct).toBe(q.wrongLine === null);
  });
});

describe('Cours 0, « Lequel est bien écrit ? »', () => {
  const c00 = getCourse('c00-bien-ecrire');
  const q = buildQuestion(c00, 'qcm', { rng: seededRng(5), level: 1, timesSeen: 0 });
  it('consigne propre au cours', () => {
    const t = setup(q, c00);
    expect(t.container.textContent).toContain('Lequel est bien écrit ?');
    expect(t.$$('.choice')).toHaveLength(4);
  });
});

describe('Relier les paires', () => {
  const L = (t: ReturnType<typeof setup>) => t.$$('.pairs__col')[0]!.querySelectorAll<HTMLElement>('.tag');
  const R = (t: ReturnType<typeof setup>) => t.$$('.pairs__col')[1]!.querySelectorAll<HTMLElement>('.tag');
  it('tout juste du premier coup : juste, une paire juste se grise', () => {
    const t = setup(paires);
    fireEvent.click(L(t)[0]!);
    expect(L(t)[0]!.classList.contains('is-selected')).toBe(true);
    fireEvent.click(R(t)[1]!);
    expect(L(t)[0]!.classList.contains('is-done')).toBe(true);
    expect(R(t)[1]!.classList.contains('is-done')).toBe(true);
    expect(t.calls).toHaveLength(0);
    for (const [l, r] of [[1, 3], [2, 2], [3, 0]] as const) {
      fireEvent.click(L(t)[l]!);
      fireEvent.click(R(t)[r]!);
    }
    expect(t.calls).toHaveLength(1);
    expect(t.calls[0]![0]).toEqual({ pairs: [[0, 1], [1, 3], [2, 2], [3, 0]] });
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('une paire fausse clignote en rouge et reste à relier ; l’exercice est compté faux', () => {
    const t = setup(paires);
    fireEvent.click(L(t)[0]!);
    fireEvent.click(R(t)[0]!);
    expect(L(t)[0]!.classList.contains('is-wrong')).toBe(true);
    expect(R(t)[0]!.classList.contains('is-wrong')).toBe(true);
    expect(L(t)[0]!.classList.contains('is-done')).toBe(false);
    for (const [l, r] of [[0, 1], [1, 3], [2, 2], [3, 0]] as const) {
      fireEvent.click(L(t)[l]!);
      fireEvent.click(R(t)[r]!);
    }
    expect(t.calls).toHaveLength(1);
    expect(t.calls[0]![0]).toEqual({ pairs: [[0, 0], [0, 1], [1, 3], [2, 2], [3, 0]] });
    expect(t.calls[0]![1].correct).toBe(false);
  });
  it('le clignotement s’efface', () => {
    vi.useFakeTimers();
    try {
      const t = setup(paires);
      fireEvent.click(L(t)[0]!);
      fireEvent.click(R(t)[0]!);
      act(() => void vi.advanceTimersByTime(1500));
      expect(L(t)[0]!.classList.contains('is-wrong')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
  it('une paire déjà reliée ne se touche plus', () => {
    const t = setup(paires);
    fireEvent.click(L(t)[0]!);
    fireEvent.click(R(t)[1]!);
    expect((L(t)[0] as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Classer', () => {
  const items = (t: ReturnType<typeof setup>) => t.$$('.stack > .tags > .tag');
  const bins = (t: ReturnType<typeof setup>) => t.$$('.bin');
  it('toucher le calcul puis la case ; tout rangé : Valider envoie la réponse', () => {
    const t = setup(classer);
    fireEvent.click(items(t)[0]!);
    expect(items(t)[0]!.classList.contains('is-selected')).toBe(true);
    fireEvent.click(bins(t)[1]!);
    expect(bins(t)[1]!.querySelectorAll('.tag')).toHaveLength(1);
    expect(t.calls).toHaveLength(0);
    for (const [i, b] of [[1, 0], [2, 1], [3, 0]] as const) {
      fireEvent.click(t.$$('.stack > .tags > .tag')[0]!);
      fireEvent.click(bins(t)[b]!);
      void i;
    }
    expect(t.calls).toHaveLength(0);
    fireEvent.click(t.valider());
    expect(t.calls[0]![0]).toEqual({ classes: ['moins', 'plus', 'moins', 'plus'] });
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('les cases se touchent au clavier (Entrée / Espace) : focalisables, nommées', () => {
    const t = setup(classer);
    expect(bins(t)[0]!.getAttribute('tabindex')).toBe('0');
    expect(bins(t)[0]!.getAttribute('role')).toBe('button');
    fireEvent.click(items(t)[0]!);
    fireEvent.keyDown(bins(t)[1]!, { key: 'Enter' });
    expect(bins(t)[1]!.querySelectorAll('.tag')).toHaveLength(1);
    fireEvent.click(items(t)[0]!);
    fireEvent.keyDown(bins(t)[0]!, { key: ' ' });
    expect(bins(t)[0]!.querySelectorAll('.tag')).toHaveLength(1);
  });
  it('un calcul mal rangé du premier coup : faux', () => {
    const t = setup(classer);
    for (const b of [1, 0, 0, 0]) {
      fireEvent.click(t.$$('.stack > .tags > .tag')[0]!);
      fireEvent.click(bins(t)[b]!);
    }
    fireEvent.click(t.valider());
    expect(t.calls[0]![0]).toEqual({ classes: ['moins', 'plus', 'plus', 'plus'] });
    expect(t.calls[0]![1].correct).toBe(false);
  });
  it('corrigé : l’élément mal placé est montré dans la case où il a été rangé', () => {
    const t = setup(classer);
    for (const b of [1, 0, 0, 0]) {
      fireEvent.click(t.$$('.stack > .tags > .tag')[0]!);
      fireEvent.click(bins(t)[b]!);
    }
    fireEvent.click(t.valider());
    t.rerender(true);
    expect(t.$$('.tag.is-wrong')).toHaveLength(1);
    expect(bins(t)[0]!.querySelector('.tag.is-wrong')).not.toBeNull();
    expect(t.$$('.tag.is-correct')).toHaveLength(3);
  });
});

describe('QCM', () => {
  it('la réponse part au toucher, sans Valider', () => {
    const t = setup(qcm);
    expect(t.valider()).toBeUndefined();
    fireEvent.click(t.$$('.choice')[2]!);
    expect(t.calls[0]![0]).toEqual({ choice: 2 });
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('fausse : −9 est l’erreur de signe', () => {
    const t = setup(qcm);
    fireEvent.click(t.$$('.choice')[0]!);
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'regle-signes' });
  });
  it('corrigé : le choix faux en rouge, la bonne réponse en vert', () => {
    const t = setup(qcm);
    fireEvent.click(t.$$('.choice')[0]!);
    t.rerender(true);
    expect(t.$$('.choice')[0]!.classList.contains('is-wrong')).toBe(true);
    expect(t.$$('.choice')[2]!.classList.contains('is-correct')).toBe(true);
    expect((t.$$('.choice')[1] as HTMLButtonElement).disabled).toBe(true);
  });
  it('corrigé : ✓ sur la bonne réponse, ✗ sur le choix faux, rien ailleurs', () => {
    const t = setup(qcm);
    fireEvent.click(t.$$('.choice')[0]!);
    expect(t.$$('.choice svg')).toHaveLength(0);
    t.rerender(true);
    expect(t.$$('.choice')[2]!.querySelector('use')!.getAttribute('href')).toBe('#i-check-circle');
    expect(t.$$('.choice')[0]!.querySelector('use')!.getAttribute('href')).toBe('#i-x-circle');
    expect(t.$$('.choice svg')).toHaveLength(2);
  });
  it('un seul envoi, même en retouchant', () => {
    const t = setup(qcm);
    fireEvent.click(t.$$('.choice')[0]!);
    fireEvent.click(t.$$('.choice')[2]!);
    expect(t.calls).toHaveLength(1);
  });
});

describe('Signe du résultat', () => {
  it('deux gros boutons « + » et « − »', () => {
    const t = setup(signe);
    expect(t.container.textContent).toContain('Quel est le signe du résultat ?');
    const b = t.$$('.choice');
    expect(b.map((x) => x.textContent)).toEqual(['+', '−']);
    fireEvent.click(b[1]!);
    expect(t.calls[0]![0]).toEqual({ choice: 1 });
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'regle-signes' });
  });
});

describe('Vrai ou faux', () => {
  it('deux gros boutons, la réponse part au toucher', () => {
    const t = setup(vraifaux);
    const b = t.$$('.toggle');
    expect(b.map((x) => x.textContent)).toEqual(['Vrai', 'Faux']);
    expect(t.valider()).toBeUndefined();
    fireEvent.click(b[1]!);
    expect(t.calls[0]![0]).toEqual({ bool: false });
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('« Vrai » sur un résultat faux : l’erreur du piège', () => {
    const t = setup(vraifaux);
    fireEvent.click(t.$$('.toggle')[0]!);
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'regle-signes' });
  });
});

describe('Aucune couleur sur les calculs', () => {
  const all: [string, Question, CourseDef?][] = [
    ['saisie', saisie], ['trou', trou], ['ordre', ordre], ['erreur', erreur], ['paires', paires],
    ['classer', classer], ['qcm', qcm], ['signe', signe], ['vraifaux', vraifaux],
  ];
  it.each(all)('%s', (_n, q, c) => {
    const t = setup(q, c ?? C05);
    const zone = t.$$('[data-copie]');
    expect(zone.length).toBeGreaterThan(0);
    for (const z of zone) for (const el of [z, ...z.querySelectorAll<HTMLElement>('*')]) expect(el.getAttribute('style') ?? '').not.toMatch(/(^|[;\s])color\s*:/);
  });
});

describe('Calculs en Lexend', () => {
  it('theme.css met les glyphes KaTeX en --font-math (Lexend) et garde les fractions empilées', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync('src/theme.css', 'utf8');
    expect(css).toMatch(/\.katex \.mord[^{]*\{[^}]*font-family:var\(--font-math\)/);
    expect(css).toMatch(/--font-math:'Lexend'/);
  });
});

describe('titre, sous-titre et consigne d\'un écran de leçon (doc 09)', () => {
  const withTexts = (q: Question, texts: { title?: string; subtitle?: string; consigne?: string }) => {
    const view = render(<QuestionView question={q} course={C05} locked={false} onAnswer={() => undefined} texts={texts} />);
    return view.container;
  };

  it('un titre devient le h1, le sous-titre est dessous, la consigne générique disparaît', () => {
    const c = withTexts(ordre, { title: 'Remets les étapes de −3 × (−4) dans l\'ordre', subtitle: 'Touche les étiquettes.' });
    expect(c.querySelector('h1.t-h3')!.textContent).toBe("Remets les étapes de −3 × (−4) dans l'ordre");
    expect(c.querySelector('h1 + p.t-body2')!.textContent).toBe('Touche les étiquettes.');
    expect(c.textContent).not.toContain("Remets les étapes dans l'ordre.");
  });

  it('une consigne remplace la consigne générique', () => {
    expect(withTexts(trou, { consigne: "Complète, une case après l'autre." }).textContent).toContain("Complète, une case après l'autre.");
    expect(withTexts(classer, { consigne: 'Sans calculer, le résultat est-il + ou − ?' }).textContent).toContain('Sans calculer, le résultat est-il + ou − ?');
    expect(withTexts(erreur, { title: 'Trouve la ligne fausse', subtitle: 'Touche la ligne où le calcul se trompe.' }).textContent).not.toContain('Une ligne est fausse.');
  });
});

const C00 = getCourse('c00-bien-ecrire');
/** Un calcul du cours 0 écrit en morceaux (`faultType` : la règle enfreinte, null si bien écrit). */
const writingEx = (expr: ReturnType<typeof op>, faultType: string | null, ...pieces: string[]): Exercise => ({
  courseId: 'c00-bien-ecrire',
  level: 1,
  expr,
  answer: rat(0),
  meta: { tokens: pieces, faultAt: faultType ? 0 : null, faultType },
});

describe('Choix (petite question à un toucher)', () => {
  const q: Extract<Question, { kind: 'choix' }> = {
    kind: 'choix',
    ex: writingEx(op('-', num(8), num(5)), null, '8', '-', '5'),
    calcLatex: '8 - 5',
    prompt: 'Dans ce calcul, à quoi sert le − ?',
    options: [{ label: 'À soustraire', why: 'On enlève 5 à 8.' }, { label: 'À dire que 5 est négatif', why: 'Non.' }],
    correctIndex: 0,
  };
  it('le calcul et la question sont en haut, les options dans la zone de réponse en bas', () => {
    const t = setup(q, C00);
    expect(t.$('.q-calc')).not.toBeNull();
    expect(t.$('.q-ask')!.textContent).toContain('à quoi sert le');
    expect(t.$$('.answer-zone button').map((b) => b.textContent)).toEqual(['À soustraire', 'À dire que 5 est négatif']);
    expect(t.$('.q-body .answer-zone')).not.toBeNull();
  });
  it('toucher la bonne option envoie { choice } et juge juste', () => {
    const t = setup(q, C00);
    fireEvent.click(t.$$('.answer-zone .choice')[0]!);
    expect(t.calls[0]![0]).toEqual({ choice: 0 });
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('un seul envoi ; la mauvaise option est jugée fausse, avec son explication', () => {
    const t = setup(q, C00);
    fireEvent.click(t.$$('.answer-zone .choice')[1]!);
    fireEvent.click(t.$$('.answer-zone .choice')[0]!);
    expect(t.calls).toHaveLength(1);
    expect(t.calls[0]![1].correct).toBe(false);
    expect(t.calls[0]![1].message).toBe('Non.');
  });
  it('aucune couleur avant la réponse ; vert et rouge après', () => {
    const t = setup(q, C00);
    expect(t.$$('.is-correct, .is-wrong')).toHaveLength(0);
    fireEvent.click(t.$$('.answer-zone .choice')[1]!);
    t.rerender(true);
    expect(t.$$('.choice.is-correct')).toHaveLength(1);
    expect(t.$$('.choice.is-wrong')).toHaveLength(1);
  });
  it('« pour découvrir » : la mention, et la mauvaise option reste neutre', () => {
    const view = render(<QuestionView question={q} course={C00} locked={false} onAnswer={() => undefined} activity="decouverte" />);
    expect(view.container.textContent).toContain('Question pour découvrir : elle ne compte pas dans la note.');
    fireEvent.click(view.container.querySelectorAll<HTMLElement>('.answer-zone .choice')[1]!);
    expect(view.container.querySelector('.is-wrong')).toBeNull();
  });
  it('intro au-dessus, outro et encadré de règle seulement après la réponse', () => {
    const texts = { intro: ['Bonjour **toi**'], outro: ['On le corrige.'], outroRule: { n: 2, text: '**Pas de parenthèses.**' } };
    const view = render(<QuestionView question={q} course={C00} locked={false} onAnswer={() => undefined} texts={texts} />);
    expect(view.container.querySelector('b')!.textContent).toBe('toi');
    expect(view.container.textContent).not.toContain('On le corrige.');
    fireEvent.click(view.container.querySelectorAll<HTMLElement>('.answer-zone .choice')[0]!);
    expect(view.container.textContent).toContain('On le corrige.');
    expect(view.container.querySelector('.rule-box')!.textContent).toContain('Règle 2');
  });
  it('2 questions sur un écran : la précédente est résumée en haut', () => {
    const view = render(<QuestionView question={q} course={C00} locked={false} onAnswer={() => undefined} previous={{ question: q, choice: 0, correct: true }} />);
    expect(view.container.querySelector('.q-summary')!.textContent).toContain('Ta réponse : À soustraire ✓');
  });
});

describe('Réécris', () => {
  const times: Question = {
    kind: 'reecrire',
    ex: writingEx(op('*', num(6), num(-2)), 'signes-colles', '6', '\\times -', '2'),
    givenLatex: '6 \\times -2',
    expected: '6×(−2)',
    specific: [],
    fallback: 'Garde le même calcul.',
    steps: ['a'],
  };
  const typeKeys = (t: ReturnType<typeof setup>, ...ks: string[]) => {
    for (const k of ks) fireEvent.click(t.$$('.keypad button').find((b) => (b.getAttribute('aria-label') ?? b.textContent) === k)!);
  };
  it('clavier complet : chiffres, + − × ÷ ( ), effacer', () => {
    const t = setup(times, C00);
    const labels = t.$$('.keypad button').map((b) => b.getAttribute('aria-label') ?? b.textContent);
    for (const k of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '−', '×', '÷', '(', ')', 'effacer', 'Valider']) expect(labels).toContain(k);
  });
  it('taper 6 × ( − 2 ) puis Valider envoie { text: "6×(−2)" }', () => {
    const t = setup(times, C00);
    typeKeys(t, '6', '×', '(', '−', '2', ')');
    expect(t.$('.answer')!.textContent).toBe('6 × (−2)');
    fireEvent.click(t.valider());
    expect(t.calls[0]![0]).toEqual({ text: '6×(−2)' });
    expect(t.calls[0]![1].correct).toBe(true);
  });
  it('Valider est inactif tant que rien n’est tapé ; effacer retire le dernier symbole', () => {
    const t = setup(times, C00);
    expect((t.valider() as HTMLButtonElement).disabled).toBe(true);
    typeKeys(t, '6', '×', 'effacer');
    expect(t.$('.answer')!.textContent).toBe('6');
  });
  it('mal écrit : jugé faux, avec un message', () => {
    const t = setup(times, C00);
    typeKeys(t, '6', '×', '−', '2');
    fireEvent.click(t.valider());
    expect(t.calls[0]![1].correct).toBe(false);
    expect(t.calls[0]![1].message).toBeTruthy();
  });
  it('prettyCalc : espaces autour des opérateurs', () => {
    expect(prettyCalc('6×(−2)')).toBe('6 × (−2)');
    expect(prettyCalc('−3+4')).toBe('−3 + 4');
    expect(prettyCalc('8−5')).toBe('8 − 5');
  });
});

describe('Toucher la faute (cours 0)', () => {
  const symbols = ['-', '6', '-', '-', '2', '\\times', '4'];
  const q: Question = {
    kind: 'erreur',
    ex: writingEx(op('*', op('-', num(-6), num(-2)), num(4)), 'signes-colles', '-6', '- -', '2', '\\times', '4'),
    lines: symbols,
    wrongLine: 2,
    errorType: 'signes-colles',
    accept: [2, 3],
    shownLatex: '-6 - -2 \\times 4',
  };
  it('une case par symbole, dans la zone du bas ; consigne et calcul en haut', () => {
    const t = setup(q, C00);
    expect(t.$$('.answer-zone .tag--piece')).toHaveLength(7);
    expect(t.$$('.answer-zone .tag--piece').map((b) => b.textContent)).toEqual(['−', '6', '−', '−', '2', '×', '4']);
    expect(t.container.textContent).toContain('Ce calcul est-il bien écrit ?');
    expect(t.$('.q-calc')).not.toBeNull();
    expect(t.$$('button').some((b) => b.textContent === 'Tout est bien écrit')).toBe(true);
  });
  it('aucune couleur avant la réponse', () => {
    const t = setup(q, C00);
    expect(t.$$('.is-correct, .is-wrong')).toHaveLength(0);
    fireEvent.click(t.$$('.tag--piece')[0]!);
    expect(t.$$('.is-correct, .is-wrong')).toHaveLength(0);
  });
  it('les deux cases de la faute sont justes, une autre est fausse ; vert et rouge après la réponse', () => {
    for (const [i, ok] of [[2, true], [3, true], [0, false]] as const) {
      const t = setup(q, C00);
      fireEvent.click(t.$$('.tag--piece')[i]!);
      expect(t.calls[0]![0]).toEqual({ line: i });
      expect(t.calls[0]![1].correct).toBe(ok);
      t.rerender(true);
      expect(t.$$('.tag--piece.is-correct')).toHaveLength(2);
      expect(t.$$('.tag--piece.is-wrong')).toHaveLength(ok ? 0 : 1);
      cleanup();
    }
  });
  it('« Tout est bien écrit » sur un calcul faux est faux', () => {
    const t = setup(q, C00);
    fireEvent.click(t.$$('button').find((b) => b.textContent === 'Tout est bien écrit')!);
    expect(t.calls[0]![1].correct).toBe(false);
  });
});

describe('Classer, glisser-déposer', () => {
  const writing = [
    writingEx(op('*', num(4), num(-3)), null, '4', '\\times', '(', '-3', ')'),
    writingEx(op('+', num(5), num(-2)), 'signes-colles', '5', '+ -', '2'),
  ];
  const q: Question = {
    kind: 'classer',
    exs: writing,
    classes: [{ id: 'bien', label: 'Bien écrit' }, { id: 'mal', label: 'Mal écrit' }],
    expected: ['bien', 'mal'],
  };
  const consigne = "Fais glisser chaque calcul du bas de l'écran vers la bonne case. Tu peux aussi toucher un calcul, puis toucher la case.";
  afterEach(() => {
    delete (document as { elementFromPoint?: unknown }).elementFromPoint;
  });
  it('la consigne de deux phrases s’affiche en deux lignes, la 2e en petit', () => {
    const view = render(<QuestionView question={q} course={C00} locked={false} onAnswer={() => undefined} texts={{ consigne }} />);
    const ps = [...view.container.querySelectorAll('.class-note p')];
    expect(ps.map((p) => p.textContent)).toEqual(["Fais glisser chaque calcul du bas de l'écran vers la bonne case.", 'Tu peux aussi toucher un calcul, puis toucher la case.']);
    expect(ps[1]!.className).toBe('t-body2');
  });
  it('les calculs sont en bas, les cases en haut', () => {
    const t = setup(q, C00);
    expect(t.$$('.answer-zone .tags .tag')).toHaveLength(2);
    expect(t.$$('.bin .tag')).toHaveLength(0);
    expect(t.$('.tag[data-drag]')!.getAttribute('data-drag')).toBe('0');
  });
  it('pointerdown, pointermove, pointerup d’un calcul vers « Mal écrit » le range', () => {
    const t = setup(q, C00);
    const mal = t.$$('.bin').find((b) => b.getAttribute('aria-label') === 'Mal écrit')!;
    (document as { elementFromPoint?: unknown }).elementFromPoint = () => mal;
    const tile = t.$$('.answer-zone .tags .tag')[1]!;
    fireEvent.pointerDown(tile, { clientX: 20, clientY: 400, pointerId: 1 });
    fireEvent.pointerMove(tile, { clientX: 60, clientY: 300, pointerId: 1 });
    expect(t.$('.tag-ghost')).not.toBeNull();
    expect(mal.classList.contains('is-over')).toBe(true);
    fireEvent.pointerUp(tile, { clientX: 60, clientY: 300, pointerId: 1 });
    expect(mal.querySelectorAll('.tag')).toHaveLength(1);
    expect(t.$$('.answer-zone .tags .tag')).toHaveLength(1);
    expect(t.$('.tag-ghost')).toBeNull();
  });
  it('lâché hors d’une case : le calcul reste en bas', () => {
    const t = setup(q, C00);
    (document as { elementFromPoint?: unknown }).elementFromPoint = () => document.body;
    const tile = t.$$('.answer-zone .tags .tag')[0]!;
    fireEvent.pointerDown(tile, { clientX: 20, clientY: 400, pointerId: 1 });
    fireEvent.pointerMove(tile, { clientX: 60, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(tile, { clientX: 60, clientY: 300, pointerId: 1 });
    expect(t.$$('.answer-zone .tags .tag')).toHaveLength(2);
  });
  it('un simple toucher ne glisse pas : toucher le calcul puis la case marche toujours', () => {
    const t = setup(q, C00);
    const tile = t.$$('.answer-zone .tags .tag')[0]!;
    fireEvent.pointerDown(tile, { clientX: 20, clientY: 400, pointerId: 1 });
    fireEvent.pointerUp(tile, { clientX: 20, clientY: 400, pointerId: 1 });
    fireEvent.click(tile);
    expect(tile.classList.contains('is-selected')).toBe(true);
    fireEvent.click(t.$$('.bin')[0]!);
    expect(t.$$('.bin')[0]!.querySelectorAll('.tag')).toHaveLength(1);
  });
  it('après Valider, sous un calcul mal écrit : la correction et le numéro de la règle', () => {
    const t = setup(q, C00);
    fireEvent.click(t.$$('.answer-zone .tags .tag')[0]!);
    fireEvent.click(t.$$('.bin')[0]!);
    fireEvent.click(t.$$('.answer-zone .tags .tag')[0]!);
    fireEvent.click(t.$$('.bin')[1]!);
    fireEvent.click(t.valider());
    t.rerender(true);
    const fixes = t.$$('.tag-fix');
    expect(fixes).toHaveLength(1);
    expect(fixes[0]!.textContent).toContain('règle 1');
  });
});

describe('Calculs du cours 0 : « 3− + 4 »', () => {
  it('le « − » après le 3 est posé tel quel : KaTeX ne le prend pas pour une soustraction', () => {
    expect(writingLatex('3- + 4')).toBe('3{-} + 4');
    expect(writingLatex('(2-)')).toBe('(2{-})');
    expect(writingLatex('7 - -1')).toBe('7 - -1');
    expect(writingLatex('-3 + 4')).toBe('-3 + 4');
    expect(calcLatex(writingEx(op('+', num(-3), num(4)), 'moins-apres', '3-', '+', '4'))).toBe('3{-} + 4');
  });
  it('rendu : le « − » colle au 3, le « + » a ses espaces', () => {
    const q: Question = { kind: 'choix', ex: writingEx(op('+', num(-3), num(4)), 'moins-apres', '3-', '+', '4'), calcLatex: '3- + 4', prompt: '?', options: [{ label: 'a', why: '' }], correctIndex: 0 };
    const view = render(<QuestionView question={q} course={C00} locked={false} onAnswer={() => undefined} />);
    expect(view.container.querySelector('.q-calc annotation')!.textContent).toBe('3{-} + 4');
    const mo = [...view.container.querySelectorAll('.q-calc math mo')].map((m) => [m.textContent, m.getAttribute('lspace')]);
    expect(mo[0]).toEqual(['−', '0em']); // un « − » seul : pas d'espace autour
    expect(mo[1]![1]).toBeNull(); // le « + » garde son espacement
  });
});
