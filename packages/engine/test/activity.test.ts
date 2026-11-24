import { describe, expect, it } from 'vitest';
import type { AppEvent, QuestionKind } from '../src/events';
import { getCourse, getModule } from '../src/courses';
import type { Outcome, Question } from '../src/exercises/types';
import { buildQuestion } from '../src/exercises/build';
import { seededRng } from '../src/rng';
import { foldProgress, LADDER, type ProgressState } from '../src/srs';
import { nextReviewSession } from '../src/reviews';
import { addDays } from '../src/time';
import {
  CHOIX_REPEAT_DISTANCE,
  LESSON_REPEAT_NOTE,
  MEME_TYPE_DISTANCE,
  TRAINING_SERIES_LENGTH,
  answer,
  availableKinds,
  courseRunItems,
  createActivity,
  current,
  endEvent,
  explanationDone,
  isDone,
  promptOf,
  rattrapageItems,
  reviewItems,
  skip,
  trainingPool,
  trainingSeries,
  type ActivityItem,
  type ActivityState,
  type NewEvent,
  type QuestionItem,
} from '../src/activity';

const IDS = getModule('calculs').courseIds;
const C0 = IDS[0]!;
const C1 = IDS[1]!;
const C5 = 'c05-multiplier-deux';
const DAY = '2026-03-02';

const ok: Outcome = { correct: true, unfinished: false, errorType: null, errorFamily: null, given: 'g', expected: 'e' };
const ko = (errorType = 'autre'): Outcome => ({ correct: false, unfinished: false, errorType, errorFamily: 'autre', given: 'g', expected: 'e' });
const simplifie: Outcome = { correct: false, unfinished: true, errorType: null, errorFamily: null, given: '-12/4', expected: '-3' };

/** n distinct typed questions of Cours 5, level 1, as 'fin' items q0…q(n-1). */
function finItems(n: number, seed = 1): QuestionItem[] {
  const course = getCourse(C5);
  const rng = seededRng(seed);
  return Array.from({ length: n }, (_, i) => ({
    type: 'question' as const,
    itemId: `q${i}`,
    courseId: C5,
    activity: 'fin' as const,
    question: buildQuestion(course, 'saisie', { rng, level: 1, timesSeen: 0 }),
  }));
}

const start = (items: ActivityItem[], seed = 7) =>
  createActivity('cours', items, { activityId: 'act-1', rng: seededRng(seed) });

/** Item id and role of the current step. */
function head(s: ActivityState): string {
  const c = current(s);
  if (!c) return 'fin';
  if (c.type === 'explication') return `expl:${c.item.itemId}`;
  return `${c.item.itemId}:${c.role}`;
}

/** Answers with the outcomes in order (default: right) and returns the events and the order seen. */
function play(s: ActivityState, outcomes: Record<string, Outcome[]> = {}) {
  const seen: string[] = [];
  const events: NewEvent[] = [];
  const used: Record<string, number> = {};
  let guard = 0;
  while (!isDone(s) && guard++ < 200) {
    const c = current(s)!;
    if (c.type === 'explication') {
      const r = explanationDone(s, 1000);
      events.push(r.event);
      s = r.state;
      continue;
    }
    const key = head(s);
    seen.push(key);
    const list = outcomes[key] ?? [];
    const i = (used[key] = (used[key] ?? 0) + 1) - 1;
    const r = answer(s, list[i] ?? ok, 1000);
    events.push(r.event);
    s = r.state;
  }
  return { state: s, seen, events };
}

let seq = 0;
function stamp(events: NewEvent[], day = DAY): AppEvent[] {
  return events.map((e) => {
    seq++;
    return { ...e, id: `x${String(seq).padStart(6, '0')}`, userId: 'u1', at: Date.parse(`${day}T09:00:00Z`) + seq * 1000, day } as AppEvent;
  });
}

const answers = (events: NewEvent[]) => events.filter((e): e is Extract<NewEvent, { kind: 'answer' }> => e.kind === 'answer');

