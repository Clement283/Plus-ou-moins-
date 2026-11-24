import { useEffect, useMemo, useState } from 'react';
import { courseRunItems, getCourse, lessonStep, rattrapageItems, resultOfTally, runErrors, runResult, type ActivityItem, type CurrentStep, type Rng, type RunResult } from '@pom/engine';
import { go } from '../router';
import { FOLD_WAIT_MS } from '../store/foldcache';
import { useProgress } from '../store/progress';
import { useEvents } from '../store/sync';
import type { StepResult } from '../ui/Stepper';
import { AppBar } from '../ui/AppBar';
import { ActivityScreen, type ChipPosition, type FirstAnswer } from './Activity';
import { RunResultView } from './CourseResult';

/**
 * Les trois activités d'un cours : le cours complet (`#/cours/:id`), le rattrapage (`#/rattrapage/:id`)
 * et « relire la leçon » (`#/cours/:id/relire`, rien n'est enregistré). Docs 01 §2, 08 n° 4 à 6, 16 et 17.
 */
const QUIT_COURSE = { title: 'Quitter le cours ?', body: 'Tu le reprendras depuis le début.' };
const QUIT_RATTRAPAGE = { title: 'Quitter la série de validation ?', body: 'Tu recommenceras une nouvelle série de 5.' };

const itemNumber = (step: CurrentStep) => Number(step.item.itemId.split('-')[1] ?? 0);

/** Pastille de contexte du cours : « Cours 4, leçon », « …, exemple guidé 1 sur 2 », « …, exercice 2 sur 5 ». */
function courseChip(courseId: string) {
  const course = getCourse(courseId);
  const guided = course.parts.filter((p) => p.type === 'question' && p.activity === 'exemple').length;
  return (step: CurrentStep, _pos: ChipPosition): string => {
    if (step.type === 'question' && step.item.texts?.series) return `Cours ${course.order} · Pratique`;
    if (step.type === 'question' && step.item.activity === 'exemple') {
      const rank = course.parts.slice(0, itemNumber(step)).filter((p) => p.type === 'question' && p.activity === 'exemple').length + 1;
      return `Cours ${course.order}, exemple guidé ${rank} sur ${guided}`;
    }
    if (step.type === 'question' && step.item.activity === 'fin') return `Cours ${course.order}, exercice ${itemNumber(step) + 1} sur 5`;
    // un cours à leçon pas à pas (Cours 0) : l'étape, avec les parties qui partagent un écran comptées pour une seule
    if (course.lessonLength !== undefined) {
      const at = lessonStep(course, itemNumber(step));
      if (at) return `Cours ${course.order} · Leçon · étape ${at.n} sur ${at.total}`;
      return step.type === 'question' ? `Cours ${course.order} · À toi` : `Cours ${course.order} · Exercices de fin`;
    }
    return `Cours ${course.order}, leçon`;
  };
}

interface Ended {
  results: StepResult[];
  firsts: FirstAnswer[];
}

/** Résultat d'après les premières réponses gardées en mémoire par le déroulé (même règle : `resultOfTally`). */
export function memoryResult(courseId: string, all: FirstAnswer[]): RunResult {
  const firsts = all.filter((f) => f.activity !== 'decouverte'); // « pour découvrir » ne compte jamais
  const fin = firsts.filter((f) => f.activity === 'fin');
  return resultOfTally({ first: firsts.length, ok: firsts.filter((f) => f.correct).length, fin: fin.length, finOk: fin.filter((f) => f.correct).length }, courseId);
}

/**
 * Attend que le repli des événements contienne la série terminée, puis affiche le résultat (pas de flash).
 * Pendant l'attente la croix reste là ; si le repli ne suit pas (enregistrement en échec), on prend le résultat en mémoire.
 */
