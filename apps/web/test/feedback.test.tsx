import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import type { Feedback, LessonBlock, LessonPart } from '@pom/engine';
import { FeedbackPanel } from '../src/components/Feedback';
import { LessonBlocks, LessonPartScreen } from '../src/components/LessonPart';
import { NumberLine } from '../src/components/NumberLine';
import { colorizeLatex } from '../src/components/colorize';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const reducedMotion = (reduce: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));

const faux: Feedback = {
  tone: 'faux',
  title: 'La bonne réponse est 12.',
  message: '− × − = +. Deux signes pareils donnent +.',
  rightLatex: '12',
  explanation: {
    rule: '− × − = +.',
    steps: [
      { t: 'math', latex: '-3 \\times (-4)', colorize: true },
      { t: 'math', latex: '= +(3 \\times 4)', colorize: true },
      { t: 'math', latex: '= 12', colorize: true },
    ],
  },
  steps: ['-3 \\times (-4)', '= +(3 \\times 4)', '= 12'],
};

describe('FeedbackPanel', () => {
  it('faux : titre, règle et bloc « Étape par étape »', () => {
    const { container, getByText } = render(<FeedbackPanel feedback={faux} />);
    const alert = container.querySelector('.alert.alert--error')!;
    expect(alert.getAttribute('role')).toBe('status');
    expect(alert.querySelector('.alert__title')!.textContent).toBe('La bonne réponse est 12.');
    expect(alert.textContent).toContain('Deux signes pareils donnent +.');
    expect(getByText('Étape par étape').className).toContain('resolution-label');
    const lines = container.querySelectorAll('.resolution > div');
    expect(lines).toHaveLength(3);
    expect(lines[2]!.className).toContain('is-last');
    // une explication peut porter des couleurs : −3 et −4 en rouge
    expect(container.querySelectorAll('.resolution .neg').length).toBeGreaterThan(0);
  });

  it('faux sans explication (réponse mal écrite) : la bonne réponse suit le message', () => {
    const f: Feedback = { tone: 'faux', title: 'Réponse mal écrite', message: "Le signe moins s'écrit avant le nombre.", rightLatex: '-8', explanation: null, steps: [] };
    const { container, queryByText } = render(<FeedbackPanel feedback={f} />);
    expect(container.querySelector('.alert__title')!.textContent).toBe('Réponse mal écrite');
    expect(container.querySelector('.alert')!.textContent).toContain('La bonne réponse est');
    expect(container.querySelector('.alert .math')!.textContent).toContain('−8');
    expect(queryByText('Étape par étape')).toBeNull();
  });

  it('juste avec une note : la note seule, bandeau vert', () => {
    const { container } = render(<FeedbackPanel feedback={{ tone: 'juste', title: 'Juste !', note: 'Juste ! On écrit simplement −7.' }} />);
    const a = container.querySelector('.alert.alert--success')!;
    expect(a.querySelector('.alert__title')!.textContent).toBe('Juste ! On écrit simplement −7.');
    expect(a.textContent).toBe('Juste ! On écrit simplement −7.');
  });

  it('juste sans note : « Juste ! »', () => {
    const { container } = render(<FeedbackPanel feedback={{ tone: 'juste', title: 'Juste !', note: null }} />);
    expect(container.querySelector('.alert--success .alert__title')!.textContent).toBe('Juste !');
  });

  it('pas fini : bandeau indigo, pas compté faux', () => {
    const { container } = render(<FeedbackPanel feedback={{ tone: 'pas-fini', title: "Le calcul n'est pas fini : simplifie.", message: 'Pas compté faux : corrige et valide encore.' }} />);
    const a = container.querySelector('.alert.alert--info')!;
    expect(a.querySelector('.alert__title')!.textContent).toBe("Le calcul n'est pas fini : simplifie.");
    expect(a.textContent).toContain('Pas compté faux : corrige et valide encore.');
  });

  it('la note de révision se pose en légende', () => {
    const { container } = render(<FeedbackPanel feedback={faux} note="Ce calcul reviendra encore à la fin." />);
    expect(container.querySelector('.t-caption')!.textContent).toBe('Ce calcul reviendra encore à la fin.');
  });
});

