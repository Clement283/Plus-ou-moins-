import { useEffect, useRef, useState, type RefObject } from 'react';
import { Icon } from '../ui/Icon';
import { speak, speakable, stopSpeaking } from '../listen/speak';

/** Bouton « Écouter » : lit l'écran à voix haute (titre, phrase affichée, consigne). */
export function ListenButton({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  const [on, setOn] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopSpeaking();
    };
  }, []);

  const toggle = () => {
    if (on) {
      stopSpeaking();
      setOn(false);
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    try {
      const text = speakable(root);
      if (!text) return;
      setOn(true);
      speak(text, () => mounted.current && setOn(false));
    } catch {
      setOn(false);
    }
  };

  return (
    <button
      type="button"
      className={on ? 'listen-btn is-on' : 'listen-btn'}
      aria-label="Écouter cet écran à voix haute"
      title="Écouter"
      onClick={toggle}
    >
      <Icon name="volume" />
    </button>
  );
}