describe('activité — déroulé de base', () => {
  it('tout juste : chaque question une fois, attempt = 1, puis activité finie', () => {
    const { state, seen, events } = play(start(finItems(5)));
    expect(seen).toEqual(['q0:original', 'q1:original', 'q2:original', 'q3:original', 'q4:original']);
    expect(answers(events).map((e) => e.attempt)).toEqual([1, 1, 1, 1, 1]);
    expect(isDone(state)).toBe(true);
    expect(current(state)).toBeNull();
  });

  it("l'événement de réponse reprend la question et le résultat", () => {
    const items = finItems(1);
    const s = start(items);
    const { event } = answer(s, ko('signe-oublie'), 4200);
    const q = items[0]!.question;
    expect(event).toEqual({
      kind: 'answer',
      activityId: 'act-1',
      activity: 'fin',
      moduleId: 'calculs',
      courseId: C5,
      level: 1,
      questionKind: 'saisie',
      prompt: promptOf(q),
      given: 'g',
      expected: 'e',
      correct: false,
      unfinished: false,
      errorType: 'signe-oublie',
      errorFamily: 'autre',
      attempt: 1,
      skipped: false,
      durationMs: 4200,
    });
  });

  it('les fonctions ne modifient pas l’état reçu', () => {
    const s = start(finItems(5));
    const snapshot = structuredClone(s);
    answer(s, ko(), 1000);
    answer(s, simplifie, 1000);
    expect(s).toEqual(snapshot);
    const failedTwice = answer(answer(answer(s, ko(), 1).state, ok, 1).state, ok, 1).state;
    const snap2 = structuredClone(failedTwice);
    answer(failedTwice, ok, 1);
    expect(failedTwice).toEqual(snap2);
  });

  it('même état, même réponse → même résultat (le calcul du même type ne dépend que de l’état)', () => {
    let s = start(finItems(5));
    s = answer(s, ok, 1000).state;
    const a = answer(s, ko(), 1000);
    const b = answer(s, ko(), 1000);
    expect(a.state).toEqual(b.state);
    expect(a.event).toEqual(b.event);
  });

  it('activité vide : erreur claire', () => {
    expect(() => createActivity('cours', [], { activityId: 'x', rng: seededRng(1) })).toThrow('Activité sans question ni explication');
  });

  it('fin d’activité : activity_end, completed seulement si tout est fait', () => {
    const s = start(finItems(2));
    expect(endEvent(s)).toEqual({ kind: 'activity_end', activityId: 'act-1', activity: 'fin', moduleId: 'calculs', courseId: C5, completed: false });
    const done = play(s).state;
    expect(endEvent(done).completed).toBe(true);
  });
});

describe('après une erreur (doc 01 §6)', () => {
  it('un calcul du même type 3 questions plus loin (position n + 3), et le même calcul à la fin', () => {
    const { seen } = play(start(finItems(6)), { 'q0:original': [ko()] });
    expect(MEME_TYPE_DISTANCE).toBe(3);
    expect(seen).toEqual([
      'q0:original', 'q1:original', 'q2:original', 'q0:meme-type',
      'q3:original', 'q4:original', 'q5:original', 'q0:repetition',
    ]);
    expect(seen.indexOf('q0:meme-type') - seen.indexOf('q0:original')).toBe(3);
  });

  it('exactement 3 questions restantes : le calcul du même type avant la dernière', () => {
    const { seen } = play(start(finItems(4)), { 'q0:original': [ko()] });
    expect(seen).toEqual(['q0:original', 'q1:original', 'q2:original', 'q0:meme-type', 'q3:original', 'q0:repetition']);
  });

  it('2 questions restantes : le calcul du même type à la fin, puis le même calcul', () => {
    const { seen } = play(start(finItems(5)), { 'q2:original': [ko()] });
    expect(seen).toEqual(['q0:original', 'q1:original', 'q2:original', 'q3:original', 'q4:original', 'q2:meme-type', 'q2:repetition']);
  });

  it('moins de 3 questions restantes (1 ou 0) : le calcul du même type à la fin, puis le même calcul', () => {
    const { seen } = play(start(finItems(5)), { 'q3:original': [ko()] });
    expect(seen).toEqual(['q0:original', 'q1:original', 'q2:original', 'q3:original', 'q4:original', 'q3:meme-type', 'q3:repetition']);
    const last = play(start(finItems(5)), { 'q4:original': [ko()] });
    expect(last.seen.slice(-3)).toEqual(['q4:original', 'q4:meme-type', 'q4:repetition']);
  });

  it('les repassages en attente comptent parmi les questions restantes', () => {
    // q0 raté → [q1 q2 S0 q3 R0] ; q2 raté → restent S0 q3 R0 (3) → après S0 q3 ; sans eux, ce serait la fin
    const { seen } = play(start(finItems(4)), { 'q0:original': [ko()], 'q2:original': [ko()] });
    expect(seen).toEqual([
      'q0:original', 'q1:original', 'q2:original', 'q0:meme-type', 'q3:original', 'q2:meme-type',
      'q0:repetition', 'q2:repetition',
    ]);
  });

  it('le même calcul revient à la fin tant qu’il est raté', () => {
    const { seen, events } = play(start(finItems(2)), { 'q0:original': [ko()], 'q0:repetition': [ko(), ko(), ok] });
    expect(seen).toEqual(['q0:original', 'q1:original', 'q0:meme-type', 'q0:repetition', 'q0:repetition', 'q0:repetition']);
    expect(answers(events).filter((e) => e.prompt === answers(events)[0]!.prompt).map((e) => e.correct)).toEqual([false, false, false, true]);
  });

  it('le repassage est exactement le même calcul ; le calcul du même type est un nouveau calcul du même cours, niveau et type', () => {
    let s = start(finItems(2));
    const original = current(s)!;
    if (original.type !== 'question') throw new Error();
    s = answer(s, ko(), 1000).state;
    s = answer(s, ok, 1000).state; // q1
    const meme = current(s)!;
    if (meme.type !== 'question') throw new Error();
    expect(meme.role).toBe('meme-type');
    expect(meme.item.itemId).toBe('q0');
    expect(meme.question.kind).toBe(original.question.kind);
    expect(meme.question.kind === 'saisie' && meme.question.ex.level).toBe(1);
    expect(meme.question.kind === 'saisie' && meme.question.ex.courseId).toBe(C5);
    expect(promptOf(meme.question)).not.toBe(promptOf(original.question));
    s = answer(s, ok, 1000).state;
    const rep = current(s)!;
    if (rep.type !== 'question') throw new Error();
    expect(rep.role).toBe('repetition');
    expect(rep.question).toEqual(original.question);
  });

  it('même piège : le calcul du même type vise l’erreur faite (Cours 0, « Trouver l’erreur »)', () => {
    const course = getCourse(C0);
    for (const err of course.errors) {
      const rng = seededRng(3);
      const q = buildQuestion(course, 'erreur', { rng, level: 1, timesSeen: 0 });
      let s = createActivity('cours', [{ type: 'question', itemId: 'a', courseId: C0, activity: 'fin', question: q }], { activityId: 'x', rng });
      s = answer(s, ko(err.id), 1000).state;
      const c = current(s)!;
      expect(c.type === 'question' && c.role).toBe('meme-type');
      // « parentheses-en-tete » n'est jamais produite par le générateur : son piège est un négatif en tête mal écrit
      expect(c.type === 'question' && c.question.kind === 'erreur' && c.question.errorType).toBe(err.id === 'parentheses-en-tete' ? 'moins-apres' : err.id);
    }
  });

  it('erreur sur un calcul du même type : rien de plus (pas de nouveau calcul, pas de repassage de plus)', () => {
    const { seen } = play(start(finItems(2)), { 'q0:original': [ko()], 'q0:meme-type': [ko()] });
    expect(seen).toEqual(['q0:original', 'q1:original', 'q0:meme-type', 'q0:repetition']);
  });

  it('erreur sur un repassage : pas de nouveau calcul du même type', () => {
    const { seen } = play(start(finItems(1)), { 'q0:original': [ko()], 'q0:repetition': [ko()] });
    expect(seen).toEqual(['q0:original', 'q0:meme-type', 'q0:repetition', 'q0:repetition']);
  });

  it('les calculs du même type et les repassages sont enregistrés avec attempt ≥ 2 (numéros croissants par calcul)', () => {
    const { events } = play(start(finItems(2)), { 'q0:original': [ko()], 'q0:repetition': [ko()] });
    expect(answers(events).map((e) => e.attempt)).toEqual([1, 1, 2, 3, 4]);
  });
});

