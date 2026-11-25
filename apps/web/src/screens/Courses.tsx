import { useEffect, useRef, useState } from 'react';
import { ESSAIS, MODULES, canOpenMemo, getCourse, lastAttempt, type CourseProgress, type LastAttempt } from '@pom/engine';
import { Stars, courseLabel, lastAttemptText, ruleLink } from '../components/CourseBits';
import { go } from '../router';
import { useProgress, useReady, useSession } from '../store/progress';
import { useEvents } from '../store/sync';
import { BottomNav } from '../ui/BottomNav';
import { Icon } from '../ui/Icon';

/**
 * Mes cours (maquette `navigation.html` écran 2, docs 08 n° 2, 16 et 17) : une ligne par cours, dépliable
 * (une seule ouverte à la fois), les cours verrouillés restent fermés.
 */

function Status({ c }: { c: CourseProgress }) {
  if (c.status === 'valide')
    return (
      <>
        <span className="status status--done">
          <Icon name="check-circle" size="sm" />
          Validé
        </span>
        <Stars n={c.stars} />
      </>
    );
  if (c.status === 'a-rattraper')
    return (
      <span className="status status--retry">
        <Icon name="review" size="sm" />À valider
      </span>
    );
  return <span className="status status--todo">À faire</span>;
}

function MemoButton({ c }: { c: CourseProgress }) {
  if (!canOpenMemo(c.status, getCourse(c.courseId).memo !== undefined)) return null;
  return (
    <button className="btn btn--outlined btn--block" type="button" onClick={() => go({ name: 'fiche', id: c.courseId })}>
      Fiche
    </button>
  );
}

function Actions({ c, last }: { c: CourseProgress; last: LastAttempt | null }) {
  const order = getCourse(c.courseId).order;
  if (c.status === 'valide')
    return (
      <>
        <button className="btn btn--outlined btn--block" type="button" onClick={() => go({ name: 'relire', id: c.courseId })}>
          <Icon name="eye" />
          Relire la leçon
        </button>
        <MemoButton c={c} />
        <p className="t-caption">Relire ne change ni tes étoiles ni tes révisions.</p>
      </>
    );
  if (c.status === 'a-rattraper') {
    const rule = ruleLink(last);
    return (
      <>
        {last && <p className="t-body2">{lastAttemptText(last)}</p>}
        <button className="btn btn--outlined btn--block" type="button" onClick={() => go({ name: 'rattrapage', id: c.courseId })}>
          Faire la série de validation
        </button>
        <MemoButton c={c} />
        <div className="row row--wrap" style={{ justifyContent: 'center' }}>
          {rule && (
            <button className="btn btn--text" type="button" onClick={() => go({ name: 'relire', id: c.courseId, part: rule.part })}>
              {`Relire la règle ${rule.n}`}
            </button>
          )}
          <button className="btn btn--text" type="button" onClick={() => go({ name: 'relire', id: c.courseId })}>
            Relire la leçon
          </button>
        </div>
        <p className="t-caption">5 exercices, 4 justes pour valider. Tu peux recommencer autant de fois que tu veux.</p>
      </>
    );
  }
  return (
    <>
      <button className="btn btn--ink btn--block" type="button" onClick={() => go({ name: 'cours-detail', id: c.courseId })}>
        Commencer le cours {order}
      </button>
      <MemoButton c={c} />
      <p className="t-caption">Le cours se termine par 5 exercices. Il te faut 4 justes pour le valider.</p>
    </>
  );
}

export default function Courses() {
  const ready = useReady();
  if (!ready) return <main className="app-body" data-screen="mes-cours" aria-busy="true" />;
  return <CoursesList />;
}

function CoursesList() {
  const progress = useProgress();
  const events = useEvents();
  const apercu = !!useSession()?.user.apercu;
  const module = MODULES.find((m) => !progress.modules[m.id]?.done) ?? MODULES[0]!;
  const mp = progress.modules[module.id]!;
  // Ouvert au départ : le prochain cours à faire ou à rattraper.
  const firstOpen = module.courseIds.find((id) => progress.courses[id]!.status !== 'valide') ?? null;
  // `undefined` : pas encore touché, on suit le prochain cours (la progression arrive après le premier affichage).
  const [touched, setOpen] = useState<string | null | undefined>(undefined);
  const open = touched === undefined ? firstOpen : touched;
  const defaultRow = useRef<HTMLDetailsElement>(null);
  const scrolls = touched === undefined && firstOpen !== null && firstOpen !== module.courseIds[0];
  useEffect(() => {
    // Les cours validés sont nombreux : le cours ouvert par défaut est amené au milieu de l'écran (maquette).
    if (scrolls && typeof defaultRow.current?.scrollIntoView === 'function') defaultRow.current.scrollIntoView({ block: 'center' });
  }, [scrolls, firstOpen]);
  const done = mp.done;

  const renderRow = (id: string) => {
    const c = progress.courses[id]!;
    const order = getCourse(id).order;
    const locked = c.status === 'verrouille';
    const num = (
      <span className={`course-num is-${locked ? 'locked' : c.status === 'valide' ? 'done' : c.status === 'a-rattraper' ? 'retry' : 'todo'}`} aria-hidden="true">
        {order}
      </span>
    );
    if (locked)
      return (
        <div key={id} className="crow is-locked">
          <div className="crow__static">
            {num}
            <div className="list-item__text">
              <span className="list-item__title">{courseLabel(id)}</span>
              <span className="status">
                <Icon name="lock" size="sm" />
                Verrouillé
              </span>
              <span className="t-caption">Valide le cours {order - 1} pour l'ouvrir.</span>
            </div>
          </div>
        </div>
      );
    return (
      <details key={id} ref={id === firstOpen ? defaultRow : undefined} className="crow" open={open === id}>
        <summary
          onClick={(e) => {
            e.preventDefault();
            setOpen(open === id ? null : id);
          }}
        >
          {num}
          <div className="list-item__text">
            <span className="list-item__title">{courseLabel(id)}</span>
            <span className="row row--wrap">
              <Status c={c} />
            </span>
          </div>
          <Icon name="chevron-right" className="crow__chev" />
        </summary>
        <div className="crow__body">
          <Actions c={c} last={lastAttempt(progress, events, id)} />
        </div>
      </details>
    );
  };

  return (
    <>
      <main className="app-body" data-screen="mes-cours">
        <header className="top">
          <h1 className="t-h2">Mes cours</h1>
        </header>
        <section className="module-head" aria-label={`Module ${module.title}`}>
          <div className="row row--between">
            <span className="t-h5">Module {module.title}</span>
            {done && (
              <span className="chip chip--success">
                <Icon name="check" />
                Module terminé
              </span>
            )}
          </div>
          <div className="progress progress--module" style={{ '--v': `${(mp.validated / mp.total) * 100}%` } as React.CSSProperties}>
            <i />
          </div>
          <p className="t-body2">
            {mp.validated} cours sur {mp.total} validés
          </p>
        </section>
        <section className="list" aria-label={`Cours du module ${module.title}`}>
          {module.courseIds.map(renderRow)}
        </section>
        {apercu && (
          <>
            <section className="module-head" aria-label="Module Essais">
              <span className="t-h5">Essais</span>
              <p className="t-body2">Cours à l'essai : tu es seul à les voir.</p>
            </section>
            <section className="list" aria-label="Cours à l'essai">
              {ESSAIS.courseIds.map(renderRow)}
            </section>
          </>
        )}
      </main>
      <div className="app-foot">
        <BottomNav active="cours" />
      </div>
    </>
  );
}
