import { useEffect, useState } from 'react';
import { reviewSummary, studentHome, type ReviewLine, type SessionSize } from '@pom/engine';
import { go } from '../router';
import { useProgress, useToday } from '../store/progress';
import { useEvents } from '../store/sync';
import { AppBar } from '../ui/AppBar';
import { Icon } from '../ui/Icon';
import { ReviewCard } from './Home';
import type { FirstAnswer } from './Activity';

/**
 * Bilan de la séance de révisions (maquette revisions.html, groupe 3 ; docs 01 §6, 02 §3 et §5, 08 n° 10) :
 * le total des premières réponses justes, le temps du jour, une ligne par cours, puis « Encore des révisions »
 * ou la carte « Révisions faites ». Les chiffres viennent de `reviewSummary` et de `studentHome` (moteur).
 */
const GOAL = 15;
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export interface BilanSummary {
  lines: ReviewLine[];
  firstOk: number;
  firstTotal: number;
}

export interface ReviewSummaryViewProps {
  summary: BilanSummary;
  /** Minutes faites aujourd'hui, séance comprise. */
  minutes: number;
  /** Ce qui reste dû après la séance ; null = plus rien. */
  remaining: SessionSize | null;
  onMore: () => void;
  onHome: () => void;
  onTrain: () => void;
}

export function ReviewSummaryView({ summary, minutes, remaining, onMore, onHome, onTrain }: ReviewSummaryViewProps) {
  const reached = minutes >= GOAL;
  const pct = Math.min(100, Math.round((minutes / GOAL) * 100));
  return (
    <main className="app-body app-body--grow scope-revisions" data-screen="bilan" style={{ padding: 0, gap: 0 }}>
      <AppBar onClose={onHome} closeLabel="Fermer" title="Bilan de la séance" />
      <div className="result">
        <div className="bilan-head">
          <span className="bilan-badge">
            <Icon name="check-circle" />
          </span>
          <h1 className="t-h3">Séance terminée</h1>
          <p className="t-body1">{`${summary.firstOk} sur ${summary.firstTotal} justes du premier coup.`}</p>
        </div>
        <div className="bilan-day">
          <div className="row">
            <span className="t-h6">Aujourd'hui</span>
            <span className="t-body2 math">{`${minutes} / ${GOAL} min`}</span>
          </div>
          <div className="progress" style={{ '--v': `${pct}%` } as React.CSSProperties}>
            <i className={reached ? 'is-goal' : undefined} />
          </div>
          {reached && <p className="t-body2 is-goal">Objectif atteint !</p>}
        </div>
        {summary.lines.length > 0 && (
          <div className="list">
            {summary.lines.map((l) => {
              const ok = l.ok === l.total;
              return (
                <div key={l.courseId} className="list-item">
                  <span className={ok ? 'course-num' : 'course-num is-retry'} aria-hidden="true">
                    {l.order}
                  </span>
                  <div className="list-item__text">
                    <div className="list-item__title">{l.shortTitle}</div>
                    <div className="list-item__sub">{`${l.ok} sur ${l.total}, ${l.label}`}</div>
                  </div>
                  <span className="list-item__trail">
                    <span className={ok ? 'is-ok' : 'is-ko'} role="img" aria-label={ok ? 'Réussi' : 'À revoir'}>
                      <Icon name={ok ? 'check-circle' : 'x-circle'} />
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {!remaining && <ReviewCard reviews={null} started onTrain={onTrain} />}
      </div>
      <div className="foot">
        {remaining && (
          <>
            <p className="t-caption">{`${plural(remaining.courses, 'cours dû', 'cours dus')}, ${plural(remaining.questions, 'question', 'questions')}, environ ${plural(remaining.minutes, 'minute', 'minutes')}.`}</p>
            <button className="btn btn--contained btn--block" type="button" onClick={onMore}>
              Encore des révisions
            </button>
          </>
        )}
        <button className="btn btn--text" type="button" onClick={onHome}>
          Revenir à l'accueil
        </button>
      </div>
    </main>
  );
}

/** Délai (ms) après lequel on montre l'en-tête calculé en mémoire si le repli des événements n'a pas suivi. */
export const FOLD_WAIT_MS = 3000;

/**
 * Attend que le repli contienne les réponses de la séance, puis affiche le bilan (pas de flash).
 * Pendant l'attente la croix reste là ; passé 3 s, l'en-tête vient des premières réponses gardées en mémoire, sans ligne par cours.
 */
export function ReviewSummary({ activityId, firsts, onMore }: { activityId: string; firsts: FirstAnswer[]; onMore: () => void }) {
  const progress = useProgress();
  const events = useEvents();
  const today = useToday();
  const [late, setLate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLate(true), FOLD_WAIT_MS);
    return () => clearTimeout(t);
  }, []);
  const folded = reviewSummary(progress, activityId, today);
  const complete = folded.lines.length > 0 && folded.firstTotal >= firsts.length;
  if (!complete && !late) {
    return (
      <main className="app-body app-body--grow" data-screen="bilan" style={{ padding: 0, gap: 0 }}>
        <AppBar onClose={() => go('#/')} closeLabel="Fermer" />
      </main>
    );
  }
  const summary: BilanSummary = complete ? folded : { lines: [], firstOk: firsts.filter((f) => f.correct).length, firstTotal: firsts.length };
  const home = studentHome(progress, events, today);
  return (
    <ReviewSummaryView
      summary={summary}
      minutes={Math.floor(home.today.totalMs / 60_000)}
      remaining={home.reviews}
      onMore={onMore}
      onHome={() => go('#/')}
      onTrain={() => go('#/entrainement')}
    />
  );
}