describe('« Passer » (doc 01 §6, « Même calcul raté 2 fois → Passer »)', () => {
  const canSkip = (s: ActivityState) => {
    const c = current(s);
    return c?.type === 'question' && c.canSkip;
  };

  it('pas de « Passer » après le 1er échec, « Passer » après le 2e échec sur le même calcul', () => {
    let s = start(finItems(1));
    expect(canSkip(s)).toBe(false);
    s = answer(s, ko(), 1000).state; // 1er échec
    expect(head(s)).toBe('q0:meme-type');
    expect(canSkip(s)).toBe(false);
    s = answer(s, ok, 1000).state;
    expect(head(s)).toBe('q0:repetition');
    expect(canSkip(s)).toBe(false);
    s = answer(s, ko(), 1000).state; // 2e échec
    expect(head(s)).toBe('q0:repetition');
    expect(canSkip(s)).toBe(true);
    expect(() => skip(start(finItems(1)), 1000)).toThrow();
  });

  it('un échec sur le calcul du même type ne compte pas pour « Passer » (ce n’est pas le même calcul)', () => {
    let s = start(finItems(1));
    s = answer(s, ko(), 1000).state;
    s = answer(s, ko(), 1000).state; // calcul du même type raté
    expect(head(s)).toBe('q0:repetition');
    expect(canSkip(s)).toBe(false);
  });

  it('passer : enregistré passé et raté, le calcul ne revient plus', () => {
    let s = start(finItems(2));
    s = answer(s, ko(), 1000).state; // q0
    s = answer(s, ok, 1000).state; // q1
    s = answer(s, ok, 1000).state; // même type
    s = answer(s, ko(), 1000).state; // repassage raté : 2e échec
    const r = skip(s, 3000);
    expect(r.event).toMatchObject({
      kind: 'answer', courseId: C5, activity: 'fin', skipped: true, correct: false, unfinished: false,
      attempt: 4, given: '', expected: 'e', durationMs: 3000,
    });
    expect(isDone(r.state)).toBe(true);
    expect(endEvent(r.state).completed).toBe(true);
  });
});

