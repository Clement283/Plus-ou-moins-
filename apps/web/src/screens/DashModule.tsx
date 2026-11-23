import { useEffect } from 'react';
import type { ModuleCourse } from '@pom/engine';
import { FollowBar } from '../components/FollowBar';
import { nextReviewShort, when } from '../components/FollowBits';
import { Stars } from '../components/CourseBits';
import { toHash } from '../router';
import { saveLastStudent, useStudentDashboard } from '../store/follow';
import { Icon } from '../ui/Icon';

/** Page de suivi, un module (maquette `suivi.html` écran 2, doc 05 §2) : une ligne par cours. */

const pct = (c: ModuleCourse) => (c.success28.rate === null ? null : Math.round(c.success28.rate * 100));

function Row({ c, eleve, today }: { c: ModuleCourse; eleve: string; today: string }) {
  if (c.status === 'pas-commence')
    return (
      <div className="crow crow--line is-locked">
        <span className="cnum is-locked" aria-hidden="true">
          {c.order}
        </span>
        <div className="crow__text">
          <span className="crow__title">{c.title}</span>
          <span className="crow__meta">
            <span className="state state--none">pas commencé</span>
            <Icon name="lock" size="sm" />
          </span>
        </div>
      </div>
    );
  const p = pct(c);
  const valid = c.status === 'valide';
  const notes: { text: string; warn?: boolean }[] = [];
  if (valid && c.struggling) {
    if (c.failedTwiceInARow) notes.push({ text: "Cours qui coince : 2 révisions ratées d'affilée", warn: true });
    else notes.push({ text: 'Cours qui coince : réussite sous 70 % sur les 14 derniers jours', warn: true });
  }
  if (c.status === 'a-rattraper' && c.failedRun)
    notes.push({ text: `${c.failedRun.kind === 'fin' ? 'fin de cours ratée' : 'série de validation ratée'}, ${c.failedRun.ok} sur ${c.failedRun.total} alors qu'il en faut 4` });
  if (c.status === 'en-cours' && c.startedOn) notes.push({ text: `Leçon commencée ${when(c.startedOn, today)}, pas encore terminée` });
  if (valid && c.nextReview) notes.push({ text: nextReviewShort(c.nextReview, today) });
  return (
    <a className="crow crow--line" href={toHash({ name: 'suivi-cours', eleve, id: c.courseId })}>
      <span className={`cnum${c.status === 'a-rattraper' ? ' is-retry' : c.status === 'en-cours' ? ' is-going' : ''}`} aria-hidden="true">
        {c.order}
      </span>
      <div className="crow__text">
        <span className="crow__title">{c.title}</span>
        <span className="crow__meta">
          {valid && (
            <>
              <span className="state">validé</span>
              <Stars n={c.stars} small />
              <span>niveau {c.level}</span>
              {p !== null && <span className={`pct${c.struggling ? ' is-low' : ''}`}>{p} %</span>}
            </>
          )}
          {c.status === 'a-rattraper' && (
            <>
              <span className="state state--retry">à valider</span>
              {p !== null && <span className="pct is-low">{p} %</span>}
            </>
          )}
          {c.status === 'en-cours' && <span className="state state--going">en cours</span>}
        </span>
        {notes.map((n) => (
          <span key={n.text} className={`crow__note${n.warn ? ' is-warn' : ''}`}>
            {n.text}
          </span>
        ))}
      </div>
      <span className="crow__trail">
        {valid && c.struggling && <Icon name="warning" size="sm" className="warn" />}
        <Icon name="chevron-right" size="sm" />
      </span>
    </a>
  );
}

export default function DashModule({ eleve, id }: { eleve: string; id: string }) {
  const { dash, today } = useStudentDashboard(eleve);
  useEffect(() => void saveLastStudent(eleve), [eleve]);
  const mod = dash?.modules.find((m) => m.moduleId === id);
  return (
    <>
      <FollowBar
        back="#/suivi"
        backLabel="Retour à l'accueil"
        title={mod?.title ?? ''}
        sub={
          mod && (
            <>
              {mod.done && <><span className="state">terminé</span>{' '}</>}
              {mod.validated} / {mod.total} cours validés
            </>
          )
        }
      />
      <main className="app-body" data-screen="suivi-module">
        {mod && (
          <>
            <div className="block">
              <div
                className="progress progress--module"
                style={{ '--v': `${(mod.validated / mod.total) * 100}%` } as React.CSSProperties}
                role="img"
                aria-label={`${mod.validated} cours validés sur ${mod.total}`}
              >
                <i />
              </div>
            </div>
            <div className="card card--list">
              {mod.courses.map((c) => (
                <Row key={c.courseId} c={c} eleve={eleve} today={today} />
              ))}
            </div>
            <p className="t-caption">
              La réussite compte les exercices, les révisions et l'entraînement des 28 derniers jours. Les questions de leçon et les exemples guidés ne comptent pas.
            </p>
          </>
        )}
      </main>
    </>
  );
}
