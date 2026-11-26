import { Stars } from '../components/CourseBits';
import { FollowBar } from '../components/FollowBar';
import { ErrItem, OfflineAlert, ddmm, errorLabel, nextReviewLong, shortDate, when } from '../components/FollowBits';
import { toHash } from '../router';
import { useRememberStudent, useStudentDashboard } from '../store/follow';
import { Icon } from '../ui/Icon';

/** Page de suivi, un cours (maquette `suivi.html` écran 3, doc 05 §3). */

export default function DashCourse({ eleve, id }: { eleve: string; id: string }) {
  const { dash, failed, today } = useStudentDashboard(eleve);
  useRememberStudent(eleve);
  const c = dash?.courses[id];
  const mc = dash?.modules.flatMap((m) => m.courses).find((x) => x.courseId === id);
  const mod = dash?.modules.find((m) => m.moduleId === c?.moduleId);
  const back = mod ? toHash({ name: 'suivi-module', eleve, id: mod.moduleId }) : '#/suivi';
  if (!dash || !c || !mc || !mod)
    return (
      <>
        <FollowBar back="#/suivi" backLabel="Retour à l'accueil" title="" />
        <main className="app-body" data-screen="suivi-cours">
          {!dash && failed && <OfflineAlert />}
        </main>
      </>
    );

  const valid = c.status === 'valide';
  const rate = mc.success28.rate === null ? null : Math.round(mc.success28.rate * 100);
  const stateCls = c.status === 'a-rattraper' ? ' is-retry' : c.status === 'en-cours' ? ' is-going' : '';
  const facts: { key: string; node: React.ReactNode }[] = [];
  if (valid) {
    facts.push({ key: 'v', node: <>Validé le <b>{shortDate(c.validatedOn!)}</b></> });
    if (c.nextReview) facts.push({ key: 'n', node: <>Prochaine révision : <b>{nextReviewLong(c.nextReview, today)}</b></> });
    if (rate !== null) facts.push({ key: 'r', node: <>Réussite sur 28 jours : <b>{rate} %</b></> });
  } else if (c.status === 'a-rattraper') {
    const f = c.failedRun;
    facts.push({
      key: 'f',
      node: f ? (
        <>
          Pas encore validé : <b>{f.ok} sur {f.total}</b> {f.kind === 'fin' ? 'aux exercices de fin' : 'à la série de validation'}, le {shortDate(f.day)}
        </>
      ) : (
        <>Pas encore validé</>
      ),
    });
    facts.push({ key: 'p', node: <>La série de validation lui est proposée</> });
  } else if (c.status === 'en-cours') {
    facts.push({ key: 'e', node: <>Cours en cours d'apprentissage</> });
    if (c.startedOn) facts.push({ key: 's', node: <>Leçon commencée {when(c.startedOn, today)}, exercices de fin pas encore faits</> });
  } else facts.push({ key: 'n', node: <>Pas encore commencé</> });

  const max = Math.max(1, ...c.errors28.map((e) => e.count));
  return (
    <>
      <FollowBar back={back} backLabel={`Retour au module ${mod.title}`} title={`Cours ${c.order}, ${c.title}`} />
      <main className="app-body" data-screen="suivi-cours">
        <section className="block">
          <div className="chead">
            <span className={`course-num${stateCls}`} aria-hidden="true">
              {c.order}
            </span>
            <div className="chead__text">
              <h2 className="t-h4">{c.title}</h2>
              <div className="chead__state">
                {valid ? <span className="state">validé</span> : c.status === 'a-rattraper' ? <span className="state state--retry">à valider</span> : c.status === 'en-cours' ? <span className="state state--going">en cours</span> : <span className="state state--none">pas commencé</span>}
                {valid ? (
                  <>
                    <Stars n={c.stars} small />
                    <span className="t-body2">
                      niveau actuel <b>{c.level}</b>, étape <b>{c.step}</b>
                    </span>
                  </>
                ) : (
                  <span className="t-body2">Pas encore de niveau ni d'étoile</span>
                )}
              </div>
            </div>
          </div>
          <div className="cfacts">
            {facts.map((f) => (
              <p key={f.key}>{f.node}</p>
            ))}
          </div>
          {valid && mc.struggling && (
            <div className="alert alert--error">
              <Icon name="warning" />
              <span className="alert__title">Cours qui coince</span>
              <span>
                {mc.failedTwiceInARow
                  ? `Elle a raté 2 révisions d'affilée, le cours est redescendu à l'étape ${c.step}.`
                  : 'Sa réussite est sous 70 % sur les 14 derniers jours.'}
              </span>
            </div>
          )}
        </section>

        <section className="card block">
          <h3 className="t-h5">Révisions</h3>
          {c.reviews.length ? (
            <>
              <div className="revs" role="list">
                {c.reviews.map((r, i) => (
                  <span key={i} role="listitem" className={`chip ${r.ok ? 'chip--success' : 'chip--error'}`}>
                    <Icon name={r.ok ? 'check' : 'x-circle'} size="sm" />
                    {ddmm(r.day)}
                    <span className="sr-only">{r.ok ? ' réussie' : ' ratée'}</span>
                  </span>
                ))}
              </div>
              <p className="t-caption">Une révision est réussie avec 3 calculs justes sur 3.</p>
            </>
          ) : (
            <p className="t-body2">{valid ? 'Aucune révision faite pour l’instant.' : 'Aucune révision pour l’instant : le cours n’est pas validé.'}</p>
          )}
        </section>

        <section className="card block">
          <h3 className="t-h5">Ses erreurs sur 28 jours</h3>
          {c.errors28.length ? (
            <div className="bars">
              {c.errors28.map((e) => (
                <div className="bar" key={e.errorType}>
                  <span className="bar__label">{errorLabel(e.errorType)}</span>
                  <span className="bar__n">{e.count}</span>
                  <div className="bar__track" aria-hidden="true">
                    <i className={e.family === 'autre' ? 'is-other' : ''} style={{ '--v': `${Math.round((e.count / max) * 100)}%` } as React.CSSProperties} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="t-body2">Aucune erreur sur 28 jours.</p>
          )}
          {c.helped28 > 0 && (
            <p className="t-body2">
              Avec aide : {c.helped28} {c.helped28 > 1 ? 'résolutions justes trouvées' : 'résolution juste trouvée'} avec l’indice.
            </p>
          )}
        </section>

        <section className="card block">
          <h3 className="t-h5">Dernières erreurs du cours</h3>
          {c.lastErrors.length ? (
            <>
              <ul className="errs">
                {c.lastErrors.map((e, i) => (
                  <ErrItem key={i} e={e} />
                ))}
              </ul>
              {c.lastErrors.length >= 9 && <p className="list-note">Les 10 dernières erreurs au plus. Ici, il y en a {c.lastErrors.length}.</p>}
            </>
          ) : (
            <p className="t-body2">Rien à montrer.</p>
          )}
        </section>
      </main>
    </>
  );
}
