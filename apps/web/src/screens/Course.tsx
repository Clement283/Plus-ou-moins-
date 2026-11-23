import { useMemo, useState } from 'react';
import { courseRunItems, getCourse, rattrapageItems, runResult, type ActivityItem, type CurrentStep, type Rng, type RunResult } from '@pom/engine';
import { go } from '../router';
import { useProgress } from '../store/progress';
import type { StepResult } from '../ui/Stepper';
import { ActivityScreen, type ChipPosition } from './Activity';
import { RunResultView } from './CourseResult';

/**
 * Les trois activités d'un cours : le cours complet (`#/cours/:id`), le rattrapage (`#/rattrapage/:id`)
 * et « relire la leçon » (`#/cours/:id/relire`, rien n'est enregistré). Docs 01 §2, 08 n° 4 à 6, 16 et 17.
 */
const QUIT_COURSE = { title: 'Quitter le cours ?', body: 'Tu le reprendras depuis le début.' };
const QUIT_RATTRAPAGE = { title: 'Quitter le rattrapage ?', body: 'Tu recommenceras une nouvelle série de 5.' };

const itemNumber = (step: CurrentStep) => Number(step.item.itemId.split('-')[1] ?? 0);

/** Pastille de contexte du cours : « Cours 4, leçon », « …, exemple guidé 1 sur 2 », « …, exercice 2 sur 5 ». */
function courseChip(courseId: string) {
  const course = getCourse(courseId);
  const guided = course.parts.filter((p) => p.type === 'question' && p.activity === 'exemple').length;
  return (step: CurrentStep, _pos: ChipPosition): string => {
    if (step.type === 'question' && step.item.activity === 'exemple') {
      const rank = course.parts.slice(0, itemNumber(step)).filter((p) => p.type === 'question' && p.activity === 'exemple').length + 1;
      return `Cours ${course.order}, exemple guidé ${rank} sur ${guided}`;
    }
    if (step.type === 'question' && step.item.activity === 'fin') return `Cours ${course.order}, exercice ${itemNumber(step) + 1} sur 5`;
    return `Cours ${course.order}, leçon`;
  };
}

/** Attend que le repli des événements contienne la série terminée, puis affiche le résultat (pas de flash). */
function Finished({ variant, courseId, activityId, results, onRetry }: { variant: 'cours' | 'rattrapage'; courseId: string; activityId: string; results: StepResult[]; onRetry?: () => void }) {
  const progress = useProgress();
  const run = progress.journal.runs[`${activityId}|${courseId}`];
  let result: RunResult | null = null;
  if (run?.done) result = runResult(progress, activityId, courseId);
  if (!result) return <main className="app-body app-body--grow" data-screen="resultat" />;
  return <RunResultView variant={variant} courseId={courseId} result={result} results={results} onRetry={onRetry} />;
}

export function CourseScreen({ courseId, rng }: { courseId: string; rng?: Rng }) {
  const course = getCourse(courseId);
  const items = useMemo(() => courseRunItems(course, rng ?? Math.random), [course, rng]);
  const [activityId] = useState(() => crypto.randomUUID());
  const [ended, setEnded] = useState<StepResult[] | null>(null);
  if (ended) return <Finished variant="cours" courseId={courseId} activityId={activityId} results={ended} />;
  return (
    <ActivityScreen
      kind="cours"
      items={items}
      chip={courseChip(courseId)}
      record
      confirmQuit={QUIT_COURSE}
      activityId={activityId}
      {...(rng ? { rng } : {})}
      onEnd={(_, completed, results) => (completed ? setEnded(results) : go('#/cours'))}
    />
  );
}

export function RattrapageScreen({ courseId, rng }: { courseId: string; rng?: Rng }) {
  const course = getCourse(courseId);
  const [series, setSeries] = useState(0);
  const items = useMemo(() => rattrapageItems(course, rng ?? Math.random), [course, rng, series]); // eslint-disable-line react-hooks/exhaustive-deps
  const [activityId, setActivityId] = useState(() => crypto.randomUUID());
  const [ended, setEnded] = useState<StepResult[] | null>(null);
  const retry = () => {
    setSeries((n) => n + 1);
    setActivityId(crypto.randomUUID());
    setEnded(null);
  };
  if (ended) return <Finished variant="rattrapage" courseId={courseId} activityId={activityId} results={ended} onRetry={retry} />;
  return (
    <ActivityScreen
      key={activityId}
      kind="rattrapage"
      items={items}
      chip={(_, pos) => `Rattrapage, ${pos.n} sur ${pos.total}`}
      record
      confirmQuit={QUIT_COURSE}
      chipAction={{ label: 'Relire la leçon', onSelect: () => go({ name: 'relire', id: courseId }), confirm: QUIT_RATTRAPAGE }}
      activityId={activityId}
      {...(rng ? { rng } : {})}
      onEnd={(_, completed, results) => (completed ? setEnded(results) : go('#/cours'))}
    />
  );
}

export function RelireScreen({ courseId, rng }: { courseId: string; rng?: Rng }) {
  const course = getCourse(courseId);
  const items = useMemo((): ActivityItem[] => courseRunItems(course, rng ?? Math.random).filter((i) => !(i.type === 'question' && i.activity === 'fin')), [course, rng]);
  return <ActivityScreen kind="cours" items={items} chip={courseChip(courseId)} record={false} onEnd={() => go('#/cours')} {...(rng ? { rng } : {})} />;
}
