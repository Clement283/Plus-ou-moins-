import { useState } from 'react';
import { checkAnswer, type Outcome } from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { ExprKeypad } from '../ExprKeypad';
import { writingLatex } from './calc';
import { Prompt, QFrame, Resolution, type QProps } from './Frame';

/** Ce qu'elle a tapé, lisible : des espaces autour des opérateurs (« 6 × (−2) »), le « − » d'un nombre collé à lui. */
export function prettyCalc(typed: string): string {
  return typed
    .replace(/([+×÷])/g, ' $1 ')
    .replace(/([\d)])−/g, '$1 − ')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .trim();
}

/**
 * « Réécris » (doc 06) : le calcul mal écrit est donné, elle le réécrit en entier avec le clavier complet, en bas. Rien n'est
 * dit pendant la saisie ; après « Valider », le retour (message précis puis « Étape par étape ») vient de l'écran appelant.
 */
export function Reecrire({ q, course, locked, onAnswer, header, footer, texts }: QProps<'reecrire'>) {
  const [typed, setTyped] = useState('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const press = (k: string) => !locked && setTyped((t) => t + k);
  const del = () => !locked && setTyped((t) => t.slice(0, -1));
  const submit = () => {
    if (locked || typed === '') return;
    const a = { text: typed };
    const o = checkAnswer(course, q, a);
    setOutcome(o);
    onAnswer(a, o);
  };
  const state = locked && outcome ? (outcome.correct ? ' answer--success' : ' answer--error') : '';
  return (
    <QFrame header={header} footer={footer} locked={locked} foot={<ExprKeypad onKey={press} onDelete={del} onSubmit={submit} canSubmit={typed !== ''} />}>
      <Prompt texts={texts} fallback="Ce calcul est mal écrit. Réécris-le correctement." cls="q-ask q-ask--lesson" />
      <div className="q-calc q-calc--md" data-copie>
        <p className="t-math-xl">
          <MathView latex={writingLatex(q.givenLatex)} />
        </p>
      </div>
      <Resolution texts={texts} />
      <p className="t-body2">Écris le calcul en entier, avec les touches du clavier.</p>
      <div className={`answer answer--text${state}`} aria-live="polite" aria-label="Ta réponse">
        <span>{prettyCalc(typed)}</span>
        {!locked && <span className="answer__caret" />}
      </div>
    </QFrame>
  );
}
