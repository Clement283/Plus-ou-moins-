import type { RunResult } from '@pom/engine';
import { RunResultView } from './CourseResult';
import { useRoute } from '../router';
import type { StepResult } from '../ui/Stepper';

/**
 * Page d'essai des écrans de résultat (développement et captures seulement), avec des chiffres fixes :
 *   #/essai/cours?cas=valide|non-valide|rattrapage-ok|rattrapage-ko|dernier
 */
const mk = (r: Partial<RunResult>): RunResult => ({ validated: false, ok: 0, first: 0, finOk: 0, fin: 0, percent: 0, nextCourseId: null, firstReviewInHours: 48, ...r });
const steps = (total: number, bad: number[]): StepResult[] => Array.from({ length: total }, (_, i) => (bad.includes(i + 1) ? 'ko' : 'ok'));

export default function EssaiCours() {
  const route = useRoute();
  const cas = new URLSearchParams((route.name === 'essai' ? route.what : '').split('?')[1] ?? '').get('cas') ?? 'valide';
  switch (cas) {
    case 'non-valide':
      return <RunResultView variant="cours" courseId="c04-soustraire" results={steps(12, [5, 9, 11])} result={mk({ ok: 10, first: 12, finOk: 3, fin: 5, percent: 83 })} />;
    case 'rattrapage-ok':
      return <RunResultView variant="rattrapage" courseId="c04-soustraire" results={steps(5, [2])} result={mk({ validated: true, ok: 4, first: 5 })} />;
    case 'rattrapage-ko':
      return <RunResultView variant="rattrapage" courseId="c04-soustraire" results={steps(5, [2, 4])} result={mk({ ok: 3, first: 5 })} onRetry={() => undefined} />;
    case 'dernier':
      return <RunResultView variant="cours" courseId="c07-multiplier-plusieurs" results={steps(12, [])} result={mk({ validated: true, ok: 12, first: 12, finOk: 5, fin: 5, percent: 100 })} />;
    default:
      return <RunResultView variant="cours" courseId="c04-soustraire" results={steps(12, [5])} result={mk({ validated: true, ok: 11, first: 12, finOk: 5, fin: 5, percent: 92 })} />;
  }
}