describe('LessonBlocks', () => {
  it('✓ vert, ✗ rouge (plusieurs ✗ séparés par « · » : une ligne chacun)', () => {
    const blocks: LessonBlock[] = [
      { t: 'text', text: '✓ 4 × (−3)' },
      { t: 'text', text: '✗ 4 × −3 · ✗ 5 + −2' },
    ];
    const { container } = render(<LessonBlocks blocks={blocks} colorize />);
    const ok = container.querySelectorAll('.lesson-line--ok');
    const ko = container.querySelectorAll('.lesson-line--ko');
    expect(ok).toHaveLength(1);
    expect(ok[0]!.querySelector('.lesson-line__mark')!.textContent).toBe('✓');
    expect(ko).toHaveLength(2);
    expect(ko[1]!.textContent).toContain('5 + −2');
  });

  it('tone neutre : bloc gris avec « ~ », ni ✓ ni ✗ (doc 07 n° 8)', () => {
    const { container } = render(<LessonBlocks blocks={[{ t: 'text', text: '(−3) + 5 : pas faux, mais inutile', tone: 'neutre' }]} colorize />);
    const n = container.querySelector('.lesson-line--neutral')!;
    expect(n.querySelector('.lesson-line__mark')!.textContent).toBe('~');
    expect(n.textContent).toContain('pas faux, mais inutile');
    expect(container.querySelector('.lesson-line--ko, .lesson-line--ok')).toBeNull();
  });

  it('le gras **…** devient <b>', () => {
    const { container } = render(<LessonBlocks blocks={[{ t: 'text', text: 'donc **−4** ici' }]} colorize />);
    expect(container.querySelector('b')!.textContent).toBe('−4');
  });

  it('colorize : négatifs rouges, positifs bleus ; sans colorize rien', () => {
    const blocks: LessonBlock[] = [{ t: 'math', latex: '-2 + 5 + (-4)', colorize: true }];
    const on = render(<LessonBlocks blocks={blocks} colorize />);
    const neg = [...on.container.querySelectorAll('.neg')].map((e) => e.textContent);
    const pos = [...on.container.querySelectorAll('.pos')].map((e) => e.textContent);
    expect(neg).toEqual(['−2', '−4']);
    expect(pos).toEqual(['5']);
    cleanup();
    const off = render(<LessonBlocks blocks={blocks} colorize={false} />);
    expect(off.container.querySelector('.neg, .pos')).toBeNull();
  });

  it('une animation inconnue est ignorée', () => {
    const { container } = render(<LessonBlocks blocks={[{ t: 'text', text: 'avant' }, { t: 'anim', name: 'inconnue' }, { t: 'text', text: 'après' }]} colorize />);
    expect(container.textContent).toContain('avant');
    expect(container.textContent).toContain('après');
    expect(container.querySelector('[data-anim]')).toBeNull();
  });

  it('mouvement réduit : animations figées (is-static), blocs sans fondu', () => {
    reducedMotion(true);
    const blocks: LessonBlock[] = [{ t: 'anim', name: 'compter-les-moins' }, { t: 'text', text: 'après' }];
    const { container } = render(<LessonBlocks blocks={blocks} colorize />);
    expect(container.querySelector('[data-anim].is-static')).not.toBeNull();
    expect(container.querySelector('.lesson-reveal')).toBeNull();
    cleanup();
    reducedMotion(false);
    const normal = render(<LessonBlocks blocks={blocks} colorize />);
    expect(normal.container.querySelector('.is-static')).toBeNull();
    expect(normal.container.querySelector('.lesson-reveal')).not.toBeNull();
  });

  it('un texte avec « : » reste une seule ligne, tel quel', () => {
    const { container } = render(<LessonBlocks blocks={[{ t: 'text', text: '2 : pas faux', tone: 'neutre' }]} colorize />);
    expect(container.querySelector('.lesson-line__note')).toBeNull();
    expect(container.querySelector('.lesson-line')!.textContent).toBe('~2 : pas faux');
  });

  it('les 3 animations nommées se rendent', () => {
    for (const name of ['signes-qui-se-cognent', 'moins-moins-devient-plus', 'compter-les-moins']) {
      const { container } = render(<LessonBlocks blocks={[{ t: 'anim', name }]} colorize />);
      expect(container.querySelector(`[data-anim="${name}"]`), name).not.toBeNull();
      cleanup();
    }
  });
});