function Finished({ variant, courseId, activityId, ended, onRetry }: { variant: 'cours' | 'rattrapage'; courseId: string; activityId: string; ended: Ended; onRetry?: () => void }) {
  const progress = useProgress();
  const events = useEvents();
  const [late, setLate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLate(true), FOLD_WAIT_MS);
    return () => clearTimeout(t);
  }, []);
  const run = progress.journal.runs[`${activityId}|${courseId}`];
  const result = run?.done ? runResult(progress, activityId, courseId) : late ? memoryResult(courseId, ended.firsts) : null;
  if (!result) {
    return (
      <main className="app-body app-body--grow" data-screen="resultat" style={{ padding: 0, gap: 0 }}>
        <AppBar onClose={() => go('#/cours')} closeLabel="Fermer" />
      </main>
    );
  }
  return <RunResultView variant={variant} courseId={courseId} result={result} results={ended.results} errors={runErrors(events, activityId, courseId)} onRetry={onRetry} />;
}

export function CourseScreen({ courseId, rng }: { courseId: string; rng?: Rng }) {
  const course = getCourse(courseId);
  const items = useMemo(() => courseRunItems(course, rng ?? Math.random), [course, rng]);
  const [activityId] = useState(() => crypto.randomUUID());
  const [ended, setEnded] = useState<Ended | null>(null);
  if (ended) return <Finished variant="cours" courseId={courseId} activityId={activityId} ended={ended} />;
  return (
    <ActivityScreen
      kind="cours"
      items={items}
      chip={courseChip(courseId)}
      record
      confirmQuit={QUIT_COURSE}
      activityId={activityId}
      {...(rng ? { rng } : {})}
      onEnd={(_, completed, results, firsts) => (completed ? setEnded({ results, firsts: [...firsts] }) : go('#/cours'))}
    />
  );
}

export function RattrapageScreen({ courseId, rng }: { courseId: string; rng?: Rng }) {
  const course = getCourse(courseId);
  const [series, setSeries] = useState(0);
  const items = useMemo(() => rattrapageItems(course, rng ?? Math.random), [course, rng, series]); // eslint-disable-line react-hooks/exhaustive-deps
  const [activityId, setActivityId] = useState(() => crypto.randomUUID());
  const [ended, setEnded] = useState<Ended | null>(null);
  const retry = () => {
    setSeries((n) => n + 1);
    setActivityId(crypto.randomUUID());
    setEnded(null);
  };
  if (ended) return <Finished variant="rattrapage" courseId={courseId} activityId={activityId} ended={ended} onRetry={retry} />;
  return (
    <ActivityScreen
      key={activityId}
      kind="rattrapage"
      items={items}
      chip={(_, pos) => `Validation, ${pos.n} sur ${pos.total}`}
      record
      confirmQuit={QUIT_RATTRAPAGE}
      chipAction={{ label: 'Relire la leçon', onSelect: () => go({ name: 'relire', id: courseId }), confirm: QUIT_RATTRAPAGE }}
      activityId={activityId}
      {...(rng ? { rng } : {})}
      onEnd={(_, completed, results, firsts) => (completed ? setEnded({ results, firsts: [...firsts] }) : go('#/cours'))}
    />
  );
}

/** `part` : ne montre que cette partie de la leçon (« Relire la règle N »), toujours sans rien enregistrer. */
export function RelireScreen({ courseId, part, rng }: { courseId: string; part?: number; rng?: Rng }) {
  const course = getCourse(courseId);
  const items = useMemo((): ActivityItem[] => {
    const all = courseRunItems(course, rng ?? Math.random);
    if (part !== undefined) {
      const one = all.filter((i) => i.itemId === `partie-${part}`);
      if (one.length) return one;
    }
    return all.filter((i) => !(i.type === 'question' && i.activity === 'fin'));
  }, [course, rng, part]);
  return <ActivityScreen kind="cours" items={items} chip={courseChip(courseId)} record={false} onEnd={() => go('#/cours')} {...(rng ? { rng } : {})} />;
}
