import { Hono } from 'hono';
import { isNewClementQuestion, type ClementQuestion } from '@pom/engine';
import { requireRole, type AppEnv } from '../auth';

type Row = {
  id: string;
  course_id: string;
  calc: string;
  given: string;
  expected: string;
  correction: string;
  note: string | null;
  asked_at: number;
  answer: string | null;
  answered_at: number | null;
  answered_by_name: string | null;
  read_at: number | null;
};

/** `answeredBy` est le prénom (jointure users.name), jamais un identifiant. */
export async function listQuestions(db: D1Database, eleveId: string): Promise<ClementQuestion[]> {
  const rows = await db
    .prepare(
      `SELECT q.id, q.course_id, q.calc, q.given, q.expected, q.correction, q.note, q.asked_at,
              q.answer, q.answered_at, u.name AS answered_by_name, q.read_at
       FROM questions q LEFT JOIN users u ON u.id = q.answered_by
       WHERE q.eleve_id = ? ORDER BY q.asked_at DESC, q.id`,
    )
    .bind(eleveId)
    .all<Row>();
  return rows.results.map((r) => ({
    id: r.id,
    courseId: r.course_id,
    calc: r.calc,
    given: r.given,
    expected: r.expected,
    correction: r.correction,
    note: r.note,
    askedAt: r.asked_at,
    answer: r.answer,
    answeredAt: r.answered_at,
    answeredBy: r.answered_by_name,
    readAt: r.read_at,
  }));
}

export const questionsRoutes = new Hono<AppEnv>();

questionsRoutes.use('*', async (c, next) => {
  if (!requireRole(c, 'eleve')) return c.json({ error: 'forbidden' }, 403);
  await next();
});

questionsRoutes.post('/', async (c) => {
  const body: unknown = await c.req.json().catch(() => null);
  if (!isNewClementQuestion(body)) return c.json({ error: 'invalid' }, 400);
  const me = c.get('user').id;
  const existing = await c.env.DB.prepare('SELECT eleve_id FROM questions WHERE id = ?')
    .bind(body.id)
    .first<{ eleve_id: string }>();
  if (existing) return existing.eleve_id === me ? c.json({ ok: true }) : c.json({ error: 'conflict' }, 409);
  await c.env.DB.prepare(
    `INSERT OR IGNORE INTO questions (id, eleve_id, course_id, calc, given, expected, correction, note, asked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(body.id, me, body.courseId, body.calc, body.given, body.expected, body.correction, body.note, body.askedAt)
    .run();
  return c.json({ ok: true });
});

questionsRoutes.get('/', async (c) => c.json({ questions: await listQuestions(c.env.DB, c.get('user').id) }));

questionsRoutes.post('/:id/read', async (c) => {
  const res = await c.env.DB.prepare(
    'UPDATE questions SET read_at = ? WHERE id = ? AND eleve_id = ? AND answer IS NOT NULL',
  )
    .bind(Date.now(), c.req.param('id'), c.get('user').id)
    .run();
  if (!res.meta.changes) return c.json({ error: 'not found' }, 404);
  return c.json({ ok: true });
});
