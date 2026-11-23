import { IconSprite } from './ui/icons';
import { useRoute } from './router';
import { useSession } from './store/progress';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import EssaiClavier from './screens/EssaiClavier';

/** Écran élève encore absent : composant vide temporaire (remplacé par les tâches 23 à 25). */
function Empty({ name }: { name: string }) {
  return <main className="app-body" data-screen={name} />;
}

function StudentRoutes() {
  const route = useRoute();
  if (route.name === 'essai') {
    if (!(import.meta.env.DEV || import.meta.env.VITE_ESSAI === '1')) return <Empty name="accueil" />;
    return route.what === 'clavier' ? <EssaiClavier /> : <Empty name={`essai-${route.what}`} />;
  }
  return <Empty name={route.name} />;
}

export default function App() {
  const session = useSession();
  return (
    <>
      <IconSprite />
      {session === undefined ? null : session === null ? <Login /> : session.user.role === 'suiveur' ? <Dashboard /> : <StudentRoutes />}
    </>
  );
}
