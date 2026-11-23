import { describe, expect, it } from 'vitest';
import type { Activity, AppEvent, ErrorFamily } from '../src/events';
import { getCourse, getModule } from '../src/courses';
import { addDays } from '../src/time';
import { computeDashboard } from '../src/dashboard';

// Doc 05 says « cours N » for the N-th course of the module (Cours 0 first), e.g. « cours 5 » = multiplier.
const IDS = getModule('calculs').courseIds;
const C = (n: number): string => IDS[n]!;

let seq = 0;
const nextId = () => `e${String(++seq).padStart(6, '0')}`;

type Opts = {
  day: string;
  course: string;
  activity?: Activity;
  activityId?: string;
  correct?: boolean;
  family?: ErrorFamily;
  errorType?: string;
  attempt?: number;
  unfinished?: boolean;
  skipped?: boolean;
  prompt?: string;
  given?: string;
  expected?: string;
  ms?: number;
};

function ans(o: Opts): AppEvent {
  const id = nextId();
  const correct = o.correct ?? true;
  const family: ErrorFamily | null = correct || o.skipped ? null : (o.family ?? 'autre');
  return {
    id, userId: 'u1', at: Date.parse(`${o.day}T09:00:00Z`) + seq * 1000, day: o.day, kind: 'answer',
    activityId: o.activityId ?? `act-${id}`, activity: o.activity ?? 'entrainement', moduleId: 'calculs',
    courseId: o.course, level: 1, questionKind: 'saisie', prompt: o.prompt ?? `q-${id}`,
    given: o.given ?? '', expected: o.expected ?? '', correct, unfinished: o.unfinished ?? false,
    errorType: family === null ? null : (o.errorType ?? (family === 'autre' ? 'autre' : `err-${family}`)),
    errorFamily: family, attempt: o.attempt ?? 1, skipped: o.skipped ?? false, durationMs: o.ms ?? 1000,
  };
}

/** n first answers: `wrong` of them wrong (`sign` of those with a sign error, the others a calcul error). */
function calculs(day: string, course: string, n: number, wrong: number, sign: number, extra: Partial<Opts> = {}): AppEvent[] {
  return Array.from({ length: n }, (_, i) =>
    ans({ day, course, correct: i >= wrong, family: i < sign ? 'signe' : 'calcul', ...extra }),
  );
}

/** Validation through a 5/5 rattrapage. */
const validate = (day: string, course: string): AppEvent[] => calculs(day, course, 5, 0, 0, { activity: 'rattrapage', activityId: nextId() });

/** A review of a course (3 first answers in one 'revision' activity), failed when `ok` is false. */
const review = (day: string, course: string, ok: boolean): AppEvent[] =>
  calculs(day, course, 3, ok ? 0 : 1, 0, { activity: 'revision', activityId: nextId() });

/** A day of 16 minutes (goal reached): 8 answers of 2 min (the most an answer counts, doc 02). */
const goalDay = (day: string): AppEvent[] => calculs(day, C(1), 8, 0, 0, { ms: 2 * 60_000 });

