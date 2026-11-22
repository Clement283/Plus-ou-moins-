import { env, SELF } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';
import type { AppEvent } from '@pom/engine';
import { sha256Hex } from '../src/auth';

async function seedUser(id: string, name: string, role: 'eleve' | 'suiveur', code: string) {
  await env.DB.prepare('INSERT INTO users (id, name, role, code_hash, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, name, role, await sha256Hex(code), 1)
    .run();
}

async function login(code: string): Promise<string> {
  const res = await SELF.fetch('https://x/api/login', post({ code }));
  expect(res.status).toBe(200);
  return ((await res.json()) as { token: string }).token;
}

function post(body: unknown, token?: string): RequestInit {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  };
}
const auth = (token: string): RequestInit => ({ headers: { authorization: `Bearer ${token}` } });

function ev(id: string, userId: string, at: number): AppEvent {
  return { id, userId, at, day: '2026-11-22', kind: 'activity_end', activityId: 'a1', activity: 'lecon', moduleId: 'relatifs', courseId: null, completed: true };
}

beforeEach(async () => {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM events'),
    env.DB.prepare('DELETE FROM tokens'),
    env.DB.prepare('DELETE FROM follows'),
    env.DB.prepare('DELETE FROM users'),
  ]);
  await seedUser('u1', 'Alice', 'eleve', 'AAAA2222');
  await seedUser('u2', 'Bob', 'eleve', 'BBBB3333');
  await seedUser('s1', 'Prof', 'suiveur', 'SSSS4444');
  await env.DB.prepare('INSERT INTO follows (suiveur_id, eleve_id) VALUES (?, ?)').bind('s1', 'u1').run();
});

describe('login', () => {
  it('bon code -> token; mauvais -> 401', async () => {
    const ok = await SELF.fetch('https://x/api/login', post({ code: 'AAAA2222' }));
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { token: string; user: unknown };
    expect(body.token).toMatch(/^[0-9a-f]{64}$/);
    expect(body.user).toEqual({ id: 'u1', name: 'Alice', role: 'eleve' });
    expect((await SELF.fetch('https://x/api/login', post({ code: 'ZZZZ9999' }))).status).toBe(401);
    expect((await SELF.fetch('https://x/api/login', post({}))).status).toBe(401);
  });

  it('le jeton est stocke hache, jamais en clair', async () => {
    const token = await login('AAAA2222');
    const rows = await env.DB.prepare('SELECT token_hash FROM tokens').all<{ token_hash: string }>();
    expect(rows.results.map((r) => r.token_hash)).toEqual([await sha256Hex(token)]);
  });
});

describe('POST /api/events', () => {
  it('meme lot deux fois -> 1 ligne par id; les deux reponses listent tous les ids', async () => {
    const token = await login('AAAA2222');
    const batch = { events: [ev('e1', 'u1', 10), ev('e2', 'u1', 20)] };
    const r1 = await SELF.fetch('https://x/api/events', post(batch, token));
    const r2 = await SELF.fetch('https://x/api/events', post(batch, token));
    expect(r1.status).toBe(200);
    expect(await r1.json()).toEqual({ accepted: ['e1', 'e2'] });
    expect(await r2.json()).toEqual({ accepted: ['e1', 'e2'] });
    const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM events').first<{ n: number }>();
    expect(count?.n).toBe(2);
  });

  it("userId d'un autre -> 403; objet invalide -> 400", async () => {
    const token = await login('AAAA2222');
    expect((await SELF.fetch('https://x/api/events', post({ events: [ev('e1', 'u2', 1)] }, token))).status).toBe(403);
    expect((await SELF.fetch('https://x/api/events', post({ events: [{ foo: 1 }] }, token))).status).toBe(400);
    expect((await SELF.fetch('https://x/api/events', post({ events: [ev('', 'u1', 1)] }, token))).status).toBe(400);
    expect((await SELF.fetch('https://x/api/events', post({ events: [{ ...ev('e1', 'u1', 1), activityId: '' }] }, token))).status).toBe(400);
    expect((await SELF.fetch('https://x/api/events', post({ events: 'nope' }, token))).status).toBe(400);
    const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM events').first<{ n: number }>();
    expect(count?.n).toBe(0);
  });

  it('plus de 500 evenements -> 400; 500 -> accepte', async () => {
    const token = await login('AAAA2222');
    const mk = (n: number) => Array.from({ length: n }, (_, i) => ev(`e${i}`, 'u1', i));
    expect((await SELF.fetch('https://x/api/events', post({ events: mk(501) }, token))).status).toBe(400);
    const ok = await SELF.fetch('https://x/api/events', post({ events: mk(500) }, token));
    expect(ok.status).toBe(200);
    expect(((await ok.json()) as { accepted: string[] }).accepted).toHaveLength(500);
  });

  it('sans jeton -> 401; suiveur -> 403', async () => {
    expect((await SELF.fetch('https://x/api/events', post({ events: [] }))).status).toBe(401);
    const s = await login('SSSS4444');
    expect((await SELF.fetch('https://x/api/events', post({ events: [ev('e1', 's1', 1)] }, s))).status).toBe(403);
  });
});

describe('GET /api/events', () => {
  it('uniquement les miens, tries par at', async () => {
    const a = await login('AAAA2222');
    const b = await login('BBBB3333');
    await SELF.fetch('https://x/api/events', post({ events: [ev('e3', 'u1', 30), ev('e1', 'u1', 10), ev('e2', 'u1', 20)] }, a));
    await SELF.fetch('https://x/api/events', post({ events: [ev('b1', 'u2', 5)] }, b));
    const res = await SELF.fetch('https://x/api/events', auth(a));
    const body = (await res.json()) as { events: AppEvent[] };
    expect(body.events.map((e) => e.id)).toEqual(['e1', 'e2', 'e3']);
    expect(body.events[0]).toEqual(ev('e1', 'u1', 10));
    expect((await SELF.fetch('https://x/api/events')).status).toBe(401);
  });
});

describe('students', () => {
  beforeEach(async () => {
    const a = await login('AAAA2222');
    await SELF.fetch('https://x/api/events', post({ events: [ev('e1', 'u1', 10)] }, a));
    const b = await login('BBBB3333');
    await SELF.fetch('https://x/api/events', post({ events: [ev('b1', 'u2', 10)] }, b));
  });

  it('GET /api/students/:id/events: suiveur lie 200; non lie 403; eleve 403', async () => {
    const s = await login('SSSS4444');
    const linked = await SELF.fetch('https://x/api/students/u1/events', auth(s));
    expect(linked.status).toBe(200);
    expect(((await linked.json()) as { events: AppEvent[] }).events.map((e) => e.id)).toEqual(['e1']);
    expect((await SELF.fetch('https://x/api/students/u2/events', auth(s))).status).toBe(403);
    const a = await login('AAAA2222');
    expect((await SELF.fetch('https://x/api/students/u1/events', auth(a))).status).toBe(403);
  });

  it('GET /api/students: le suiveur voit ses eleves; un eleve -> 403', async () => {
    const s = await login('SSSS4444');
    const res = await SELF.fetch('https://x/api/students', auth(s));
    expect(await res.json()).toEqual({ students: [{ id: 'u1', name: 'Alice' }] });
    const a = await login('AAAA2222');
    expect((await SELF.fetch('https://x/api/students', auth(a))).status).toBe(403);
  });
});