describe('« Passer » par calcul (doc 07 #13)', () => {
  it('deux calculs différents ratés 2 fois : les deux se passent, chacun à son tour', () => {
    let s = start(finItems(2));
    s = answer(s, ko(), 1000).state; // q0 : 1er échec
    s = answer(s, ko(), 1000).state; // q1 : 1er échec
    // les calculs du même type sont réussis, les repassages ratés une fois (2e échec de chaque calcul)
    const failed = new Set<string>();
    while (!(failed.has('q0') && failed.has('q1'))) {
      const c = current(s)!;
      if (c.type !== 'question') throw new Error();
      const again = c.role === 'repetition';
      if (again) failed.add(c.item.itemId);
      s = answer(s, again ? ko() : ok, 1000).state;
    }
    const canSkip = (x: ActivityState) => {
      const c = current(x);
      return c?.type === 'question' && c.canSkip;
    };
    const skipped: string[] = [];
    while (!isDone(s)) {
      expect(canSkip(s)).toBe(true);
      skipped.push(head(s));
      s = skip(s, 1000).state;
    }
    expect(skipped.sort()).toEqual(['q0:repetition', 'q1:repetition']);
  });
});

describe('« Simplifie » (doc 03 §3)', () => {
  it('pas compté faux : enregistré unfinished avec le même numéro, le calcul reste affiché', () => {
    let s = start(finItems(2));
    const r1 = answer(s, simplifie, 1000);
    expect(r1.event).toMatchObject({ unfinished: true, correct: false, attempt: 1 });
    s = r1.state;
    expect(head(s)).toBe('q0:original');
    const r2 = answer(s, simplifie, 1000);
    expect(r2.event).toMatchObject({ unfinished: true, attempt: 1 });
    const r3 = answer(r2.state, ok, 1000);
    expect(r3.event).toMatchObject({ unfinished: false, correct: true, attempt: 1 });
    expect(head(r3.state)).toBe('q1:original');
  });

  it('« Simplifie » sur un repassage : même numéro que la réponse qui suit', () => {
    let s = start(finItems(1));
    s = answer(s, ko(), 1000).state;
    s = answer(s, ok, 1000).state;
    const r = answer(s, simplifie, 1000);
    expect(r.event.kind === 'answer' && r.event.attempt).toBe(3);
    expect(answer(r.state, ok, 1000).event).toMatchObject({ attempt: 3, unfinished: false });
  });
});

