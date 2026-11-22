import { Hono } from 'hono';
import { requireRole, type AppEnv } from '../auth';
import { listEvents } from './events';

export const studentsRoutes = new Hono<AppEnv>();

studentsRoutes.use('*', async (c, next) => {
  if (!requireRole(c, 'suiveur')) return c.json({ error: 'forbidden' }, 403);
  await next();
});

studentsRoutes.get('/', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT u.id, u.name FROM follows f JOIN users u ON u.id = f.eleve_id WHERE f.suiveur_id = ? ORDER BY u.name',
  )
    .bind(c.get('user').id)
    .all<{ id: string; name: string }>();
  return c.json({ students: rows.results });
});

studentsRoutes.get('/:id/events', async (c) => {
  const id = c.req.param('id');
  const link = await c.env.DB.prepare('SELECT 1 AS ok FROM follows WHERE suiveur_id = ? AND eleve_id = ?')
    .bind(c.get('user').id, id)
    .first();
  if (!link) return c.json({ error: 'forbidden' }, 403);
  return c.json({ events: await listEvents(c.env.DB, id) });
});
