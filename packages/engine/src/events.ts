export type Activity = 'lecon' | 'exemple' | 'fin' | 'rattrapage' | 'revision' | 'entrainement' | 'decouverte' | 'echauffement';
export type QuestionKind = 'saisie' | 'trou' | 'ordre' | 'erreur' | 'paires' | 'classer' | 'qcm' | 'vraifaux' | 'choix' | 'reecrire' | 'droite' | 'resoudre' | 'calculer' | 'intervalle' | 'tableau' | 'solutions';
export type ErrorFamily = 'signe' | 'ecriture' | 'calcul' | 'autre';

export type AppEvent = { id: string; userId: string; at: number; day: string } & (
  | {
      kind: 'answer';
      activityId: string;
      activity: Activity;
      moduleId: string;
      courseId: string;
      level: 1 | 2 | 3;
      questionKind: QuestionKind;
      prompt: string;
      given: string;
      expected: string;
      correct: boolean;
      unfinished: boolean; // « Simplifie »
      errorType: string | null;
      errorFamily: ErrorFamily | null;
      attempt: number; // 1 = première réponse
      skipped: boolean;
      durationMs: number;
      /** Juste avec l'indice (« À toi de résoudre ») : marqué « avec aide » dans le suivi. Absent = sans aide. */
      helped?: boolean;
    }
  | { kind: 'lesson_part_done'; activityId: string; moduleId: string; courseId: string; partIndex: number; durationMs: number }
  | { kind: 'activity_end'; activityId: string; activity: Activity; moduleId: string; courseId: string | null; completed: boolean }
);

const ACTIVITIES: readonly string[] = ['lecon', 'exemple', 'fin', 'rattrapage', 'revision', 'entrainement', 'decouverte', 'echauffement'];
const QUESTION_KINDS: readonly string[] = ['saisie', 'trou', 'ordre', 'erreur', 'paires', 'classer', 'qcm', 'vraifaux', 'choix', 'reecrire', 'droite', 'resoudre', 'calculer', 'intervalle', 'tableau', 'solutions'];
const ERROR_FAMILIES: readonly string[] = ['signe', 'ecriture', 'calcul', 'autre'];

type Rec = Record<string, unknown>;
const isStr = (v: unknown): v is string => typeof v === 'string';
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const isNonNegInt = (v: unknown): boolean => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isNonNegNum = (v: unknown): boolean => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isEnum = (list: readonly string[], v: unknown): boolean => isStr(v) && list.includes(v);

/** Valide précisément un événement (utilisé côté serveur pour rejeter les entrées invalides). */
export function isAppEvent(x: unknown): x is AppEvent {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false;
  const e = x as Rec;
  if (!isStr(e.id) || !isStr(e.userId) || !isNonNegNum(e.at)) return false;
  if (!isStr(e.day) || !/^\d{4}-\d{2}-\d{2}$/.test(e.day)) return false;
  switch (e.kind) {
    case 'answer':
      return (
        isStr(e.activityId) && isEnum(ACTIVITIES, e.activity) && isStr(e.moduleId) && isStr(e.courseId) &&
        (e.level === 1 || e.level === 2 || e.level === 3) &&
        isEnum(QUESTION_KINDS, e.questionKind) &&
        isStr(e.prompt) && isStr(e.given) && isStr(e.expected) &&
        isBool(e.correct) && isBool(e.unfinished) &&
        (e.errorType === null || isStr(e.errorType)) &&
        (e.errorFamily === null || isEnum(ERROR_FAMILIES, e.errorFamily)) &&
        typeof e.attempt === 'number' && Number.isInteger(e.attempt) && e.attempt >= 1 &&
        isBool(e.skipped) && isNonNegNum(e.durationMs) &&
        (e.helped === undefined || isBool(e.helped))
      );
    case 'lesson_part_done':
      return (
        isStr(e.activityId) && isStr(e.moduleId) && isStr(e.courseId) &&
        isNonNegInt(e.partIndex) && isNonNegNum(e.durationMs)
      );
    case 'activity_end':
      return (
        isStr(e.activityId) && isEnum(ACTIVITIES, e.activity) && isStr(e.moduleId) &&
        (e.courseId === null || isStr(e.courseId)) && isBool(e.completed)
      );
    default:
      return false;
  }
}
