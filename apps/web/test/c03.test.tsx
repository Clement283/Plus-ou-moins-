import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { getCourse, seededRng, toLatex, type Question } from '@pom/engine';
import { AutresFacons } from '../src/components/Autres';
import { Etapes, stageSize } from '../src/components/Etapes';
import { QuestionView } from '../src/components/questions/QuestionView';
import { Math as MathView, lengthClass, shownLength } from '../src/ui/Math';
import { toSpeech } from '../src/listen/toSpeech';

afterEach(cleanup);

const C03 = getCourse('c03-additionner-plusieurs');
const at = (i: number) => C03.parts[i]!;

describe('longs calculs : 5 ou 6 termes tiennent dans la largeur du téléphone', () => {
  const four = '5 + (-9) + 2 + (-4)';
  const five = '-15 + 8 + (-3) + 11 + (-12)';
  const six = '-47 + 29 + (-83) + 15 + (-62) + 38';

  it('la longueur lue : 4 termes court, 5 termes long, 6 termes de deux chiffres très long', () => {
    expect(shownLength(four)).toBe(19);
    expect(lengthClass(four)).toBe('');
    expect(lengthClass(five)).toBe(' math--long');
    expect(lengthClass(six)).toBe(' math--xlong');
    expect(shownLength('\\text{Positifs : 7}')).toBe(12);
    expect(shownLength('3 \\times (-2)')).toBe(8);
  });

  it('le calcul rendu porte la classe de sa longueur', () => {
    const { container } = render(
      <>
        <MathView latex={four} />
        <MathView latex={six} />
      </>,
    );
    const maths = [...container.querySelectorAll('.math')];
    expect(maths[0]!.className).toBe('math');
    expect(maths[1]!.className).toBe('math math--xlong');
  });

  it('toute somme du niveau 3 (5 à 6 termes) est réduite', () => {
    const rng = seededRng(5);
    for (let i = 0; i < 100; i++) {
      const ex = C03.generate(3, rng);
      expect(['', ' math--long', ' math--xlong']).toContain(lengthClass(toLatex(ex.expr)));
      expect(lengthClass(toLatex(ex.expr))).not.toBe('');
    }
  });

  it('les scènes : plus la somme est longue, plus la police rétrécit', () => {
    const scene = (t: string) => ({ layout: 'one' as const, calcs: [{ tokens: [{ t }] }] });
    expect(stageSize(scene('−3 + 5'))).toBe('');
    expect(stageSize(scene('5 + (−8) + 3 + (−2)'))).toBe(' stage--n2');
    expect(stageSize(scene('= 3 + 6 + (−7) + (−1) + 4'))).toBe(' stage--n3');
    expect(stageSize({ layout: 'row', calcs: [{ tokens: [{ t: '5 + (−8) + 3 + (−2) + 1' }] }] })).toBe('');
  });

  it('la lecture à voix haute lit une somme de 6 termes en entier', () => {
    const speech = toSpeech('−47 + 29 + (−83) + 15 + (−62) + 38 = ?');
    expect(speech.startsWith('moins 47 plus 29 plus ouvre la parenthèse moins 83')).toBe(true);
    expect(speech.match(/plus/g)).toHaveLength(5);
    expect(speech.match(/ouvre la parenthèse/g)).toHaveLength(2);
    expect(speech.endsWith('égale?')).toBe(true);
  });
});

describe('Cours 3 : écran pas à pas « L’ordre des bonds ne change rien »', () => {
  const p = at(1);
  if (p.type !== 'etapes') throw new Error('etapes');
  it('la somme de 4 termes s’affiche en taille réduite, puis la phrase à trous', () => {
    const onDone = vi.fn();
    const view = render(<Etapes title={p.title} steps={p.steps} onDone={onDone} />);
    const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
    const btn = (label: string) => [...view.container.querySelectorAll<HTMLElement>('button')].find((b) => b.textContent === label) ?? null;
    expect($('.stage')!.className).toContain('stage--n2');
    expect($('.stage')!.textContent).toContain('5 + (−8) + 3 + (−2)');
    fireEvent.click(btn('Suite')!);
    expect($('.stage')!.textContent).toContain('5 + 3 + (−8) + (−2) = ?');
    fireEvent.click(btn('Suite')!);
    fireEvent.click(btn('à un autre endroit')!);
    expect(view.container.textContent).toContain('seul l\'ordre change');
    fireEvent.click(btn('au même endroit')!);
    expect(view.container.textContent).toContain('l\'ordre ne change pas le résultat');
  });
});

