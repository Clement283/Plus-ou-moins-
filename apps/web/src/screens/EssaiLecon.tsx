import { QuestionView } from '../components/questions/QuestionView';
import { Etapes } from '../components/Etapes';
import { AutresFacons } from '../components/Autres';
import { LessonPartScreen } from '../components/LessonPart';
import { AppBar } from '../ui/AppBar';
import type { StepResult } from '../ui/Stepper';
import { getCourse } from '@pom/engine';
import { useRoute } from '../router';

/**
 * Page d'essai d'une partie de leçon (développement et captures seulement) :
 * `#/essai/lecon?course=c04&part=0`. Le cours se désigne par son préfixe (c00 à c07).
 */
const IDS = ['c00-bien-ecrire', 'c01-additionner-meme-signe', 'c02-additionner-signes-contraires', 'c03-additionner-plusieurs', 'c04-soustraire', 'c05-multiplier-deux', 'c06-diviser-deux', 'c07-multiplier-plusieurs'];

export default function EssaiLecon() {
  const route = useRoute();
  const q = new URLSearchParams((route.name === 'essai' ? route.what : '').split('?')[1] ?? '');
  const course = getCourse(IDS.find((i) => i.startsWith(q.get('course') ?? 'c04')) ?? IDS[4]!);
  const index = Math.min(Math.max(Number(q.get('part') ?? 0), 0), course.parts.length - 1);
  const part = course.parts[index]!;
  const header = <span className="chip chip--module">{`Cours ${course.order}, leçon`}</span>;
  const total = course.parts.length;
  const done = Array.from({ length: index }, (): StepResult => 'ok');
  return (
    <main className="app-body app-body--grow" data-screen="essai-lecon" style={{ padding: 0, gap: 0 }}>
      <AppBar onClose={() => history.back()} stepper={{ total, done, current: index }} />
      {part.type === 'explication' ? (
        <LessonPartScreen key={`${course.id}-${index}`} part={part} onNext={() => undefined} header={header} title={course.title} />
      ) : part.type === 'etapes' ? (
        <Etapes key={`${course.id}-${index}`} title={part.title} steps={part.steps} keep={course.unePhrase ? 1 : 2} onDone={() => undefined} header={header} />
      ) : part.type === 'autres' ? (
        <AutresFacons key={`${course.id}-${index}`} screen={part} onDone={() => undefined} header={header} />
      ) : part.type === 'pratique' ? (
        <p className="t-body1">Série de pratique : {part.questions.length} questions (écran ajouté par la tâche 9).</p>
      ) : (
        <QuestionView key={`${course.id}-${index}`} question={part.question} course={course} locked={false} onAnswer={() => undefined} header={<div className="row">{header}</div>} activity={part.activity} texts={{ ...(part.title ? { title: part.title } : {}), ...(part.subtitle ? { subtitle: part.subtitle } : {}), ...(part.consigne ? { consigne: part.consigne } : {}), ...(part.intro ? { intro: part.intro } : {}), ...(part.outro ? { outro: part.outro } : {}), ...(part.outroRule ? { outroRule: part.outroRule } : {}) }} />
      )}
    </main>
  );
}
