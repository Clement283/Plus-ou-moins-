import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { canSubmit, emptyRaw, pressKey, rawToString, type Key, type RawInput } from '@pom/engine';
import { Keypad } from '../src/components/Keypad';
import { RawInputView } from '../src/components/RawInputView';

function Harness({ submitted }: { submitted?: (i: RawInput) => void }) {
  const [input, setInput] = useState<RawInput>(emptyRaw());
  return (
    <div>
      <RawInputView input={input} />
      <Keypad onKey={(k: Key) => setInput((i) => pressKey(i, k))} onSubmit={() => submitted?.(input)} canSubmit={canSubmit(input)} />
    </div>
  );
}

const LABEL: Record<string, string> = {
  '−': 'moins', '(': 'parenthèse ouvrante', ')': 'parenthèse fermante', '▭/▭': 'fraction', '→': 'case suivante', '⌫': 'effacer',
};
function setup() {
  const view = render(<Harness />);
  const tap = (...keys: string[]) => {
    for (const k of keys) {
      const btn = view.container.querySelector<HTMLButtonElement>(`button[aria-label="${LABEL[k] ?? k}"], button[data-key="${k}"]`);
      const b = btn ?? [...view.container.querySelectorAll('button')].find((x) => x.textContent === k)!;
      fireEvent.click(b);
    }
  };
  const shown = () => view.container.querySelector('.answer')!.textContent;
  return { ...view, tap, shown };
}

