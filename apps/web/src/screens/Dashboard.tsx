import { useEffect, useState } from 'react';
import { DAILY_GOAL_MS, getCourse, type Dashboard as Dash, type DayPoint } from '@pom/engine';
import { Acc, ErrItem, OfflineAlert, errorLabel, listOrders, lowerFirst, plural, upperFirst, longDate, weekdayLetter, when } from '../components/FollowBits';
import { toHash } from '../router';
import { useCurrentStudent, useStudentDashboard, useStudents, type Student } from '../store/follow';
import { Icon } from '../ui/Icon';
import { Sheet } from '../ui/Sheet';

/** Page de suivi, accueil (maquette `suivi.html` écran 1, doc 05 §1) : lecture seule, cinq blocs. */

const GOAL = DAILY_GOAL_MS / 60_000;
const MARK_LABEL = { atteint: 'objectif atteint', partiel: "un peu d'activité", rien: 'rien' } as const;
const MARK_DOT = { atteint: 'dot dot--full', partiel: 'dot dot--half', rien: 'dot' } as const;

/** Minutes entières par catégorie, dont la somme fait le total arrondi à la minute inférieure (plus grands restes d'abord). */
function splitMinutes(d: DayPoint): { total: number; review: number; course: number; training: number } {
  const parts = [d.reviewMs, d.courseMs, d.trainingMs].map((ms) => ms / 60_000);
  const total = Math.floor(d.totalMs / 60_000);
  const out = parts.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  const order = parts.map((p, i) => [p - Math.floor(p), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) if (left-- > 0) out[i]!++;
  return { total, review: out[0]!, course: out[1]!, training: out[2]! };
}

function DayInfo({ d, isToday }: { d: DayPoint; isToday: boolean }) {
  const label = upperFirst(longDate(d.day));
  if (d.totalMs === 0)
    return (
      <div className="dayinfo" aria-live="polite">
        <b>{label}</b>
        <span className="t-body2">Rien ce jour-là.</span>
      </div>
    );
  const m = splitMinutes(d);
  const lead = `${label}${isToday ? " (aujourd'hui)" : ''}`;
  return (
    <div className="dayinfo" aria-live="polite">
      {m.total === 0 ? (
        <b>{lead}, moins d'une minute.</b>
      ) : (
        <>
          <b>
            {lead}, {m.total} min.
          </b>{' '}
          <span className="t-body2">
            Révisions {m.review} min, cours {m.course} min, entraînement {m.training} min.
          </span>
        </>
      )}
    </div>
  );
}

function Calendar({ days, goalDays, today }: { days: DayPoint[]; goalDays: number; today: string }) {
  const [sel, setSel] = useState(days.length - 1);
  const letters = Array.from({ length: 7 }, (_, i) => weekdayLetter(days[i]!.day));
  return (
    <section className="card block" aria-labelledby="h28">
      <h2 className="t-h5" id="h28">
        28 derniers jours
      </h2>
      <div className="cal" role="group" aria-label="Un point par jour">
        {letters.map((w, i) => (
          <span key={i} className="cal__wd" aria-hidden="true">
            {w}
          </span>
        ))}
        {days.map((d, i) => (
          <button
            key={d.day}
            type="button"
            className={`cal__day${d.day === today ? ' is-today' : ''}`}
            aria-pressed={i === sel}
            aria-label={`${longDate(d.day)}, ${MARK_LABEL[d.mark]}`}
            onClick={() => setSel(i)}
          >
            <span className={MARK_DOT[d.mark]} />
          </button>
        ))}
      </div>
      <div className="cal__key">
        <span>
          <i className="dot dot--full" />
          {GOAL} minutes atteintes
        </span>
        <span>
          <i className="dot dot--half" />
          un peu
        </span>
        <span>
          <i className="dot" />
          rien
        </span>
      </div>
      <p className="t-body1">
        <b>
          Objectif atteint {goalDays} jours sur {days.length}
        </b>
      </p>
      <DayInfo d={days[sel]!} isToday={days[sel]!.day === today} />
    </section>
  );
}

const pctOf = (rate: number | null) => (rate === null ? null : Math.round(rate * 100));

function Reviews({ dash, today }: { dash: Dash; today: string }) {
  const p = dash.home.pendingReviews;
  return (
    <section className="card block" aria-labelledby="hrev">
      <h2 className="t-h5" id="hrev">
        Révisions pas faites
      </h2>
      {p.count === 0 ? (
        <div className="empty--ok">
          <Icon name="check-circle" />
          Révisions à jour
        </div>
      ) : (
        <Acc
          summary={
            <span className="acc__text">
              <span className="acc__title">{p.count} en attente</span>
              <span className="acc__sub">la plus ancienne : {when(p.oldest!, today)}</span>
            </span>
          }
        >
          <div className="card card--outlined card--flat">
            {p.items.map((r) => (
              <div className="fact" key={r.courseId}>
                <span className="fact__label">
                  Cours {getCourse(r.courseId).order}, {lowerFirst(r.title)}
                </span>
                <span className="fact__sub">{r.due < today ? `depuis ${when(r.due, today)}` : "pour aujourd'hui"}</span>
              </div>
            ))}
          </div>
        </Acc>
      )}
    </section>
  );
}

function CommonErrors({ dash }: { dash: Dash }) {
  const { top } = dash.home.commonErrors;
  return (
    <section className="card block" aria-labelledby="herr">
      <div className="block__head">
        <h2 className="t-h5" id="herr">
          Erreurs les plus communes
        </h2>
        <span className="t-caption">28 jours</span>
      </div>
      {top.length === 0 ? (
        <p className="t-body2">Aucune erreur sur 28 jours.</p>
      ) : (
        <div>
          {top.map((c, i) => (
            <Acc
              key={c.errorType}
              summary={
                <>
                  <span className="acc__rank">{i + 1}</span>
                  <span className="acc__text">
                    <span className="acc__title">{errorLabel(c.errorType)}</span>
                    <span className="acc__sub">
                      {c.family === 'ecriture' ? "erreur d'écriture, " : c.courseIds.length > 1 ? 'dans les ' : 'dans le '}
                      cours{' '}
                      {listOrders(c.courseIds)}
                    </span>
                  </span>
                  <span className="acc__n">{plural(c.count, 'fois', 'fois')}</span>
                </>
              }
            >
              <ul className="errs">
                {c.calculs.map((e, k) => (
                  <ErrItem key={k} e={e} />
                ))}
              </ul>
              {c.calculs.length >= 9 && <p className="list-note">Ses 10 derniers calculs ratés de ce type au plus. Ici, il y en a {c.calculs.length}.</p>}
            </Acc>
          ))}
        </div>
      )}
      <p className="t-caption">Les erreurs « autre » qui reviennent souvent apparaissent ici pour que tu puisses les signaler.</p>
    </section>
  );
}

function ToRework({ dash, eleve }: { dash: Dash; eleve: string }) {
  const list = dash.home.toRework;
  return (
    <section className="card block" aria-labelledby="hret">
      <h2 className="t-h5" id="hret">
        À retravailler
      </h2>
      {list.length === 0 ? (
        <div className="empty--ok">
          <Icon name="check-circle" />
          Rien à retravailler en ce moment
        </div>
      ) : (
        <div className="crow-bleed">
          {list.map((r) => {
            const pct = pctOf(r.success14.rate);
            return (
              <a key={r.courseId} className="crow crow--line" href={toHash({ name: 'suivi-cours', eleve, id: r.courseId })}>
                <span className="cnum" aria-hidden="true">
                  {getCourse(r.courseId).order}
                </span>
                <div className="crow__text">
                  <span className="crow__title">
                    Cours {getCourse(r.courseId).order}, {r.title}
                  </span>
                  {pct !== null && (
                    <span className="crow__meta">
                      <span className="pct is-low">{pct} %</span>
                    </span>
                  )}
                  {r.failedTwiceInARow && <span className="crow__note is-warn">2 révisions ratées d'affilée</span>}
                  {r.lowSuccess && <span className="crow__note is-warn">Réussite sous 70 % sur les 14 derniers jours</span>}
                </div>
                <span className="crow__trail">
                  <Icon name="warning" size="sm" className="warn" />
                  <Icon name="chevron-right" size="sm" />
                </span>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StudentPicker({ students, current, onChoose }: { students: Student[]; current: Student; onChoose: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  if (students.length < 2) return <h1 className="who who--static">{current.name}</h1>;
  return (
    <>
      <button className="who" type="button" aria-label={`Changer d'élève, ${current.name}`} onClick={() => setOpen(true)}>
        {current.name}
        <Icon name="chevron-down" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} label="Choisir un élève">
        <h2 className="t-h5">Changer d'élève</h2>
        <div className="who-list">
          {students.map((s) => (
            <button
              key={s.id}
              type="button"
              className="fact"
              aria-current={s.id === current.id}
              onClick={() => {
                onChoose(s.id);
                setOpen(false);
              }}
            >
              <span className="fact__label">{s.name}</span>
              {s.id === current.id && <Icon name="check" />}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}

export default function Dashboard() {
  const students = useStudents();
  const { student, choose } = useCurrentStudent(students.data);
  const { dash, today } = useStudentDashboard(student?.id);
  useEffect(() => {
    document.title = 'Suivi';
  }, []);
  if (students.data && students.data.length === 0)
    return (
      <main className="app-body" data-screen="suivi">
        <p className="t-body1">Aucun élève à suivre pour l'instant.</p>
      </main>
    );
  if (!student || !dash)
    return (
      <main className="app-body" data-screen="suivi">
        {students.failed && !students.data && <OfflineAlert />}
      </main>
    );
  const t = dash.home.state.today;
  const minutes = Math.floor(t.totalMs / 60_000);
  return (
    <main className="app-body" data-screen="suivi">
      <header className="top">
        <div>
          <div className="kicker">Suivi</div>
          <StudentPicker students={students.data!} current={student} onChoose={choose} />
        </div>
        <span className="ro">
          <Icon name="eye" size="sm" />
          Lecture seule
        </span>
      </header>

      <Calendar days={dash.home.last28.days} goalDays={dash.home.last28.goalDays} today={today} />

      <section className="card block" aria-labelledby="hetat">
        <h2 className="t-h5" id="hetat">
          État
        </h2>
        <div className="facts">
          <div className="fact">
            <span className="fact__label">Aujourd'hui</span>
            <span className="fact__value">
              {minutes} / {GOAL} min
              {t.goalReached && <Icon name="check-circle" size="sm" className="ico-success" />}
            </span>
          </div>
          <div className="fact">
            <span className="fact__label">Série</span>
            <span className="fact__value">{plural(dash.home.state.streak, 'jour', 'jours')}</span>
          </div>
          {dash.home.state.modules.map((m) => (
            <a key={m.moduleId} className="fact" href={toHash({ name: 'suivi-module', eleve: student.id, id: m.moduleId })}>
              <span className="fact__label">{m.title}</span>
              <span className="fact__value">
                {m.validated} / {m.total} cours
                <Icon name="chevron-right" size="sm" className="chev" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <Reviews dash={dash} today={today} />
      <CommonErrors dash={dash} />
      <ToRework dash={dash} eleve={student.id} />
    </main>
  );
}
