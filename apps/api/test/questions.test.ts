import { env, SELF } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ClementQuestion, NewClementQuestion } from '@pom/engine';
import { sha256Hex } from '../src/auth';

async function seedUser(id: string, name: string, role: 'eleve' | 'suiveur', code: string) {
  await env.DB.prepare('INSERT INTO users (id, name, role, code_hash, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, name, role, await sha256Hex(code), 1)
    .run();
}

function req(method: string, path: string, token?: string, body?: unknown): Promise<Response> {
  return SELF.fetch(`https://x${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

async function login(code: string): Promise<string> {
  const res = await req('POST', '/api/login', undefined, { code });
  return ((await res.json()) as { token: string }).token;
}

const q = (id: string, over: Partial<NewClementQuestion> = {}): NewClementQuestion => ({
  id,
  courseId: 'c01',
  calc: '−2 + (−5)',
  given: '7',
  expected: '−7',
  correction: 'Deux négatifs : on additionne et on garde le moins.',
  note: null,
  askedAt: 1000,
  ...over,
});

let alice: string;
let bob: string;
let prof: string;
let autre: string;

beforeEach(async () => {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM questions'),
    env.DB.prepare('DELETE FROM events'),
    env.DB.prepare('DELETE FROM tokens'),
    env.DB.prepare('DELETE FROM follows'),
    env.DB.prepare('DELETE FROM users'),
  ]);
  await seedUser('u1', 'Alice', 'eleve', 'AAAA2222');
  await seedUser('u2', 'Bob', 'eleve', 'BBBB3333');
  await seedUser('s1', 'Clément', 'suiveur', 'SSSS4444');
  await seedUser('s2', 'Autre', 'suiveur', 'SSSS5555');
  await env.DB.prepare('INSERT INTO follows (suiveur_id, eleve_id) VALUES (?, ?)').bind('s1', 'u1').run();
  alice = await login('AAAA2222');
  bob = await login('BBBB3333');
  prof = await login('SSSS4444');
  autre = await login('SSSS5555');
});

const count = async () => (await env.DB.prepare('SELECT COUNT(*) AS n FROM questions').first<{ n: number }>())!.n;
const listOf = async (path: string, token: string) =>
  ((await (await req('GET', path, token)).json()) as { questions: ClementQuestion[] }).questions;

describe('questions : accès', () => {
  it('401 sans jeton sur les 5 routes', async () => {
    for (const [m, p] of [
      ['POST', '/api/questions'],
      ['GET', '/api/questions'],
      ['POST', '/api/questions/x/read'],
      ['GET', '/api/students/u1/questions'],
      ['POST', '/api/students/u1/questions/x/answer'],
    ] as const) {
      expect((await req(m, p, undefined, m === 'POST' ? {} : undefined)).status, `${m} ${p}`).toBe(401);
    }
  });
  it('un suiveur ne peut pas créer (403)', async () => {
    expect((await req('POST', '/api/questions', prof, q('a'))).status).toBe(403);
  });
  it('un élève ne peut pas répondre (403)', async () => {
    await req('POST', '/api/questions', alice, q('a'));
    expect((await req('POST', '/api/students/u1/questions/a/answer', alice, { answer: 'Salut' })).status).toBe(403);
  });
});

describe('questions : élève', () => {
  it('crée (200) ; le même id rejoué = 200 sans doublon', async () => {
    expect((await req('POST', '/api/questions', alice, q('a'))).status).toBe(200);
    expect((await req('POST', '/api/questions', alice, q('a'))).status).toBe(200);
    expect(await count()).toBe(1);
  });
  it('même id par un autre élève -> 409', async () => {
    await req('POST', '/api/questions', alice, q('a'));
    expect((await req('POST', '/api/questions', bob, q('a'))).status).toBe(409);
    expect(await count()).toBe(1);
  });
  it('eleve_id vient du jeton, pas du corps', async () => {
    await req('POST', '/api/questions', alice, { ...q('a'), eleveId: 'u2', eleve_id: 'u2' });
    const row = await env.DB.prepare('SELECT eleve_id FROM questions WHERE id = ?').bind('a').first<{ eleve_id: string }>();
    expect(row?.eleve_id).toBe('u1');
  });
  it('note de 501 caractères -> 400', async () => {
    expect((await req('POST', '/api/questions', alice, q('a', { note: 'x'.repeat(501) }))).status).toBe(400);
    expect(await count()).toBe(0);
  });
  it('corps invalide -> 400', async () => {
    expect((await req('POST', '/api/questions', alice, { id: '' })).status).toBe(400);
  });
  it("l'élève B ne voit pas les questions de A ; A voit les siennes (récentes d'abord)", async () => {
    await req('POST', '/api/questions', alice, q('a', { askedAt: 1 }));
    await req('POST', '/api/questions', alice, q('b', { askedAt: 2 }));
    expect((await listOf('/api/questions', alice)).map((x) => x.id)).toEqual(['b', 'a']);
    expect(await listOf('/api/questions', bob)).toEqual([]);
  });
  it("l'élève B ne peut pas marquer lue la question de A (404)", async () => {
    await req('POST', '/api/questions', alice, q('a'));
    await req('POST', '/api/students/u1/questions/a/answer', prof, { answer: 'Voilà' });
    expect((await req('POST', '/api/questions/a/read', bob)).status).toBe(404);
  });
  it('read sur une question sans réponse -> 404', async () => {
    await req('POST', '/api/questions', alice, q('a'));
    expect((await req('POST', '/api/questions/a/read', alice)).status).toBe(404);
  });
});

describe('questions : suiveur', () => {
  it('le suiveur de A lit celles de A, avec le prénom de qui a répondu', async () => {
    await req('POST', '/api/questions', alice, q('a'));
    await req('POST', '/api/students/u1/questions/a/answer', prof, { answer: 'Voilà' });
    const list = await listOf('/api/students/u1/questions', prof);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 'a', answer: 'Voilà', answeredBy: 'Clément', readAt: null });
  });
  it('suiveur sans lien -> 403 sur la liste et sur la réponse', async () => {
    await req('POST', '/api/questions', alice, q('a'));
    expect((await req('GET', '/api/students/u1/questions', autre)).status).toBe(403);
    expect((await req('POST', '/api/students/u1/questions/a/answer', autre, { answer: 'Hop' })).status).toBe(403);
  });
  it("qid d'un autre élève -> 404", async () => {
    await req('POST', '/api/questions', bob, q('b'));
    expect((await req('POST', '/api/students/u1/questions/b/answer', prof, { answer: 'Hop' })).status).toBe(404);
  });
  it('réponse vide ou de 2001 caractères -> 400', async () => {
    await req('POST', '/api/questions', alice, q('a'));
    expect((await req('POST', '/api/students/u1/questions/a/answer', prof, { answer: '  ' })).status).toBe(400);
    expect((await req('POST', '/api/students/u1/questions/a/answer', prof, { answer: 'x'.repeat(2001) })).status).toBe(400);
    expect((await req('POST', '/api/students/u1/questions/a/answer', prof, {})).status).toBe(400);
  });
  it('réponse puis read -> readAt non nul ; nouvelle réponse -> readAt nul', async () => {
    await req('POST', '/api/questions', alice, q('a'));
    await req('POST', '/api/students/u1/questions/a/answer', prof, { answer: 'Un' });
    expect((await req('POST', '/api/questions/a/read', alice)).status).toBe(200);
    expect((await listOf('/api/questions', alice))[0]!.readAt).not.toBeNull();
    await req('POST', '/api/students/u1/questions/a/answer', prof, { answer: 'Deux' });
    const after = (await listOf('/api/questions', alice))[0]!;
    expect(after.readAt).toBeNull();
    expect(after.answer).toBe('Deux');
  });
});