describe('computeDashboard — the example journal of doc 05 (cours 5, Thursday 12 March)', () => {
  const MON = '2026-03-09';
  const TUE = '2026-03-10';
  const WED = '2026-03-11';
  const THU = '2026-03-12';
  const c5 = C(5);
  const events: AppEvent[] = [
    // Monday: cours 5 + reviews, 16 min, 20 calculs, 5 wrong, 4 of them sign errors
    ans({ day: MON, course: c5, activity: 'lecon', correct: false, family: 'signe', ms: 60_000 }), // not a calcul
    ...calculs(MON, c5, 4, 4, 4, { ms: 45_000 }),
    ans({ day: MON, course: c5, correct: false, family: 'ecriture', ms: 45_000 }),
    ...calculs(MON, c5, 15, 0, 0, { ms: 45_000 }),
    ans({ day: MON, course: c5, correct: true, attempt: 2, ms: 0 }), // a retry: not a calcul
    // Tuesday: reviews, 6 min, 9 calculs, 2 wrong, 1 sign error
    ...calculs(TUE, c5, 9, 2, 1, { activity: 'revision', ms: 40_000 }),
    // Wednesday: nothing. Thursday: reviews + training, 15 min, 24 calculs, 3 wrong, 1 sign error
    ...calculs(THU, c5, 24, 3, 1, { ms: 37_500 }),
  ];
  const d = computeDashboard(events, THU);

  it('Aujourd’hui: 15 / 15 min ✓', () => {
    expect(d.home.state.today.totalMs).toBe(15 * 60_000);
    expect(d.home.state.today.goalReached).toBe(true);
  });

  it('Série: 1 jour (Wednesday missed; Monday reached, Tuesday not)', () => {
    expect(d.home.state.streak).toBe(1);
  });

  it('points of the 4 days: Mon ● · Tue ◐ · Wed ○ · Thu ●', () => {
    const days = d.home.last30.days;
    expect(days).toHaveLength(30);
    expect(days[29]!.day).toBe(THU);
    expect(days[0]!.day).toBe(addDays(THU, -29));
    expect(days.slice(-4).map((x) => x.mark)).toEqual(['atteint', 'partiel', 'rien', 'atteint']);
    expect(days[26]!.totalMs).toBe(16 * 60_000);
    expect(d.home.last30.goalDays).toBe(2);
  });

  it('cours 5 success over 14 days: (53 − 10) / 53 = 81 %, not in « À retravailler »', () => {
    expect(d.home.toRework).toEqual([]);
    const course = d.modules[0]!.courses.find((x) => x.courseId === c5)!;
    expect(course.success30).toMatchObject({ ok: 43, total: 53 });
    expect(Math.round(course.success30.rate! * 100)).toBe(81);
    expect(course.struggling).toBe(false);
  });
});

