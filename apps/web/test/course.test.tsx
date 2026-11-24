import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { getCourse, lessonStep, resultOfTally, runErrors, num, op, rat, seededRng, type ActivityItem, type Question } from '@pom/engine';

const h = vi.hoisted(() => ({ events: [] as any[], items: [] as any[], record: null as any, listeners: new Set<() => void>(), fixed: null as any }));
vi.mock('../src/store/sync', () => ({
  useEvents: () => h.events,
  recordEvent: vi.fn(h.record = async (e: any) => {
    h.events.push({ ...e, id: `e${h.events.length}`, userId: 'u1', at: Date.UTC(2026, 10, 22, 11) + h.events.length, day: '2026-11-22' });
    h.listeners.forEach((l) => l());
  }),
}));
vi.mock('../src/store/progress', async () => {
  const React = await import('react');
  const engine = await import('@pom/engine');
  return {
    useProgress: () => {
      const [, force] = React.useReducer((n: number) => n + 1, 0);
      React.useEffect(() => {
        h.listeners.add(force);
        return () => void h.listeners.delete(force);
      }, []);
      return h.fixed ?? engine.foldProgress(h.events);
    },
  };
});
vi.mock('@pom/engine', async (orig) => {
  const real = await orig<typeof import('@pom/engine')>();
  return { ...real, courseRunItems: vi.fn((c: any, r: any) => (h.items.length ? h.items : real.courseRunItems(c, r))), rattrapageItems: vi.fn(() => h.items) };
});

import { go } from '../src/router';
import { CourseScreen, RattrapageScreen, RelireScreen } from '../src/screens/Course';
import { RunResultView } from '../src/screens/CourseResult';
import { memoryResult } from '../src/screens/Course';

const C04 = getCourse('c04-soustraire');
const sub = (a: number, b: number) => ({ courseId: C04.id, level: 1 as const, expr: op('-', num(a), num(b)), answer: rat(a - b) });
const item = (id: string, activity: 'fin' | 'rattrapage', a: number, b: number): ActivityItem => ({
  type: 'question',
  itemId: id,
  courseId: C04.id,
  activity,
  question: { kind: 'saisie', ex: sub(a, b), promptLatex: `${a} - ${b}` } as Question,
});
const ops: [number, number][] = [[5, 3], [6, 2], [7, 3], [9, 4], [8, 5]];
const series = (activity: 'fin' | 'rattrapage') => ops.map(([a, b], i) => item(`${activity}-${i}`, activity, a, b));

afterEach(() => {
  cleanup();
  h.events.length = 0;
  h.fixed = null;
  window.location.hash = '';
});
beforeEach(() => {
  h.items = [];
});

function mount(ui: React.ReactElement) {
  const view = render(ui);
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const btn = (label: string) => $$('button').find((b) => (b.getAttribute('aria-label') ?? b.textContent?.trim()) === label) ?? null;
  const text = () => view.container.textContent ?? '';
  /** Un calcul : taper la réponse, valider, continuer. */
  const play = (answers: number[]) => {
    for (const a of answers) {
      for (const d of String(a)) fireEvent.click(btn(d)!);
      fireEvent.click(btn('Valider')!);
      fireEvent.click(btn('Continuer')!);
    }
  };
  /** Rate tout ce qui reste (les calculs « du même genre » et les répétitions compris) jusqu'à la fin. */
  const drain = () => {
    for (let i = 0; i < 80 && btn('Valider'); i++) {
      if (btn('Passer')) {
        fireEvent.click(btn('Passer')!);
      } else {
        fireEvent.click(btn('9')!);
        fireEvent.click(btn('Valider')!);
      }
      fireEvent.click(btn('Continuer')!);
    }
  };
  return { ...view, $, $$, btn, text, play, drain };
}
const settle = () => act(async () => void (await Promise.resolve()));
const RIGHT = [2, 4, 4, 5, 3];

