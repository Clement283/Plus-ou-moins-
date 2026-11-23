import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  WRITING_TITLE, answer, createActivity, current, endEvent, explanationDone, feedbackFor, getCourse, isDone, skip, toLatex,
  type Activity, type ActivityItem, type ActivityKind, type ActivityState, type Answer, type CurrentStep, type Feedback, type NewEvent, type Outcome, type Question, type Rng,
} from '@pom/engine';
import { FeedbackPanel } from '../components/Feedback';
import { LessonPartScreen } from '../components/LessonPart';
import { QuestionView } from '../components/questions/QuestionView';
import { Bold } from '../components/Bold';
import { recordEvent } from '../store/sync';
import { useStepTimer } from '../store/timer';
import { AppBar } from '../ui/AppBar';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { Math as MathView } from '../ui/Math';
import type { StepResult } from '../ui/Stepper';

/**
 * Le déroulé commun d'une activité (cours, rattrapage, relire, révisions, entraînement) : barre du haut avec
 * la progression, pastille de contexte, question puis retour et « Continuer » (docs 01 §6, 07 n° 12 à 14, 08 n° 7 à 9).
 * Les files, les ré-insertions après une erreur et les événements viennent du moteur (`activity.ts`).
 */

export const NOTE_FIRST = 'Un calcul du même genre reviendra plus loin, et celui-ci à la fin.';
export const NOTE_AGAIN = 'Ce calcul reviendra encore à la fin.';
const SUB_CHIP = { 'meme-type': 'Même genre que ton erreur', repetition: "Le calcul raté tout à l'heure" } as const;

/** Première réponse à un calcul de l'activité (celles qui comptent dans la note), gardée en mémoire. */
export interface FirstAnswer {
  activity: Activity;
  correct: boolean;
}

export interface ChipPosition {
  /** Rang de l'étape affichée (à partir de 1) et nombre d'étapes, rajoutées après une erreur comprises. */
  n: number;
  total: number;
}

export interface ActivityScreenProps {
  kind: ActivityKind;
  items: ActivityItem[];
  /** Texte de la pastille de contexte (« Cours 4, exercice 2 sur 5 »…). */
  chip: (step: CurrentStep, pos: ChipPosition) => string;
  /** false : relire une leçon, rien n'est enregistré (doc 08 n° 17). */
  record: boolean;
  /** Si présent, la croix demande confirmation avec ces textes. */
  confirmQuit?: { title: string; body: string };
  /** Fin de l'activité : `completed` est faux quand l'élève quitte avant la fin ; `results` : une valeur par étape faite. */
  onEnd: (state: ActivityState, completed: boolean, results: StepResult[], firsts: FirstAnswer[]) => void;
  /** Petit bouton à droite de la pastille (« Relire la leçon ») : ouvre autre chose, donc quitte l'activité (avec confirmation si `confirmQuit`). */
  chipAction?: { label: string; onSelect: () => void; confirm?: { title: string; body: string } };
  /** Tirage des calculs « du même genre » (défaut : Math.random) et identifiant de l'activité (défaut : UUID). */
  rng?: Rng;
  activityId?: string;
}

type View =
  | { phase: 'ask'; step: CurrentStep; notice: Feedback | null }
  | { phase: 'feedback'; step: Extract<CurrentStep, { type: 'question' }>; feedback: Feedback; note: string | null; total: number; correct: boolean }
  | { phase: 'skipped'; step: Extract<CurrentStep, { type: 'question' }>; total: number };

const exerciseOf = (q: Question) => ('ex' in q ? q.ex : q.exs[0]!);