describe('cours : leçon, exemples guidés et 5 exercices de fin (doc 01 §2, doc 03 §5)', () => {
  it('les parties dans l’ordre du cours, puis 5 exercices de fin tapés au niveau 1', () => {
    for (const id of IDS) {
      const course = getCourse(id);
      const items = courseRunItems(course, seededRng(5));
      expect(items.length).toBe(course.parts.length + 5);
      course.parts.forEach((p, i) => {
        const it = items[i]!;
        expect(it.type).toBe(p.type === 'etapes' ? 'explication' : p.type);
        if (p.type === 'etapes' && it.type === 'explication') expect(it.steps).toBe(p.steps);
        if (p.type === 'question' && it.type === 'question') {
          expect(it.activity).toBe(p.activity);
          expect(it.question).toBe(p.question);
        }
        if (p.type !== 'question' && it.type === 'explication') expect(it.partIndex).toBe(i);
      });
      const fin = items.slice(course.parts.length) as QuestionItem[];
      expect(fin.every((f) => f.type === 'question' && f.activity === 'fin')).toBe(true);
      expect(fin.every((f) => f.question.kind === course.endExercises.kind)).toBe(true);
      expect(id === C0 ? ['erreur'] : ['saisie', 'trou']).toContain(course.endExercises.kind);
      expect(fin.every((f) => ('ex' in f.question ? f.question.ex.level : 0) === 1)).toBe(true);
      expect(new Set(fin.map((f) => promptOf(f.question))).size).toBe(5);
      expect(new Set(items.map((x) => x.itemId)).size).toBe(items.length);
    }
  });

  it('les explications donnent lesson_part_done avec leur numéro de partie', () => {
    const course = getCourse(C1);
    const { events } = play(createActivity('cours', courseRunItems(course, seededRng(2)), { activityId: 'r', rng: seededRng(2) }));
    const parts = events.filter((e) => e.kind === 'lesson_part_done');
    const expected = course.parts.flatMap((p, i) => (p.type === 'explication' ? [i] : []));
    expect(parts.map((e) => e.kind === 'lesson_part_done' && e.partIndex)).toEqual(expected);
    expect(parts[0]).toEqual({ kind: 'lesson_part_done', activityId: 'r', moduleId: 'calculs', courseId: C1, partIndex: expected[0], durationMs: 1000 });
  });

  it('les explications ne comptent pas parmi les « 3 questions plus loin »', () => {
    const expl = (itemId: string, partIndex: number): ActivityItem => ({ type: 'explication', itemId, courseId: C5, partIndex, blocks: [] });
    const [q0, q1, q2, q3] = finItems(4);
    const s = start([q0!, expl('e1', 1), q1!, expl('e2', 3), q2!, q3!]);
    const steps: string[] = [];
    let state = answer(s, ko(), 1).state;
    while (!isDone(state)) {
      steps.push(head(state));
      const c = current(state)!;
      state = c.type === 'explication' ? explanationDone(state, 1).state : answer(state, ok, 1).state;
    }
    expect(steps).toEqual(['expl:e1', 'q1:original', 'expl:e2', 'q2:original', 'q0:meme-type', 'q3:original', 'q0:repetition']);
  });

  it('un exemple du Cours 0 (« Réécris » fait à la main) raté n’a pas de calcul du même type : il repasse juste avant les exercices de fin', () => {
    const course = getCourse(C0);
    const items = courseRunItems(course, seededRng(2));
    const trou = items.find((x) => x.type === 'question' && x.question.kind === 'reecrire')!;
    let s = createActivity('cours', items, { activityId: 'r', rng: seededRng(2) });
    while (head(s) !== `${trou.itemId}:original`) {
      const c = current(s)!;
      s = c.type === 'explication' ? explanationDone(s, 1).state : answer(s, ok, 1).state;
    }
    s = answer(s, ko(), 1).state;
    const ids = s.queue.map((x) => (x.type === 'question' ? `${x.item.itemId}:${x.role}` : 'expl'));
    expect(ids.some((x) => x.endsWith(':meme-type'))).toBe(false);
    const rep = ids.indexOf(`${trou.itemId}:repetition`);
    expect(ids[rep + 1]).toBe('fin-0:original');
  });

  it('seule la 1re réponse compte : 5 sur 5 aux exercices de fin malgré calculs du même type et repassages ratés → validé', () => {
    const course = getCourse(C1);
    const items = courseRunItems(course, seededRng(9));
    const firstQ = items.find((x) => x.type === 'question')!;
    const { events } = play(createActivity('cours', items, { activityId: 'run-1', rng: seededRng(9) }), {
      [`${firstQ.itemId}:original`]: [ko()],
      [`${firstQ.itemId}:meme-type`]: [ko()],
      [`${firstQ.itemId}:repetition`]: [ko(), ko(), ok],
    });
    const state = foldProgress(stamp(events));
    const questions = items.filter((x) => x.type === 'question').length;
    expect(state.journal.runs[`run-1|${C1}`]).toMatchObject({ first: questions, ok: questions - 1, fin: 5, finOk: 5, done: true });
    expect(state.courses[C1]!.status).toBe('valide');
  });

  it('seule la 1re réponse compte : 2 exercices de fin ratés puis réussis au repassage → 3 sur 5, rattrapage', () => {
    const course = getCourse(C1);
    const items = courseRunItems(course, seededRng(9));
    const fins = items.filter((x) => x.type === 'question' && x.activity === 'fin');
    const { events } = play(createActivity('cours', items, { activityId: 'run-2', rng: seededRng(9) }), {
      [`${fins[0]!.itemId}:original`]: [ko()],
      [`${fins[3]!.itemId}:original`]: [ko()],
    });
    const state = foldProgress(stamp(events));
    expect(state.journal.runs[`run-2|${C1}`]).toMatchObject({ fin: 5, finOk: 3 });
    expect(state.courses[C1]!.status).toBe('a-rattraper');
  });

  it('« Simplifie » puis bonne réponse : compte comme une 1re réponse juste', () => {
    const course = getCourse(C1);
    const items = courseRunItems(course, seededRng(9));
    const fin0 = items.find((x) => x.type === 'question' && x.activity === 'fin')!;
    const { events } = play(createActivity('cours', items, { activityId: 'run-3', rng: seededRng(9) }), {
      [`${fin0.itemId}:original`]: [simplifie, simplifie, ok],
    });
    const state = foldProgress(stamp(events));
    expect(state.journal.runs[`run-3|${C1}`]).toMatchObject({ fin: 5, finOk: 5 });
    expect(state.courses[C1]!.status).toBe('valide');
  });
});

describe('rattrapage', () => {
  it('5 exercices tapés du cours, niveau 1, tous différents ; validé à 4 sur 5 malgré les repassages', () => {
    const course = getCourse(C5);
    const items = rattrapageItems(course, seededRng(4));
    expect(items).toHaveLength(5);
    expect(items.every((x) => x.activity === 'rattrapage' && x.question.kind === course.endExercises.kind)).toBe(true);
    expect(items.every((x) => 'ex' in x.question && x.question.ex.level === 1)).toBe(true);
    expect(new Set(items.map((x) => promptOf(x.question))).size).toBe(5);
    expect(rattrapageItems(getCourse(C0), seededRng(4)).every((x) => x.question.kind === 'erreur')).toBe(true);

    const s = createActivity('rattrapage', items, { activityId: 'ratt-1', rng: seededRng(4) });
    expect(endEvent(s)).toMatchObject({ activity: 'rattrapage', courseId: C5 });
    const { events } = play(s, { [`${items[2]!.itemId}:original`]: [ko()], [`${items[2]!.itemId}:meme-type`]: [ko()] });
    const state = foldProgress(stamp(events));
    expect(state.journal.runs[`ratt-1|${C5}`]).toMatchObject({ first: 5, ok: 4 });
    expect(state.courses[C5]!.status).toBe('valide');
  });
});