describe('cours : résultat', () => {
  it('5 sur 5 dont 5 exercices de fin sur 5 : « Cours 4 validé »', async () => {
    h.items = series('fin');
    const t = mount(<CourseScreen courseId={C04.id} rng={seededRng(1)} />);
    t.play(RIGHT);
    await settle();
    expect(t.text()).toContain('Cours 4 validé');
    expect(t.text()).toContain('5 bonnes réponses sur 5, dont 5 exercices de fin justes sur 5.');
    expect(t.text()).toContain('Le cours 5, « Multiplier deux relatifs », est débloqué.');
    expect(t.text()).toContain('Tu gagnes la 1re étoile du cours 4.');
    expect(t.text()).toContain('Première révision dans 48 heures.');
    expect(t.btn('Commencer le cours 5')).toBeTruthy();
    expect(t.btn("Retour à l'accueil")).toBeTruthy();
    expect(t.$('.rating--xl')).toBeTruthy();
    fireEvent.click(t.btn('Commencer le cours 5')!);
    expect(window.location.hash).toBe('#/cours/' + encodeURIComponent('c05-multiplier-deux'));
  });

  it('non validé : les deux critères avec leurs chiffres, celui qui manque en rouge', async () => {
    h.items = series('fin');
    const t = mount(<CourseScreen courseId={C04.id} rng={seededRng(1)} />);
    t.play([2, 4, 4, 9, 9]); // 3 sur 5 : 60 % et 3 exercices de fin
    t.drain();
    await settle();
    expect(t.text()).toContain("Le cours 4 n'est pas encore validé");
    const alerts = t.$$('.alert');
    expect(alerts.map((a) => a.className)).toEqual(['alert alert--error', 'alert alert--error']);
    expect(t.text()).toContain('Tu as 3 bonnes réponses sur 5, soit 60 %.');
    expect(t.text()).toContain('4 exercices de fin sur 5');
    expect(t.text()).toContain('Tu en as réussi 3.');
    expect(t.btn('Faire la série de validation')).toBeTruthy();
    fireEvent.click(t.btn('Relire la leçon')!);
    expect(window.location.hash).toBe('#/cours/' + encodeURIComponent(C04.id) + '/relire');
  });

  it('aucune erreur avec une règle : pas de bloc « Tes erreurs : » (ni « Autre erreur »)', () => {
    const errors = [{ errorType: 'autre', label: 'Autre erreur', rule: null, partIndex: null, count: 2 }];
    const t = mount(
      <RunResultView variant="cours" courseId={C04.id} results={['ko', 'ko', 'ok']} result={resultOfTally({ first: 3, ok: 1, fin: 3, finOk: 1 }, C04.id)} errors={errors} />,
    );
    expect(t.text()).not.toContain('Tes erreurs :');
    expect(t.text()).not.toContain('Autre erreur');
  });

  it('résultat en mémoire : les réponses « pour découvrir » ne comptent pas', () => {
    const firsts = [
      { activity: 'decouverte' as const, correct: false },
      { activity: 'decouverte' as const, correct: false },
      { activity: 'lecon' as const, correct: true },
      { activity: 'fin' as const, correct: true },
    ];
    expect(memoryResult(C04.id, firsts)).toEqual(resultOfTally({ first: 2, ok: 2, fin: 1, finOk: 1 }, C04.id));
  });

  it('erreurs par règle et lien « Relire la règle N » vers la partie de la règle', () => {
    const C00 = getCourse('c00-bien-ecrire');
    const ans = (i: number, correct: boolean, errorType?: string) =>
      ({ kind: 'answer', activityId: 'a1', courseId: C00.id, activity: 'fin', attempt: 1, correct, ...(errorType ? { errorType } : {}), id: `x${i}`, userId: 'u1', at: i, day: '2026-11-22' }) as any;
    const events = [ans(0, false, 'signes-colles'), ans(1, false, 'signes-colles'), ans(2, false, 'signes-colles'), ans(3, false, 'parenthese'), ans(4, true)];
    const t = mount(
      <RunResultView variant="cours" courseId={C00.id} results={['ko', 'ko', 'ko', 'ko', 'ok']} result={resultOfTally({ first: 5, ok: 1, fin: 5, finOk: 1 }, C00.id)} errors={runErrors(events, 'a1', C00.id)} />,
    );
    expect(t.text()).toContain('Tes erreurs :');
    expect(t.text()).toContain('Deux signes qui se touchent (règle 1)');
    expect(t.text()).toContain('3 fois');
    expect(t.text()).toContain('Parenthèse non fermée (règle 4)');
    expect(t.text()).toContain('1 fois');
    expect(t.text()).toContain('Prochaine étape : la série de validation.');
    expect(t.$$('a').find((a) => a.textContent === 'Relire la règle 1')?.getAttribute('href')).toBe('#/cours/c00-bien-ecrire/relire/4');
  });

  it('erreurs sans règle : ni bloc ni lien « Relire la règle »', () => {
    const t = mount(
      <RunResultView
        variant="cours"
        courseId={C04.id}
        results={['ko']}
        result={{ validated: false, ok: 1, first: 5, finOk: 1, fin: 5, percent: 20, nextCourseId: null, firstReviewInHours: 48 }}
        errors={[{ errorType: 'autre', label: 'Autre erreur', rule: null, partIndex: null, count: 2 }]}
      />,
    );
    expect(t.text()).not.toContain('Autre erreur');
    expect(t.text()).not.toContain('Relire la règle');
  });

  it('le critère rempli est en vert', () => {
    const t = mount(
      <RunResultView
        variant="cours"
        courseId={C04.id}
        results={['ok', 'ok', 'ok', 'ko', 'ko']}
        result={{ validated: false, ok: 10, first: 12, finOk: 3, fin: 5, percent: 83, nextCourseId: null, firstReviewInHours: 48 }}
      />,
    );
    expect(t.$$('.alert').map((a) => a.className)).toEqual(['alert alert--success', 'alert alert--error']);
    expect(t.text()).toContain('Tu as 10 bonnes réponses sur 12, soit 83 %.');
  });

  it('dernier cours validé : « Retour à l\'accueil » seul', () => {
    const c07 = getCourse('c07-multiplier-plusieurs');
    const t = mount(
      <RunResultView variant="cours" courseId={c07.id} results={['ok']} result={{ validated: true, ok: 12, first: 12, finOk: 5, fin: 5, percent: 100, nextCourseId: null, firstReviewInHours: 48 }} />,
    );
    expect(t.text()).toContain('Cours 7 validé');
    expect(t.btn("Retour à l'accueil")).toBeTruthy();
    expect(t.$$('button').filter((b) => b.textContent?.startsWith('Commencer'))).toHaveLength(0);
    expect(t.text()).not.toContain('est débloqué');
  });

  it('croix pendant le cours : « Quitter le cours ? », Continuer reste, Quitter enregistre completed:false', async () => {
    h.items = series('fin');
    const t = mount(<CourseScreen courseId={C04.id} rng={seededRng(1)} />);
    fireEvent.click(t.btn('Quitter')!);
    expect(t.$('[role=dialog]')!.textContent).toContain('Quitter le cours ?');
    expect(t.text()).toContain('Tu le reprendras depuis le début.');
    fireEvent.click(t.btn('Continuer')!);
    expect(t.$('[role=dialog]')).toBeNull();
    fireEvent.click(t.btn('Quitter')!);
    fireEvent.click(t.$$('.dialog__actions button').find((b) => b.textContent === 'Quitter')!);
    await settle();
    expect(h.events.at(-1)).toMatchObject({ kind: 'activity_end', completed: false });
    expect(window.location.hash).toBe('#/cours');
  });
});

