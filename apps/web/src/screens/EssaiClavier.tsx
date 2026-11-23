import { useState } from 'react';
import { canSubmit, emptyRaw, pressKey, type Key, type RawInput } from '@pom/engine';
import { Keypad } from '../components/Keypad';
import { RawInputView } from '../components/RawInputView';
import { AppBar } from '../ui/AppBar';

/** Page d'essai du clavier maths (`#/essai/clavier`, développement seulement) : même cadre que la maquette. */
export default function EssaiClavier() {
  const [input, setInput] = useState<RawInput>(emptyRaw());
  const [sent, setSent] = useState(false);
  return (
    <main className="app-body app-body--grow" data-screen="essai-clavier" style={{ padding: 0, gap: 0 }}>
      <AppBar onClose={() => history.back()} stepper={{ total: 5, done: [], current: 0 }} />
      <div className="q-body">
        <div className="row">
          <span className="chip chip--module">Cours 2, exercice 1 sur 5</span>
        </div>
        <div className="q-expr">
          <p className="t-body2">Calcule.</p>
          <p className="t-math-xl">−3 + (−5)</p>
        </div>
        <RawInputView input={input} state={sent ? 'faux' : 'neutre'} />
      </div>
      <Keypad onKey={(k: Key) => { setSent(false); setInput((i) => pressKey(i, k)); }} onSubmit={() => setSent(true)} canSubmit={canSubmit(input)} />
    </main>
  );
}
