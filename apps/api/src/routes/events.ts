import { Hono } from 'hono';
import { isAppEvent, type AppEvent } from '@pom/engine';
import { requireRole, type AppEnv } from '../auth';

export const MAX_BATCH = 500;

/** Rejette aussi les chaînes vides, que isAppEvent accepte. */
function isValid(e: unknown): e is AppEvent {
  if (!isAppEvent(e)) return false;
  if (e.id === '' || e.userId === '') return false;
  if ('activityId' in e && e.activityId === '') return false;
  return true;
}

export async function listEvents(db: D1Database, userId: string): Promise<AppEvent[]> {
  const rows = await db
    .prepare('SELECT payload FROM events WHERE user_id = ? ORDER BY at, id')
    .bind(userId)
    .all<{ payload: string }>();
  return rows.results.map((r) => JSON.parse(r.payload) as AppEvent);
}

export const eventsRoutes = new Hono<AppEnv>();

eventsRoutes.post('/', async (c) => {
  const user = c.get('user');
  if (!requireRole(c, 'eleve')) return c.json({ error: 'forbidden' }, 403);
  const body: unknown = await c.req.json().catch(() => null);
  const events = (body as { events?: unknown } | null)?.events;
  if (!Array.isArray(events) || events.length > MAX_BATCH) return c.json({ error: 'invalid batch' }, 400);
  if (!events.every(isValid)) return c.json({ error: 'invalid event' }, 400);
  if (events.some((e) => e.userId !== user.id)) return c.json({ error: 'forbidden' }, 403);
  if (events.length > 0) {
    // Idempotent : un id déjà présent est ignoré, et reste listé dans `accepted`.
    const insert = c.env.DB.prepare(
      'INSERT OR IGNORE INTO events (id, user_id, at, day, kind, payload) VALUES (?, ?, ?, ?, ?, ?)',
    );
    await c.env.DB.batch(
      events.map((e) => insert.bind(e.id, user.id, e.at, e.day, e.kind, JSON.stringify(e))),
    );
  }
  return c.json({ accepted: events.map((e) => e.id) });
});

eventsRoutes.get('/', async (c) => c.json({ events: await listEvents(c.env.DB, c.get('user').id) }));
