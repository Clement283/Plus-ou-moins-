import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { getCourse } from '@pom/engine';
import { Etapes } from '../src/components/Etapes';
import { QUESTION_FONT, drawnMaths, mathLines, sceneOverflows, scenesOf, textWidth, PHONE } from './phoneWidth';

afterEach(cleanup);

const C05 = getCourse('c05-multiplier-deux');

describe('Cours 5 : largeur du téléphone (en plus de la boucle commune de c04.test.tsx)', () => {
  it('la plus longue scène (3 dettes de 2 €) tient sur une ligne', () => {
    const scenes = scenesOf(C05.parts);
    expect(scenes.flatMap((s) => sceneOverflows(s))).toEqual([]);
    const longest = Math.max(...scenes.flatMap((s) => s.calcs.map((c) => c.tokens.map((t) => t.t).join('').length)));
    expect(longest).toBeGreaterThan(24); // elle passe en petite police (stage--n3) et tient quand même
  });
  it('niveau 3 : un produit de deux facteurs à deux chiffres tient sur une ligne, sa résolution aussi', () => {
    for (const latex of drawnMaths(C05)) expect(mathLines(latex, QUESTION_FONT), latex).toBe(1);
  });
  it('les calculs de l’écran « Autres façons de faire » tiennent dans la largeur', () => {
    const p = C05.parts.find((x) => x.type === 'autres');
    if (p?.type !== 'autres') throw new Error('autres');
    for (const t of p.techniques) expect(textWidth(t.essai.calc, QUESTION_FONT)).toBeLessThan(PHONE - 48);
  });
});

describe('Cours 5 : écran pas à pas « Multiplier, c’est répéter »', () => {
  const p = C05.parts[1]!;
  if (p.type !== 'etapes') throw new Error('etapes');
  it('deux lectures, une phrase à trous, une lecture, une phrase à trous ; une erreur donne son message', () => {
    const view = render(<Etapes title={p.title} steps={p.steps} onDone={() => undefined} />);
    const btn = (label: string) => [...view.container.querySelectorAll<HTMLElement>('button')].find((b) => b.textContent === label) ?? null;
    expect(view.container.querySelector('.stage')!.textContent).toContain('3 × 2 = 2 + 2 + 2 = 6');
    fireEvent.click(btn('Suite')!);
    fireEvent.click(btn('Suite')!);
    fireEvent.click(btn('1')!);
    expect(view.container.textContent).toContain('tu as additionné les deux nombres');
    fireEvent.click(btn('−6')!);
    expect(view.container.textContent).toContain('Un positif fois un négatif donne un négatif');
    fireEvent.click(btn('Suite')!);
    expect(view.container.querySelector('.stage')!.textContent).toContain('2 × (−2) = −4');
    fireEvent.click(btn('Suite')!);
    fireEvent.click(btn('0')!);
    expect(view.container.textContent).toContain('le résultat monte encore de 2 : 0 + 2 = 2');
    fireEvent.click(btn('2')!);
    expect(view.container.textContent).toContain('Deux négatifs donnent un positif');
  });
});

describe('Cours 5 : écran pas à pas « Le signe du produit »', () => {
  const p = C05.parts[2]!;
  if (p.type !== 'etapes') throw new Error('etapes');
  it('le piège du plus grand : « positif » donne le message de la règle de l’addition, puis l’encadré', () => {
    const view = render(<Etapes title={p.title} steps={p.steps} onDone={() => undefined} />);
    const btn = (label: string) => [...view.container.querySelectorAll<HTMLElement>('button')].find((b) => b.textContent === label) ?? null;
    fireEvent.click(btn('Suite')!);
    fireEvent.click(btn('positif')!);
    fireEvent.click(btn('Suite')!);
    expect(view.container.querySelector('.stage')!.textContent).toContain('6 × (−7) = −42');
    fireEvent.click(btn('Suite')!);
    fireEvent.click(btn('positif')!);
    expect(view.container.textContent).toContain("c'est la règle de l'addition (Cours 2)");
    fireEvent.click(btn('négatif')!);
    expect(view.container.textContent).toContain('Ici, le plus grand ne compte pas');
    fireEvent.click(btn('Suite')!);
    expect(view.container.textContent).toContain('Même signe : le produit est positif. Signes contraires : le produit est négatif.');
  });
});
