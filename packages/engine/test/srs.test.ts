import { describe, expect, it } from 'vitest';
import type { Activity, AppEvent } from '../src/events';
import { getModule } from '../src/courses';
import { addDays } from '../src/time';
import { LADDER, applyEvent, foldProgress, type ProgressState } from '../src/srs';

// Doc 01 says « cours 1 / cours 2 » for the first two courses of the module (here Cours 0 and Cours 1)
// and « cours 5 » for « multiplier deux relatifs ».
const IDS = getModule('calculs').courseIds;
const [FIRST, SECOND, THIRD] = [IDS[0]!, IDS[1]!, IDS[2]!];
const C5 = 'c05-multiplier-deux';

let seq = 0;
const nextId = () => `e${String(++seq).padStart(5, '0')}`;
const atOf = (day: string) => Date.parse(`${day}T09:00:00Z`) + seq * 1000;

type AnswerOpts = {
  day: string;
  activityId: string;
  activity: Activity;
  courseId: string;
  correct: boolean;
  attempt?: number;
  unfinished?: boolean;
  skipped?: boolean;
  errorType?: string | null;
  prompt?: string;
};

function answer(o: AnswerOpts): AppEvent {
  const id = nextId();
  return {
    id,
    userId: 'u1',
    at: atOf(o.day),
    day: o.day,
    kind: 'answer',
    activityId: o.activityId,
    activity: o.activity,
    moduleId: 'calculs',
    courseId: o.courseId,
    level: 1,
    questionKind: 'saisie',
    prompt: o.prompt ?? `q-${id}`,
    given: '',
    expected: '',
    correct: o.correct,
    unfinished: o.unfinished ?? false,
    errorType: o.errorType !== undefined ? o.errorType : o.correct ? null : 'autre',
    errorFamily: o.correct ? null : 'autre',
    attempt: o.attempt ?? 1,
    skipped: o.skipped ?? false,
    durationMs: 1000,
  };
}

function activityEnd(day: string, activityId: string, activity: Activity, courseId: string | null): AppEvent {
  return { id: nextId(), userId: 'u1', at: atOf(day), day, kind: 'activity_end', activityId, activity, moduleId: 'calculs', courseId, completed: true };
}

/** A course run: lesson/example answers (first 3 'lecon', rest 'exemple'), then the 5 end exercises. */
function courseRun(courseId: string, day: string, lesson: boolean[], fin: boolean[]): AppEvent[] {
  const activityId = `run-${nextId()}`;
  const evts = lesson.map((correct, i) =>
    answer({ day, activityId, activity: i < 3 ? 'lecon' : 'exemple', courseId, correct }),
  );
  for (const correct of fin) evts.push(answer({ day, activityId, activity: 'fin', courseId, correct }));
  evts.push(activityEnd(day, activityId, 'fin', courseId));
  return evts;
}

const ok = (n: number) => Array<boolean>(n).fill(true);
const results = (good: number, total: number) => [...ok(good), ...Array<boolean>(total - good).fill(false)];
const validRun = (courseId: string, day: string) => courseRun(courseId, day, ok(7), ok(5));

function rattrapage(courseId: string, day: string, good: number): AppEvent[] {
  const activityId = `ratt-${nextId()}`;
  const evts = results(good, 5).map((correct) => answer({ day, activityId, activity: 'rattrapage', courseId, correct }));
  evts.push(activityEnd(day, activityId, 'rattrapage', courseId));
  return evts;
}

/** A review session: 3 first answers per listed course, interleaved. */
function review(day: string, perCourse: Record<string, boolean[]>): AppEvent[] {
  const activityId = `rev-${nextId()}`;
  const evts: AppEvent[] = [];
  const ids = Object.keys(perCourse);
  const max = Math.max(...ids.map((c) => perCourse[c]!.length));
  for (let i = 0; i < max; i++)
    for (const courseId of ids) {
      const r = perCourse[courseId]![i];
      if (r !== undefined) evts.push(answer({ day, activityId, activity: 'revision', courseId, correct: r }));
    }
  return evts;
}
const rev = (day: string, courseId: string, good: number) => review(day, { [courseId]: results(good, 3) });

