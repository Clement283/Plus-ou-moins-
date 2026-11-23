import { MODULES, getCourse, type RunResult } from '@pom/engine';
import { go } from '../router';
import { AppBar } from '../ui/AppBar';
import { Icon } from '../ui/Icon';
import type { StepResult } from '../ui/Stepper';

/**
 * Résultat d'un cours ou d'un rattrapage (docs 01 §2, 08 n° 5 et 6 ; maquette cours.html, groupes 3 et 4).
 * Les chiffres viennent de `runResult` ; ici seulement la mise en page et les textes.
 */
export interface RunResultViewProps {
  variant: 'cours' | 'rattrapage';
  courseId: string;
  result: RunResult;
  /** Une valeur par étape faite, pour la barre du haut. */
  results: StepResult[];
  /** Rattrapage : relance une nouvelle série. */
  onRetry?: () => void;
}

const nextOf = (courseId: string): string | null => {
  const m = MODULES.find((x) => x.courseIds.includes(courseId));
  return m ? (m.courseIds[m.courseIds.indexOf(courseId) + 1] ?? null) : null;
};

export function RunResultView({ variant, courseId, result, results, onRetry }: RunResultViewProps) {
  const course = getCourse(courseId);
  const next = nextOf(courseId);
  const nextCourse = next ? getCourse(next) : null;
  const close = result.validated ? '#/' : '#/cours';
  const bar = <AppBar onClose={() => go(close)} closeLabel="Fermer" stepper={{ total: results.length, done: results, current: -1, label: `${results.length} étapes terminées` }} />;
  const relire = (
    <button className="btn btn--text" type="button" style={{ justifySelf: 'center', alignSelf: 'center' }} onClick={() => go({ name: 'relire', id: courseId })}>
      Relire la leçon
    </button>
  );

  if (result.validated) {
    const sub =
      variant === 'cours'
        ? `${result.ok} bonnes réponses sur ${result.first}, dont ${result.finOk} exercices de fin justes sur ${result.fin}.`
        : `Rattrapage réussi : ${result.ok} exercices justes sur ${result.first}.`;
    return (
      <main className="app-body app-body--grow" data-screen="resultat" style={{ padding: 0, gap: 0 }}>
        {bar}
        <div className="result">
          <div className="result__hero">
            <span className="rating rating--xl" role="img" aria-label="1 étoile sur 3">
              <Icon name="star" />
              <Icon name="star" className="is-empty" />
              <Icon name="star" className="is-empty" />
            </span>
            <h1 className="t-h2">{`Cours ${course.order} validé`}</h1>
            <p className="t-body1" style={{ color: 'var(--muted)' }}>{sub}</p>
          </div>
          <div className="card" style={{ gap: 'var(--sp-12)' }}>
            {nextCourse && (
              <div className="tick">
                <Icon name="check-circle" />
                <span>{`Le cours ${nextCourse.order}, « ${nextCourse.title} », est débloqué.`}</span>
              </div>
            )}
            <div className="tick">
              <Icon name="check-circle" />
              <span>{`Tu gagnes la 1re étoile du cours ${course.order}.`}</span>
            </div>
            <div className="tick">
              <Icon name="clock" />
              <span>{`Première révision dans ${result.firstReviewInHours} heures.`}</span>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          {nextCourse && (
            <button className="btn btn--contained btn--block" type="button" onClick={() => go({ name: 'cours-detail', id: nextCourse.id })}>
              {`Commencer le cours ${nextCourse.order}`}
            </button>
          )}
          <button
            className={nextCourse ? 'btn btn--text' : 'btn btn--contained btn--block'}
            type="button"
            style={nextCourse ? { justifySelf: 'center', alignSelf: 'center' } : undefined}
            onClick={() => go('#/')}
          >
            Retour à l'accueil
          </button>
        </div>
      </main>
    );
  }

  if (variant === 'rattrapage') {
    return (
      <main className="app-body app-body--grow" data-screen="resultat" style={{ padding: 0, gap: 0 }}>
        {bar}
        <div className="result">
          <div className="result__hero">
            <span className="course-num is-retry" aria-hidden="true">{course.order}</span>
            <h1 className="t-h2">{`${result.ok} sur ${result.first}, il en faut 4`}</h1>
            <p className="t-body1" style={{ color: 'var(--muted)' }}>Ce n'est pas encore ça, mais tu peux recommencer autant de fois que nécessaire.</p>
          </div>
          {nextCourse && (
            <div className="tick">
              <Icon name="lock" className="is-lock" />
              <span>{`Le cours ${nextCourse.order} se débloque quand le cours ${course.order} est validé.`}</span>
            </div>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn btn--contained btn--block" type="button" onClick={onRetry}>
            Refaire une série de 5
          </button>
          {relire}
        </div>
      </main>
    );
  }

  const okPercent = result.ok * 5 >= result.first * 4;
  const okFin = result.finOk >= 4;
  return (
    <main className="app-body app-body--grow" data-screen="resultat" style={{ padding: 0, gap: 0 }}>
      {bar}
      <div className="result">
        <div className="result__hero">
          <span className="course-num is-retry" aria-hidden="true">{course.order}</span>
          <h1 className="t-h2">{`Le cours ${course.order} n'est pas encore validé`}</h1>
        </div>
        <p className="t-body2" style={{ color: 'var(--muted)' }}>Pour valider un cours, il faut réussir deux choses.</p>
        <div className="stack" style={{ gap: 'var(--sp-8)' }}>
          <div className={`alert alert--${okPercent ? 'success' : 'error'}`}>
            <Icon name={okPercent ? 'check-circle' : 'x-circle'} />
            <div className="alert__title">80 % sur tout le cours</div>
            <div>{`Tu as ${result.ok} bonnes réponses sur ${result.first}, soit ${result.percent} %.`}</div>
          </div>
          <div className={`alert alert--${okFin ? 'success' : 'error'}`}>
            <Icon name={okFin ? 'check-circle' : 'x-circle'} />
            <div className="alert__title">4 exercices de fin sur 5</div>
            <div>{`Tu en as réussi ${result.finOk}. Elle vérifie que tu sais calculer seule.`}</div>
          </div>
        </div>
        <p className="t-body2" style={{ color: 'var(--muted)' }}>Pas besoin de refaire la leçon : 5 exercices, 4 justes pour valider. Tu peux recommencer.</p>
        <div style={{ flex: 1 }} />
        <button className="btn btn--contained btn--block" type="button" onClick={() => go({ name: 'rattrapage', id: courseId })}>
          Faire le rattrapage
        </button>
        {relire}
      </div>
    </main>
  );
}
