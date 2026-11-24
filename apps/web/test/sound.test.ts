import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function load() {
  vi.resetModules();
  return import('../src/sound');
}

function fakeAudio() {
  const ctor = vi.fn(function (this: any) {
    const param = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() });
    this.currentTime = 0;
    this.state = 'running';
    this.destination = {};
    this.resume = vi.fn(async () => undefined);
    this.createGain = () => ({ gain: param(), connect: vi.fn() });
    this.createOscillator = () => ({ type: 'sine', frequency: param(), connect: vi.fn(), start: vi.fn(), stop: vi.fn() });
  });
  (window as any).AudioContext = ctor;
  return ctor;
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  (window as any).AudioContext = undefined;
});

describe('réglage du son', () => {
  it('activé par défaut, mémorisé dans pom-son', async () => {
    const s = await load();
    expect(s.isSoundOn()).toBe(true);
    s.setSoundOn(false);
    expect(s.isSoundOn()).toBe(false);
    expect(localStorage.getItem('pom-son')).toBe('0');
    expect((await load()).isSoundOn()).toBe(false);
    s.setSoundOn(true);
    expect((await load()).isSoundOn()).toBe(true);
  });

  it('localStorage qui échoue : ne lève pas, son activé', async () => {
    const s = await load();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    expect(s.isSoundOn()).toBe(true);
    expect(() => s.setSoundOn(false)).not.toThrow();
  });
});

describe('playSound', () => {
  it('sans AudioContext : ne lève pas', async () => {
    const s = await load();
    for (const n of ['juste', 'faux', 'valide', 'objectif'] as const) expect(() => s.playSound(n)).not.toThrow();
  });

  it('un AudioContext qui échoue : ne lève pas', async () => {
    (window as any).AudioContext = function () {
      throw new Error('non');
    };
    const s = await load();
    expect(() => s.playSound('juste')).not.toThrow();
  });

  it('coupé : aucun AudioContext créé', async () => {
    const ctor = fakeAudio();
    const s = await load();
    s.setSoundOn(false);
    s.playSound('juste');
    expect(ctor).not.toHaveBeenCalled();
  });

  it('un seul AudioContext pour plusieurs sons, créé au premier', async () => {
    const ctor = fakeAudio();
    const s = await load();
    expect(ctor).not.toHaveBeenCalled();
    for (const n of ['juste', 'faux', 'valide', 'objectif'] as const) s.playSound(n);
    expect(ctor).toHaveBeenCalledTimes(1);
  });
});

describe('announceGoal', () => {
  it('joue « objectif » une seule fois par jour, mémorisé dans pom-objectif-sonne', async () => {
    vi.useFakeTimers();
    const ctor = fakeAudio();
    const s = await load();
    s.announceGoal('2026-11-24');
    s.announceGoal('2026-11-24');
    vi.advanceTimersByTime(1000);
    expect(ctor).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('pom-objectif-sonne')).toBe('2026-11-24');
    s.announceGoal('2026-11-25');
    vi.advanceTimersByTime(1000);
    expect(localStorage.getItem('pom-objectif-sonne')).toBe('2026-11-25');
    vi.useRealTimers();
  });
});