function training(courseId: string, day: string, n: number, errorType: string): AppEvent[] {
  const activityId = `train-${nextId()}`;
  return Array.from({ length: n }, () => answer({ day, activityId, activity: 'entrainement', courseId, correct: false, errorType }));
}

const course = (s: ProgressState, id: string) => s.courses[id]!;
const stepLetter = (s: ProgressState, id: string) => {
  const step = course(s, id).step;
  return step === null ? null : LADDER[step]!.step;
};

describe('LADDER', () => {
  it('is the doc 01 §3 scale', () => {
    expect(LADDER.map((r) => `${r.step}${r.level}:${r.days}`)).toEqual([
      'A1:2', 'B2:2', 'C2:7', 'D3:2', 'E3:7', 'F3:30', 'G3:90', 'H3:180',
    ]);
  });
});

describe('doc 01 « Exemples »: course 5 from 2 March to 6 May 2026', () => {
  // [day, events of the day, step, level, stars, next review]
  const rows: [string, () => AppEvent[], string, number, number, string][] = [
    ['2026-03-02', () => validRun(C5, '2026-03-02'), 'A', 1, 1, '2026-03-04'],
    ['2026-03-04', () => rev('2026-03-04', C5, 3), 'B', 2, 2, '2026-03-06'],
    ['2026-03-06', () => rev('2026-03-06', C5, 2), 'B', 2, 2, '2026-03-07'],
    ['2026-03-07', () => rev('2026-03-07', C5, 3), 'B', 2, 2, '2026-03-09'],
    ['2026-03-09', () => rev('2026-03-09', C5, 3), 'C', 2, 2, '2026-03-16'],
    ['2026-03-16', () => rev('2026-03-16', C5, 3), 'D', 3, 3, '2026-03-18'],
    ['2026-03-18', () => rev('2026-03-18', C5, 1), 'D', 3, 3, '2026-03-19'],
    ['2026-03-19', () => rev('2026-03-19', C5, 2), 'C', 2, 3, '2026-03-26'],
    ['2026-03-26', () => rev('2026-03-26', C5, 3), 'D', 3, 3, '2026-03-28'],
    ['2026-03-30', () => rev('2026-03-30', C5, 3), 'E', 3, 3, '2026-04-06'],
    ['2026-04-06', () => rev('2026-04-06', C5, 3), 'F', 3, 3, '2026-05-06'],
  ];
  const all: AppEvent[] = [];
  for (const [day, make, step, level, stars, next] of rows) {
    all.push(...make());
    const snapshot = [...all];
    it(`${day}: ${step}, level ${level}, ${stars} star(s), next ${next}`, () => {
      const s = foldProgress(snapshot);
      const c = course(s, C5);
      expect(c.status).toBe('valide');
      expect(c.validatedOn).toBe('2026-03-02');
      expect(stepLetter(s, C5)).toBe(step);
      expect(c.level).toBe(level);
      expect(c.stars).toBe(stars);
      expect(c.nextReview).toBe(next);
    });
  }
  it('keeps the review history and the failure flags', () => {
    const c = course(foldProgress(all), C5);
    expect(c.reviewHistory.map((r) => `${r.day.slice(5)}${r.ok ? '+' : '-'}`)).toEqual([
      '03-04+', '03-06-', '03-07+', '03-09+', '03-16+', '03-18-', '03-19-', '03-26+', '03-30+', '04-06+',
    ]);
    expect(c.lastReviewFailed).toBe(false);
    expect(c.failedTwiceInARow).toBe(false);
    const after19 = course(foldProgress(all.filter((e) => e.day <= '2026-03-19')), C5);
    expect(after19.lastReviewFailed).toBe(true);
    expect(after19.failedTwiceInARow).toBe(true);
    const after18 = course(foldProgress(all.filter((e) => e.day <= '2026-03-18')), C5);
    expect(after18.lastReviewFailed).toBe(true);
    expect(after18.failedTwiceInARow).toBe(false);
  });
});

