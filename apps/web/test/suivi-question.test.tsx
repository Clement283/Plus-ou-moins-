import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({ list: [] as any[], answerStatus: 0, answer: undefined as any }));
vi.mock('../src/api', async (orig) => {
  const real = await orig<typeof import('../src/api')>();
  h.answer = vi.fn(async () => {
    if (h.answerStatus) throw new real.ApiError(h.answerStatus, 'x');
  });
  return { ...real, getStudentQuestions: vi.fn(async () => h.list), answerQuestion: h.answer };
});
vi.mock('../src/store/progress', () => ({
  useToday: () => '2026-11-22',
  useSession: () => ({ token: 't', user: { id: 'u-claire', name: 'Claire', role: 'suiveur' } }),
}));

import { resetDb } from '../src/store/db';
import SuiviQuestion from '../src/screens/SuiviQuestion';

const q = (over: Record<string, unknown> = {}) => ({
  id: 'q1', courseId: 'c01', calc: '−3 + (−5)', given: '8', expected: '−8', correction: 'Même signe.', note: 'Pourquoi ?',
  askedAt: Date.UTC(2026, 10, 22, 8), answer: null, answeredAt: null, answeredBy: null, readAt: null, ...over,
});
async function mount() {
  const v = render(<SuiviQuestion eleve="lea" id="q1" />);
  await waitFor(() => expect(v.container.textContent).toContain('−3 + (−5)'));
  const box = () => v.container.querySelector<HTMLTextAreaElement>('textarea')!;
  const send = () => [...v.container.querySelectorAll('button')].find((b) => /Envoyer la réponse/.test(b.textContent!))! as HTMLButtonElement;
  return { ...v, box, send };
}

beforeEach(async () => {
  await resetDb();
  h.list = [q()];
  h.answerStatus = 0;
  h.answer.mockClear?.();
  window.location.hash = '#/suivi/lea/question/q1';
});
afterEach(() => cleanup());

describe('SuiviQuestion', () => {
  it('affiche la demande en entier', async () => {
    const v = await mount();
    const t = v.container.textContent!;
    expect(t).toContain('Sa réponse');
    expect(t).toContain('La bonne réponse');
    expect(t).toContain('Même signe.');
    expect(t).toContain('Pourquoi ?');
  });

  it('« Envoyer la réponse » est désactivé quand le texte est vide après trim', async () => {
    const v = await mount();
    expect(v.send().disabled).toBe(true);
    fireEvent.change(v.box(), { target: { value: '   ' } });
    expect(v.send().disabled).toBe(true);
    fireEvent.change(v.box(), { target: { value: 'Ok' } });
    expect(v.send().disabled).toBe(false);
  });

  it('envoie une fois puis revient au suivi', async () => {
    const v = await mount();
    fireEvent.change(v.box(), { target: { value: ' Les deux vont à gauche. ' } });
    fireEvent.click(v.send());
    await waitFor(() => expect(h.answer).toHaveBeenCalledTimes(1));
    expect(h.answer).toHaveBeenCalledWith('t', 'lea', 'q1', 'Les deux vont à gauche.');
    await waitFor(() => expect(window.location.hash).toBe('#/suivi'));
  });

  it('403 : « Tu ne suis plus cette élève. »', async () => {
    h.answerStatus = 403;
    const v = await mount();
    fireEvent.change(v.box(), { target: { value: 'Ok' } });
    fireEvent.click(v.send());
    await waitFor(() => expect(v.container.textContent).toContain('Tu ne suis plus cette élève.'));
    expect(window.location.hash).toBe('#/suivi/lea/question/q1');
  });

  it("refuse 2001 caractères avant l'envoi", async () => {
    const v = await mount();
    fireEvent.change(v.box(), { target: { value: 'a'.repeat(2001) } });
    expect(v.send().disabled).toBe(true);
    fireEvent.click(v.send());
    expect(h.answer).not.toHaveBeenCalled();
  });

  it('une demande déjà répondue montre la réponse et « Modifier ma réponse »', async () => {
    h.list = [q({ answer: 'Déjà dit.', answeredAt: 1 })];
    const v = await mount();
    expect(v.container.textContent).toContain('Déjà dit.');
    expect(v.container.textContent).toContain('Modifier ma réponse');
  });
});
