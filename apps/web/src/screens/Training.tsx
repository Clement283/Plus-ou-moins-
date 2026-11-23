import { useEffect, useState } from 'react';
import { MODULES, TRAINING_SERIES_LENGTH, foldProgress, getCourse, trainingPool, trainingSeries, type QuestionItem, type Rng } from '@pom/engine';
import { Stars, courseLabel } from '../components/CourseBits';
import { go } from '../router';
import { useProgress, useReady } from '../store/progress';
import { loadAll } from '../store/sync';
import { BottomNav } from '../ui/BottomNav';
import { Icon } from '../ui/Icon';
import { ActivityScreen } from './Activity';

/**
 * Entraînement (maquette `navigation.html` écran 3, docs 03 §5, 08 n° 1 et 3) : « Tout mélangé » ou une sélection
 * de cours validés ou à valider, par séries de 10 questions. Ne change jamais les révisions (le moteur ignore
 * l'activité « entraînement » dans le calendrier).
 */

export type TrainingChoice = 'tout' | { courseIds: string[] };
/** Le choix voyage de l'écran à la série : l'adresse `#/entrainement/serie` n'a pas de paramètre. */
let pending: TrainingChoice | null = null;
export function startTraining(choice: TrainingChoice | null): void {
  pending = choice;
  if (choice) go('#/entrainement/serie');
}

const COUNT = (n: number) => (n === 0 ? 'Choisis au moins un cours' : `${n} cours retenu${n > 1 ? 's' : ''}, ${TRAINING_SERIES_LENGTH} questions`);

/** « Les cours 5 à 7 apparaîtront ici… » : les cours pas encore commencés (doc 08). */
function comingText(orders: number[]): string | null {
  if (orders.length === 0) return null;
  const contiguous = orders.every((o, i) => i === 0 || o === orders[i - 1]! + 1);
  const who =
    orders.length === 1
      ? `Le cours ${orders[0]} apparaîtra`
      : contiguous
        ? `Les cours ${orders[0]} à ${orders[orders.length - 1]} apparaîtront`
        : `Les cours ${orders.slice(0, -1).join(', ')} et ${orders[orders.length - 1]} apparaîtront`;
  return `${who} ici quand tu auras fini ${orders.length === 1 ? 'ce cours' : 'ces cours'}.`;
}

function Foot({ mode, pool, picked }: { mode: 'tout' | 'choix'; pool: string[]; picked: string[] }) {
  const chosen = mode === 'tout' ? pool : pool.filter((id) => picked.includes(id));
  return (
    <div className="footbar">
      <p className="t-caption t-center">{COUNT(chosen.length)}</p>
      <button className="btn btn--contained btn--block" type="button" disabled={chosen.length === 0} onClick={() => startTraining(mode === 'tout' ? 'tout' : { courseIds: chosen })}>
        Commencer l'entraînement
      </button>
    </div>
  );
}

export default function Training() {
  const ready = useReady();
  if (!ready)
    return (
      <>
        <main className="app-body" data-screen="entrainement" aria-busy="true" />
        <div className="app-foot">
          <BottomNav active="entrainement" />
        </div>
      </>
    );
  return <TrainingChoose />;
}

function TrainingChoose() {
  const progress = useProgress();
  const pool = trainingPool(progress);
  const [mode, setMode] = useState<'tout' | 'choix'>('tout');
  const [picked, setPicked] = useState<string[]>([]);
  const nav = (
    <div className="app-foot">
      {pool.length > 0 && <Foot mode={mode} pool={pool} picked={picked} />}
      <BottomNav active="entrainement" />
    </div>
  );

  if (pool.length === 0)
    return (
      <>
        <main className="app-body" data-screen="entrainement">
          <header className="top">
            <h1 className="t-h2">Entraînement</h1>
          </header>
          <section className="card empty">
            <h2 className="t-h4">Rien à travailler pour l'instant</h2>
            <p className="t-body2">L'entraînement s'ouvre dès que tu as validé un cours.</p>
            <button className="btn btn--outlined" type="button" onClick={() => go('#/cours')}>
              Aller aux cours
            </button>
          </section>
        </main>
        {nav}
      </>
    );

  const module = MODULES.find((m) => !progress.modules[m.id]?.done) ?? MODULES[0]!;
  const coming = comingText(module.courseIds.filter((id) => !pool.includes(id)).map((id) => getCourse(id).order));
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <>
      <main className="app-body" data-screen="entrainement">
        <header className="top">
          <h1 className="t-h2">Entraînement</h1>
        </header>
        <p className="t-body2">Pratique libre sur les cours que tu as validés. Les questions mélangent les trois niveaux.</p>
        <div className="toggle-group" role="group" aria-label="Quoi travailler">
          {(['tout', 'choix'] as const).map((m) => (
            <button key={m} className={`toggle${mode === m ? ' is-selected' : ''}`} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
              {m === 'tout' ? 'Tout mélangé' : 'Mes cours'}
            </button>
          ))}
        </div>
        {mode === 'tout' ? (
          <section className="stack" aria-label="Cours retenus">
            <h2 className="t-h6">Cours retenus</h2>
            <div className="tchoice">
              {pool.map((id) => (
                <span key={id} className="chip chip--selected">
                  Cours {getCourse(id).order}
                </span>
              ))}
            </div>
          </section>
        ) : (
          <section className="stack">
            <h2 className="t-h6">Choisis les cours à travailler</h2>
            <div className="list">
              {pool.map((id) => {
                const c = progress.courses[id]!;
                const retry = c.status === 'a-rattraper';
                return (
                  <label key={id} className="list-item">
                    <span className="check">
                      <input type="checkbox" checked={picked.includes(id)} onChange={() => toggle(id)} aria-label={`Cours ${getCourse(id).order}${retry ? ', à valider' : ''}`} />
                    </span>
                    <span className="list-item__text">
                      <span className="list-item__title">{courseLabel(id)}</span>
                      {retry && (
                        <span className="status status--retry">
                          <Icon name="review" size="sm" />À valider
                        </span>
                      )}
                    </span>
                    {!retry && (
                      <span className="list-item__trail">
                        <Stars n={c.stars} />
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        )}
        <p className="t-caption">
          {coming && `${coming} `}L'entraînement ne change pas tes révisions : un cours se révise le jour prévu, sur l'accueil.
        </p>
      </main>
      {nav}
    </>
  );
}

/** La série : 10 questions dans le déroulé commun ; à la fin (ou à la croix), retour à l'entraînement. */
export function TrainingSeries({ rng }: { rng?: Rng }) {
  // Le choix est consommé une fois : revenir en arrière puis avancer ne relance pas une série périmée.
  const [choice] = useState(pending);
  const [items, setItems] = useState<QuestionItem[] | null | undefined>(undefined); // undefined : en cours de chargement
  // Tirée une seule fois, d'après la progression à jour (le repli du magasin peut ne pas être prêt à l'ouverture directe).
  useEffect(() => {
    if (!choice) {
      setItems(null);
      return;
    }
    let alive = true;
    void loadAll().then((events) => {
      if (!alive) return;
      pending = null;
      try {
        setItems(trainingSeries(foldProgress(events), choice, rng ?? Math.random));
      } catch {
        setItems(null);
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (items === null) go('#/entrainement');
  }, [items]);
  if (!items) return <main className="app-body" data-screen="entrainement-serie" />;
  return (
    <ActivityScreen
      kind="entrainement"
      items={items}
      chip={(step) => `Cours ${getCourse(step.item.courseId).order}, entraînement`}
      record
      onEnd={() => go('#/entrainement')}
      {...(rng ? { rng } : {})}
    />
  );
}