export function ActivityScreen({ kind, items, chip, record, confirmQuit, onEnd, chipAction, rng, activityId }: ActivityScreenProps) {
  const [state, setState] = useState<ActivityState>(() => createActivity(kind, items, { activityId: activityId ?? crypto.randomUUID(), rng: rng ?? Math.random }));
  const [view, setView] = useState<View>(() => ({ phase: 'ask', step: current(state)!, notice: null }));
  const [results, setResults] = useState<StepResult[]>([]);
  const firsts = useRef<FirstAnswer[]>([]);
  const [shown, setShown] = useState(0); // une valeur par étape affichée : fait repartir le chronomètre
  const [asking, setAsking] = useState<'close' | 'action' | null>(null);
  const timer = useStepTimer(shown);
  /** Un seul traitement par étape affichée : un double toucher ne compte pas deux fois. */
  const handled = useRef(-1);
  const once = (): boolean => {
    if (handled.current === shown) return false;
    handled.current = shown;
    return true;
  };

  const save = useCallback(
    (e: NewEvent) => {
      if (record) void recordEvent(e).catch(() => undefined);
    },
    [record],
  );

  const show = (s: ActivityState) => {
    setState(s);
    setView({ phase: 'ask', step: current(s)!, notice: null });
    setShown((n) => n + 1);
  };
  /** Étape suivante, ou fin de l'activité. */
  const advance = (s: ActivityState, res: StepResult[] = results) => {
    if (isDone(s)) {
      save(endEvent(s));
      onEnd(s, true, res, firsts.current);
    } else show(s);
  };

  const onAnswer = (a: Answer, o: Outcome) => {
    if (view.phase !== 'ask' || view.step.type !== 'question') return;
    const step = view.step;
    if (!o.unfinished && !once()) return;
    const ms = timer.read();
    const feedback = feedbackFor(getCourse(step.item.courseId), step.question, a, o);
    const before = results.length + state.queue.length;
    if (step.role === 'original' && step.attempt === 1) firsts.current.push({ activity: step.item.activity, correct: o.correct });
    const r = answer(state, o, ms);
    save(r.event);
    if (o.unfinished) {
      timer.reset();
      setView({ phase: 'ask', step, notice: feedback });
      return;
    }
    const failed = feedback.tone === 'faux';
    const shownFeedback: Feedback =
      feedback.tone === 'faux' && feedback.title !== WRITING_TITLE ? { ...feedback, title: `${step.role === 'repetition' ? 'Pas encore.' : 'Pas tout à fait.'} ${feedback.title}` } : feedback;
    const note = !failed ? null : step.role === 'original' ? NOTE_FIRST : step.role === 'repetition' ? NOTE_AGAIN : null;
    setState(r.state);
    setResults((x) => [...x, o.correct ? 'ok' : 'ko']);
    setView({ phase: 'feedback', step, feedback: shownFeedback, note, total: before, correct: o.correct });
  };

  const onSkip = () => {
    if (view.phase !== 'ask' || view.step.type !== 'question') return;
    if (!once()) return;
    const before = results.length + state.queue.length;
    const r = skip(state, timer.read());
    save(r.event);
    setState(r.state);
    setResults((x) => [...x, 'ko']);
    setView({ phase: 'skipped', step: view.step, total: before });
  };

  const onLessonNext = () => {
    if (!once()) return;
    const r = explanationDone(state, timer.read());
    save(r.event);
    setResults((x) => [...x, 'ok']);
    advance(r.state, [...results, 'ok']);
  };

  const quit = (after?: () => void) => {
    save({ ...endEvent(state), completed: false });
    if (after) after();
    else onEnd(state, false, results, firsts.current);
  };

  // --- barre du haut ---
  const answered = view.phase !== 'ask';
  const total = view.phase === 'ask' ? results.length + state.queue.length : view.total;
  const label = view.phase === 'ask' ? undefined : `Question ${results.length} sur ${total}, ${view.phase === 'skipped' ? 'passée' : view.correct ? 'juste' : 'ratée'}`;
  const bar = (
    <AppBar
      onClose={() => (confirmQuit ? setAsking('close') : quit())}
      stepper={{ total, done: results, current: answered ? -1 : results.length, ...(label ? { label } : {}) }}
    />
  );
  const sure = asking === 'action' ? (chipAction?.confirm ?? confirmQuit) : confirmQuit;
  const dialog = asking && sure && (
    <Dialog
      title={sure.title}
      actions={
        <>
          <button className="btn btn--contained btn--block" type="button" onClick={() => setAsking(null)}>
            Continuer
          </button>
          <button className="btn btn--text" type="button" onClick={() => quit(asking === 'action' ? chipAction?.onSelect : undefined)}>
            Quitter
          </button>
        </>
      }
    >
      <p className="t-body1">{sure.body}</p>
    </Dialog>
  );

  const pos: ChipPosition = { n: Math.min(results.length + (answered ? 0 : 1), total), total };
  const frame = (body: ReactNode) => (
    <main className="app-body app-body--grow" data-screen="activite" style={{ padding: 0, gap: 0 }}>
      {bar}
      {body}
      {dialog}
    </main>
  );
  const chips = (step: Extract<CurrentStep, { type: 'question' }>, extra?: string) => (
    <div className={chipAction ? 'chips chips--split' : 'chips'}>
      <span className={kind === 'revision' ? 'chip' : 'chip chip--module'}>
        {kind === 'revision' && <Icon name="review" size="sm" />}
        {chip(step, pos)}
      </span>
      {extra && <span className="chip chip--neutral">{extra}</span>}
      {chipAction && (
        <button className="btn btn--text btn--sm chip-action" type="button" onClick={() => (confirmQuit ? setAsking('action') : quit(chipAction.onSelect))}>
          <Icon name="book" size="sm" />
          {chipAction.label}
        </button>
      )}
    </div>
  );
  const subChip = (step: Extract<CurrentStep, { type: 'question' }>) => (kind === 'revision' && step.role !== 'original' ? SUB_CHIP[step.role] : undefined);

  // --- corps ---
  if (view.phase === 'skipped') {
    const { step } = view;
    const ex = exerciseOf(step.question);
    const expl = getCourse(step.item.courseId).generalExplanation(ex);
    const lines = expl.steps.filter((b) => b.t === 'math');
    return frame(
      <>
        <div className="q-body is-scroll">
          {chips(step, 'Calcul passé')}
          <div className="q-expr" data-copie>
            <h2 className="t-h5">On le fait ensemble</h2>
            <p className="t-math">
              <MathView latex={toLatex(ex.expr)} />
            </p>
          </div>
          <p className="t-body1">
            <Bold text={expl.rule} />
          </p>
          <ol className="walk">
            {lines.map((b, i) => (
              <li key={i}>
                <span className="walk__n">{i + 1}</span>
                <div>
                  <span className="walk__m">{b.t === 'math' && <MathView latex={b.latex} colorize={b.colorize} />}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="foot">
          <p className="t-caption">Ce calcul est compté comme raté.</p>
          <button className="btn btn--contained btn--block" type="button" onClick={() => advance(state)}>
            Continuer
          </button>
        </div>
      </>,
    );
  }

  const { step } = view;
  if (step.type === 'explication') {
    const course = getCourse(step.item.courseId);
    return frame(
      <LessonPartScreen
        key={shown}
        part={{ type: 'explication', blocks: step.item.blocks }}
        title={course.title}
        header={<span className="chip chip--module">{chip(step, pos)}</span>}
        onNext={onLessonNext}
      />,
    );
  }

  const course = getCourse(step.item.courseId);
  const footer =
    view.phase === 'feedback' ? (
      <>
        <FeedbackPanel feedback={view.feedback} />
        {view.note && <p className="t-caption">{view.note}</p>}
        <button className="btn btn--contained btn--block" type="button" onClick={() => advance(state)}>
          Continuer
        </button>
      </>
    ) : undefined;
  return frame(
    <>
      <QuestionView
        key={shown}
        question={step.question}
        course={course}
        locked={view.phase === 'feedback'}
        onAnswer={onAnswer}
        header={chips(step, subChip(step))}
        footer={footer}
        notice={view.phase === 'ask' && view.notice ? <FeedbackPanel feedback={view.notice} /> : undefined}
      />
      {view.phase === 'ask' && step.canSkip && (
        <div className="foot">
          <button className="btn btn--text" type="button" onClick={onSkip}>
            Passer
          </button>
        </div>
      )}
    </>,
  );
}