/** Cours 1 and Cours 5 validated on DAY by a 5/5 rattrapage, so both are due on DAY + 2. */
function validatedState(courseIds: string[] = [C1, C5]): { events: AppEvent[]; state: ProgressState } {
  const events = courseIds.flatMap((id) => {
    const s = createActivity('rattrapage', rattrapageItems(getCourse(id), seededRng(1)), { activityId: `v-${id}`, rng: seededRng(1) });
    return stamp(play(s).events);
  });
  return { events, state: foldProgress(events) };
}

describe('révision', () => {
  it('une erreur, puis calcul du même type et repassage justes → révision ratée (2 sur 3), pas 4 sur 5', () => {
    const { events: before, state } = validatedState();
    const due = addDays(DAY, 2);
    const session = nextReviewSession(state, due, seededRng(8), () => 'rev-1')!;
    const items = reviewItems(session);
    expect(items).toHaveLength(6);
    expect(items.every((x) => x.activity === 'revision')).toBe(true);
    const s = createActivity('revision', items, { activityId: session.activityId, rng: seededRng(8) });
    expect(endEvent(s).courseId).toBeNull();
    const failed = items.find((x) => x.courseId === C5)!;
    const { events, seen } = play(s, { [`${failed.itemId}:original`]: [ko()] });
    expect(seen.filter((k) => k.startsWith(`${failed.itemId}:`))).toEqual([
      `${failed.itemId}:original`, `${failed.itemId}:meme-type`, `${failed.itemId}:repetition`,
    ]);
    const c5Answers = answers(events).filter((e) => e.courseId === C5);
    expect(c5Answers.map((e) => e.attempt).sort()).toEqual([1, 1, 1, 2, 3]);
    const after = foldProgress([...before, ...stamp(events, due)]);
    expect(after.journal.runs[`rev-1|${C5}`]).toMatchObject({ first: 3, ok: 2, done: true });
    expect(after.courses[C5]!.reviewHistory).toEqual([{ day: due, ok: false }]);
    expect(after.courses[C5]!.nextReview).toBe(addDays(due, 1));
    expect(after.courses[C1]!.reviewHistory).toEqual([{ day: due, ok: true }]);
  });

  it('le calcul du même type d’une révision garde son format rapide (qcm / vraifaux / classer)', () => {
    const { state } = validatedState([C0, C1, C5]);
    for (let seed = 0; seed < 10; seed++) {
      const session = nextReviewSession(state, addDays(DAY, 2), seededRng(seed), () => 'rev')!;
      const items = reviewItems(session);
      let s = createActivity('revision', items, { activityId: 'rev', rng: seededRng(seed) });
      const kinds: QuestionKind[] = [];
      while (!isDone(s)) {
        const c = current(s)!;
        if (c.type !== 'question') throw new Error();
        kinds.push(c.question.kind);
        s = answer(s, c.role === 'original' ? ko() : ok, 1).state;
      }
      // + les formats propres au Cours 0 (« Quelle règle ? », « Réécris », « Toucher la faute », son exercice de fin)
      expect(kinds.every((k) => ['qcm', 'vraifaux', 'classer', 'choix', 'reecrire', 'erreur'].includes(k))).toBe(true);
    }
  });
});

