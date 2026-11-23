import { useEffect, useState } from 'react';
import { foldProgress, nextReviewSession, reviewItems, type ActivityItem, type ProgressState, type Rng } from '@pom/engine';
import { go } from '../router';
import { useToday } from '../store/progress';
import { loadAll } from '../store/sync';
import { ActivityScreen, type FirstAnswer } from './Activity';
import { ReviewSummary } from './ReviewSummary';

/**
 * Séance de révisions (`#/revisions` ; docs 01 §6, 02 §3, 08 n° 7 à 10) : 5 cours dus au plus, 3 questions chacun,
 * mêlées ; ni nom de cours ni leçon. Pas de confirmation en quittant : les cours non terminés restent dus (moteur).
 */
interface Run {
  activityId: string;
  items: ActivityItem[];
}

const start = (state: ProgressState, today: string, rng: Rng): Run | null => {
  const s = nextReviewSession(state, today, rng);
  return s ? { activityId: s.activityId, items: reviewItems(s) } : null;
};

export default function ReviewScreen({ rng }: { rng?: Rng }) {
  const today = useToday();
  const [run, setRun] = useState<Run | null>(null);
  const [firsts, setFirsts] = useState<FirstAnswer[] | null>(null);
  const [more, setMore] = useState(false);

  // À l'arrivée : la progression à jour (le repli d'abord chargé peut être vide), puis la séance ; rien de dû → accueil.
  useEffect(() => {
    let alive = true;
    void loadAll().then((events) => {
      if (!alive) return;
      const r = start(foldProgress(events), today, rng ?? Math.random);
      if (r) setRun(r);
      else go('#/');
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!run) return <main className="app-body app-body--grow" data-screen="revisions" />;
  if (firsts)
    return (
      <ReviewSummary
        key={run.activityId}
        activityId={run.activityId}
        firsts={firsts}
        onMore={() => {
          // Comme à l'arrivée : la progression à jour (la séance qui vient de finir y est), jamais le repli en mémoire.
          if (more) return;
          setMore(true);
          void loadAll().then((events) => {
            setMore(false);
            const r = start(foldProgress(events), today, rng ?? Math.random);
            if (!r) return go('#/');
            setRun(r);
            setFirsts(null);
          });
        }}
      />
    );
  return (
    <ActivityScreen
      key={run.activityId}
      kind="revision"
      items={run.items}
      chip={(_, pos) => `Révisions, question ${pos.n} sur ${pos.total}`}
      record
      activityId={run.activityId}
      {...(rng ? { rng } : {})}
      onEnd={(_, completed, _results, f) => (completed ? setFirsts([...f]) : go('#/'))}
    />
  );
}