describe('Keypad', () => {
  it('disposition : 7 8 9 ⌫ / 4 5 6 − / 1 2 3 fraction / ( 0 ) → / Valider', () => {
    const { container } = render(<Keypad onKey={() => {}} onSubmit={() => {}} canSubmit />);
    const keys = [...container.querySelectorAll('button')];
    expect(keys.map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual([
      '7', '8', '9', 'effacer', '4', '5', '6', 'moins', '1', '2', '3', 'fraction', 'parenthèse ouvrante', '0', 'parenthèse fermante', 'case suivante', 'Valider',
    ]);
    const submit = keys[16]!;
    expect(submit.style.gridColumn).toBe('span 4');
  });
  it('touches : type="button", aucun input, aucun élément saisissable', () => {
    const { container } = render(<Keypad onKey={() => {}} onSubmit={() => {}} canSubmit />);
    for (const b of container.querySelectorAll('button')) expect(b.getAttribute('type')).toBe('button');
    expect(container.querySelector('input,textarea,[contenteditable]')).toBeNull();
  });
  it('Valider est inactif quand canSubmit est faux et ne déclenche rien', () => {
    let n = 0;
    const { container } = render(<Keypad onKey={() => {}} onSubmit={() => n++} canSubmit={false} />);
    const b = [...container.querySelectorAll('button')].at(-1)!;
    expect(b.disabled).toBe(true);
    fireEvent.click(b);
    expect(n).toBe(0);
  });
});

describe('RawInputView', () => {
  it('vide : « Ta réponse » et curseur', () => {
    const { container } = render(<RawInputView input={emptyRaw()} />);
    expect(container.querySelector('.answer--empty')!.textContent).toBe('Ta réponse');
    expect(container.querySelector('.answer__caret')).not.toBeNull();
    expect(container.querySelector('input,textarea')).toBeNull();
  });
  it('états faux, juste, note', () => {
    const i = pressKey(emptyRaw(), 'digit:8');
    expect(render(<RawInputView input={i} state="faux" />).container.querySelector('.answer--error')).not.toBeNull();
    expect(render(<RawInputView input={i} state="juste" />).container.querySelector('.answer--success')).not.toBeNull();
    const note = render(<RawInputView input={i} state="note" />).container.querySelector('.answer')!;
    expect(note.className).toBe('answer');
  });
  it('aucune couleur sur la saisie', () => {
    const i = pressKey(pressKey(emptyRaw(), 'frac'), 'digit:1');
    const { container } = render(<RawInputView input={i} />);
    for (const el of container.querySelectorAll<HTMLElement>('*')) expect(el.style.color).toBe('');
  });
});

describe('Exemples du doc 03 (touches tapées sur le clavier rendu)', () => {
  const cases: [string[], string][] = [
    [['−', '8'], '−8'],
    [['8', '−'], '8−'],
    [['−', '−', '8'], '−−8'],
    [['8'], '8'],
    [['(', '−', '8', ')'], '(−8)'],
    [['(', '−', '8'], '(−8'],
    [['0', '7'], '07'],
    [['−', '0'], '−0'],
    [['3', '⌫', '4'], '4'],
    [['−'], '−'],
  ];
  for (const [keys, shown] of cases) {
    it(`${keys.join(' ')} affiche ${shown}`, () => {
      const t = setup();
      t.tap(...keys);
      expect(t.shown()).toBe(shown);
    });
  }

  it('fraction −12 sur 4', () => {
    const t = setup();
    t.tap('▭/▭', '−', '1', '2', '→', '4');
    const frac = t.container.querySelector('.answer .frac')!;
    expect([...frac.children].map((c) => c.textContent)).toEqual(['−12', '4']);
  });
  it('− devant la fraction 12 sur 4', () => {
    const t = setup();
    t.tap('−', '▭/▭', '1', '2', '→', '4');
    const answer = t.container.querySelector('.answer')!;
    expect(answer.firstElementChild!.textContent).toBe('−');
    expect(answer.querySelector('.frac')!.textContent).toBe('124');
    expect(answer.firstElementChild!.nextElementSibling!.className).toBe('frac');
  });
  it('fraction 3 sur case vide, dénominateur actif', () => {
    const t = setup();
    t.tap('▭/▭', '3', '→');
    const [num, den] = [...t.container.querySelectorAll('.answer .frac > span')];
    expect(num!.textContent).toBe('3');
    expect(den!.classList.contains('is-slot')).toBe(true);
    expect(den!.classList.contains('is-active')).toBe(true);
  });
  it('fraction 3 sur 4, → puis ⌫ : le 4 est effacé, curseur dans le dénominateur', () => {
    const t = setup();
    t.tap('▭/▭', '3', '→', '4', '→', '⌫');
    const den = t.container.querySelectorAll('.answer .frac > span')[1]!;
    expect(den.textContent).toBe('');
    expect(den.classList.contains('is-active')).toBe(true);
  });
  it('fraction 5 sur 0', () => {
    const t = setup();
    t.tap('▭/▭', '5', '→', '0');
    expect([...t.container.querySelectorAll('.answer .frac > span')].map((c) => c.textContent)).toEqual(['5', '0']);
  });
  it('fraction vide : deux cases vides, numérateur actif', () => {
    const t = setup();
    t.tap('▭/▭');
    const [num, den] = [...t.container.querySelectorAll('.answer .frac > span')];
    expect(num!.className).toContain('is-active');
    expect(den!.className).toContain('is-slot');
    expect(den!.className).not.toContain('is-active');
  });
  it('le curseur est visible dans la case active non vide, et à la fin en dehors', () => {
    const t = setup();
    t.tap('▭/▭', '1');
    expect(t.container.querySelectorAll('.answer__caret').length).toBe(1);
    expect(t.container.querySelector('.frac .answer__caret')).not.toBeNull();
    t.tap('→', '→');
    expect(t.container.querySelector('.frac .answer__caret')).toBeNull();
    expect(t.container.querySelectorAll('.answer__caret').length).toBe(1);
  });
  it('Valider : grisé si rien, actif avec un caractère ou une fraction vide', () => {
    const t = setup();
    const submit = () => [...t.container.querySelectorAll('button')].at(-1)!.disabled;
    expect(submit()).toBe(true);
    t.tap('▭/▭');
    expect(submit()).toBe(false);
    t.tap('⌫');
    expect(submit()).toBe(true);
    t.tap('3');
    expect(submit()).toBe(false);
  });
  it('la 13e touche est sans effet', () => {
    const t = setup();
    t.tap('1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3');
    expect(t.shown()).toBe('123456789012');
  });
  it('13 caractères avec une fraction : la barre ne compte pas', () => {
    const t = setup();
    t.tap('▭/▭', '1', '2', '3', '4', '5', '6', '→', '1', '2', '3', '4', '5', '6', '7');
    expect(t.container.querySelector('.answer')!.textContent).toBe('123456' + '123456');
  });
  it('rawToString reste cohérent avec l’affichage', () => {
    expect(rawToString(pressKey(emptyRaw(), 'minus'))).toBe('-');
  });
});

describe('RawInputView hors saisie', () => {
  it('état faux : ni curseur ni case active', () => {
    const { container } = render(<RawInputView input={pressKey(emptyRaw(), 'frac')} state="faux" />);
    expect(container.querySelector('.answer__caret')).toBeNull();
    expect(container.querySelector('.is-active')).toBeNull();
  });
});