describe('doc 01 « Autres cas »', () => {
  const D = '2026-03-02';

  it('no course started: course 1 unlocked, all others locked', () => {
    const s = foldProgress([]);
    expect(course(s, FIRST).status).toBe('disponible');
    for (const id of IDS.slice(1)) expect(course(s, id).status).toBe('verrouille');
    expect(course(s, FIRST)).toMatchObject({ validatedOn: null, step: null, level: null, stars: 0, nextReview: null, reviewHistory: [], recentErrors: {} });
    expect(s.modules.calculs).toEqual({ moduleId: 'calculs', validated: 0, total: 8, done: false });
  });

  it('11/12 overall with 5/5 end exercises: validated ★, course 2 unlocked, step A, review in 48 h', () => {
    const s = foldProgress(courseRun(FIRST, D, results(6, 7), ok(5)));
    expect(course(s, FIRST)).toMatchObject({ status: 'valide', validatedOn: D, step: 0, level: 1, stars: 1, nextReview: '2026-03-04' });
    expect(course(s, SECOND).status).toBe('disponible');
    expect(course(s, THIRD).status).toBe('verrouille');
    expect(s.modules.calculs).toMatchObject({ validated: 1, total: 8, done: false });
  });

  it('10/12 (83 %) but 3/5 end exercises: not validated, rattrapage proposed, course 2 locked', () => {
    const s = foldProgress(courseRun(FIRST, D, ok(7), results(3, 5)));
    expect(course(s, FIRST)).toMatchObject({ status: 'a-rattraper', validatedOn: null, step: null, stars: 0, nextReview: null });
    expect(course(s, SECOND).status).toBe('verrouille');
  });

  it('9/12 (75 %) with 4/5 end exercises: not validated (under 80 %), rattrapage proposed', () => {
    const s = foldProgress(courseRun(FIRST, D, results(5, 7), results(4, 5)));
    expect(course(s, FIRST).status).toBe('a-rattraper');
    expect(course(s, SECOND).status).toBe('verrouille');
  });

  it('exactly 80 % with 4/5 end exercises is validated (10 answers, 8 right)', () => {
    const s = foldProgress(courseRun(FIRST, D, results(4, 5), results(4, 5)));
    expect(course(s, FIRST).status).toBe('valide');
  });

  it('not validated, then rattrapage 4/5: validated ★, course 2 unlocked, step A', () => {
    const evts = [...courseRun(FIRST, D, ok(7), results(3, 5)), ...rattrapage(FIRST, '2026-03-03', 4)];
    const s = foldProgress(evts);
    expect(course(s, FIRST)).toMatchObject({ status: 'valide', validatedOn: '2026-03-03', step: 0, level: 1, stars: 1, nextReview: '2026-03-05' });
    expect(course(s, SECOND).status).toBe('disponible');
  });

  it('not validated, then rattrapage 3/5: still not validated, new rattrapage proposed', () => {
    const evts = [...courseRun(FIRST, D, ok(7), results(3, 5)), ...rattrapage(FIRST, D, 3)];
    const s = foldProgress(evts);
    expect(course(s, FIRST).status).toBe('a-rattraper');
    expect(course(s, SECOND).status).toBe('verrouille');
    // and a later rattrapage still can validate
    expect(course(foldProgress([...evts, ...rattrapage(FIRST, '2026-03-04', 5)]), FIRST).status).toBe('valide');
  });

  it('step A, 1st then 2nd failure: stays at A; tomorrow, then in 48 h', () => {
    const evts = [...validRun(C5, D), ...rev('2026-03-04', C5, 2)];
    let c = course(foldProgress(evts), C5);
    expect([stepLetter(foldProgress(evts), C5), c.nextReview, c.failedTwiceInARow]).toEqual(['A', '2026-03-05', false]);
    evts.push(...rev('2026-03-05', C5, 0));
    c = course(foldProgress(evts), C5);
    expect([stepLetter(foldProgress(evts), C5), c.nextReview, c.failedTwiceInARow]).toEqual(['A', '2026-03-07', true]);
  });

  /** Drives C5 up to the given step index by successive successful reviews; returns events and last day. */
  function upTo(stepIndex: number): { evts: AppEvent[]; day: string } {
    const evts = validRun(C5, D);
    let s = foldProgress(evts);
    while (course(s, C5).step! < stepIndex) {
      evts.push(...rev(course(s, C5).nextReview!, C5, 3));
      s = foldProgress(evts);
    }
    return { evts, day: course(s, C5).nextReview! };
  }

  it('step H, review passed: stays at H, back in 6 months', () => {
    const { evts, day } = upTo(7);
    evts.push(...rev(day, C5, 3));
    const s = foldProgress(evts);
    expect(stepLetter(s, C5)).toBe('H');
    expect(course(s, C5).nextReview).toBe(addDays(day, 180));
    expect(course(s, C5).stars).toBe(3);
  });

  it('step F, 1st then 2nd failure: F tomorrow, then E in 1 week', () => {
    const { evts, day } = upTo(5);
    evts.push(...rev(day, C5, 2));
    let s = foldProgress(evts);
    expect([stepLetter(s, C5), course(s, C5).nextReview]).toEqual(['F', addDays(day, 1)]);
    evts.push(...rev(addDays(day, 1), C5, 1));
    s = foldProgress(evts);
    expect([stepLetter(s, C5), course(s, C5).level, course(s, C5).nextReview]).toEqual(['E', 3, addDays(day, 8)]);
  });

  it('every further failure goes down one more step; the next success after that climbs', () => {
    const { evts, day } = upTo(5); // F
    evts.push(...rev(day, C5, 0)); // F, +1
    evts.push(...rev(addDays(day, 1), C5, 0)); // E, +7
    evts.push(...rev(addDays(day, 8), C5, 0)); // D, +2
    let s = foldProgress(evts);
    expect([stepLetter(s, C5), course(s, C5).nextReview, course(s, C5).failedTwiceInARow]).toEqual(['D', addDays(day, 10), true]);
    evts.push(...rev(addDays(day, 10), C5, 3));
    s = foldProgress(evts);
    expect([stepLetter(s, C5), course(s, C5).nextReview, course(s, C5).failedTwiceInARow]).toEqual(['E', addDays(day, 17), false]);
  });

  it('training: 10 wrong answers on course 5 change neither step nor date, but count in recent errors', () => {
    const base = validRun(C5, D);
    const before = course(foldProgress(base), C5);
    const s = foldProgress([...base, ...training(C5, '2026-03-03', 10, 'signes')]);
    const c = course(s, C5);
    expect([c.step, c.nextReview, c.reviewHistory]).toEqual([before.step, before.nextReview, before.reviewHistory]);
    expect(c.recentErrors).toEqual({ signes: 10 });
  });

  it('recent errors: counts over the 10 most recent first answers, all activities', () => {
    const activityId = 'train-x';
    const day = '2026-03-03';
    const mk = (errorType: string | null) => answer({ day, activityId, activity: 'entrainement', courseId: C5, correct: errorType === null, errorType });
    const evts = [
      ...validRun(C5, D), // 12 right answers
      ...['table', 'table', 'table'].map(mk), // pushed out by the 10 below
      ...['regle-signes', 'regle-signes', 'regle-signes', 'table', null, null, null, null, null, null].map(mk),
      // a non-first answer and an unfinished answer are not counted
      answer({ day, activityId, activity: 'entrainement', courseId: C5, correct: false, errorType: 'table', attempt: 2 }),
      answer({ day, activityId, activity: 'entrainement', courseId: C5, correct: false, errorType: null, unfinished: true }),
    ];
    expect(course(foldProgress(evts), C5).recentErrors).toEqual({ 'regle-signes': 3, table: 1 });
  });
});

