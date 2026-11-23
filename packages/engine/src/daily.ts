/**
 * Time of the day (doc 02 §1–§2). The client's chronometer pauses in the background, so
 * `durationMs` already excludes that time; here each answer counts at most 2 min and each
 * lesson explanation at most 3 min. Every answer counts, repeated tries included.
 */
import type { AppEvent } from './events';

export const ANSWER_MAX_MS = 2 * 60_000;
export const EXPLANATION_MAX_MS = 3 * 60_000;
export const DAILY_GOAL_MS = 15 * 60_000;

export interface DailyTime {
  totalMs: number;
  reviewMs: number;
  courseMs: number;
  trainingMs: number;
  goalReached: boolean;
}

export function dailyTime(events: AppEvent[], day: string): DailyTime {
  let reviewMs = 0;
  let courseMs = 0;
  let trainingMs = 0;
  for (const e of events) {
    if (e.day !== day) continue;
    if (e.kind === 'lesson_part_done') {
      courseMs += Math.min(e.durationMs, EXPLANATION_MAX_MS);
    } else if (e.kind === 'answer') {
      const ms = Math.min(e.durationMs, ANSWER_MAX_MS);
      if (e.activity === 'revision') reviewMs += ms;
      else if (e.activity === 'entrainement') trainingMs += ms;
      else courseMs += ms; // 'lecon', 'exemple', 'fin', 'rattrapage'
    }
  }
  const totalMs = reviewMs + courseMs + trainingMs;
  return { totalMs, reviewMs, courseMs, trainingMs, goalReached: totalMs >= DAILY_GOAL_MS };
}
