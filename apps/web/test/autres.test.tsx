import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { courseRunItems, getCourse, seededRng } from '@pom/engine';
import { AutresFacons } from '../src/components/Autres';
import { arcHeights, LineView } from '../src/components/NumberLine';

afterEach(cleanup);

const C02 = getCourse('c02-additionner-signes-contraires');
const found = C02.parts[9];
if (found?.type !== 'autres') throw new Error("la partie 9 du Cours 2 n'est pas « Autres façons de faire »");
const part = found;

function setup() {
  const onDone = vi.fn();
  const view = render(<AutresFacons screen={part} onDone={onDone} />);
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const btn = (label: string | RegExp) => $$('button').find((b) => (typeof label === 'string' ? b.textContent === label : label.test(b.textContent ?? ''))) ?? null;
  const key = (k: string) => fireEvent.click(view.getByRole('button', { name: k }));
  return { ...view, onDone, $, $$, btn, key };
}

describe('AutresFacons (Cours 2, « Autres façons de faire »)', () => {
  it('le rappel des règles en haut, puis les 2 cartes, la phrase de fin', () => {
    const t = setup();
    expect(t.$('h1')!.textContent).toBe('Autres façons de faire');
    const html = t.container.innerHTML;
    expect(html.indexOf('Les 2 règles à retenir')).toBeLessThan(html.indexOf('1. Commencer par le positif'));
    expect(t.$$('.recap li')).toHaveLength(3);
    expect(t.$('.rule-box')!.textContent).toContain('Signes contraires : je soustrais le plus petit du plus grand (sans signe), et je prends le signe du plus grand.');
    expect(t.$$('.autres-card')).toHaveLength(2);
    expect(t.$$('.autres-card h3').map((h) => h.textContent)).toEqual(['1. Commencer par le positif', '2. Deviner le signe']);
    expect(t.$$('.autres-card__ex')[0]!.textContent).toBe('−7 + 2 = 2 + (−7) = 2 − 7 = −5');
    expect(t.container.textContent).toContain("Maintenant, tu t'entraînes avec quatre questions.");
  });

  it('le choix se fait avec les boutons du bas ; on peut continuer sans essayer', () => {
    const t = setup();
    expect(t.btn('Essayer : commencer par le positif')).not.toBeNull();
    expect(t.btn('Essayer : deviner le signe')).not.toBeNull();
    expect(t.container.textContent).toContain("Tu peux aussi continuer sans essayer : aucune n'est obligatoire.");
    fireEvent.click(t.btn('Continuer')!);
    expect(t.onDone).toHaveBeenCalledTimes(1);
  });

  it('technique 1 : taper −3 est juste, 3 donne le message du signe, 13 celui de la soustraction', () => {
    const t = setup();
    fireEvent.click(t.btn('Essayer : commencer par le positif')!);
    expect(t.container.textContent).toContain('Essaie avec −8 + 5');
    expect(t.container.textContent).toContain('Essai libre : il ne compte pas dans la note.');
    t.key('3');
    fireEvent.click(t.btn('Valider')!);
    expect(t.container.querySelector('.alert--error')!.textContent).toContain("Ici, c'est 8, et il est négatif.");
    expect(t.btn('Essayer l\'autre façon')).not.toBeNull();
  });

  it('technique 1 : la bonne réponse −3', () => {
    const t = setup();
    fireEvent.click(t.btn('Essayer : commencer par le positif')!);
    t.key('moins');
    t.key('3');
    fireEvent.click(t.btn('Valider')!);
    expect(t.container.querySelector('.alert--success')!.textContent).toContain('On part de 5 et on recule de 8');
  });

  it('technique 2 : toucher le signe, puis l’autre façon', () => {
    const t = setup();
    fireEvent.click(t.btn('Essayer : deviner le signe')!);
    expect(t.$$('.choice').map((c) => c.textContent)).toEqual(['positif', 'négatif']);
    fireEvent.click(t.btn('négatif')!);
    expect(t.container.querySelector('.alert--error')!.textContent).toContain('Le nombre le plus loin de 0 est 9');
    fireEvent.click(t.btn("Essayer l'autre façon")!);
    expect(t.container.textContent).toContain('Essaie avec −8 + 5');
    expect(t.$('.alert')).toBeNull();
  });
});

describe('arcs de la droite graduée : deux bonds qui se superposent', () => {
  it('un arc qui en contient un autre est plus haut', () => {
    expect(arcHeights([{ from: 0, by: -7 }, { from: -7, by: 2 }])).toEqual([44, 28]);
    expect(arcHeights([{ from: 0, by: -3 }, { from: -3, by: -5 }])).toEqual([28, 28]);
    expect(arcHeights([{ from: 0, by: -6 }, { from: -6, by: 6 }])).toEqual([28, 44]);
  });
  it('LineView donne sa hauteur à chaque arc, la zone des arcs s’agrandit', () => {
    const { container } = render(<LineView line={{ from: -7, to: 0, jumps: [{ from: 0, by: -7 }, { from: -7, by: 2 }], tone: 'color' }} />);
    const arcs = [...container.querySelectorAll<HTMLElement>('.line-view__arc')];
    expect(arcs[0]!.style.height).toBe('44px');
    expect(arcs[1]!.style.height).toBe('');
    expect(container.querySelector<HTMLElement>('.line-view__arcs')!.style.height).toBe('72px');
  });
});

describe('Cours 2 : l’écran fait partie de l’activité', () => {
  it('l’élément `autres` porte les données de l’écran', () => {
    const item = courseRunItems(C02, seededRng(1)).find((i) => i.itemId === 'partie-9');
    expect(item?.type === 'explication' && item.autres?.techniques).toHaveLength(2);
  });
});
