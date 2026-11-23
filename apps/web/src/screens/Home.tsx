import { useMemo } from 'react';
import { DAILY_GOAL_MS, getCourse, studentHome, type ProgressState, type SessionSize, type StudentHome } from '@pom/engine';
import { DayGauge } from '../components/DayGauge';
import { Stars, isTodo } from '../components/CourseBits';
import { go } from '../router';
import { useProgress, useReady, useSession, useToday } from '../store/progress';
import { useEvents } from '../store/sync';
import { BottomNav } from '../ui/BottomNav';
import { Icon } from '../ui/Icon';

/**
 * Accueil de l'élève (maquette `concept.html`, docs 02 §6 et 08 n° 19) : une pile calme, la jauge du jour,
 * la carte des révisions (la seule carte forte), le prochain cours, puis la progression du module.
 */

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

function dayText(minutes: number, goal: number): string {
  if (minutes >= goal) return minutes === goal ? 'Objectif atteint !' : `Objectif atteint ! ${plural(minutes - goal, 'minute', 'minutes')} en plus.`;
  if (minutes === 0) return `Objectif du jour : ${goal} minutes.`;
  return `Encore ${plural(goal - minutes, 'minute', 'minutes')} pour ton objectif.`;
}

export function ReviewCard({ reviews, started, onTrain = () => go('#/entrainement') }: { reviews: SessionSize | null; started: boolean; onTrain?: () => void }) {
  if (!reviews) {
    return (
      <div className="card card--done">
        <span className="card__eyebrow">
          <Icon name="check" size="sm" />
          Révisions faites
        </span>
        <h2 className="t-h4">Tout est révisé pour aujourd'hui</h2>
        <p className="card__meta">Pour continuer, entraîne-toi sur les cours de ton choix.</p>
        <button className="btn btn--outlined btn--block" type="button" onClick={onTrain}>
          S'entraîner
        </button>
      </div>
    );
  }
  const n = plural(reviews.courses, 'révision', 'révisions');
  return (
    <div className="card card--feature">
      <span className="card__eyebrow">
        <Icon name="review" size="sm" />
        Révisions du jour
      </span>
      <h2 className="t-h3">{started ? `Encore ${n}` : `${n} à faire`}</h2>
      <p className="card__meta">
        {reviews.questions} questions, environ {plural(reviews.minutes, 'minute', 'minutes')}
      </p>
      <button className="btn btn--inverse btn--block" type="button" onClick={() => go('#/revisions')}>
        {started ? 'Encore des révisions' : 'Réviser'}
      </button>
    </div>
  );
}

/** Le bouton du cours est à contour tant qu'il reste des révisions, plein ensuite (maquette). */
function CourseCard({ home, progress, reviewsLeft }: { home: StudentHome; progress: ProgressState; reviewsLeft: boolean }) {
  const btn = reviewsLeft ? 'btn--outlined' : 'btn--ink';
  if (!home.next) {
    return (
      <section className="card" aria-label="Module terminé">
        <p className="t-h4">Module {home.module.title} terminé. Tous les cours sont validés.</p>
        <button className={`btn ${btn} btn--block`} type="button" onClick={() => go('#/entrainement')}>
          S'entraîner
        </button>
        <ModuleStrip home={home} progress={progress} />
      </section>
    );
  }
  const { courseId, status } = home.next;
  const course = getCourse(courseId);
  const retry = status === 'a-rattraper';
  return (
    <section className="card" aria-label={retry ? 'Cours à valider' : 'Prochain cours'}>
      <div className="course-head">
        <span className={retry ? 'course-num is-retry' : 'course-num'} aria-hidden="true">
          {course.order}
        </span>
        <div className="min-w0">
          <div className={`t-subtitle2 ${retry ? 'ink-error' : 'ink-secondary'}`}>{retry ? 'Cours à valider' : 'Prochain cours'}</div>
          <h3 className="t-h4">{course.title}</h3>
          {retry && <p className="t-body2 mt-4">5 exercices. Avec 4 justes, le cours est validé.</p>}
        </div>
      </div>
      {retry ? (
        <div className="stack-tight">
          <button className={`btn ${btn} btn--block`} type="button" onClick={() => go({ name: 'rattrapage', id: courseId })}>
            Faire la série de validation
          </button>
          <button className="btn btn--text self-center" type="button" onClick={() => go({ name: 'relire', id: courseId })}>
            Relire la leçon
          </button>
        </div>
      ) : (
        <button className={`btn ${btn} btn--block`} type="button" onClick={() => go({ name: 'cours-detail', id: courseId })}>
          Commencer le cours {course.order}
        </button>
      )}
      <ModuleStrip home={home} progress={progress} />
    </section>
  );
}

