import { createRoot } from 'react-dom/client';
import '@fontsource/lexend/latin-400.css';
import '@fontsource/lexend/latin-500.css';
import '@fontsource/lexend/latin-600.css';
import '@fontsource/lexend/latin-700.css';
import App from './App';
import './theme.css';
import './styles/line.css';
import './styles/etapes.css';
import './styles/series.css';
import './styles/autres.css';
import './styles/memo.css';
import './styles/warmup.css';
import './styles/questions.css';
import './styles/intervalle.css';
import './styles/ecrire.css';
import './styles/listen.css';
import { startSync } from './store/sync';
import { followSystemTheme } from './theme';
import { registerSW } from 'virtual:pwa-register';

followSystemTheme();
startSync();
// Nouvelle version en ligne : le service worker l'installe, puis la page se recharge toute seule.
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