describe('entraînement : séries de 10 (doc 03 §5)', () => {
  it('« tout mélangé » : 10 questions sur les cours validés, tous types possibles, niveaux 1 à 3', () => {
    const { state } = validatedState([C0, C1, C5]);
    const seenKinds = new Set<QuestionKind>();
    const seenCourses = new Set<string>();
    for (let seed = 0; seed < 30; seed++) {
      const items = trainingSeries(state, 'tout', seededRng(seed));
      expect(items).toHaveLength(TRAINING_SERIES_LENGTH);
      expect(TRAINING_SERIES_LENGTH).toBe(10);
      expect(new Set(items.map((x) => x.itemId)).size).toBe(10);
      for (const x of items) {
        expect(x.activity).toBe('entrainement');
        expect([C0, C1, C5]).toContain(x.courseId);
        expect(availableKinds(getCourse(x.courseId))).toContain(x.question.kind);
        const level = 'ex' in x.question ? x.question.ex.level : x.question.exs[0]!.level;
        expect([1, 2, 3]).toContain(level);
        seenKinds.add(x.question.kind);
        seenCourses.add(x.courseId);
      }
    }
    expect(seenKinds.size).toBe(10); // 8 types communs + « choix » et « reecrire » du Cours 0
    expect(seenCourses.size).toBe(3);
  });

  it('un cours au choix : uniquement ce cours (niveaux mélangés, pas celui du cours)', () => {
    const { state } = validatedState([C1, C5]);
    const leveled: ProgressState = { ...state, courses: { ...state.courses, [C5]: { ...state.courses[C5]!, step: 3, level: LADDER[3].level } } };
    const items = trainingSeries(leveled, { courseIds: [C5] }, seededRng(1));
    expect(items).toHaveLength(10);
    expect(items.every((x) => x.courseId === C5)).toBe(true);
  });

  it('niveaux mélangés (doc 07 #15B) : sur 1 000 séries, chaque niveau tiré à 1/3 environ, quel que soit le niveau du cours', () => {
    const { state } = validatedState([C0, C1, C5]);
    const leveled: ProgressState = { ...state, courses: { ...state.courses, [C5]: { ...state.courses[C5]!, step: 3, level: LADDER[3].level } } };
    const count: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    for (let seed = 0; seed < 1000; seed++)
      for (const x of trainingSeries(leveled, 'tout', seededRng(seed)))
        count['ex' in x.question ? x.question.ex.level : x.question.exs[0]!.level]!++;
    const total = 1000 * TRAINING_SERIES_LENGTH;
    expect(count[1]! + count[2]! + count[3]!).toBe(total);
    for (const level of [1, 2, 3]) expect(Math.abs(count[level]! / total - 1 / 3)).toBeLessThan(0.02);
  });

  it('types valides par cours : le Cours 0 n’a que ses formats (pas de « Vrai ou faux »), les autres les 8', () => {
    expect(availableKinds(getCourse(C0)).sort()).toEqual(['choix', 'classer', 'erreur', 'qcm', 'reecrire']);
    expect(availableKinds(getCourse(C5)).sort()).toEqual(['classer', 'erreur', 'ordre', 'paires', 'qcm', 'saisie', 'trou', 'vraifaux']);
  });

  it('cours non validé ou aucun cours validé : erreur', () => {
    const { state } = validatedState([C1]);
    expect(() => trainingSeries(state, { courseIds: [C5] }, seededRng(1))).toThrow();
    expect(() => trainingSeries(foldProgress([]), 'tout', seededRng(1))).toThrow();
  });

  it("l'entraînement ne change pas le calendrier, même avec des erreurs et des repassages", () => {
    const { events: before, state } = validatedState([C5]);
    const items = trainingSeries(state, 'tout', seededRng(3));
    const s = createActivity('entrainement', items, { activityId: 'tr-1', rng: seededRng(3) });
    expect(endEvent(s)).toMatchObject({ activity: 'entrainement', courseId: C5 });
    const { events } = play(s, Object.fromEntries(items.map((x) => [`${x.itemId}:original`, [ko()]])));
    const after = foldProgress([...before, ...stamp(events, addDays(DAY, 2))]);
    expect(after.courses[C5]).toMatchObject({ step: 0, nextReview: addDays(DAY, 2), reviewHistory: [] });
  });
});

describe('entraînement : cours à rattraper et sélection (doc 08 n° 1 et 3)', () => {
  it('trainingPool : cours validés et à rattraper, dans l’ordre des cours', () => {
    const { state } = validatedState([IDS[0]!, IDS[1]!, IDS[2]!]);
    const c3 = IDS[3]!;
    const withC3: ProgressState = { ...state, courses: { ...state.courses, [c3]: { ...state.courses[c3]!, status: 'a-rattraper' } } };
    expect(trainingPool(withC3)).toEqual(IDS.slice(0, 4));
    expect(trainingPool(state)).toEqual(IDS.slice(0, 3));
  });
  it('un cours à rattraper : 10 questions de ce cours', () => {
    const { state } = validatedState([IDS[0]!]);
    const c3 = IDS[3]!;
    const withC3: ProgressState = { ...state, courses: { ...state.courses, [c3]: { ...state.courses[c3]!, status: 'a-rattraper' } } };
    const items = trainingSeries(withC3, { courseIds: [c3] }, seededRng(1));
    expect(items).toHaveLength(10);
    expect(items.every((x) => x.courseId === c3)).toBe(true);
  });
  it('plusieurs cours choisis : uniquement ces cours ; « tout » inclut les cours à rattraper', () => {
    const { state } = validatedState([C0, C1, C5]);
    const items = trainingSeries(state, { courseIds: [C0, C5] }, seededRng(2));
    expect(new Set(items.map((x) => x.courseId))).toEqual(new Set([C0, C5]));
    const c3 = IDS[3]!;
    const withC3: ProgressState = { ...state, courses: { ...state.courses, [c3]: { ...state.courses[c3]!, status: 'a-rattraper' } } };
    const seen = new Set<string>();
    for (let seed = 0; seed < 40; seed++) for (const x of trainingSeries(withC3, 'tout', seededRng(seed))) seen.add(x.courseId);
    expect(seen.has(c3)).toBe(true);
  });
});