describe('course status and first answers', () => {
  const D = '2026-03-02';

  it('a started course run is « en-cours »; lesson_part_done also starts it', () => {
    const run = courseRun(FIRST, D, ok(3), []);
    expect(course(foldProgress(run.slice(0, 1)), FIRST).status).toBe('en-cours');
    const part: AppEvent = { id: nextId(), userId: 'u1', at: atOf(D), day: D, kind: 'lesson_part_done', activityId: 'a', moduleId: 'calculs', courseId: FIRST, partIndex: 0, durationMs: 1000 };
    expect(course(foldProgress([part]), FIRST).status).toBe('en-cours');
  });

  it('the course is evaluated at the 5th first end answer, not waiting for activity_end', () => {
    const run = courseRun(FIRST, D, ok(7), ok(5));
    const withoutEnd = run.filter((e) => e.kind !== 'activity_end');
    expect(course(foldProgress(withoutEnd), FIRST).status).toBe('valide');
    expect(course(foldProgress(withoutEnd.slice(0, -1)), FIRST).status).toBe('en-cours');
  });

  it('a wrong « decouverte » answer changes neither the run count nor the recent errors', () => {
    const run = courseRun(FIRST, D, ok(7), ok(5));
    const noise = [0, 1, 2].map(() => answer({ day: D, activityId: 'disc', activity: 'decouverte', courseId: FIRST, correct: false }));
    const base = foldProgress(run);
    const withNoise = foldProgress([...noise, ...run]);
    expect(withNoise.journal.runs).toEqual(base.journal.runs);
    expect(course(withNoise, FIRST)).toEqual(course(base, FIRST));
    expect(course(foldProgress(noise), FIRST).status).toBe('disponible');
  });

  it('only first answers count: retries (attempt > 1) are ignored', () => {
    const activityId = 'run-retry';
    const evts: AppEvent[] = [];
    for (let i = 0; i < 7; i++) evts.push(answer({ day: D, activityId, activity: 'lecon', courseId: FIRST, correct: true }));
    // 2 wrong end answers then their retries, right: still 3/5 at the end
    evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: false, prompt: 'x1' }));
    evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: false, prompt: 'x2' }));
    for (let i = 0; i < 3; i++) evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: true }));
    evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: true, prompt: 'x1', attempt: 2 }));
    evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: true, prompt: 'x2', attempt: 2 }));
    expect(course(foldProgress(evts), FIRST).status).toBe('a-rattraper');
  });

  it('a skipped answer counts as wrong', () => {
    const run = courseRun(FIRST, D, ok(7), ok(5));
    const finIdx = run.findIndex((e) => e.kind === 'answer' && e.activity === 'fin');
    const tamper = (i: number) => {
      const e = run[i]!;
      if (e.kind === 'answer') run[i] = { ...e, correct: true, skipped: true };
    };
    tamper(finIdx);
    tamper(finIdx + 1);
    expect(course(foldProgress(run), FIRST).status).toBe('a-rattraper');
  });

  it('« Simplifie » (unfinished) is neutral and does not consume the first answer', () => {
    // Both ways a client may number the next try: attempt 2 (tries counted) or attempt 1 again.
    for (const nextAttempt of [2, 1]) {
      const activityId = `run-u${nextAttempt}`;
      const evts: AppEvent[] = [];
      for (let i = 0; i < 7; i++) evts.push(answer({ day: D, activityId, activity: 'lecon', courseId: FIRST, correct: true }));
      for (let i = 0; i < 4; i++) {
        evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: false, unfinished: true, errorType: null, prompt: `f${i}` }));
        evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: true, prompt: `f${i}`, attempt: nextAttempt }));
      }
      const four = foldProgress(evts);
      expect(course(four, FIRST).status).toBe('en-cours'); // 4 first end answers so far
      evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: true }));
      expect(course(foldProgress(evts), FIRST).status).toBe('valide');
    }
  });

  it('after an unfinished answer, a wrong try is the first answer and the next try is not', () => {
    const activityId = 'run-uw';
    const evts: AppEvent[] = [];
    for (let i = 0; i < 7; i++) evts.push(answer({ day: D, activityId, activity: 'lecon', courseId: FIRST, correct: true }));
    evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: false, unfinished: true, errorType: null, prompt: 'g' }));
    evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: false, prompt: 'g', attempt: 2 }));
    evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: false, prompt: 'g' }));
    evts[evts.length - 1] = { ...(evts[evts.length - 1] as Extract<AppEvent, { kind: 'answer' }>), attempt: 3, correct: true };
    for (let i = 0; i < 3; i++) evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: true }));
    expect(course(foldProgress(evts), FIRST).status).toBe('en-cours'); // 'g' counts once (wrong): 4 first end answers
    evts.push(answer({ day: D, activityId, activity: 'fin', courseId: FIRST, correct: false }));
    expect(course(foldProgress(evts), FIRST).status).toBe('a-rattraper'); // 3/5
  });

  it('validating course N unlocks N+1 only; a validated course stays validated', () => {
    const evts = [...validRun(FIRST, D), ...courseRun(FIRST, '2026-03-03', ok(7), results(0, 5))];
    const s = foldProgress(evts);
    expect(course(s, FIRST)).toMatchObject({ status: 'valide', validatedOn: D });
    expect(course(s, SECOND).status).toBe('disponible');
  });

  it('module progress: done when all its courses are validated', () => {
    const ids = IDS;
    const evts = ids.flatMap((id) => validRun(id, D)); // each run ends with its activity_end
    expect(foldProgress(evts.slice(0, -2)).modules.calculs).toMatchObject({ validated: 7, done: false });
    const s = foldProgress(evts);
    expect(s.modules.calculs).toEqual({ moduleId: 'calculs', validated: 8, total: 8, done: true });
  });
});

