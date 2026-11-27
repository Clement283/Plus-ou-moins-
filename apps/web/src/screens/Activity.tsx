import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  LESSON_REPEAT_NOTE, WRITING_TITLE, answer, createActivity, current, endEvent, explanationDone, feedbackFor, getCourse, isDone, skip, toLatex,
  type Activity, type ActivityItem, type ActivityKind, type ActivityState, type Answer, type CurrentStep, type Feedback, type NewEvent, type Outcome, type PartTexts, type Question, type Rng,
} from '@pom/engine';
import { AskClement } from '../components/AskClement';
import { ListenButton } from '../components/ListenButton';
import { Etapes } from '../components/Etapes';
import { AutresFacons } from '../components/Autres';
import { FeedbackPanel } from '../components/Feedback';
import { LessonPartScreen } from '../components/LessonPart';
import type { PreviousChoix } from '../components/questions/Frame';
import { WRITING_COURSE } from '../components/questions/calc';
import { QuestionView } from '../components/questions/QuestionView';
import { Bold } from '../components/Bold';
import { playSound } from '../sound';
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
  | { phase: 'feedback'; step: Extract<CurrentStep, { type: 'question' }>; feedback: Feedback; note: string | null; total: number; correct: boolean; outcome: Outcome }
  | { phase: 'skipped'; step: Extract<CurrentStep, { type: 'question' }>; total: number };

const exerciseOf = (q: Question) => ('ex' in q ? q.ex : q.exs[0]!);

