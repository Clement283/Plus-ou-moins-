import { Hono, type Context } from 'hono';
import { isAnswerText } from '@pom/engine';
import { requireRole, type AppEnv } from '../auth';
import { listEvents } from './events';
import { listQuestions } from './questions';

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

/** Le suiveur connecté suit-il cet élève ? */
async function assertFollows(c: Context<AppEnv>, eleveId: string): Promise<boolean> {
  const link = await c.env.DB.prepare('SELECT 1 AS ok FROM follows WHERE suiveur_id = ? AND eleve_id = ?')
    .bind(c.get('user').id, eleveId)
    .first();
  return !!link;
}

studentsRoutes.get('/:id/events', async (c) => {
  const id = c.req.param('id');
  if (!(await assertFollows(c, id))) return c.json({ error: 'forbidden' }, 403);
  return c.json({ events: await listEvents(c.env.DB, id) });
});

studentsRoutes.get('/:id/questions', async (c) => {
  const id = c.req.param('id');
  if (!(await assertFollows(c, id))) return c.json({ error: 'forbidden' }, 403);
  return c.json({ questions: await listQuestions(c.env.DB, id) });
});

studentsRoutes.post('/:id/questions/:qid/answer', async (c) => {
  const id = c.req.param('id');
  if (!(await assertFollows(c, id))) return c.json({ error: 'forbidden' }, 403);
  const body: unknown = await c.req.json().catch(() => null);
  const answer = (body as { answer?: unknown } | null)?.answer;
  if (!isAnswerText(answer)) return c.json({ error: 'invalid' }, 400);
  const res = await c.env.DB.prepare(
    'UPDATE questions SET answer = ?, answered_at = ?, answered_by = ?, read_at = NULL WHERE id = ? AND eleve_id = ?',
  )
    .bind(answer, Date.now(), c.get('user').id, c.req.param('qid'), id)
    .run();
  if (!res.meta.changes) return c.json({ error: 'not found' }, 404);
  return c.json({ ok: true });
});