describe('NumberLine', () => {
  const jumps = [{ from: 0, by: -3 }, { from: -3, by: -5 }];

  it('prefers-reduced-motion : directement à l’état final', () => {
    reducedMotion(true);
    const { container } = render(<NumberLine from={-9} to={1} jumps={jumps} />);
    const nl = container.querySelector('.number-line')!;
    expect(nl.getAttribute('data-state')).toBe('final');
    expect(container.querySelector('.number-line__cursor')!.textContent).toBe('−8');
    expect(container.querySelectorAll('.nl-arc.is-shown')).toHaveLength(2);
  });

  it('sinon : part du départ puis saute, bond après bond', () => {
    reducedMotion(false);
    vi.useFakeTimers();
    const { container } = render(<NumberLine from={-9} to={1} jumps={jumps} />);
    const nl = container.querySelector('.number-line')!;
    expect(nl.getAttribute('data-state')).toBe('start');
    expect(container.querySelector('.number-line__cursor')!.textContent).toBe('0');
    expect(container.querySelectorAll('.nl-arc.is-shown')).toHaveLength(0);
    act(() => { vi.advanceTimersByTime(600); });
    expect(container.querySelector('.number-line__cursor')!.textContent).toBe('−3');
    expect(container.querySelectorAll('.nl-arc.is-shown')).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(nl.getAttribute('data-state')).toBe('final');
    expect(container.querySelector('.number-line__cursor')!.textContent).toBe('−8');
    expect(container.querySelectorAll('.nl-arc.is-shown')).toHaveLength(2);
  });

  it('une droite vide ou à l’envers ne plante pas', () => {
    reducedMotion(true);
    expect(() => render(<NumberLine from={2} to={2} jumps={[]} />)).not.toThrow();
    expect(() => render(<NumberLine from={3} to={-1} jumps={[]} />)).not.toThrow();
  });

  it('chaque bond porte sa valeur, rouge si négatif, bleue si positif', () => {
    reducedMotion(true);
    const { container } = render(<NumberLine from={-4} to={3} jumps={[{ from: -3, by: 5 }]} />);
    const arc = container.querySelector('.nl-arc')!;
    expect(arc.classList.contains('is-pos')).toBe(true);
    expect(arc.textContent).toBe('+5');
  });
});