export function ActivityScreen({ kind, items, chip, record, confirmQuit, onEnd, chipAction, rng, activityId }: ActivityScreenProps) {
  const [state, setState] = useState<ActivityState>(() => createActivity(kind, items, { activityId: activityId ?? crypto.randomUUID(), rng: rng ?? Math.random }));
  const [view, setView] = useState<View>(() => ({ phase: 'ask', step: current(state)!, notice: null }));
  const [results, setResults] = useState<StepResult[]>([]);
  const firsts = useRef<FirstAnswer[]>([]);
  /** Les petites questions répondues, par partie : l'une se résume en haut de l'écran de la suivante (`joinPrevious`). */
  const choixAnswers = useRef<Record<string, PreviousChoix>>({});
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
    const lessonQuestion = step.item.activity === 'lecon' || step.item.activity === 'exemple' || step.item.activity === 'decouverte';
    const feedback = feedbackFor(getCourse(step.item.courseId), step.question, a, o, { guess: step.item.activity === 'decouverte' });
    if (step.question.kind === 'choix' && 'choice' in a) choixAnswers.current[step.item.itemId] = { question: step.question, choice: a.choice, correct: o.correct };
    const before = results.length + state.queue.length;
    const r = answer(state, o, ms);
    save(r.event);
    if (!o.unfinished && step.role === 'original' && step.attempt === 1) firsts.current.push({ activity: step.item.activity, correct: o.correct });
    if (o.unfinished) {
      timer.reset();
      setView({ phase: 'ask', step, notice: feedback });
      return;
    }
    const failed = feedback.tone === 'faux';
    playSound(o.correct ? 'juste' : 'faux');
    // « Toucher la faute » : les cases ne sont pas des lignes, le titre du moteur (« ligne 3 ») ne convient pas
    const touch = step.question.kind === 'erreur' && step.question.accept !== undefined;
    const ownMessage = step.question.kind === 'choix' || step.question.kind === 'reecrire' || step.question.kind === 'resoudre' || step.question.kind === 'calculer' || step.question.kind === 'intervalle' || step.question.kind === 'tableau' || step.question.kind === 'solutions' || step.question.kind === 'ecrire'; // le message est la réponse : pas de préfixe
    const shownFeedback: Feedback =
      feedback.tone !== 'faux'
        ? feedback
        : touch
          ? { ...feedback, title: step.question.kind === 'erreur' && step.question.accept?.length === 0 ? 'Ce calcul était bien écrit.' : 'Pas tout à fait.' }
          : feedback.title !== WRITING_TITLE && !ownMessage
            ? { ...feedback, title: `${step.role === 'repetition' ? 'Pas encore.' : 'Pas tout à fait.'} ${feedback.title}` }
            : feedback;
    // leçon : une question ratée repasse avant les exercices de fin (sauf « pour découvrir » et les petites questions, qui ont leur propre règle)
    const note = !failed
      ? null
      : lessonQuestion
        ? step.item.activity === 'decouverte' || (step.question.kind === 'choix' && step.question.small === true)
          ? null
          : LESSON_REPEAT_NOTE
        : step.role === 'original'
          ? NOTE_FIRST
          : step.role === 'repetition'
            ? NOTE_AGAIN
            : null;
    setState(r.state);
    setResults((x) => [...x, o.correct || step.item.activity === 'decouverte' ? 'ok' : 'ko']); // « pour découvrir » ne compte jamais : pas de rouge
    setView({ phase: 'feedback', step, feedback: shownFeedback, note, total: before, correct: o.correct, outcome: o });
  };

  const onSkip = () => {
    if (view.phase !== 'ask' || view.step.type !== 'question') return;
    if (!once()) return;
    const before = results.length + state.queue.length;
    const r = skip(state, timer.read());
    save(r.event);
    if (view.step.role === 'original' && view.step.attempt === 1) firsts.current.push({ activity: view.step.item.activity, correct: false });
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
  const bodyRef = useRef<HTMLElement | null>(null);
  const lessonScreen =
    view.step.type === 'explication' || ['lecon', 'exemple', 'decouverte'].includes(view.step.item.activity);
  const frame = (body: ReactNode) => (
    <main ref={bodyRef} className="app-body app-body--grow" data-screen="activite" style={{ padding: 0, gap: 0 }}>
      {bar}
      {lessonScreen && <ListenButton rootRef={bodyRef} />}
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
              <MathView latex={typeof ex.meta?.latex === 'string' ? ex.meta.latex : toLatex(ex.expr)} />
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
    if (step.item.steps) {
      return frame(
        <Etapes
          key={shown}
          title={step.item.texts?.title ?? course.title}
          steps={step.item.steps}
          keep={course.unePhrase ? 1 : 2}
          header={<span className="chip chip--module">{chip(step, pos)}</span>}
          onDone={onLessonNext}
        />,
      );
    }
    if (step.item.autres) {
      return frame(
        <AutresFacons key={shown} screen={step.item.autres} header={<span className="chip chip--module">{chip(step, pos)}</span>} onDone={onLessonNext} />,
      );
    }
    return frame(
      <LessonPartScreen
        key={shown}
        part={{ type: 'explication', blocks: step.item.blocks, ...(step.item.texts?.title ? { title: step.item.texts.title } : {}), ...(step.item.texts?.subtitle ? { subtitle: step.item.texts.subtitle } : {}) }}
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
        <FeedbackPanel feedback={view.feedback} colorSigns={course.id !== WRITING_COURSE} />
        {record && !view.correct && view.feedback.tone === 'faux' && (
          <AskClement courseId={course.id} question={step.question} outcome={view.outcome} correction={view.feedback.message} />
        )}
        {view.note && <p className="t-caption">{view.note}</p>}
        {step.item.texts?.series && step.item.texts.series.n === step.item.texts.series.of && step.role === 'original' && (
          <div className="alert alert--info series-summary" role="status">
            <Icon name="info" />
            <div className="alert__title">
              {results.slice(-step.item.texts.series.of).filter((r) => r === 'ok').length} sur {step.item.texts.series.of}
            </div>
            {step.item.texts.series.outro && <div>{step.item.texts.series.outro}</div>}
          </div>
        )}
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
        texts={textsOf(step)}
        activity={step.item.activity}
        previous={previousOf(step, choixAnswers.current)}
        header={chips(step, subChip(step))}
        footer={footer}
        notice={view.phase === 'ask' && view.notice ? <FeedbackPanel feedback={view.notice} colorSigns={course.id !== WRITING_COURSE} /> : undefined}
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

/**
 * Titre, sous-titre et consigne de l'écran de leçon (doc 09). Le titre parle du calcul de la leçon : sur le « même
 * type » posé après une erreur (autre calcul), seule la consigne reste.
 */
function textsOf(step: Extract<CurrentStep, { type: 'question' }>): PartTexts | undefined {
  const t = step.item.texts;
  if (!t || step.role !== 'meme-type') return t;
  return t.consigne === undefined ? undefined : { consigne: t.consigne };
}

/** La petite question d'avant, si l'écran la partage (`joinPrevious`) et qu'elle a été répondue (partie juste avant). */
function previousOf(step: Extract<CurrentStep, { type: 'question' }>, answered: Record<string, PreviousChoix>): PreviousChoix | undefined {
  if (step.item.texts?.joinPrevious !== true || step.role === 'meme-type') return undefined;
  const n = Number(step.item.itemId.split('-')[1]);
  return answered[`partie-${n - 1}`];
}