describe('computeDashboard — « Autres cas » of doc 05', () => {
  const TODAY = '2026-03-20';

  it('cours 4: 10 answers over 14 days, 6 right (60 %) → in « À retravailler », with ⚠ in the module', () => {
    const d = computeDashboard(calculs(addDays(TODAY, -3), C(4), 10, 4, 0), TODAY);
    expect(d.home.toRework.map((x) => x.courseId)).toEqual([C(4)]);
    expect(d.home.toRework[0]).toMatchObject({ title: getCourse(C(4)).title, lowSuccess: true, failedTwiceInARow: false });
    expect(d.home.toRework[0]!.success14).toMatchObject({ ok: 6, total: 10, rate: 0.6 });
    expect(d.modules[0]!.courses[4]!.struggling).toBe(true);
  });

  it('cours 3: 4 answers over 14 days, 1 right → not in « À retravailler » (fewer than 5 answers)', () => {
    const d = computeDashboard(calculs(TODAY, C(3), 4, 3, 0), TODAY);
    expect(d.home.toRework).toEqual([]);
    expect(d.modules[0]!.courses[3]!.struggling).toBe(false);
  });

  it('answers older than 14 days do not count for « À retravailler »', () => {
    const d = computeDashboard(calculs(addDays(TODAY, -14), C(4), 10, 10, 0), TODAY);
    expect(d.home.toRework).toEqual([]);
  });

  it('cours 5: 90 % success but 2 reviews failed in a row → in « À retravailler »', () => {
    const v = addDays(TODAY, -5);
    const events = [
      ...validate(v, C(5)), // 5 right
      ...review(addDays(v, 2), C(5), false), // 1st failure: back the next day
      ...review(addDays(v, 3), C(5), false), // 2nd failure in a row
      ...calculs(addDays(v, 4), C(5), 9, 0, 0), // 9 right: 18 / 20 = 90 %
    ];
    const d = computeDashboard(events, TODAY);
    expect(d.home.toRework).toHaveLength(1);
    expect(d.home.toRework[0]).toMatchObject({ courseId: C(5), lowSuccess: false, failedTwiceInARow: true });
    expect(d.home.toRework[0]!.success14).toMatchObject({ ok: 18, total: 20 });
    const m = d.modules[0]!.courses[5]!;
    expect(m).toMatchObject({ struggling: true, failedTwiceInARow: true });
  });

  it('4 courses in difficulty → the 3 weakest, weakest first', () => {
    const events = [
      ...calculs(TODAY, C(1), 10, 4, 0), // 60 %
      ...calculs(TODAY, C(2), 10, 5, 0), // 50 %
      ...calculs(TODAY, C(3), 10, 6, 0), // 40 %
      ...calculs(TODAY, C(4), 20, 7, 0), // 65 %
    ];
    const d = computeDashboard(events, TODAY);
    expect(d.home.toRework.map((x) => x.courseId)).toEqual([C(3), C(2), C(1)]);
    expect(d.modules[0]!.courses.filter((x) => x.struggling).map((x) => x.courseId)).toEqual([C(1), C(2), C(3), C(4)]);
  });

  it('3 reviews pending since Monday, 1 since Wednesday → 4 pending, the oldest: Monday', () => {
    const MON = '2026-03-16';
    const events = [
      ...validate(addDays(MON, -2), C(1)),
      ...validate(addDays(MON, -2), C(2)),
      ...validate(addDays(MON, -2), C(3)),
      ...validate(MON, C(4)),
    ];
    const d = computeDashboard(events, '2026-03-20');
    expect(d.home.pendingReviews.count).toBe(4);
    expect(d.home.pendingReviews.oldest).toBe(MON);
    expect(d.home.pendingReviews.items).toEqual([
      { courseId: C(1), title: getCourse(C(1)).title, due: MON },
      { courseId: C(2), title: getCourse(C(2)).title, due: MON },
      { courseId: C(3), title: getCourse(C(3)).title, due: MON },
      { courseId: C(4), title: getCourse(C(4)).title, due: '2026-03-18' },
    ]);
  });

  it('no review pending → « Révisions à jour ✓ » (count 0, no oldest date)', () => {
    const d = computeDashboard(validate(addDays(TODAY, -1), C(1)), TODAY);
    expect(d.home.pendingReviews).toEqual({ count: 0, oldest: null, items: [] });
  });

  it('21 days with the goal reached over the last 30 → « Objectif atteint 21 jours sur 30 »', () => {
    const events = [
      ...Array.from({ length: 21 }, (_, i) => goalDay(addDays(TODAY, -i - (i >= 10 ? 5 : 0)))).flat(),
      ...goalDay(addDays(TODAY, -30)), // 31 days ago: out of the window
      ans({ day: addDays(TODAY, -12), course: C(1), ms: 60_000 }), // a little activity
    ];
    const d = computeDashboard(events, TODAY);
    expect(d.home.last30.goalDays).toBe(21);
    expect(d.home.last30.days.filter((x) => x.mark === 'atteint')).toHaveLength(21);
    expect(d.home.last30.days.filter((x) => x.mark === 'partiel').map((x) => x.day)).toEqual([addDays(TODAY, -12)]);
  });

  it('module « Calculs »: cours 0 to 4 validated, 5 in progress, 6 and 7 not started → 5 / 8; 6 and 7 « 🔒 pas commencé », 5 « en cours »', () => {
    const events = [
      ...[0, 1, 2, 3, 4].flatMap((n) => validate(TODAY, C(n))),
      ans({ day: TODAY, course: C(5), activity: 'lecon', activityId: 'run5' }),
    ];
    const d = computeDashboard(events, TODAY);
    expect(d.home.state.modules).toEqual([{ moduleId: 'calculs', title: getModule('calculs').title, validated: 5, total: 8 }]);
    const m = d.modules[0]!;
    expect(m).toMatchObject({ moduleId: 'calculs', validated: 5, total: 8 });
    expect(m.courses.map((x) => x.status)).toEqual([
      'valide', 'valide', 'valide', 'valide', 'valide', 'en-cours', 'pas-commence', 'pas-commence',
    ]);
  });
});

