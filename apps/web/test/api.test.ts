import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, REQUEST_TIMEOUT_MS, answerQuestion, getEvents, getMyQuestions, getStudentQuestions, markQuestionRead, postQuestion } from '../src/api';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('api', () => {
  it('une requête sans réponse est abandonnée après le délai : ApiError(0), comme hors ligne', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => new Promise((_res, rej) => init.signal!.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError'))))),
    );
    const p = getEvents('t').catch((e) => e);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 10);
    const e = await p;
    expect(e).toBeInstanceOf(ApiError);
    expect((e as ApiError).status).toBe(0);
  });
});

describe('api « Demander à Clément »', () => {
  const stub = () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ questions: [], ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', f);
    return f;
  };
  const call = (f: ReturnType<typeof stub>) => {
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    return { url, method: init.method ?? 'GET', auth: (init.headers as Record<string, string>).authorization, body: init.body };
  };
  const q = { id: 'q1', courseId: 'c01', calc: '1', given: '2', expected: '3', correction: 'c', note: null, askedAt: 1 };

  it('postQuestion : POST /api/questions', async () => {
    const f = stub();
    await postQuestion('tok', q);
    expect(call(f)).toMatchObject({ url: '/api/questions', method: 'POST', auth: 'Bearer tok', body: JSON.stringify(q) });
  });
  it('getMyQuestions : GET /api/questions', async () => {
    const f = stub();
    expect(await getMyQuestions('tok')).toEqual([]);
    expect(call(f)).toMatchObject({ url: '/api/questions', method: 'GET', auth: 'Bearer tok' });
  });
  it('markQuestionRead : POST /api/questions/:id/read', async () => {
    const f = stub();
    await markQuestionRead('tok', 'a b');
    expect(call(f)).toMatchObject({ url: '/api/questions/a%20b/read', method: 'POST', auth: 'Bearer tok' });
  });
  it('getStudentQuestions : GET /api/students/:id/questions', async () => {
    const f = stub();
    await getStudentQuestions('tok', 'e1');
    expect(call(f)).toMatchObject({ url: '/api/students/e1/questions', method: 'GET', auth: 'Bearer tok' });
  });
  it('answerQuestion : POST …/questions/:qid/answer avec { answer }', async () => {
    const f = stub();
    await answerQuestion('tok', 'e1', 'q1', 'Bien vu');
    expect(call(f)).toMatchObject({ url: '/api/students/e1/questions/q1/answer', method: 'POST', auth: 'Bearer tok', body: JSON.stringify({ answer: 'Bien vu' }) });
  });
});
