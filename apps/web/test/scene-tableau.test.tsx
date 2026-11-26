import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { type EtapeStep, intervalOfRelation, rat } from '@pom/engine';
import { Etapes } from '../src/components/Etapes';

afterEach(cleanup);

const render1 = (step: EtapeStep) => {
  const view = render(<Etapes title="Titre" steps={[step]} onDone={vi.fn()} />);
  return (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
};

describe('scènes de leçon : intervalle colorié et tableau de signes', () => {
  it('un intervalle colorié sous les calculs, avec le rond plein pour la borne comprise', () => {
    const $$ = render1({
      text: 'x ≥ 2 s’écrit [2 , +∞[.',
      scene: { layout: 'one', calcs: [{ tokens: [{ t: 'x ≥ 2' }] }], interval: { intervals: [intervalOfRelation('>=', rat(2))] } },
    });
    expect($$('.interval-line__zone')).toHaveLength(1);
    expect($$('.interval-line__dot.is-closed')).toHaveLength(1);
  });

  it('deux intervalles reliés (réunion)', () => {
    const $$ = render1({
      scene: {
        layout: 'one',
        calcs: [{ tokens: [{ t: 'S' }] }],
        interval: { intervals: [intervalOfRelation('<=', rat(-1)), intervalOfRelation('>=', rat(2))] },
      },
    });
    expect($$('.interval-line__zone')).toHaveLength(2);
  });

  it('un tableau de signes : 1re ligne seule, puis tout rempli avec colonnes surlignées', () => {
    const f = [
      { a: 1, b: -2 },
      { a: 1, b: 1 },
    ];
    const seule = render1({ scene: { layout: 'one', calcs: [{ tokens: [{ t: '(x − 2)(x + 1)' }] }], table: { op: 'produit', factors: f, upTo: 'valeurs' } } });
    expect(seule('.sign-table')).toHaveLength(1);
    expect(seule('.sign-table')[0]!.textContent).toContain('−1');
    cleanup();
    const plein = render1({ scene: { layout: 'one', calcs: [{ tokens: [{ t: 'S' }] }], table: { op: 'produit', factors: f, ghost: '>=' } } });
    expect(plein('.sign-table__c.sign-zero')).toHaveLength(4);
    expect(plein('.sign-table__c.is-ghost').length).toBeGreaterThan(0);
  });
});