describe('computeDashboard — État', () => {
  const TODAY = '2026-03-20';

  it('série: counts up to yesterday while today is not reached yet', () => {
    const events = [
      ...goalDay(addDays(TODAY, -3)),
      ...goalDay(addDays(TODAY, -2)),
      ...goalDay(addDays(TODAY, -1)),
      ans({ day: TODAY, course: C(1), ms: 60_000 }),
    ];
    expect(computeDashboard(events, TODAY).home.state.streak).toBe(3);
    expect(computeDashboard([...events, ...goalDay(TODAY)], TODAY).home.state.streak).toBe(4);
    expect(computeDashboard(goalDay(addDays(TODAY, -2)), TODAY).home.state.streak).toBe(0);
  });

  it('a module is « en cours » once a course is started, and until all its courses are validated', () => {
    expect(computeDashboard([], TODAY).home.state.modules).toEqual([]);
    const all = IDS.flatMap((id) => validate(TODAY, id));
    const d = computeDashboard(all, TODAY);
    expect(d.home.state.modules).toEqual([]);
    // doc 07 #17A: a finished module leaves the État lines but stays in the module list, done
    expect(d.modules[0]).toMatchObject({ moduleId: 'calculs', validated: 8, total: 8, done: true });
    expect(computeDashboard(validate(TODAY, C(0)), TODAY).modules[0]!.done).toBe(false);
  });

});

describe('computeDashboard — Erreurs les plus communes (30 days)', () => {
  const TODAY = '2026-03-20';

  it('top 3 error types of the signe, écriture and calcul families, all courses together, with their latest wrong calculs', () => {
    const wrong = (day: string, course: string, errorType: string, family: ErrorFamily, extra: Partial<Opts> = {}) =>
      ans({ day, course, correct: false, errorType, family, ...extra });
    const events = [
      ...Array.from({ length: 3 }, () => wrong(TODAY, C(5), 'regle-signes', 'signe')),
      ...Array.from({ length: 2 }, () => wrong(TODAY, C(6), 'regle-signes', 'signe')),
      ...Array.from({ length: 4 }, () => wrong(TODAY, C(4), 'oppose-oublie', 'signe')),
      ...Array.from({ length: 2 }, () => wrong(TODAY, C(0), 'moins-apres', 'ecriture')),
      wrong(TODAY, C(5), 'erreur-table', 'calcul'),
      ...Array.from({ length: 6 }, () => wrong(TODAY, C(5), 'autre', 'autre')), // not in the top
      ...Array.from({ length: 5 }, () => wrong(addDays(TODAY, -30), C(5), 'erreur-table', 'calcul')), // too old
      wrong(TODAY, C(5), 'erreur-table', 'calcul', { attempt: 2 }), // not a first answer
    ];
    const d = computeDashboard(events, TODAY);
    const top = d.home.commonErrors.top;
    expect(top.map((x) => [x.errorType, x.family, x.count])).toEqual([
      ['regle-signes', 'signe', 5],
      ['oppose-oublie', 'signe', 4],
      ['moins-apres', 'ecriture', 2],
    ]);
    expect(d.home.commonErrors.otherCount).toBe(6);
    expect(top[0]!.calculs).toHaveLength(5);
    expect(top[0]!.calculs[0]!.courseId).toBe(C(6)); // most recent first
  });

  it('a wrong calcul shows the given and the correct answer, how many times it failed in the activity, and « passé »', () => {
    const act = 'act-x';
    const at = (o: Partial<Opts>) => ans({ day: TODAY, course: C(5), activityId: act, prompt: '-6 \\times (-4)', ...o });
    const events = [
      at({ correct: false, family: 'signe', errorType: 'regle-signes', given: '-24', expected: '24' }),
      at({ correct: false, family: 'signe', errorType: 'regle-signes', given: '-24', expected: '24', attempt: 2 }),
      ans({ day: TODAY, course: C(5), activityId: act, prompt: 'meme-type', attempt: 3, correct: false, family: 'signe', errorType: 'regle-signes' }),
      at({ correct: false, family: 'signe', errorType: 'regle-signes', given: '-24', expected: '24', attempt: 4 }),
      at({ correct: false, skipped: true, expected: '24', attempt: 5 }),
      ans({ day: TODAY, course: C(5), activityId: 'act-y', correct: false, family: 'signe', errorType: 'regle-signes', given: '-21', expected: '21', prompt: '-3 \\times (-7)' }),
    ];
    const calculsOf = computeDashboard(events, TODAY).home.commonErrors.top[0]!.calculs;
    expect(calculsOf).toEqual([
      { day: TODAY, courseId: C(5), activityId: 'act-y', prompt: '-3 \\times (-7)', given: '-21', expected: '21', failures: 1, passed: false },
      { day: TODAY, courseId: C(5), activityId: act, prompt: '-6 \\times (-4)', given: '-24', expected: '24', failures: 3, passed: true },
    ]);
  });

  it('keeps the 10 latest calculs of a type', () => {
    const events = calculs(TODAY, C(5), 12, 12, 12);
    const top = computeDashboard(events, TODAY).home.commonErrors.top;
    expect(top[0]!.count).toBe(12);
    expect(top[0]!.calculs).toHaveLength(10);
  });
});

