import type { AppEvent } from '@pom/engine';

export type Role = 'eleve' | 'suiveur';
export type User = { id: string; name: string; role: Role };
export type LoginResult = { token: string; user: User };

/** Erreur HTTP de l'API (status 0 = réseau injoignable). */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(path, { ...rest, headers });
  } catch {
    throw new ApiError(0, 'network');
  }
  if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
  return (await res.json()) as T;
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
