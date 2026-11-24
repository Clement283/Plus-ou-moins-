import { useEffect, useRef, useState } from 'react';
import {
  buildWarmup, feedbackFor, foldProgress, getCourse, warmupAnswerEvent, warmupDue, warmupSkipEvent,
  type Answer, type Feedback, type Outcome, type Rng, type Warmup as WarmupData,
} from '@pom/engine';
import { Bold } from '../components/Bold';
import { courseLabel } from '../components/CourseBits';
import { FeedbackPanel } from '../components/Feedback';
import { WRITING_COURSE } from '../components/questions/calc';
import { QuestionView } from '../components/questions/QuestionView';
import { go } from '../router';
import { useToday } from '../store/progress';
import { loadAll, recordEvent } from '../store/sync';
import { useStepTimer } from '../store/timer';
import { Icon } from '../ui/Icon';

/**
 * Échauffement du jour (`#/echauffement`, maquette `nouvelles-fonctions.html` n° 2, version A) : un écran dédié,
 * centré, avec une seule question sur un cours déjà validé. Compte dans le temps du jour, pas dans une note ;
 * une erreur remet le cours dans les révisions (moteur). « Passer » compte comme fait, mais pas dans le temps.
 */
type Phase = { name: 'ask' } | { name: 'done'; feedback: Feedback; correct: boolean };

export default function Warmup({ rng }: { rng?: Rng }) {
  const today = useToday();
  const [w, setW] = useState<WarmupData | null>(null);
  const [phase, setPhase] = useState<Phase>({ name: 'ask' });
  const timer = useStepTimer(w?.activityId ?? null);
  const handled = useRef(false);

  // À l'arrivée : l'état à jour ; rien à proposer (déjà fait aujourd'hui, aucun cours validé) → accueil.
  useEffect(() => {
    let alive = true;
    void loadAll().then((events) => {
      if (!alive) return;
      const state = foldProgress(events);
      const next = warmupDue(state, events, today) ? buildWarmup(state, today, rng ?? Math.random) : null;
      if (next) setW(next);
      else go('#/');
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!w) return <main className="app-body app-body--grow" data-screen="echauffement" aria-busy="true" />;
  const course = getCourse(w.courseId);
  const done = phase.name === 'done' ? phase : null;

  const onAnswer = (a: Answer, o: Outcome) => {
    if (handled.current) return;
    handled.current = true;
    void recordEvent(warmupAnswerEvent(w, o, timer.read())).catch(() => undefined);
    setPhase({ name: 'done', feedback: feedbackFor(course, w.question, a, o), correct: o.correct });
  };
  const skip = () => {
    if (handled.current) return;
    handled.current = true;
    void recordEvent(warmupSkipEvent(w)).catch(() => undefined);
    go('#/');
  };

  const ex = 'ex' in w.question ? w.question.ex : w.question.exs[0]!;
  const header = (
    <div className="warmup__head">
      <span className={`warmup__ico${done ? (done.correct ? ' is-ok' : ' is-ko') : ''}`} aria-hidden="true">
        <Icon name={done?.correct ? 'check-circle' : 'flame'} />
      </span>
      <h1 className="t-h2">{!done ? 'Un petit calcul avant de commencer' : done.correct ? 'Juste.' : 'Pas tout à fait.'}</h1>
      <span className="chip chip--module">{courseLabel(w.courseId)}</span>
    </div>
  );
  const footer = done ? (
    <>
      {done.correct ? (
        <p className="t-body1 warmup__why">
          <Bold text={course.generalExplanation(ex).rule} />
        </p>
      ) : (
        <FeedbackPanel feedback={done.feedback} colorSigns={course.id !== WRITING_COURSE} />
      )}
      {!done.correct && <p className="t-caption">Ce cours reviendra dans tes révisions.</p>}
      <button className="btn btn--contained btn--block" type="button" onClick={() => go('#/')}>
        Aller à l’accueil
      </button>
    </>
  ) : undefined;

  return (
    <main className="app-body app-body--grow warmup" data-screen="echauffement" style={{ padding: 0, gap: 0 }}>
      <QuestionView key={w.activityId} question={w.question} course={course} locked={!!done} onAnswer={onAnswer} header={header} footer={footer} />
      {!done && (
        <div className="foot">
          <p className="t-caption">1 question · environ 20 secondes</p>
          <button className="btn btn--text" type="button" onClick={skip}>
            Passer
          </button>
        </div>
      )}
    </main>
  );
}