describe('computeDashboard — module view (§2)', () => {
  const TODAY = '2026-03-20';

  it('per course: stars, current level, 30-day success without lesson questions and guided examples, next review', () => {
    const v = addDays(TODAY, -10);
    const events = [
      ans({ day: v, course: C(1), activity: 'lecon', correct: false, activityId: 'run0' }), // an unfinished run
      ans({ day: v, course: C(1), activity: 'exemple', correct: false, activityId: 'run0' }),
      ...calculs(v, C(1), 5, 0, 0, { activity: 'fin', activityId: 'run1' }), // validated: step A
      ...review(addDays(v, 2), C(1), true), // step B: ★★ level 2
      ...calculs(addDays(TODAY, -30), C(1), 4, 4, 0), // 31 days ago: out of the 30 days
    ];
    const course = computeDashboard(events, TODAY).modules[0]!.courses[1]!;
    expect(course).toMatchObject({
      courseId: C(1), title: getCourse(C(1)).title, order: 1, status: 'valide', stars: 2, level: 2,
      nextReview: addDays(v, 4), struggling: false, failedTwiceInARow: false,
    });
    expect(course.success30).toEqual({ ok: 8, total: 8, rate: 1 });
    const untouched = computeDashboard(events, TODAY).modules[0]!.courses[7]!;
    expect(untouched).toMatchObject({ status: 'pas-commence', stars: 0, level: null, nextReview: null, success30: { ok: 0, total: 0, rate: null } });
  });

  it('a course to catch up is reported as « à rattraper », distinct from « en cours » (doc 07 #19B)', () => {
    const events = calculs(TODAY, C(0), 5, 5, 0, { activity: 'fin', activityId: 'run0' });
    const d = computeDashboard(events, TODAY);
    expect(d.modules[0]!.courses[0]!.status).toBe('a-rattraper');
    expect(d.courses[C(0)]!.status).toBe('a-rattraper');
    const started = computeDashboard([ans({ day: TODAY, course: C(1), activity: 'lecon', activityId: 'run1' })], TODAY);
    expect(started.modules[0]!.courses[1]!.status).toBe('en-cours');
  });

  it('« à retravailler » compares the displayed percentage: 69,6 % shows 70 % and is not flagged (doc 07 #21A)', () => {
    const at = (right: number, total: number) =>
      computeDashboard(calculs(TODAY, C(4), total, total - right, 0), TODAY);
    const d = at(348, 500); // 69,6 %
    expect(d.home.toRework).toEqual([]);
    expect(d.modules[0]!.courses[4]!.struggling).toBe(false);
    expect(at(347, 500).home.toRework.map((x) => x.courseId)).toEqual([C(4)]); // 69,4 % shows 69 %
    expect(at(7, 10).home.toRework).toEqual([]); // exactly 70 %
  });
});

