import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, act } from '@testing-library/react';
import {
  buildQuestion, getCourse, num, op, rat, seededRng,
  type Answer, type CourseDef, type Exercise, type Outcome, type Question,
} from '@pom/engine';
import { QuestionView } from '../src/components/questions/QuestionView';

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
    [classer, 'Range chaque calcul.'],
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
    expect(t.container.textContent).toContain("Touche l'endroit mal écrit.");
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
