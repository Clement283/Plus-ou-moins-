import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { getCourse } from '@pom/engine';
import { Etapes } from '../src/components/Etapes';
import { QUESTION_FONT, RESOLUTION_FONT, drawnMaths, lessonMaths, mathLines, sceneOverflows, scenesOf, textWidth } from './phoneWidth';

afterEach(cleanup);

const C04 = getCourse('c04-soustraire');

describe('largeur du téléphone : aucun calcul ne dépasse (aide réutilisable phoneWidth)', () => {
  it('l’estimation repère une scène trop longue', () => {
    const scene = (t: string) => ({ layout: 'one' as const, calcs: [{ tokens: [{ t }] }] });
    expect(sceneOverflows(scene('5 − (−3) = 5 + 3'))).toEqual([]);
    expect(sceneOverflows(scene('= 248 + 175 + (−90) + (−316) + 527 + (−804)'))).toHaveLength(1);
    expect(textWidth('12', 10)).toBeCloseTo(12.8);
    expect(mathLines('248 - (-175) - 90 = \\square', QUESTION_FONT)).toBeLessThanOrEqual(2);
  });

  for (const id of ['c01-additionner-meme-signe', 'c02-additionner-signes-contraires', 'c03-additionner-plusieurs', 'c04-soustraire', 'c05-multiplier-deux']) {
    const course = getCourse(id);
    it(`${id} : chaque scène de la leçon tient sur une ligne`, () => {
      const scenes = scenesOf(course.parts);
      expect(scenes.length).toBeGreaterThan(5);
      expect(scenes.flatMap((s) => sceneOverflows(s))).toEqual([]);
    });
    it(`${id} : chaque calcul de question tient en 2 lignes au plus, coupé après un signe`, () => {
      for (const latex of lessonMaths(course.parts)) expect(mathLines(latex, QUESTION_FONT), latex).toBeLessThanOrEqual(2);
    });
    it(`${id} : calculs tirés aux 3 niveaux (fin, révisions) et leur résolution type`, () => {
      for (const latex of drawnMaths(course)) {
        const font = latex.startsWith('=') ? RESOLUTION_FONT : QUESTION_FONT;
        expect(mathLines(latex, font), latex).toBeLessThanOrEqual(2);
      }
    });
  }
});

describe('Cours 4 : écran pas à pas « J’ajoute l’opposé »', () => {
  const p = C04.parts[3]!;
  if (p.type !== 'etapes') throw new Error('etapes');
  it('deux lectures, puis deux phrases à trous ; une erreur donne son message', () => {
    const view = render(<Etapes title={p.title} steps={p.steps} onDone={() => undefined} />);
    const btn = (label: string) => [...view.container.querySelectorAll<HTMLElement>('button')].find((b) => b.textContent === label) ?? null;
    expect(view.container.querySelector('.stage')!.textContent).toContain('5 − (−3)');
    fireEvent.click(btn('Suite')!);
    fireEvent.click(btn('Suite')!);
    fireEvent.click(btn('(−3)')!);
    expect(view.container.textContent).toContain('Il faut aussi changer son signe');
    fireEvent.click(btn('3')!);
    expect(view.container.textContent).toContain('Le − est devenu un +');
  });
});