describe('computeDashboard — course view (§3)', () => {
  const TODAY = '2026-03-20';
  const c5 = C(5);

  it('state, review history, errors by type over 30 days, the 10 latest errors', () => {
    const v = '2026-03-02';
    const events = [
      ...validate(v, c5),
      ...review('2026-03-04', c5, true), // B
      ...review('2026-03-06', c5, false),
      ...review('2026-03-07', c5, true), // stays B
      ...review('2026-03-09', c5, true), // C
      ...review('2026-03-16', c5, false),
      ...review('2026-03-17', c5, false), // back to B
      ...calculs(addDays(TODAY, -31), c5, 3, 3, 3), // older than 30 days
      ...calculs(TODAY, c5, 9, 9, 7), // 7 sign errors, 2 calcul errors
      ans({ day: TODAY, course: c5, correct: false, family: 'autre' }),
      ...calculs(TODAY, c5, 2, 2, 0, { family: 'ecriture' }),
    ];
    const cv = computeDashboard(events, TODAY).courses[c5]!;
    expect(cv).toMatchObject({
      courseId: c5, moduleId: 'calculs', title: getCourse(c5).title, order: 5, status: 'valide',
      stars: 2, level: 2, step: 'B', validatedOn: v, nextReview: '2026-03-19',
    });
    expect(cv.reviews).toEqual([
      { day: '2026-03-04', ok: true }, { day: '2026-03-06', ok: false }, { day: '2026-03-07', ok: true },
      { day: '2026-03-09', ok: true }, { day: '2026-03-16', ok: false }, { day: '2026-03-17', ok: false },
    ]);
    // the 3 failed reviews (1 calcul error each) are within the 30 days, the 3 older sign errors are not
    expect(cv.errors30).toEqual([
      { errorType: 'err-signe', family: 'signe', count: 7 },
      { errorType: 'err-calcul', family: 'calcul', count: 5 },
      { errorType: 'err-ecriture', family: 'ecriture', count: 2 },
      { errorType: 'autre', family: 'autre', count: 1 },
    ]);
    expect(cv.lastErrors).toHaveLength(10);
    expect(cv.lastErrors[0]!.day).toBe(TODAY);
  });

  it('an untouched course: no step, no validation, no review, no error', () => {
    const cv = computeDashboard([], TODAY).courses[C(7)]!;
    expect(cv).toMatchObject({ status: 'pas-commence', stars: 0, level: null, step: null, validatedOn: null, nextReview: null, reviews: [], errors30: [], lastErrors: [] });
  });

  it('marks a calcul failed several times in the same activity, or passed (« raté 3 fois, passé »)', () => {
    const act = 'run-a';
    const p = (o: Partial<Opts>) => ans({ day: TODAY, course: c5, activityId: act, prompt: 'P', given: '-24', expected: '24', ...o });
    const events = [
      p({ correct: false, family: 'signe' }),
      p({ correct: false, family: 'signe', attempt: 2 }),
      p({ correct: false, family: 'signe', attempt: 3 }),
      p({ correct: false, skipped: true, given: '', attempt: 4 }),
      ans({ day: TODAY, course: c5, activityId: 'run-b', prompt: 'P', correct: false, family: 'signe' }), // same prompt, other activity
      ans({ day: TODAY, course: c5, activityId: act, prompt: 'Q', correct: true }), // right: not an error
    ];
    const cv = computeDashboard(events, TODAY).courses[c5]!;
    expect(cv.lastErrors.map((x) => [x.activityId, x.prompt, x.failures, x.passed])).toEqual([
      ['run-b', 'P', 1, false],
      [act, 'P', 3, true],
    ]);
    expect(cv.lastErrors[1]).toMatchObject({ given: '-24', expected: '24' });
  });
});

describe('computeDashboard — events', () => {
  it('ignores duplicate event ids', () => {
    const TODAY = '2026-03-20';
    const e = ans({ day: TODAY, course: C(1), ms: 60_000 });
    const d = computeDashboard([e, e], TODAY);
    expect(d.home.state.today.totalMs).toBe(60_000);
  });
});
