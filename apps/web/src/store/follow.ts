import { useCallback, useEffect, useMemo, useState } from 'react';
import { computeDashboard, type AppEvent, type Dashboard } from '@pom/engine';
import { getStudentEvents, getStudents } from '../api';
import { getDb } from './db';
import { useSession, useToday } from './progress';
import { dropSessionIf401 } from './sync';

/**
 * Page de suivi (doc 05) : élèves suivis et leurs événements. Chaque réponse du serveur est gardée dans
 * IndexedDB (magasin `follow`) pour que la page s'ouvre hors ligne avec les dernières données.
 */

export type Student = { id: string; name: string };

const STUDENTS_KEY = 'students';
const LAST_KEY = 'last';
const eventsKey = (id: string) => `events:${id}`;

async function readCache<T>(key: string): Promise<T | undefined> {
  try {
    return (await (await getDb()).get('follow', key)) as T | undefined;
  } catch {
    return undefined;
  }
}

async function writeCache(key: string, value: unknown): Promise<void> {
  try {
    await (await getDb()).put('follow', value, key);
  } catch {
    // Le cache est facultatif.
  }
}

/** Dernier élève consulté (« l'appli se souvient du dernier élève consulté », doc 05). */
export const loadLastStudent = (): Promise<string | undefined> => readCache<string>(LAST_KEY);
export const saveLastStudent = (id: string): Promise<void> => writeCache(LAST_KEY, id);
export const loadStudentsCache = (): Promise<Student[] | undefined> => readCache<Student[]>(STUDENTS_KEY);
export const loadEventsCache = (id: string): Promise<AppEvent[] | undefined> => readCache<AppEvent[]>(eventsKey(id));

export type Loaded<T> = { data: T | null; /** Le serveur n'a pas répondu (ou refusé) : `data` vient du cache, ou manque. */ failed: boolean };

/** Charge depuis le cache, puis depuis le serveur ; un 401 (jeton révoqué) efface la session. */
function useCachedFetch<T>(key: string | null, fetcher: (token: string) => Promise<T>): Loaded<T> {
  const token = useSession()?.token;
  const [state, setState] = useState<{ key: string | null; data: T | null; failed: boolean }>({ key: null, data: null, failed: false });
  useEffect(() => {
    if (!key || !token) return;
    let alive = true;
    setState((s) => (s.key === key ? s : { key, data: null, failed: false }));
    void (async () => {
      const cached = await readCache<T>(key);
      if (alive && cached !== undefined) setState((s) => (s.key === key && s.data === null ? { key, data: cached, failed: false } : s));
      try {
        const fresh = await fetcher(token);
        if (!alive) return;
        setState({ key, data: fresh, failed: false });
        void writeCache(key, fresh);
      } catch (e) {
        await dropSessionIf401(e);
        if (alive) setState((s) => (s.key === key ? { ...s, failed: true } : s));
      }
    })();
    return () => {
      alive = false;
    };
    // `fetcher` change à chaque rendu : la clé identifie la requête.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, token]);
  return state.key === key ? { data: state.data, failed: state.failed } : { data: null, failed: false };
}

/** Élèves suivis par la personne connectée. */
export function useStudents(): Loaded<Student[]> {
  return useCachedFetch<Student[]>(STUDENTS_KEY, getStudents);
}

/** Événements d'un élève (le cache IndexedDB sert d'abord, puis le serveur). */
export function useStudentEvents(id: string | undefined): Loaded<AppEvent[]> {
  return useCachedFetch<AppEvent[]>(id ? eventsKey(id) : null, (token) => getStudentEvents(token, id!));
}

/**
 * Élève affiché sur l'accueil : le dernier consulté s'il fait toujours partie de la liste, sinon le premier.
 * `choose` le change et le mémorise.
 */
export function useCurrentStudent(students: Student[] | null): { student: Student | null; choose: (id: string) => void } {
  const [last, setLast] = useState<string | undefined | null>(null); // null : pas encore lu
  useEffect(() => {
    let alive = true;
    void loadLastStudent().then((id) => alive && setLast((prev) => prev ?? id));
    return () => {
      alive = false;
    };
  }, []);
  const choose = useCallback((id: string) => {
    setLast(id);
    void saveLastStudent(id);
  }, []);
  if (!students || students.length === 0 || last === null) return { student: null, choose };
  return { student: students.find((s) => s.id === last) ?? students[0]!, choose };
}

/** Tableau de bord d'un élève : repli des événements (cache puis serveur) au jour de Paris. */
export function useStudentDashboard(id: string | undefined): { dash: Dashboard | null; failed: boolean; today: string } {
  const { data, failed } = useStudentEvents(id);
  const today = useToday();
  const dash = useMemo(() => (data ? computeDashboard(data, today) : null), [data, today]);
  return { dash, failed, today };
}
