import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { LineScene } from '@pom/engine';
import { LineView } from '../src/components/NumberLine';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const line = (over: Partial<LineScene> = {}): LineScene => ({
  from: -5,
  to: 2,
  jumps: [
    { from: 0, by: -3 },
    { from: -3, by: 3, after: true },
  ],
  tone: 'color',
  ...over,
});

const touch = (extra = {}) => ({ onPick: vi.fn(), consigne: 'Touche la graduation.', ...extra });

describe('LineView', () => {
  it('avec touch : 8 graduations donnent 8 boutons de 36 px minimum (44 px quand la place le permet)', () => {
    const { container } = render(<LineView line={line()} touch={touch()} />);
    const btns = [...container.querySelectorAll<HTMLElement>('button')];
    expect(btns).toHaveLength(8);
    for (const b of btns) expect(b.style.minWidth).toBe('36px');
    expect(container.querySelector<HTMLElement>('.line-view__grid')!.style.gridTemplateColumns).toContain('minmax(36px');
  });

  it('un clic sur −3 appelle onPick(-3)', () => {
    const t = touch();
    const { getByLabelText } = render(<LineView line={line()} touch={t} />);
    fireEvent.click(getByLabelText('Graduation −3'));
    expect(t.onPick).toHaveBeenCalledWith(-3);
  });

  it('tone neutral : aucun arc orange ou bleu', () => {
    const { container } = render(<LineView line={line({ tone: 'neutral' })} />);
    expect(container.querySelector('.is-neg')).toBeNull();
    expect(container.querySelector('.is-pos')).toBeNull();
  });

  it('tone color : arc négatif orange, positif bleu', () => {
    const { container } = render(<LineView line={line()} revealed />);
    const arcs = [...container.querySelectorAll('.line-view__arc')];
    expect(arcs[0]!.classList.contains('is-neg')).toBe(true);
    expect(arcs[1]!.classList.contains('is-pos')).toBe(true);
  });

  it('les bonds after ne sont dessinés qu\'une fois revealed', () => {
    const a = render(<LineView line={line()} />);
    expect(a.container.querySelectorAll('.line-view__arc.is-shown')).toHaveLength(1);
    a.unmount();
    const b = render(<LineView line={line()} revealed />);
    expect(b.container.querySelectorAll('.line-view__arc.is-shown')).toHaveLength(2);
  });

  it('la main n\'est pas rendue sans hand, et n\'est jamais sur le 0', () => {
    const none = render(<LineView line={line()} touch={touch()} />);
    expect(none.container.querySelector('.line-view__hand')).toBeNull();
    none.unmount();
    // le dernier bond arrive en 0 : la main doit aller ailleurs
    const l = line({ jumps: [{ from: -3, by: 3 }] });
    const { container } = render(<LineView line={l} touch={touch({ hand: true })} />);
    const col = container.querySelector('.line-view__hand')!.parentElement!;
    expect(col.querySelector('.line-view__num')!.textContent).not.toBe('0');
  });

  it('les nombres sont sous les pastilles et la consigne avant la droite', () => {
    const { container } = render(<LineView line={line()} touch={touch()} />);
    const col = container.querySelector('.line-view__col')!;
    expect(col.children[0]!.tagName).toBe('BUTTON');
    expect(col.children[1]!.classList.contains('line-view__num')).toBe(true);
    const html = container.innerHTML;
    expect(html.indexOf('Touche la graduation.')).toBeLessThan(html.indexOf('line-view__grid'));
  });

  it('reduced-motion : ni respiration ni main animée', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { container } = render(<LineView line={line()} touch={touch({ hand: true })} />);
    expect(container.querySelector('.is-breathing')).toBeNull();
    expect(container.querySelector('.is-animated')).toBeNull();
  });

  it('sans reduced-motion, les pastilles respirent', () => {
    const { container } = render(<LineView line={line()} touch={touch()} />);
    expect(container.querySelector('.is-breathing')).not.toBeNull();
  });
});
