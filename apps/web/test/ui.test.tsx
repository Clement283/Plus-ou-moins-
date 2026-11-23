import { describe, expect, it } from 'vitest';
import { act, render, renderHook } from '@testing-library/react';
import { Math as Maths } from '../src/ui/Math';
import { Stepper } from '../src/ui/Stepper';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { go, useRoute, parseRoute, toHash } from '../src/router';

describe('Math', () => {
  it('rend une fraction empilée (.mfrac) pour \\frac{-12}{4}', () => {
    const { container } = render(<Maths latex="\frac{-12}{4}" />);
    expect(container.querySelector('.mfrac')).not.toBeNull();
  });
  it('ne lève pas sur du LaTeX invalide (throwOnError: false)', () => {
    expect(() => render(<Maths latex="\frac{" />)).not.toThrow();
  });
});

describe('Stepper', () => {
  it('17 segments, 8 faits dont le 6e raté : le 6e est rouge', () => {
    const done = ['ok', 'ok', 'ok', 'ok', 'ok', 'ko', 'ok', 'ok'] as const;
    const { container } = render(<Stepper total={17} done={[...done]} current={8} />);
    const steps = container.querySelectorAll('.stepper__step');
    expect(steps.length).toBe(17);
    expect(steps[5]!.classList.contains('is-error')).toBe(true);
    expect(steps[4]!.classList.contains('is-done')).toBe(true);
    expect(steps[8]!.classList.contains('is-current')).toBe(true);
    expect(steps[9]!.className).toBe('stepper__step');
    expect(steps[7]!.classList.contains('is-error')).toBe(false);
  });
  it('le segment courant est clair', () => {
    const { container } = render(<Stepper total={5} done={['ok', 'ok']} current={2} />);
    expect(container.querySelectorAll('.stepper__step')[2]!.classList.contains('is-current')).toBe(true);
  });
});

describe('router', () => {
  it("go('#/cours') puis useRoute() → { name: 'cours' }", async () => {
    const { result } = renderHook(() => useRoute());
    await act(async () => {
      go('#/cours');
      await new Promise((r) => setTimeout(r, 20)); // hashchange est asynchrone
    });
    expect(result.current).toEqual({ name: 'cours' });
  });
  it('analyse toutes les routes', () => {
    expect(parseRoute('')).toEqual({ name: 'accueil' });
    expect(parseRoute('#/')).toEqual({ name: 'accueil' });
    expect(parseRoute('#/nimporte/quoi')).toEqual({ name: 'inconnu' });
    expect(parseRoute('#/cours/c3')).toEqual({ name: 'cours-detail', id: 'c3' });
    expect(parseRoute('#/cours/c3/relire')).toEqual({ name: 'relire', id: 'c3' });
    expect(parseRoute('#/rattrapage/c3')).toEqual({ name: 'rattrapage', id: 'c3' });
    expect(parseRoute('#/revisions')).toEqual({ name: 'revisions' });
    expect(parseRoute('#/entrainement')).toEqual({ name: 'entrainement' });
    expect(parseRoute('#/entrainement/serie')).toEqual({ name: 'entrainement-serie' });
    expect(parseRoute('#/suivi')).toEqual({ name: 'suivi' });
    expect(parseRoute('#/suivi/u1/module/m1')).toEqual({ name: 'suivi-module', eleve: 'u1', id: 'm1' });
    expect(parseRoute('#/suivi/u1/cours/c2')).toEqual({ name: 'suivi-cours', eleve: 'u1', id: 'c2' });
    expect(parseRoute('#/essai/keypad')).toEqual({ name: 'essai', what: 'keypad' });
  });
  it('toHash est l’inverse de parseRoute', () => {
    for (const h of ['#/', '#/cours', '#/cours/c3', '#/cours/c3/relire', '#/rattrapage/c3', '#/revisions', '#/entrainement', '#/entrainement/serie', '#/suivi', '#/suivi/u1/module/m1', '#/suivi/u1/cours/c2']) {
      expect(toHash(parseRoute(h))).toBe(h);
    }
  });
});

describe('theme.css', () => {
  it('contient tous les tokens de styles.css', () => {
    const src = readFileSync(resolve(__dirname, '../../../docs/design/design-system/styles.css'), 'utf8');
    const theme = readFileSync(resolve(__dirname, '../src/theme.css'), 'utf8');
    const names = new Set([...src.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]!));
    expect(names.size).toBeGreaterThan(50);
    for (const n of names) expect(theme, n).toContain(`${n}:`);
  });
});
