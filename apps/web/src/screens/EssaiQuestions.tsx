import { useMemo, useState } from 'react';
import { buildQuestion, getCourse, num, op, rat, seededRng, type CourseDef, type Exercise, type Outcome, type Question } from '@pom/engine';
import { QuestionView } from '../components/questions/QuestionView';
import { AppBar } from '../ui/AppBar';
import { Icon } from '../ui/Icon';
import type { StepResult } from '../ui/Stepper';
import { useRoute } from '../router';

/**
 * Page d'essai des 8 types d'exercices (`#/essai/questions?type=<type>`, développement seulement) : mêmes exemples
 * et même cadre que la maquette « Les 8 types d'exercices » et « Trois états corrigés ». Les textes d'explication du
 * bas de page (état corrigé) sont ceux de la maquette, posés ici seulement pour la comparaison : l'écran
 * d'activité (tâches 22 et 23) les remplace par le vrai retour.
 */

const course = (id: string): CourseDef => getCourse(id);
const ex = (a: number, b: number, answer: number, courseId = 'c05-multiplier-deux'): Exercise => ({
  courseId,
  level: 1,
  expr: op('*', num(a), num(b)),
  answer: rat(answer),
});

interface Frame {
  course: CourseDef;
  question: Question;
  chip: string;
  step: { total: number; done: StepResult[] };
  /** Texte du retour en bas de la maquette « corrigé » (comparaison seulement). */
  alert?: { title: string; text: string };
}

const m = (n: number, c: number) => ({ total: n, done: Array.from({ length: c }, (): StepResult => 'ok') });

/** Un calcul d'écriture du cours 0 dont une écriture est fausse (graine fixe : captures stables). */
function writing(kind: 'erreur' | 'qcm'): Question {
  const c00 = course('c00-bien-ecrire');
  for (let seed = 1; seed < 200; seed++) {
    const q = buildQuestion(c00, kind, { rng: seededRng(seed), level: 2, timesSeen: 0 });
    if (kind === 'qcm' || (q.kind === 'erreur' && q.wrongLine !== null)) return q;
  }
  throw new Error('aucun exemple');
}

