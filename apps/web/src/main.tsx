import { createRoot } from 'react-dom/client';
import '@fontsource/lexend/latin-400.css';
import '@fontsource/lexend/latin-500.css';
import '@fontsource/lexend/latin-600.css';
import '@fontsource/lexend/latin-700.css';
import App from './App';
import './theme.css';
import { startSync } from './store/sync';
import { followSystemTheme } from './theme';

followSystemTheme();
startSync();

createRoot(document.getElementById('root')!).render(<App />);
