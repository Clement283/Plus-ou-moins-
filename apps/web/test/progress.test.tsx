import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { foldProgress, MODULES, type AppEvent } from '@pom/engine';
import { resetDb } from '../src/store/db';
import { advanceProgress, loadProgressCache, msUntilParisMidnight, saveProgressCache, useToday } from '../src/store/progress';

const courseId = MODULES[0]!.courseIds[0]!;
const moduleId = MODULES[0]!.id;
const ev = (i: number, at: number): AppEvent => ({
  id: `e${i}`, userId: 'u1', at, day: '2026-11-20', kind: 'lesson_part_done', activityId: 'a1', moduleId, courseId, partIndex: i, durationMs: 10,
});

describe('advanceProgress', () => {
  const all = [ev(0, 1000), ev(1, 2000), ev(2, 3000), ev(3, 4000)];
  it('mise à jour incrémentale = repli complet', () => {
    const s = advanceProgress(advanceProgress(null, all.slice(0, 2)), all);
    expect(s).toEqual(foldProgress(all));
  });
  it('un événement plus ancien arrivé en retard donne le même résultat que le repli', () => {
    const s = advanceProgress(advanceProgress(null, [all[0]!, all[2]!, all[3]!]), all);
    expect(s).toEqual(foldProgress(all));
  });
  it('ignore les événements déjà appliqués', () => {
    const s = advanceProgress(null, all);
    expect(advanceProgress(s, all)).toBe(s);
  });
});

describe('cache de progression (IndexedDB)', () => {
  beforeEach(() => resetDb());
  it('aller-retour, et invalidation si la version de l’appli change', async () => {
    const s = foldProgress([ev(0, 1000)]);
    await saveProgressCache('u1', s, 'b1');
    expect(await loadProgressCache('u1', 'b1')).toEqual(s);
    expect(await loadProgressCache('u1', 'b2')).toBeNull();
    expect(await loadProgressCache('u2', 'b1')).toBeNull();
  });
});

describe('jour de Paris', () => {
  afterEach(() => vi.useRealTimers());
  it('délai jusqu’à minuit à Paris (heure d’hiver puis changement d’heure)', () => {
    // 2026-11-22 22:59:30 UTC = 23:59:30 à Paris (UTC+1)
    expect(msUntilParisMidnight(Date.UTC(2026, 10, 22, 22, 59, 30))).toBe(30_000);
    // 2026-03-28 23:30 UTC = 00:30 le 29 à Paris (UTC+1) ; minuit suivant à 21:00 + 23 h (jour de 23 h) = 22:00 UTC le 29
    expect(msUntilParisMidnight(Date.UTC(2026, 2, 28, 23, 30))).toBe(22.5 * 3_600_000);
  });
  it('useToday change à minuit (Paris) et au retour au premier plan', () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2026, 10, 22, 22, 59, 30));
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe('2026-11-22');
    act(() => void vi.advanceTimersByTime(31_000));
    expect(result.current).toBe('2026-11-23');
    // l'appli reste en arrière-plan plus d'un jour, puis revient
    vi.setSystemTime(Date.UTC(2026, 10, 25, 12));
    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe('2026-11-25');
  });
});
