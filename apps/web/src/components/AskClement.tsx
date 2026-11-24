import { useState } from 'react';
import { QUESTION_LIMITS, latexToText, promptOf, type Outcome, type Question } from '@pom/engine';
import { askClement, useMyQuestions } from '../store/questions';
import { Sheet } from '../ui/Sheet';

export interface AskClementProps {
  courseId: string;
  question: Question;
  outcome: Outcome;
  /** Texte de la correction affichée à l'élève. */
  correction: string;
}

const cut = (s: string, max: number) => (s.length > max ? s.slice(0, max) : s);

/** « Demander à Clément » sous un retour d'erreur : bouton discret, feuille avec le résumé et un petit mot facultatif. */
export function AskClement({ courseId, question, outcome, correction }: AskClementProps) {
  const mine = useMyQuestions();
  const name = mine.find((q) => q.answer !== null && q.answeredBy)?.answeredBy ?? 'Clément';
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const calc = latexToText(promptOf(question));
  const tooLong = note.length > QUESTION_LIMITS.note;

  async function send() {
    if (busy || tooLong) return;
    setBusy(true);
    setFailed(false);
    try {
      await askClement({
        courseId,
        calc: cut(calc, QUESTION_LIMITS.calc),
        given: cut(outcome.given, QUESTION_LIMITS.given),
        expected: cut(outcome.expected, QUESTION_LIMITS.expected),
        correction: cut(correction, QUESTION_LIMITS.correction),
        note: note.trim() === '' ? null : note.trim(),
      });
      setSent(true);
    } catch {
      setFailed(true);
    }
    setBusy(false);
  }

  return (
    <div className="ask">
      {sent ? (
        <>
          <button className="btn btn--text ask__btn" type="button" disabled>
            Envoyé
          </button>
          <p className="t-caption" role="status">{`Envoyé. ${name} te répondra ici.`}</p>
        </>
      ) : (
        <button className="btn btn--text ask__btn" type="button" onClick={() => setOpen(true)}>
          {`Demander à ${name}`}
        </button>
      )}
      <Sheet open={open && !sent} onClose={() => setOpen(false)} label={`Demander à ${name}`}>
        <h2 className="t-h4">{`Demander à ${name}`}</h2>
        <p className="t-body2">On lui envoie ce calcul, ta réponse et la correction.</p>
        <dl className="ask__sum">
          <div><dt>Le calcul</dt><dd className="math">{calc}</dd></div>
          <div><dt>Ta réponse</dt><dd className="math">{outcome.given}</dd></div>
          <div><dt>La bonne réponse</dt><dd className="math">{outcome.expected}</dd></div>
        </dl>
        <p className="t-body2">{correction}</p>
        <label className="t-body2" htmlFor="ask-note">Un petit mot (facultatif)</label>
        <textarea id="ask-note" className="ask__note" rows={3} value={note} placeholder="Je ne comprends pas pourquoi…" onChange={(e) => setNote(e.target.value)} />
        {tooLong && <p className="t-caption" role="alert">{`Ton mot est trop long (${QUESTION_LIMITS.note} caractères au plus).`}</p>}
        {failed && <p className="t-caption" role="alert">Ça n'est pas parti. Réessaie.</p>}
        <button className="btn btn--contained btn--block" type="button" disabled={tooLong || busy} onClick={send}>
          {`Envoyer à ${name}`}
        </button>
        <button className="btn btn--text" type="button" onClick={() => setOpen(false)}>Annuler</button>
        <p className="t-caption">Pas de réseau ? La question part dès que le réseau revient.</p>
      </Sheet>
    </div>
  );
}