describe('Cours 3 : « Autres façons de faire »', () => {
  const found = at(8);
  if (found.type !== 'autres') throw new Error('autres');
  const screen = found;
  function setup() {
    const onDone = vi.fn();
    const view = render(<AutresFacons screen={screen} onDone={onDone} />);
    const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
    const btn = (label: string) => $$('button').find((b) => b.textContent === label) ?? null;
    const key = (k: string) => fireEvent.click(view.getByRole('button', { name: k }));
    return { ...view, onDone, $$, btn, key };
  }

  it('le rappel des 2 règles en haut, puis les 2 cartes', () => {
    const t = setup();
    const html = t.container.innerHTML;
    expect(html.indexOf('Les 2 règles à retenir')).toBeLessThan(html.indexOf('1. Chercher les opposés'));
    expect(t.$$('.recap li')).toHaveLength(2);
    expect(t.$$('.autres-card h3').map((h) => h.textContent)).toEqual(['1. Chercher les opposés et les nombres ronds', '2. Cocher chaque nombre utilisé']);
    expect(t.btn('Essayer : chercher les opposés et les nombres ronds')).not.toBeNull();
    expect(t.btn('Essayer : cocher chaque nombre utilisé')).not.toBeNull();
    expect(t.container.textContent).toContain("Ensuite, tu t'entraînes avec quatre questions.");
  });

  it('technique 1 : taper 1 est juste, −1 donne le message du signe', () => {
    const t = setup();
    fireEvent.click(t.btn('Essayer : chercher les opposés et les nombres ronds')!);
    expect(t.container.textContent).toContain('Essaie avec 9 + (−3) + (−9) + 4');
    t.key('moins');
    t.key('1');
    fireEvent.click(t.btn('Valider')!);
    expect(t.container.querySelector('.alert--error')!.textContent).toContain("Ici, c'est 4, et il est positif.");
    expect(t.btn("Essayer l'autre façon")).not.toBeNull();
  });

  it('technique 1 : la bonne réponse 1', () => {
    const t = setup();
    fireEvent.click(t.btn('Essayer : chercher les opposés et les nombres ronds')!);
    t.key('1');
    fireEvent.click(t.btn('Valider')!);
    expect(t.container.querySelector('.alert--success')!.textContent).toContain("9 et (−9) s'annulent");
  });

  it('technique 2 : toucher le nombre oublié', () => {
    const t = setup();
    fireEvent.click(t.btn('Essayer : cocher chaque nombre utilisé')!);
    expect(t.$$('.choice').map((c) => c.textContent)).toEqual(['−3', '2', '−6']);
    fireEvent.click(t.btn('2')!);
    expect(t.container.querySelector('.alert--error')!.textContent).toContain('Ce nombre est bien dans le regroupement');
    expect(t.btn("Essayer l'autre façon")).not.toBeNull();
    fireEvent.click(t.btn('Continuer')!);
    expect(t.onDone).toHaveBeenCalledTimes(1);
  });
});

describe('Cours 3 : exemples guidés à cases (le calcul de départ et les lignes restent affichés)', () => {
  const qOf = (i: number): Question => {
    const p = at(i);
    if (p.type !== 'question') throw new Error('question');
    return p.question;
  };
  const view = (i: number) => {
    const p = at(i);
    if (p.type !== 'question') throw new Error('question');
    const texts = {
      ...(p.consigne ? { consigne: p.consigne } : {}),
      ...(p.intro ? { intro: p.intro } : {}),
      ...(p.above ? { above: p.above } : {}),
      ...(p.help ? { help: p.help } : {}),
    };
    return render(<QuestionView question={qOf(i)} course={C03} locked={false} onAnswer={() => undefined} texts={texts} />);
  };

  it('exemple 1, dernière ligne : calcul de départ, 2 lignes déjà écrites, aide', () => {
    const v = view(11);
    const lines = [...v.container.querySelectorAll('.resolution__line')].map((l) => l.textContent);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('3');
    expect(lines[0]).toContain('(−7)');
    expect(v.container.querySelector('.hole')).not.toBeNull();
    expect(v.container.querySelector('.help-box')!.textContent).toContain('Dernière ligne.');
    // la case est entre les lignes et l'aide
    const order = [...v.container.querySelectorAll('.resolution, .hole, .help-box')].map((e) => e.className.split(' ')[0]);
    expect(order).toEqual(['resolution', 'hole', 'help-box']);
  });

  it('exemple 2, case 1 : l’introduction, le calcul et les nombres regroupés', () => {
    const v = view(12);
    expect(v.container.textContent).toContain('Cette fois, deux cases sont à toi.');
    expect([...v.container.querySelectorAll('.resolution__line')]).toHaveLength(2);
    expect(v.container.textContent).toContain('(−9)');
  });

  it('exemple 2, case 2 : les deux lignes du dessus', () => {
    const v = view(13);
    expect([...v.container.querySelectorAll('.resolution__line')]).toHaveLength(3);
  });
});