describe('cours : 12 étapes', () => {
  it('11 bonnes réponses sur 12, dont 5 exercices de fin justes sur 5', () => {
    const t = mount(
      <RunResultView variant="cours" courseId={C04.id} results={['ok', 'ok', 'ok', 'ok', 'ko', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok']} result={resultOfTally({ first: 12, ok: 11, fin: 5, finOk: 5 }, C04.id)} />,
    );
    expect(t.text()).toContain('Cours 4 validé');
    expect(t.text()).toContain('11 bonnes réponses sur 12, dont 5 exercices de fin justes sur 5.');
  });

  it('enregistrement en échec : la croix reste, puis le résultat en mémoire après 3 s', async () => {
    const { recordEvent } = await import('../src/store/sync');
    vi.mocked(recordEvent).mockRejectedValue(new Error('hors ligne'));
    vi.useFakeTimers();
    h.items = series('fin');
    const t = mount(<CourseScreen courseId={C04.id} rng={seededRng(1)} />);
    t.play(RIGHT);
    await act(async () => void (await Promise.resolve()));
    expect(t.text()).not.toContain('Cours 4 validé');
    expect(t.btn('Fermer')).toBeTruthy();
    fireEvent.click(t.btn('Fermer')!);
    expect(window.location.hash).toBe('#/cours');
    await act(async () => void vi.advanceTimersByTime(3100));
    expect(t.text()).toContain('Cours 4 validé');
    expect(t.text()).toContain('5 bonnes réponses sur 5, dont 5 exercices de fin justes sur 5.');
    vi.useRealTimers();
    vi.mocked(recordEvent).mockImplementation(h.record);
  });
});

describe('rattrapage', () => {
  it('4 sur 5 : cours validé', async () => {
    h.items = series('rattrapage');
    const t = mount(<RattrapageScreen courseId={C04.id} rng={seededRng(1)} />);
    expect(t.text()).toContain('Validation, 1 sur 5');
    t.play([2, 4, 9, 5, 3]);
    t.drain();
    await settle();
    expect(t.text()).toContain('Cours 4 validé');
    expect(t.text()).toContain('Série de validation réussie : 4 exercices justes sur 5.');
    expect(t.btn('Commencer le cours 5')).toBeTruthy();
  });

  it('3 sur 5 : « Refaire une série de 5 » relance de nouveaux calculs', async () => {
    h.items = series('rattrapage');
    const t = mount(<RattrapageScreen courseId={C04.id} rng={seededRng(1)} />);
    t.play([2, 4, 9, 9, 3]);
    t.drain();
    await settle();
    expect(t.text()).toContain('3 sur 5, il en faut 4');
    expect(t.text()).toContain('Le cours 5 se débloque quand le cours 4 est validé.');
    expect(t.btn('Relire la leçon')).toBeTruthy();
    const { rattrapageItems } = await import('@pom/engine');
    const before = vi.mocked(rattrapageItems).mock.calls.length;
    fireEvent.click(t.btn('Refaire une série de 5')!);
    expect(vi.mocked(rattrapageItems).mock.calls.length).toBe(before + 1);
    expect(t.text()).toContain('Validation, 1 sur 5');
  });

  it('« Relire la leçon » en cours de série demande confirmation puis abandonne la série', async () => {
    h.items = series('rattrapage');
    const t = mount(<RattrapageScreen courseId={C04.id} rng={seededRng(1)} />);
    fireEvent.click(t.btn('Relire la leçon')!);
    expect(t.$('[role=dialog]')!.textContent).toContain('Quitter la série de validation ?');
    expect(t.text()).toContain('Tu recommenceras une nouvelle série de 5.');
    fireEvent.click(t.$$('.dialog__actions button').find((b) => b.textContent === 'Quitter')!);
    await settle();
    expect(h.events.at(-1)).toMatchObject({ kind: 'activity_end', completed: false });
    expect(window.location.hash).toBe('#/cours/' + encodeURIComponent(C04.id) + '/relire');
  });

  it('croix de la série de validation : « Quitter la série de validation ? », comme « Relire la leçon »', () => {
    h.items = series('rattrapage');
    const t = mount(<RattrapageScreen courseId={C04.id} rng={seededRng(1)} />);
    fireEvent.click(t.btn('Quitter')!);
    expect(t.$('[role=dialog]')!.textContent).toContain('Quitter la série de validation ?');
    expect(t.$('[role=dialog]')!.textContent).toContain('Tu recommenceras une nouvelle série de 5.');
  });
});

describe('relire', () => {
  it('avec une partie : ne montre que cette partie, sans événement, puis revient à Mes cours', async () => {
    const t = mount(<RelireScreen courseId="c00-bien-ecrire" part={4} rng={seededRng(1)} />);
    await settle();
    // partie 4 = explication pas à pas : « Suite » jusqu'à la dernière étape, puis « Suivant »
    expect(t.text()).toContain('Quand deux signes se touchent');
    for (let i = 0; i < 10 && t.btn('Suite'); i++) {
      fireEvent.click(t.btn('Suite')!);
      await settle();
    }
    expect(t.btn('Suivant')).toBeTruthy();
    fireEvent.click(t.btn('Suivant')!);
    await settle();
    expect(h.events).toEqual([]);
    expect(window.location.hash).toBe('#/cours');
  });

  it('rejoue les parties de leçon sans exercice de fin et sans aucun événement', async () => {
    const t = mount(<RelireScreen courseId={C04.id} rng={seededRng(1)} />);
    const { courseRunItems } = await import('@pom/engine');
    vi.mocked(courseRunItems).mockClear();
    expect(t.text()).toContain('Cours 4, leçon');
    expect(t.btn('Suivant')).toBeTruthy();
    fireEvent.click(t.btn('Suivant')!);
    await settle();
    expect(h.events).toEqual([]);
    fireEvent.click(t.btn('Quitter')!);
    await settle();
    expect(h.events).toEqual([]);
    expect(window.location.hash).toBe('#/cours');
  });
});

describe('cours 0 : pastille de la leçon pas à pas', () => {
  it('« Cours 0 · Leçon · étape N sur M », deux questions sur un même écran comptent une étape', () => {
    const c00 = getCourse('c00-bien-ecrire');
    const total = lessonStep(c00, 0)!.total;
    const t = mount(<CourseScreen courseId={c00.id} rng={seededRng(1)} />);
    const chip = () => t.$('.chip')!.textContent;
    const choose = (label: string) => fireEvent.click(t.$$('.answer-zone .choice').find((b) => b.textContent === label)!);
    expect(chip()).toBe(`Cours 0 · Leçon · étape 1 sur ${total}`);
    choose('Non');
    fireEvent.click(t.btn('Continuer')!);
    expect(chip()).toBe(`Cours 0 · Leçon · étape 2 sur ${total}`); // « Le signe − a deux rôles » (pas à pas)
    for (let i = 0; i < 3; i++) fireEvent.click(t.btn('Suite')!);
    fireEvent.click(t.btn('Suivant')!);
    expect(chip()).toBe(`Cours 0 · Leçon · étape 3 sur ${total}`);
    choose('À soustraire');
    fireEvent.click(t.btn('Continuer')!);
    expect(chip()).toBe(`Cours 0 · Leçon · étape 3 sur ${total}`); // 2e question du même écran
  });
});
