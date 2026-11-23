import { useMemo, useState } from 'react';
import {
  feedbackFor, getCourse, num, op, rat,
  type Answer, type CourseDef, type Exercise, type Feedback, type Outcome, type Question,
} from '@pom/engine';
import { FeedbackPanel } from '../components/Feedback';
import { QuestionView } from '../components/questions/QuestionView';
import { AppBar } from '../ui/AppBar';
import type { StepResult } from '../ui/Stepper';
import { useRoute } from '../router';

/**
 * Pages d'essai (développement et captures seulement) du retour après une réponse et des parties de leçon :
 *   #/essai/retour?case=qcm|erreur|classer|fraction|tons
 *   #/essai/lecon?course=c04&part=0
 * Les compositions reprennent les états corrigés de la maquette `exercices.html` ; l'écran d'activité (tâche 23)
 * les remplace par le vrai déroulé.
 */

const query = (what: string): URLSearchParams => new URLSearchParams(what.split('?')[1] ?? '');
const courseOf = (prefix: string): CourseDef => {
  const ids = ['c00-bien-ecrire', 'c01-additionner-meme-signe', 'c02-additionner-signes-contraires', 'c03-additionner-plusieurs', 'c04-soustraire', 'c05-multiplier-deux', 'c06-diviser-deux', 'c07-multiplier-plusieurs'];
  return getCourse(ids.find((i) => i.startsWith(prefix)) ?? ids[0]!);
};
const ex = (a: number, b: number, answer: number, courseId = 'c05-multiplier-deux', o: '*' | '/' = '*'): Exercise => ({ courseId, level: 1, expr: op(o, num(a), num(b)), answer: rat(answer) });
const m = (n: number, c: number) => ({ total: n, done: Array.from({ length: c }, (): StepResult => 'ok') });

interface Case {
  course: CourseDef;
  question: Question;
  chip: string;
  step: { total: number; done: StepResult[] };
  /** Retour écrit à la main (rend un cas que le moteur ne produit pas tel quel) ; sinon `feedbackFor`. */
  forced?: Feedback;
  note?: string;
}

function cases(): Record<string, Case> {
  const c05 = courseOf('c05');
  return {
    qcm: {
      course: c05,
      chip: 'Cours 5, révision',
      step: m(3, 1),
      note: 'Un calcul du même genre reviendra plus loin, et celui-ci à la fin.',
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
    },
    erreur: {
      course: c05,
      chip: 'Cours 3, entraînement',
      step: m(5, 3),
      question: { kind: 'erreur', ex: ex(-3, -4, 12), lines: ['-3 \\times (-4)', '= -(3 \\times 4)', '= -12'], wrongLine: 1, errorType: 'regle-signes' },
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
    },
    // Fraction empilée dans l'explication : retour écrit à la main (les cours actuels n'en produisent pas).
    fraction: {
      course: courseOf('c06'),
      chip: 'Cours 6, exercice 2 sur 5',
      step: m(5, 1),
      question: { kind: 'saisie', ex: ex(-12, 4, -3, 'c06-diviser-deux', '/'), promptLatex: '\\frac{-12}{4} = \\square' },
      forced: {
        tone: 'faux',
        title: 'La bonne réponse est −3.',
        message: 'Je divise les nombres sans leur signe, puis je mets le signe.',
        rightLatex: '-3',
        explanation: {
          rule: 'Je divise les nombres sans leur signe, puis je mets le signe.',
          steps: [
            { t: 'math', latex: '\\frac{-12}{4}', colorize: true },
            { t: 'math', latex: '= -\\frac{12}{4}', colorize: true },
            { t: 'math', latex: '= -3', colorize: true },
          ],
        },
        steps: [],
      },
    },
  };
}

const TONS: Feedback[] = [
  { tone: 'juste', title: 'Juste !', note: 'Juste ! On écrit simplement −7.' },
  { tone: 'juste', title: 'Juste !', note: null },
  { tone: 'pas-fini', title: "Le calcul n'est pas fini : simplifie.", message: 'Pas compté faux : corrige et valide encore.' },
  { tone: 'faux', title: 'Réponse mal écrite', message: "Le signe moins s'écrit avant le nombre : −8.", rightLatex: '-8', explanation: null, steps: [] },
];

export default function EssaiRetour() {
  const route = useRoute();
  const what = route.name === 'essai' ? route.what : '';
  const which = query(what).get('case') ?? 'qcm';
  const all = useMemo(cases, []);
  const [done, setDone] = useState<{ a: Answer; o: Outcome } | null>(null);

  if (which === 'tons') {
    return (
      <main className="app-body" data-screen="essai-retour">
        {TONS.map((f, i) => (
          <FeedbackPanel key={i} feedback={f} />
        ))}
        <FeedbackPanel feedback={TONS[3]!} note="Ce calcul reviendra encore à la fin." />
      </main>
    );
  }

  const c = all[which] ?? all.qcm!;
  const fb = done ? (c.forced ?? feedbackFor(c.course, c.question, done.a, done.o)) : null;
  const footer = fb && (
    <>
      <FeedbackPanel feedback={fb} note={c.note} />
      <button className="btn btn--contained btn--block" type="button">Continuer</button>
    </>
  );
  return (
    <main className="app-body app-body--grow" data-screen="essai-retour" style={{ padding: 0, gap: 0 }}>
      <AppBar onClose={() => history.back()} stepper={{ ...c.step, current: c.step.done.length }} />
      <QuestionView
        key={which}
        question={c.question}
        course={c.course}
        locked={done !== null}
        onAnswer={(a, o) => !o.unfinished && setDone({ a, o: c.forced ? { ...o, correct: false } : o })}
        header={
          <div className="row">
            <span className="chip chip--module">{c.chip}</span>
          </div>
        }
        footer={footer}
      />
    </main>
  );
}