describe('LessonPartScreen', () => {
  const part: Extract<LessonPart, { type: 'explication' }> = {
    type: 'explication',
    blocks: [
      { t: 'text', text: "Enlever une dette de 3 €, c'est comme gagner 3 €." },
      { t: 'math', latex: '5 - (-3) = 5 + 3 = 8', colorize: true },
      { t: 'anim', name: 'moins-moins-devient-plus' },
    ],
  };

  it('titre, blocs, bouton « Suivant »', () => {
    const next = vi.fn();
    const { container, getByText } = render(<LessonPartScreen part={part} onNext={next} title="Soustraire" header={<span className="chip chip--module">Cours 4, leçon</span>} />);
    expect(container.querySelector('h1')!.textContent).toBe('Soustraire');
    expect(container.textContent).toContain('Enlever une dette');
    expect(container.querySelector('.chip--module')!.textContent).toBe('Cours 4, leçon');
    fireEvent.click(getByText('Suivant'));
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('LessonPartScreen : titre, sous-titre et « Fais attention » (doc 09)', () => {
  const part: Extract<LessonPart, { type: 'explication' }> = {
    type: 'explication',
    title: "Soustraire, c'est ajouter l'opposé",
    subtitle: "Je transforme en addition, puis j'applique les cours 1 et 2.",
    blocks: [
      { t: 'text', text: '5 − (−3) = 5 + 3 = **8**', tone: 'ok' },
      { t: 'heading', text: 'Fais attention' },
      { t: 'text', text: '6 − (−2) = 6 − 2 = 4', tone: 'ko', note: "Le signe de −2 n'a pas changé : 6 − (−2) = 6 + 2." },
      { t: 'text', text: '(−4) − 6', tone: 'neutre', note: 'Pas faux, mais inutile : en tête, pas de parenthèses.' },
    ],
  };

  it('le titre de l\'écran remplace le titre du cours, le sous-titre est dessous', () => {
    const { container } = render(<LessonPartScreen part={part} onNext={() => undefined} title="Soustraire" />);
    expect(container.querySelector('h1')!.textContent).toBe("Soustraire, c'est ajouter l'opposé");
    const sub = container.querySelector('h1 + p.t-body2')!;
    expect(sub.textContent).toBe("Je transforme en addition, puis j'applique les cours 1 et 2.");
  });

  it('sans titre d\'écran : le titre du cours', () => {
    const { container } = render(<LessonPartScreen part={{ type: 'explication', blocks: [] }} onNext={() => undefined} title="Soustraire" />);
    expect(container.querySelector('h1')!.textContent).toBe('Soustraire');
    expect(container.querySelector('h1 + p.t-body2')).toBeNull();
  });

  it('ligne ✓ verte, titre « Fais attention » (h2), ✗ rouge et ~ gris avec leur explication', () => {
    const { container } = render(<LessonPartScreen part={part} onNext={() => undefined} />);
    expect(container.querySelector('.lesson-line--ok')!.textContent).toContain('5 − (−3) = 5 + 3 = 8');
    expect(container.querySelector('h2.t-h6')!.textContent).toBe('Fais attention');
    const ko = container.querySelector('.lesson-line--ko.lesson-line--stack')!;
    expect(ko.querySelector('.lesson-line__mark')!.textContent).toBe('✗');
    expect(ko.querySelector('.lesson-line__note')!.textContent).toBe("Le signe de −2 n'a pas changé : 6 − (−2) = 6 + 2.");
    const n = container.querySelector('.lesson-line--neutral.lesson-line--stack')!;
    expect(n.querySelector('.lesson-line__mark')!.textContent).toBe('~');
    expect(n.querySelector('.lesson-line__note')!.textContent).toBe('Pas faux, mais inutile : en tête, pas de parenthèses.');
  });
});

describe('colorizeLatex', () => {
  it('enveloppe les nombres signés, laisse les opérateurs', () => {
    expect(colorizeLatex('5 - (-3)')).toBe('\\htmlClass{pos}{5} - (\\htmlClass{neg}{-3})');
    expect(colorizeLatex('-2 \\times 3')).toBe('\\htmlClass{neg}{-2} \\times \\htmlClass{pos}{3}');
    expect(colorizeLatex('= -12')).toBe('= \\htmlClass{neg}{-12}');
  });
  it('un moins binaire reste hors du nombre, \\text intact', () => {
    expect(colorizeLatex('3 - 7')).toBe('\\htmlClass{pos}{3} - \\htmlClass{pos}{7}');
    expect(colorizeLatex('\\text{3 signes}')).toBe('\\text{3 signes}');
  });
  it('fractions', () => {
    expect(colorizeLatex('\\frac{-12}{4}')).toBe('\\frac{\\htmlClass{neg}{-12}}{\\htmlClass{pos}{4}}');
  });
});
