import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { IconSprite } from '../src/ui/icons';
import { toSpeech } from '../src/listen/toSpeech';
import { speakable, speak, stopSpeaking } from '../src/listen/speak';
import { ListenButton } from '../src/components/ListenButton';

function fakeSpeech() {
  const synth = {
    speaking: false,
    speak: vi.fn((u: any) => {
      synth.speaking = true;
      synth.last = u;
    }),
    cancel: vi.fn(() => {
      synth.speaking = false;
    }),
    getVoices: () => [{ lang: 'en-US' }, { lang: 'fr-FR', name: 'fr' }],
    last: null as any,
  };
  (window as any).speechSynthesis = synth;
  (window as any).SpeechSynthesisUtterance = function (this: any, t: string) {
    this.text = t;
  };
  return synth;
}

beforeEach(() => {
  fakeSpeech();
});
afterEach(() => {
  cleanup();
  delete (window as any).speechSynthesis;
  delete (window as any).SpeechSynthesisUtterance;
});

describe('toSpeech', () => {
  it('lit les calculs en clair', () => {
    expect(toSpeech('−3 + (−5) = ?')).toBe('moins trois plus ouvre la parenthèse moins cinq ferme la parenthèse égale?');
    expect(toSpeech('12 × 40')).toBe('douze fois 40');
    expect(toSpeech('8 ÷ 2 ▢ ✓ ✗')).toBe('huit divisé par deux case vide juste faux');
    expect(toSpeech('Bien , non !')).toBe('Bien, non!');
  });
});

describe('speakable', () => {
  it('ignore data-speak-skip, boutons et lit un trou ouvert', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<h2>Titre</h2><p>Phrase 3 + 2.</p><span data-speak-skip>Relire le début</span><button>Suite</button><p>Un <span data-speak-open>[ ? ]</span> ici</p>';
    const t = speakable(root);
    expect(t).not.toContain('Relire');
    expect(t).not.toContain('Suite');
    expect(t).toContain('un mot à trouver');
    expect(t).toContain('Titre');
    expect(t).toContain('trois plus deux');
  });
});

describe('speak', () => {
  it('utilise fr-FR et une voix française', () => {
    const s = (window as any).speechSynthesis;
    speak('bonjour');
    expect(s.last.lang).toBe('fr-FR');
    expect(s.last.voice.lang).toBe('fr-FR');
  });
  it('échoue en silence', () => {
    (window as any).speechSynthesis.speak = () => {
      throw new Error('boom');
    };
    expect(() => speak('x')).not.toThrow();
    delete (window as any).speechSynthesis;
    expect(() => speak('x')).not.toThrow();
    expect(() => stopSpeaking()).not.toThrow();
  });
});

function setup() {
  const ref = createRef<HTMLElement>();
  const utils = render(
    <>
      <IconSprite />
      <main ref={ref}>
        <h2>Titre</h2>
        <ListenButton rootRef={ref} />
      </main>
    </>,
  );
  return { ...utils, btn: screen.getByRole('button', { name: 'Écouter cet écran à voix haute' }) };
}

describe('ListenButton', () => {
  it('un clic lit, le 2e arrête, le démontage coupe', () => {
    const s = (window as any).speechSynthesis;
    const { btn, unmount } = setup();
    fireEvent.click(btn);
    expect(s.speak).toHaveBeenCalledTimes(1);
    expect(s.last.lang).toBe('fr-FR');
    expect(btn.className).toContain('is-on');
    fireEvent.click(btn);
    expect(s.cancel).toHaveBeenCalled();
    expect(btn.className).not.toContain('is-on');
    s.cancel.mockClear();
    unmount();
    expect(s.cancel).toHaveBeenCalled();
  });
  it('ne lève rien sans speechSynthesis', () => {
    delete (window as any).speechSynthesis;
    const { btn, unmount } = setup();
    expect(() => fireEvent.click(btn)).not.toThrow();
    expect(() => unmount()).not.toThrow();
  });
});