function ModuleStrip({ home, progress }: { home: StudentHome; progress: ProgressState }) {
  const m = home.module;
  const says = m.window.map((c) => `cours ${c.order} ${c.status === 'valide' ? 'validé' : c.status === 'a-rattraper' ? 'à valider' : isTodo(c.status) ? 'à faire' : 'verrouillé'}`);
  const label = says.join(', ').replace(/^c/, 'C');
  return (
    <div className="strip">
      <div className="strip-head">
        <span className="t-h6">Module {m.title}</span>
        <span className="t-caption">
          {m.validated} cours sur {m.total} validés
        </span>
      </div>
      <div className="progress progress--module" style={{ '--v': `${(m.validated / m.total) * 100}%` } as React.CSSProperties}>
        <i />
      </div>
      <div className="course-window" role="group" aria-label={label}>
        {m.window.map((c) => {
          if (c.status === 'valide')
            return (
              <div key={c.courseId} className="course-chip">
                <b>{c.order}</b>
                <Stars n={progress.courses[c.courseId]!.stars} small />
              </div>
            );
          if (c.status === 'a-rattraper')
            return (
              <div key={c.courseId} className="course-chip is-retry">
                <b>{c.order}</b>à valider
              </div>
            );
          if (isTodo(c.status))
            return (
              <div key={c.courseId} className="course-chip is-todo">
                <b>{c.order}</b>à faire
              </div>
            );
          return (
            <div key={c.courseId} className="course-chip is-locked">
              <b>{c.order}</b>
              <Icon name="lock" size="sm" className="ink-subtle" />
            </div>
          );
        })}
      </div>
      <a className="link link--target t-body2 self-start" href="#/cours">
        Voir tous mes cours
      </a>
    </div>
  );
}

export default function Home() {
  const progress = useProgress();
  const events = useEvents();
  const today = useToday();
  const name = useSession()?.user.name;
  const ready = useReady();
  const home = useMemo(() => studentHome(progress, events, today), [progress, events, today]);
  const minutes = Math.floor(home.today.totalMs / 60_000);
  const goal = DAILY_GOAL_MS / 60_000;
  // Rien tant que la session et les événements locaux ne sont pas chargés : jamais de prénom absent ni de « 0 cours » faux.
  if (!ready) return <main className="app-body" data-screen="accueil" aria-busy="true" />;
  return (
    <>
      <main className="app-body" data-screen="accueil">
        <header className="top">
          <h1 className="t-h2">{name ? `Bonjour ${name} !` : 'Bonjour !'}</h1>
          {home.streak > 0 && (
            <span className="streak" aria-label={`${plural(home.streak, 'jour', 'jours')} d'affilée avec l'objectif atteint`}>
              <Icon name="flame" />
              {plural(home.streak, 'jour', 'jours')}
            </span>
          )}
        </header>

        <section className="day" aria-label="Temps du jour">
          <div className="day-head">
            <h2 className="t-h5">Aujourd'hui</h2>
            <span className="t-body2 math">
              {minutes} / {goal} min
            </span>
          </div>
          <DayGauge minutes={minutes} goal={goal} />
          <p className={minutes >= goal ? 't-body2 is-goal' : 't-body2'}>{dayText(minutes, goal)}</p>
        </section>

        <section aria-live="polite">
          <ReviewCard reviews={home.reviews} started={home.today.reviewMs > 0} />
        </section>

        <CourseCard home={home} progress={progress} reviewsLeft={home.reviews !== null} />
      </main>
      <div className="app-foot">
        <BottomNav active="accueil" />
      </div>
    </>
  );
}