describe('repassage des questions de leçon (doc 08 n° 21 et 22)', () => {
  const ex = (finItems(1)[0]!.question as Extract<Question, { kind: 'saisie' }>).ex;
  const choixQ = (n: number, small = true): Question => ({
    kind: 'choix',
    ...(small ? { small: true as const } : {}),
    ex,
    calcLatex: null,
    prompt: `Question ${n}`,
    options: [
      { label: 'A', why: 'a' },
      { label: 'B', why: 'b' },
      { label: 'C', why: 'c' },
      { label: 'D', why: 'd' },
    ],
    correctIndex: 2,
  });
  const item = (itemId: string, activity: QuestionItem['activity'], question: Question): QuestionItem => ({ type: 'question', itemId, courseId: C5, activity, question });
  const steps = (s: ActivityState) => s.queue.map((x) => (x.type === 'explication' ? `expl:${x.item.itemId}` : `${x.item.itemId}:${x.role}`));
  const fins = () => finItems(2).map((f, i) => ({ ...f, itemId: `f${i}` }));
  const expl = (itemId: string): ActivityItem => ({ type: 'explication', itemId, courseId: C5, partIndex: 0, blocks: [] });

  it('constantes', () => {
    expect(CHOIX_REPEAT_DISTANCE).toBe(2);
    expect(LESSON_REPEAT_NOTE).toBe('Tu retrouveras ce calcul à la fin de la leçon.');
  });

  it('choix raté : revient 2 étapes plus loin, options remélangées, même bonne réponse', () => {
    const s = start([item('c0', 'lecon', choixQ(0)), expl('e1'), item('c1', 'lecon', choixQ(1)), expl('e2'), item('c2', 'lecon', choixQ(2)), ...fins()]);
    const r = answer(s, ko(), 1).state;
    expect(steps(r).slice(0, 4)).toEqual(['expl:e1', 'c1:original', 'c0:repetition', 'expl:e2']);
    expect(steps(r).filter((x) => x.startsWith('c0')).length).toBe(1);
    const rep = r.queue[2]!;
    if (rep.type !== 'question' || rep.question.kind !== 'choix') throw new Error('choix attendu');
    expect(rep.question.options.map((o) => o.label)).not.toEqual(['A', 'B', 'C', 'D']);
    expect(rep.question.options[rep.question.correctIndex]!.label).toBe('C');
    expect(rep.item.itemId).toBe('c0');
  });

  it('choix raté juste avant le 1er fin : la répétition est avant ce fin', () => {
    const s = start([item('c0', 'lecon', choixQ(0)), ...fins()]);
    const r = answer(s, ko(), 1).state;
    expect(steps(r)).toEqual(['c0:repetition', 'f0:original', 'f1:original']);
    const s2 = start([item('c0', 'lecon', choixQ(0)), expl('e1'), ...fins()]);
    expect(steps(answer(s2, ko(), 1).state)).toEqual(['expl:e1', 'c0:repetition', 'f0:original', 'f1:original']);
  });

  it('choix raté deux fois : revient encore, « Passer » à la 3e présentation', () => {
    let s = start([item('c0', 'lecon', choixQ(0)), expl('e1'), item('c1', 'lecon', choixQ(1)), expl('e2'), ...fins()]);
    s = answer(s, ko(), 1).state;
    while (head(s) !== 'c0:repetition') {
      const c = current(s)!;
      s = c.type === 'explication' ? explanationDone(s, 1).state : answer(s, ok, 1).state;
    }
    expect((current(s) as { canSkip: boolean }).canSkip).toBe(false);
    s = answer(s, ko(), 1).state;
    expect(steps(s).filter((x) => x === 'c0:repetition').length).toBe(1);
    while (head(s) !== 'c0:repetition') {
      const c = current(s)!;
      s = c.type === 'explication' ? explanationDone(s, 1).state : answer(s, ok, 1).state;
    }
    const c = current(s) as { canSkip: boolean; attempt: number };
    expect(c.attempt).toBe(3);
    expect(c.canSkip).toBe(true);
  });

  it('choix sans `small` (« Quelle règle ? ») : repassage habituel, répétition exacte juste avant le 1er fin', () => {
    const q = choixQ(0, false);
    const s = start([item('c0', 'lecon', q), expl('e1'), item('c1', 'lecon', choixQ(1)), expl('e2'), ...fins()]);
    const r = answer(s, ko(), 1).state;
    expect(steps(r)).toEqual(['expl:e1', 'c1:original', 'expl:e2', 'c0:repetition', 'f0:original', 'f1:original']);
    const rep = r.queue.find((x) => x.type === 'question' && x.role === 'repetition');
    expect(rep && rep.type === 'question' && rep.question).toBe(q);
  });

  it('decouverte ratée : rien ne repasse', () => {
    const s = start([item('d0', 'decouverte', choixQ(0)), ...fins()]);
    expect(steps(answer(s, ko(), 1).state)).toEqual(['f0:original', 'f1:original']);
  });

  it('classer de leçon raté : pas de « même type », répétition juste avant le 1er fin', () => {
    const q: Question = { kind: 'classer', exs: [ex], groups: [], answer: [] } as unknown as Question;
    for (const act of ['lecon', 'exemple'] as const) {
      const s = start([item('p0', act, q), expl('e1'), item('p1', act, choixQ(1)), ...fins()]);
      expect(steps(answer(s, ko(), 1).state)).toEqual(['expl:e1', 'p1:original', 'p0:repetition', 'f0:original', 'f1:original']);
    }
    expect(steps(answer(start([item('p0', 'lecon', q)]), ko(), 1).state)).toEqual(['p0:repetition']);
  });
});
