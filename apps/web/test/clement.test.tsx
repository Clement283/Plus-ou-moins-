import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { buildQuestion, checkAnswer, feedbackFor, feedbackText, getCourse, seededRng, type ClementQuestion } from '@pom/engine';

const h = vi.hoisted(() => ({ questions: [] as any[], posted: [] as any[], read: [] as string[] }));
vi.mock('../src/api', async (orig) => {
  const real = await orig<typeof import('../src/api')>();
  return {
    ...real,
    postQuestion: vi.fn(async (_t: string, q: any) => void h.posted.push(q)),
    getMyQuestions: vi.fn(async () => h.questions),
    markQuestionRead: vi.fn(async (_t: string, id: string) => {
      h.read.push(id);
      h.questions = h.questions.map((q) => (q.id === id ? { ...q, readAt: 5 } : q));
    }),
    getEvents: vi.fn(async () => []),
    postEvents: vi.fn(async () => []),
  };
});

import { getDb, resetDb, SESSION_KEY } from '../src/store/db';
import { resetStore } from '../src/store/sync';
import { refreshQuestions, resetQuestions } from '../src/store/questions';
import { AskClement } from '../src/components/AskClement';
import { HomeBubble } from '../src/components/HomeBubble';
import { ClementCard } from '../src/components/ClementCard';
import Questions from '../src/screens/Questions';
import QuestionDetail from '../src/screens/QuestionDetail';

const USER = { token: 't', user: { id: 'u-a', name: 'Léa', role: 'eleve' as const } };
const course = getCourse('c01-additionner-meme-signe');
const question = buildQuestion(course, 'saisie', { rng: seededRng(3), level: 1 } as any);
const wrong = { raw: { tokens: [{ t: 'c', c: '9' }, { t: 'c', c: '9' }, { t: 'c', c: '9' }], cursor: 'root' } } as any;
const outcome = checkAnswer(course, question, wrong);
const sq = (over: Partial<ClementQuestion> = {}): ClementQuestion => ({
  id: 'q1', courseId: 'c01-additionner-meme-signe', calc: '−3 + (−5)', given: '8', expected: '−8', correction: 'Même signe.', note: null,
  askedAt: 1000, answer: null, answeredAt: null, answeredBy: null, readAt: null, ...over,
});

beforeEach(async () => {
  await resetDb();
  h.questions = [];
  h.posted = [];
  h.read = [];
  window.location.hash = '';
  await (await getDb()).put('session', USER, SESSION_KEY);
  resetStore();
  resetQuestions();
});
afterEach(() => cleanup());

const btn = (c: HTMLElement, re: RegExp) =>
  [...c.querySelectorAll<HTMLButtonElement>('button')].find((b) => re.test(b.textContent ?? '') || re.test(b.getAttribute('aria-label') ?? ''));

describe('feedbackText', () => {
  it('donne le texte brut d’une correction', () => {
    const f = feedbackFor(course, question, wrong, outcome);
    expect(feedbackText(f)).toContain(f.title);
  });
});

describe('Demander à Clément', () => {
  const mount = () => render(<AskClement courseId="c01-additionner-meme-signe" question={question} outcome={outcome} correction="Même signe." />);

  it('bouton discret, feuille avec résumé, envoi puis « Envoyé »', async () => {
    const v = mount();
    fireEvent.click(btn(v.container, /^Demander à Clément$/)!);
    expect(document.body.textContent).toContain('Ta réponse');
    expect(document.body.textContent).toContain('Même signe.');
    fireEvent.change(document.querySelector('textarea')!, { target: { value: 'Je ne comprends pas.' } });
    await act(async () => void fireEvent.click(btn(document.body, /Envoyer à Clément/)!));
    await waitFor(() => expect(h.posted).toHaveLength(1));
    expect(h.posted[0]).toMatchObject({ courseId: 'c01-additionner-meme-signe', note: 'Je ne comprends pas.', correction: 'Même signe.' });
    expect(document.body.textContent).toContain('Envoyé. Clément te répondra ici.');
    expect(btn(v.container, /^Envoyé$/)).toBeTruthy();
  });

  it('un mot vide part sans note ; un mot de 501 caractères est bloqué', async () => {
    const v = mount();
    fireEvent.click(btn(v.container, /^Demander à Clément$/)!);
    fireEvent.change(document.querySelector('textarea')!, { target: { value: 'x'.repeat(501) } });
    expect(btn(document.body, /Envoyer à Clément/)!.disabled).toBe(true);
    fireEvent.change(document.querySelector('textarea')!, { target: { value: '  ' } });
    await act(async () => void fireEvent.click(btn(document.body, /Envoyer à Clément/)!));
    await waitFor(() => expect(h.posted).toHaveLength(1));
    expect(h.posted[0].note).toBeNull();
  });

  it('le prénom vient de la dernière réponse reçue', async () => {
    h.questions = [sq({ answer: 'Voilà', answeredAt: 2, answeredBy: 'Claire', readAt: 3 })];
    const v = mount();
    await act(async () => void (await refreshQuestions()));
    await waitFor(() => expect(btn(v.container, /^Demander à Claire$/)).toBeTruthy());
  });
});

describe('accueil', () => {
  it('bulle grise sans nouveauté, colorée avec réponse non lue, ouvre Mes questions', async () => {
    const v = render(<HomeBubble />);
    const b = () => v.container.querySelector<HTMLElement>('button')!;
    expect(b().dataset.unread).toBeUndefined();
    h.questions = [sq({ answer: 'Voilà', answeredAt: 2, answeredBy: 'Clément' })];
    await act(async () => void (await refreshQuestions()));
    await waitFor(() => expect(b().dataset.unread).toBe('true'));
    fireEvent.click(b());
    expect(window.location.hash).toBe('#/questions');
  });

  it('la carte n’apparaît que si réponse non lue, et disparaît après lecture', async () => {
    const v = render(<ClementCard />);
    await act(async () => void (await refreshQuestions()));
    expect(v.container.textContent).toBe('');
    h.questions = [sq({ answer: 'Voilà', answeredAt: 2, answeredBy: 'Clément' })];
    await act(async () => void (await refreshQuestions()));
    await waitFor(() => expect(v.container.textContent).toContain('Clément a répondu à ta question'));
    const d = render(<QuestionDetail id="q1" />);
    await waitFor(() => expect(h.read).toEqual(['q1']));
    d.unmount();
    await waitFor(() => expect(v.container.textContent).toBe(''));
  });
});

describe('Mes questions', () => {
  it('liste les questions avec leur réponse et « Pas encore de réponse »', async () => {
    h.questions = [
      sq({ id: 'q1', askedAt: 2000, answer: 'Les deux sont négatifs.', answeredAt: 3000, answeredBy: 'Clément', readAt: 4 }),
      sq({ id: 'q2', askedAt: 1000, calc: '−6 + (−2)' }),
    ];
    const v = render(<Questions />);
    await waitFor(() => expect(v.container.textContent).toContain('Les deux sont négatifs.'));
    expect(v.container.textContent).toContain('−6 + (−2)');
    expect(v.container.textContent).toContain('Pas encore de réponse');
  });

  it('le détail montre la question et la réponse', async () => {
    h.questions = [sq({ answer: 'Les deux sont négatifs.', answeredAt: 3000, answeredBy: 'Clément' })];
    const v = render(<QuestionDetail id="q1" />);
    await waitFor(() => expect(v.container.textContent).toContain('Les deux sont négatifs.'));
    expect(v.container.textContent).toContain('−3 + (−5)');
  });
});
