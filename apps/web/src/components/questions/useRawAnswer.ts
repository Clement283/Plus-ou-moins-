import { useState } from 'react';
import { canSubmit, checkAnswer, emptyRaw, pressKey, type Answer, type CourseDef, type Key, type Outcome, type Question, type RawInput } from '@pom/engine';
import type { RawInputState } from '../RawInputView';

/**
 * Saisie manuelle d'une réponse écrite (saisie et trou). « Simplifie » (`unfinished`) laisse la saisie modifiable :
 * la marque juste/faux ne se pose que sur une réponse jugée.
 */
export function useRawAnswer(course: CourseDef, q: Question, locked: boolean, onAnswer: (a: Answer, o: Outcome) => void) {
  const [input, setInput] = useState<RawInput>(emptyRaw);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const press = (k: Key) => !locked && setInput((i) => pressKey(i, k));
  const submit = () => {
    if (locked || !canSubmit(input)) return;
    const a: Answer = { raw: input };
    const o = checkAnswer(course, q, a);
    setOutcome(o.unfinished ? null : o);
    onAnswer(a, o);
  };
  const state: RawInputState = locked && outcome ? (outcome.correct ? 'juste' : 'faux') : 'neutre';
  return { input, press, submit, can: canSubmit(input), state };
}