describe('what counts as a review', () => {
  const D = '2026-03-02';
  const due = '2026-03-04';

  it('a review session with several courses counts each course on its own 3 answers', () => {
    const evts = [...validRun(FIRST, D), ...validRun(SECOND, D), ...review(due, { [FIRST]: ok(3), [SECOND]: results(2, 3) })];
    const s = foldProgress(evts);
    expect([stepLetter(s, FIRST), course(s, FIRST).nextReview]).toEqual(['B', '2026-03-06']);
    expect([stepLetter(s, SECOND), course(s, SECOND).nextReview, course(s, SECOND).lastReviewFailed]).toEqual(['A', '2026-03-05', true]);
  });

  it('an interrupted review (fewer than 3 first answers for a course) does not count: still due', () => {
    const evts = [...validRun(C5, D), ...review(due, { [C5]: ok(2) })];
    const c = course(foldProgress(evts), C5);
    expect([c.step, c.nextReview, c.reviewHistory]).toEqual([0, due, []]);
  });

  it('retries in a review do not count toward the 3 first answers', () => {
    const activityId = 'rev-r';
    const evts = [
      ...validRun(C5, D),
      answer({ day: due, activityId, activity: 'revision', courseId: C5, correct: false, prompt: 'r' }),
      answer({ day: due, activityId, activity: 'revision', courseId: C5, correct: true, prompt: 'r', attempt: 2 }),
      answer({ day: due, activityId, activity: 'revision', courseId: C5, correct: true }),
    ];
    expect(course(foldProgress(evts), C5).reviewHistory).toEqual([]);
    evts.push(answer({ day: due, activityId, activity: 'revision', courseId: C5, correct: true }));
    expect(course(foldProgress(evts), C5).reviewHistory).toEqual([{ day: due, ok: false }]);
  });

  it('a course cannot be reviewed twice the same day: the second complete review is ignored', () => {
    const evts = [...validRun(C5, D), ...rev(due, C5, 2), ...rev(due, C5, 3)];
    const c = course(foldProgress(evts), C5);
    expect(c.reviewHistory).toEqual([{ day: due, ok: false }]);
    expect([c.step, c.nextReview]).toEqual([0, '2026-03-05']);
  });

  it('a review of a course not yet due is ignored (no early review)', () => {
    const evts = [...validRun(C5, D), ...rev('2026-03-03', C5, 3)];
    const c = course(foldProgress(evts), C5);
    expect([c.step, c.nextReview, c.reviewHistory]).toEqual([0, due, []]);
  });

  it('a late review counts from the day it is done', () => {
    const evts = [...validRun(C5, D), ...rev('2026-03-10', C5, 3)];
    expect(course(foldProgress(evts), C5).nextReview).toBe('2026-03-12');
  });

  it('uses the event day, not its timestamp', () => {
    const evts = validRun(C5, D).map((e) => ({ ...e, at: e.at + 5 * 86_400_000 }));
    expect(course(foldProgress(evts), C5).validatedOn).toBe(D);
  });
});

