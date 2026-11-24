import type { AppEvent, ClementQuestion, NewClementQuestion } from '@pom/engine';

export type Role = 'eleve' | 'suiveur';
export type User = { id: string; name: string; role: Role };
export type LoginResult = { token: string; user: User };

/** Erreur HTTP de l'API (status 0 = réseau injoignable). */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Délai (ms) au-delà duquel une requête est abandonnée (réseau très lent = comme hors ligne). */
export const REQUEST_TIMEOUT_MS = 10_000;

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), REQUEST_TIMEOUT_MS);
  try {
    let res: Response;
    try {
      res = await fetch(path, { ...rest, headers, signal: abort.signal });
    } catch {
      throw new ApiError(0, 'network');
    }
    if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, 'network'); // corps illisible ou lecture interrompue par le délai
  } finally {
    clearTimeout(timer);
  }
}

export function login(code: string): Promise<LoginResult> {
  return request('/api/login', { method: 'POST', body: JSON.stringify({ code }) });
}

/** Renvoie les ids acceptés par le serveur (déjà présents compris). */
export async function postEvents(token: string, events: AppEvent[]): Promise<string[]> {
  return (await request<{ accepted: string[] }>('/api/events', { method: 'POST', token, body: JSON.stringify({ events }) })).accepted;
}

export async function getEvents(token: string): Promise<AppEvent[]> {
  return (await request<{ events: AppEvent[] }>('/api/events', { token })).events;
}

export async function getStudents(token: string): Promise<{ id: string; name: string }[]> {
  return (await request<{ students: { id: string; name: string }[] }>('/api/students', { token })).students;
}

export async function getStudentEvents(token: string, studentId: string): Promise<AppEvent[]> {
  return (await request<{ events: AppEvent[] }>(`/api/students/${encodeURIComponent(studentId)}/events`, { token })).events;
}

const enc = encodeURIComponent;

/** « Demander à Clément » : l'id client rend l'envoi idempotent (rejouer le même id n'ajoute rien). */
export async function postQuestion(token: string, q: NewClementQuestion): Promise<void> {
  await request('/api/questions', { method: 'POST', token, body: JSON.stringify(q) });
}

export async function getMyQuestions(token: string): Promise<ClementQuestion[]> {
  return (await request<{ questions: ClementQuestion[] }>('/api/questions', { token })).questions;
}

export async function markQuestionRead(token: string, id: string): Promise<void> {
  await request(`/api/questions/${enc(id)}/read`, { method: 'POST', token });
}

export async function getStudentQuestions(token: string, studentId: string): Promise<ClementQuestion[]> {
  return (await request<{ questions: ClementQuestion[] }>(`/api/students/${enc(studentId)}/questions`, { token })).questions;
}

export async function answerQuestion(token: string, studentId: string, id: string, answer: string): Promise<void> {
  await request(`/api/students/${enc(studentId)}/questions/${enc(id)}/answer`, { method: 'POST', token, body: JSON.stringify({ answer }) });
}