function frames(): Record<string, Frame> {
  const c05 = course('c05-multiplier-deux');
  const sign = (a: number, b: number): Question => ({
    kind: 'qcm',
    ex: ex(a, b, a * b),
    choices: [{ value: rat(1), latex: '+', errorType: a * b > 0 ? null : 'regle-signes' }, { value: rat(-1), latex: '-', errorType: a * b > 0 ? 'regle-signes' : null }],
    correctIndex: a * b > 0 ? 0 : 1,
    formula: 'debut',
  });
  return {
    saisie: { course: c05, chip: 'Cours 3, exercice 2 sur 5', step: m(5, 1), question: { kind: 'saisie', ex: ex(-3, -4, 12), promptLatex: '-3 \\times (-4)' } },
    trou: { course: course('c02-additionner-signes-contraires'), chip: 'Cours 2, exercice 3 sur 5', step: m(5, 2), question: { kind: 'trou', ex: ex(-3, 0, 8), promptLatex: '-3 + \\square = 5', hidden: rat(8) } },
    ordre: {
      course: c05,
      chip: 'Cours 3, leçon',
      step: m(5, 0),
      question: {
        kind: 'ordre',
        ex: ex(-3, -4, 12),
        tiles: [
          { id: 'a', latex: '= 12' },
          { id: 'b', latex: '= +(3 \\times 4)' },
          { id: 'c', latex: '= -12' },
          { id: 'd', latex: '-3 \\times (-4)' },
        ],
        solution: ['d', 'b', 'a'],
        trapTile: { latex: '= -12', errorType: 'regle-signes' },
      },
    },
    erreur: {
      course: c05,
      chip: 'Cours 3, entraînement',
      step: m(5, 3),
      question: { kind: 'erreur', ex: ex(-3, -4, 12), lines: ['-3 \\times (-4)', '= -(3 \\times 4)', '= -12'], wrongLine: 1, errorType: 'regle-signes' },
      alert: { title: 'La première erreur est à la ligne 2.', text: '− × − = +. Deux signes pareils donnent +, donc le résultat est 12.' },
    },
    paires: {
      course: c05,
      chip: 'Cours 5, entraînement',
      step: m(5, 2),
      question: {
        kind: 'paires',
        exs: [ex(-3, -4, 12), ex(6, -2, -12), ex(-5, -2, 10), ex(3, -3, -9)],
        left: ['-3 \\times (-4)', '6 \\times (-2)', '-5 \\times (-2)', '3 \\times (-3)'],
        right: [
          { latex: '-9', value: rat(-9) },
          { latex: '12', value: rat(12) },
          { latex: '10', value: rat(10) },
          { latex: '-12', value: rat(-12) },
        ],
      },
    },
    classer: {
      course: c05,
      chip: 'Cours 5, révision',
      step: m(5, 2),
      question: {
        kind: 'classer',
        exs: [ex(-2, 3, -6), ex(-4, -5, 20), ex(7, -1, -7), ex(2, 8, 16)],
        classes: [{ id: 'plus', label: 'Résultat +' }, { id: 'moins', label: 'Résultat −' }],
        expected: ['moins', 'plus', 'moins', 'plus'],
      },
      alert: { title: '7 × (−1) va dans Résultat −.', text: '+ × − = −. Deux signes différents donnent −.' },
    },
    qcm: {
      course: c05,
      chip: 'Cours 5, révision',
      step: m(3, 1),
      question: {
        kind: 'qcm',
        ex: ex(-3, -3, 9),
        choices: [
          { value: rat(-9), latex: '-9', errorType: 'regle-signes' },
          { value: rat(6), latex: '6', errorType: 'autre' },
          { value: rat(9), latex: '9', errorType: null },
          { value: rat(8), latex: '8', errorType: 'autre' },
        ],
        correctIndex: 2,
        formula: 'debut',
      },
      alert: { title: 'La bonne réponse est 9.', text: '− × − = + et + × − = −. Deux signes pareils donnent +, deux signes différents donnent −.' },
    },
    vraifaux: { course: c05, chip: 'Cours 5, révision', step: m(3, 2), question: { kind: 'vraifaux', ex: ex(-3, -4, 12), shown: rat(-12), isTrue: false, errorType: 'regle-signes' } },
    signe: { course: c05, chip: 'Cours 5, leçon', step: m(5, 1), question: sign(-5, -6) },
    ecriture: { course: course('c00-bien-ecrire'), chip: 'Cours 0, exercice 2 sur 5', step: m(5, 1), question: writing('erreur') },
    'qcm-ecriture': { course: course('c00-bien-ecrire'), chip: 'Cours 0, révision', step: m(3, 1), question: writing('qcm') },
  };
}

const typeOf = (what: string): string => new URLSearchParams(what.split('?')[1] ?? '').get('type') ?? 'saisie';

export default function EssaiQuestions() {
  const route = useRoute();
  const type = route.name === 'essai' ? typeOf(route.what) : 'saisie';
  const all = useMemo(frames, []);
  const f = all[type] ?? all.saisie!;
  // Un seul rendu par type : la clé remet la saisie à zéro quand on change de type.
  const [done, setDone] = useState<{ type: string; outcome: Outcome } | null>(null);
  const [run, setRun] = useState(0);
  const locked = done?.type === type;
  const footer = locked && (
    <>
      {!done.outcome.correct && f.alert && (
        <div className="alert alert--error" role="status">
          <Icon name="x-circle" />
          <div className="alert__title">{f.alert.title}</div>
          <p>{f.alert.text}</p>
        </div>
      )}
      <button className="btn btn--contained btn--block" type="button" onClick={() => { setDone(null); setRun((r) => r + 1); }}>
        Continuer
      </button>
    </>
  );
  return (
    <main className="app-body app-body--grow" data-screen="essai-questions" style={{ padding: 0, gap: 0 }}>
      <AppBar onClose={() => history.back()} stepper={{ ...f.step, current: f.step.done.length }} />
      <QuestionView
        key={`${type}-${run}`}
        question={f.question}
        course={f.course}
        locked={locked}
        onAnswer={(_a, outcome) => !outcome.unfinished && setDone({ type, outcome })}
        header={
          <div className="row">
            <span className="chip chip--module">{f.chip}</span>
          </div>
        }
        footer={footer}
      />
    </main>
  );
}
