import { lazy, Suspense, useEffect, useRef } from 'react';
import { warmupDue } from '@pom/engine';
import { IconSprite } from './ui/icons';
import { go, useRoute } from './router';
import { useProgress, useReady, useSession, useToday } from './store/progress';
import { clearTestEvents, useEvents } from './store/sync';
import { setTestMode, useTestMode } from './store/testMode';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import DashModule from './screens/DashModule';
import DashCourse from './screens/DashCourse';
import EssaiClavier from './screens/EssaiClavier';
import Home from './screens/Home';
import Courses from './screens/Courses';
import Training, { TrainingSeries } from './screens/Training';
import Memo from './screens/Memo';
import Warmup from './screens/Warmup';
import Questions from './screens/Questions';
import QuestionDetail from './screens/QuestionDetail';
import SuiviQuestion from './screens/SuiviQuestion';
import Review from './screens/Review';
import { CourseScreen, RattrapageScreen, RelireScreen } from './screens/Course';

const ESSAI = import.meta.env.DEV || import.meta.env.VITE_ESSAI === '1';
/** Page d'essai chargée à la demande : absente du paquet de production (la condition est connue à la construction). */
const EssaiQuestions = ESSAI ? lazy(() => import('./screens/EssaiQuestions')) : null;
const EssaiRetour = ESSAI ? lazy(() => import('./screens/EssaiRetour')) : null;
const EssaiActivite = ESSAI ? lazy(() => import('./screens/EssaiActivite')) : null;
const EssaiCours = ESSAI ? lazy(() => import('./screens/EssaiCours')) : null;
const EssaiBilan = ESSAI ? lazy(() => import('./screens/EssaiBilan')) : null;
const EssaiLecon = ESSAI ? lazy(() => import('./screens/EssaiLecon')) : null;

/** Écran élève encore absent : composant vide temporaire (remplacé par les tâches 23 à 25). */
function Empty({ name }: { name: string }) {
  return <main className="app-body" data-screen={name} />;
}

/** Adresse inconnue ou interdite à cette personne : retour à son accueil. */
function Redirect({ to }: { to: string }) {
  useEffect(() => go(to), [to]);
  return null;
}

/** Échauffement : à la première ouverture du jour (une fois par chargement), l'accueil mène à l'écran dédié. */
function useWarmupGate(): void {
  const route = useRoute();
  const ready = useReady();
  const progress = useProgress();
  const events = useEvents();
  const today = useToday();
  const checked = useRef(false);
  useEffect(() => {
    if (!ready || checked.current) return;
    checked.current = true;
    if (route.name === 'accueil' && warmupDue(progress, events, today)) go('#/echauffement');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
}

function StudentRoutes() {
  const route = useRoute();
  useWarmupGate();
  if (route.name === 'suivi' || route.name === 'suivi-module' || route.name === 'suivi-cours' || route.name === 'suivi-question') return <Redirect to="#/" />;
  if (route.name === 'essai') {
    if (!ESSAI) return <Redirect to="#/" />;
    if (route.what === 'clavier') return <EssaiClavier />;
    if (EssaiQuestions && route.what.split('?')[0] === 'questions') return <Suspense fallback={null}><EssaiQuestions /></Suspense>;
    if (EssaiRetour && route.what.split('?')[0] === 'retour') return <Suspense fallback={null}><EssaiRetour /></Suspense>;
    if (EssaiLecon && route.what.split('?')[0] === 'lecon') return <Suspense fallback={null}><EssaiLecon /></Suspense>;
    if (EssaiCours && route.what.split('?')[0] === 'cours') return <Suspense fallback={null}><EssaiCours /></Suspense>;
    if (EssaiBilan && route.what.split('?')[0] === 'bilan') return <Suspense fallback={null}><EssaiBilan /></Suspense>;
    if (EssaiActivite && route.what.split('?')[0] === 'activite') return <Suspense fallback={null}><EssaiActivite /></Suspense>;
    return <Empty name={`essai-${route.what}`} />;
  }
  // `key` : chaque ouverture repart de zéro (un autre cours, une nouvelle série).
  if (route.name === 'cours-detail') return <CourseScreen key={route.id} courseId={route.id} />;
  if (route.name === 'rattrapage') return <RattrapageScreen key={route.id} courseId={route.id} />;
  if (route.name === 'relire') return <RelireScreen key={`${route.id}/${route.part ?? ''}`} courseId={route.id} {...(route.part === undefined ? {} : { part: route.part })} />;
  if (route.name === 'fiche') return <Memo key={route.id} courseId={route.id} />;
  if (route.name === 'echauffement') return <Warmup />;
  if (route.name === 'questions') return <Questions />;
  if (route.name === 'question') return <QuestionDetail key={route.id} id={route.id} />;
  if (route.name === 'accueil') return <Home />;
  if (route.name === 'cours') return <Courses />;
  if (route.name === 'entrainement') return <Training />;
  if (route.name === 'revisions') return <Review key="revisions" />;
  if (route.name === 'entrainement-serie') return <TrainingSeries key="serie" />;
  return <Redirect to="#/" />;
}

function FollowerRoutes() {
  const route = useRoute();
  if (route.name === 'suivi-module') return <DashModule key={route.eleve + route.id} eleve={route.eleve} id={route.id} />;
  if (route.name === 'suivi-cours') return <DashCourse key={route.eleve + route.id} eleve={route.eleve} id={route.id} />;
  if (route.name === 'suivi-question') return <SuiviQuestion key={route.eleve + route.id} eleve={route.eleve} id={route.id} />;
  if (route.name !== 'suivi') return <Redirect to="#/suivi" />;
  return <Dashboard />;
}

/** Un suiveur « aperçu » en mode test : l'appli de l'élève, avec un bandeau pour revenir au suivi. */
function TestRoutes() {
  const route = useRoute();
  // Fermer le cours ramène à l'accueil ou à « Mes cours » : les réponses du test sont effacées.
  useEffect(() => {
    if (route.name === 'accueil' || route.name === 'cours') clearTestEvents();
  }, [route.name]);
  return (
    <>
      <div className="test-bar" role="status">
        <span>Mode test</span>
        <button
          className="btn btn--text"
          type="button"
          onClick={() => {
            setTestMode(false);
            clearTestEvents();
            go({ name: 'suivi' });
          }}
        >
          Retour au suivi
        </button>
      </div>
      <StudentRoutes />
    </>
  );
}

export default function App() {
  const session = useSession();
  const testing = useTestMode();
  return (
    <>
      <IconSprite />
      {session === undefined ? null : session === null ? <Login /> : session.user.role === 'suiveur' ? session.user.apercu && testing ? <TestRoutes /> : <FollowerRoutes /> : <StudentRoutes />}
    </>
  );
}
