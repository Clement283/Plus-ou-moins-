// « Demander à Clément » : contrat des questions d'un élève (client, serveur et suiveur).

export interface ClementQuestion {
  id: string;
  courseId: string;
  calc: string;
  given: string;
  expected: string;
  correction: string;
  note: string | null;
  askedAt: number;
  answer: string | null;
  answeredAt: number | null;
  answeredBy: string | null;
  readAt: number | null;
}

export type NewClementQuestion = Pick<
  ClementQuestion,
  'id' | 'courseId' | 'calc' | 'given' | 'expected' | 'correction' | 'note' | 'askedAt'
>;

export const QUESTION_LIMITS = { calc: 200, given: 100, expected: 100, correction: 600, note: 500, answer: 2000 } as const;

const str = (v: unknown, max: number, minLen = 0): v is string =>
  typeof v === 'string' && v.length >= minLen && v.length <= max;

export function isNewClementQuestion(x: unknown): x is NewClementQuestion {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false;
  const q = x as Record<string, unknown>;
  return (
    str(q.id, 100, 1) &&
    str(q.courseId, 100, 1) &&
    str(q.calc, QUESTION_LIMITS.calc) &&
    str(q.given, QUESTION_LIMITS.given) &&
    str(q.expected, QUESTION_LIMITS.expected) &&
    str(q.correction, QUESTION_LIMITS.correction) &&
    (q.note === null || str(q.note, QUESTION_LIMITS.note)) &&
    typeof q.askedAt === 'number' &&
    Number.isFinite(q.askedAt) &&
    q.askedAt >= 0
  );
}

/** Non vide après `trim`, au plus `QUESTION_LIMITS.answer` caractères. */
export function isAnswerText(x: unknown): x is string {
  return typeof x === 'string' && x.trim().length > 0 && x.length <= QUESTION_LIMITS.answer;
}
