import { createRoot } from 'react-dom/client';
import App from './App';
import './theme.css';
import { startSync } from './store/sync';

startSync();

createRoot(document.getElementById('root')!).render(<App />);
