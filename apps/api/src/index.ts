import { Hono } from 'hono';
import { newToken, requireAuth, sha256Hex, type AppEnv, type AuthUser } from './auth';
import { eventsRoutes } from './routes/events';
import { studentsRoutes } from './routes/students';
import { assets } from './assets.generated';
import { serveStatic } from './static';

const app = new Hono<AppEnv>();

app.post('/api/login', async (c) => {
  const body: unknown = await c.req.json().catch(() => null);
  const raw = (body as { code?: unknown } | null)?.code;
  if (typeof raw !== 'string' || raw.trim() === '') return c.json({ error: 'unauthorized' }, 401);
  // Les codes sont en majuscules : on tolère espaces et minuscules à la saisie du code (pas un calcul).
  const user = await c.env.DB.prepare('SELECT id, name, role FROM users WHERE code_hash = ?')
    .bind(await sha256Hex(raw.trim().toUpperCase()))
    .first<AuthUser>();
  if (!user) return c.json({ error: 'unauthorized' }, 401);
  const token = newToken();
  await c.env.DB.prepare('INSERT INTO tokens (token_hash, user_id, created_at) VALUES (?, ?, ?)')
    .bind(await sha256Hex(token), user.id, Date.now())
    .run();
  return c.json({ token, user });
});

app.use('/api/events/*', requireAuth);
app.use('/api/events', requireAuth);
app.use('/api/students/*', requireAuth);
app.use('/api/students', requireAuth);
app.route('/api/events', eventsRoutes);
app.route('/api/students', studentsRoutes);

app.all('/api/*', (c) => c.json({ error: 'not found' }, 404));

// Hors /api : fichiers de la PWA embarqués dans le Worker (assets.generated.ts), repli SPA.
app.all('*', (c) => serveStatic(c.req.raw, assets));

export default app;