describe('applyEvent', () => {
  function journal(): AppEvent[] {
    const D = '2026-03-02';
    return [
      ...courseRun(FIRST, D, ok(7), results(3, 5)),
      ...rattrapage(FIRST, '2026-03-03', 4),
      ...validRun(SECOND, '2026-03-03'),
      ...training(SECOND, '2026-03-04', 4, 'signes'),
      ...review('2026-03-05', { [FIRST]: ok(3), [SECOND]: results(1, 3) }),
      ...review('2026-03-06', { [SECOND]: ok(3) }),
      ...review('2026-03-06', { [SECOND]: ok(3) }), // same day: ignored
      ...review('2026-03-07', { [FIRST]: ok(2) }), // interrupted
      ...review('2026-03-08', { [SECOND]: results(2, 3), [FIRST]: ok(3) }),
      ...courseRun(THIRD, '2026-03-08', ok(7), ok(4)), // still running
    ];
  }

  /** Deterministic shuffle (LCG). */
  function shuffle<T>(xs: T[], seed: number): T[] {
    const a = [...xs];
    let s = seed;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) % 2147483648;
      const j = s % (i + 1);
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  }

  it('folding equals applying each event in turn', () => {
    const evts = journal();
    const stepwise = evts.reduce(applyEvent, foldProgress([]));
    expect(stepwise).toEqual(foldProgress(evts));
  });

  it('holds whatever the split between a fold and later events', () => {
    const evts = journal();
    const full = foldProgress(evts);
    for (let cut = 0; cut <= evts.length; cut += 7) {
      const s = evts.slice(cut).reduce(applyEvent, foldProgress(evts.slice(0, cut)));
      expect(s).toEqual(full);
    }
  });

  it('events arriving out of order (offline sync) give the same state', () => {
    const evts = journal();
    const full = foldProgress(evts);
    for (const seed of [1, 2, 3]) {
      const mixed = shuffle(evts, seed);
      expect(foldProgress(mixed)).toEqual(full);
      expect(mixed.reduce(applyEvent, foldProgress([]))).toEqual(full);
      const cut = Math.floor(mixed.length / 2);
      expect(mixed.slice(cut).reduce(applyEvent, foldProgress(mixed.slice(0, cut)))).toEqual(full);
    }
  });

  it('applying an event twice (same id) changes nothing', () => {
    const evts = journal();
    const s = foldProgress(evts);
    expect(applyEvent(s, evts[3]!)).toEqual(s);
    expect(foldProgress([...evts, evts[10]!])).toEqual(s);
  });

  it('does not mutate the given state', () => {
    const evts = journal();
    const s = foldProgress(evts.slice(0, 20));
    const copy = JSON.parse(JSON.stringify(s)) as ProgressState;
    applyEvent(s, evts[20]!);
    applyEvent(s, { ...evts[2]!, id: 'older', at: 0 }); // out of order: refold path
    expect(s).toEqual(copy);
  });
});
