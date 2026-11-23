import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { MODULES, getCourse, pendingReviews, foldProgress, reviewSummary, seededRng, type AppEvent, type ActivityState } from '@pom/engine';
import { scenario, TODAY, NOW, type ScenarioName } from '../../../e2e/fixtures';

const h = vi.hoisted(() => ({ events: [] as AppEvent[], recorded: [] as any[], stub: false, endWith: { firsts: [] as { activity: string; correct: boolean }[] }, props: null as any }));
vi.mock('../src/store/sync', () => ({
  useEvents: () => h.events,
  loadAll: vi.fn(async () => h.events),
  recordEvent: vi.fn(async (e: any) => void h.recorded.push(e)),
}));
vi.mock('../src/store/progress', async () => {
  const engine = await import('@pom/engine');
  return {
    useProgress: () => engine.foldProgress(h.events),
    useToday: () => '2026-11-22',
    useSession: () => ({ token: 't', user: { id: 'u-lea', name: 'Léa', role: 'eleve' } }),
  };
});
vi.mock('../src/screens/Activity', async () => {
  const actual = await vi.importActual<typeof import('../src/screens/Activity')>('../src/screens/Activity');
  return {
    ...actual,
    ActivityScreen: (props: any) => {
      if (!h.stub) return <actual.ActivityScreen {...props} />;
      h.props = props;
      return (
        <main>
          <button type="button" onClick={() => props.onEnd({} as ActivityState, true, [], h.endWith.firsts)}>
            fin-stub
          </button>
        </main>
      );
    },
  };
});

import ReviewScreen from '../src/screens/Review';
import { ReviewSummaryView } from '../src/screens/ReviewSummary';

const load = (name: ScenarioName) => void (h.events = scenario(name).events);
const flush = () => act(async () => void (await Promise.resolve()));
async function mount(ui: React.ReactElement) {
  const view = render(ui);
  await flush();
  await flush();
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const text = () => view.container.textContent ?? '';
  const btn = (label: string) => $$('button, a').find((b) => (b.getAttribute('aria-label') ?? b.textContent?.trim()) === label) ?? null;
  return { ...view, $, $$, text, btn };
}

/** Les 3 premières réponses d'une séance sur un cours, `ok` justes, comme l'appli les enregistre. */
function answersOf(activityId: string, courseId: string, ok: number, start: number): AppEvent[] {
  return [0, 1, 2].map((i) => ({
    id: `s-${activityId}-${courseId}-${i}`,
    userId: 'u-lea',
    at: NOW + (start + i) * 1000,
    day: TODAY,
    kind: 'answer',
    activityId,
    activity: 'revision',
    moduleId: MODULES[0]!.id,
    courseId,
    level: 1,
    questionKind: 'qcm',
    prompt: '1 + 1',
    given: '2',
    expected: '2',
    correct: i < ok,
    unfinished: false,
    errorType: i < ok ? null : 'signe-inverse',
    errorFamily: i < ok ? null : 'signe',
    attempt: 1,
    skipped: false,
    durationMs: 40_000,
  })) as unknown as AppEvent[];
}

beforeEach(() => {
  window.location.hash = '#/revisions';
  h.stub = false;
});
afterEach(() => {
  cleanup();
  h.recorded.length = 0;
});

const SUMMARY = {
  lines: [
    { courseId: 'c01-additionner-meme-signe', order: 1, title: 'Additionner deux nombres de même signe', shortTitle: 'Même signe', ok: 3, total: 3 as const, nextReview: '2026-11-29', label: 'revient dans 1 semaine' },
    { courseId: 'c04-soustraire', order: 4, title: 'Soustraire', shortTitle: 'Soustraire', ok: 2, total: 3 as const, nextReview: '2026-11-23', label: 'revient demain' },
  ],
  firstOk: 5,
  firstTotal: 6,
};
const noop = () => undefined;

describe('Révisions : la séance', () => {
  it('pastille « Révisions, question 1 sur 15 », jamais le nom du cours, uniquement qcm, vraifaux ou classer', async () => {
    load('debut-de-journee');
    const v = await mount(<ReviewScreen rng={seededRng(3)} />);
    expect(v.$('.chip')?.textContent).toBe('Révisions, question 1 sur 15');
    for (const id of MODULES[0]!.courseIds) expect(v.text()).not.toContain(getCourse(id).title);
    expect(v.$('.keypad')).toBeNull(); // pas de saisie au clavier
    expect(v.$('.choice-grid, .tags, .bins, .choices')).not.toBeNull();
  });

  it('aucun cours dû : retour à l\'accueil', async () => {
    h.events = scenario('objectif-atteint').events;
    expect(pendingReviews(foldProgress(h.events), TODAY)).toHaveLength(0);
    await mount(<ReviewScreen rng={seededRng(3)} />);
    expect(window.location.hash).toBe('#/');
  });

  it('séance quittée au milieu : retour à l\'accueil sans confirmation, activity_end non terminé, les cours restent dus', async () => {
    load('debut-de-journee');
    const v = await mount(<ReviewScreen rng={seededRng(3)} />);
    fireEvent.click(v.btn('Quitter')!);
    expect(v.$('[role=dialog]')).toBeNull();
    expect(window.location.hash).toBe('#/');
    const end = h.recorded.find((e) => e.kind === 'activity_end');
    expect(end).toMatchObject({ activity: 'revision', completed: false });
    // 2 questions sur 3 d'un cours : il reste dû
    const id = end.activityId as string;
    const partial = [...h.events, ...answersOf(id, 'c01-additionner-meme-signe', 3, 0).slice(0, 2)];
    expect(pendingReviews(foldProgress(partial), TODAY).map((p) => p.courseId)).toContain('c01-additionner-meme-signe');
  });
});

describe('Bilan de la séance', () => {
  it('il reste des cours dus : textes de la maquette', () => {
    const v = render(
      <ReviewSummaryView summary={{ ...SUMMARY, firstOk: 13, firstTotal: 15 }} minutes={11} remaining={{ courses: 2, questions: 6, minutes: 2 }} onMore={noop} onHome={noop} onTrain={noop} />,
    );
    const t = v.container.textContent!;
    expect(v.container.querySelector('.appbar__title')?.textContent).toBe('Bilan de la séance');
    expect(t).toContain('Séance terminée');
    expect(t).toContain('13 sur 15 justes du premier coup.');
    expect(t).toContain("Aujourd'hui");
    expect(t).toContain('11 / 15 min');
    expect(v.container.querySelector<HTMLElement>('.bilan-day .progress')!.style.getPropertyValue('--v')).toBe('73%');
    const items = [...v.container.querySelectorAll('.list-item')].map((i) => i.textContent);
    expect(items[0]).toContain('Même signe');
    expect(items[0]).toContain('3 sur 3, revient dans 1 semaine');
    expect(items[1]).toContain('Soustraire');
    expect(items[1]).toContain('2 sur 3, revient demain');
    expect(v.container.querySelector('.list-item [aria-label="Réussi"]')).not.toBeNull();
    expect(v.container.querySelector('.list-item [aria-label="À revoir"]')).not.toBeNull();
    expect(t).toContain('2 cours dus, 6 questions, environ 2 minutes.');
    expect(t).toContain('Encore des révisions');
    expect(t).toContain("Revenir à l'accueil");
    expect(t).not.toContain('Révisions faites');
    expect(t).not.toContain('Objectif atteint');
  });

  it('plus aucun cours dû et objectif atteint : carte « Révisions faites » et « S\'entraîner »', () => {
    const go: string[] = [];
    const v = render(<ReviewSummaryView summary={SUMMARY} minutes={16} remaining={null} onMore={noop} onHome={() => go.push('home')} onTrain={() => go.push('train')} />);
    const t = v.container.textContent!;
    expect(t).toContain('16 / 15 min');
    expect(t).toContain('Objectif atteint !');
    expect(v.container.querySelector<HTMLElement>('.bilan-day .progress')!.style.getPropertyValue('--v')).toBe('100%');
    expect(t).toContain('Révisions faites');
    expect(t).toContain("Tout est révisé pour aujourd'hui");
    expect(t).not.toContain('Encore des révisions');
    const btn = (l: string) => [...v.container.querySelectorAll('button')].find((b) => b.textContent === l)!;
    fireEvent.click(btn("S'entraîner"));
    fireEvent.click(btn("Revenir à l'accueil"));
    expect(go).toEqual(['train', 'home']);
  });

  it('un seul cours dû : singulier', () => {
    const v = render(<ReviewSummaryView summary={SUMMARY} minutes={3} remaining={{ courses: 1, questions: 3, minutes: 1 }} onMore={noop} onHome={noop} onTrain={noop} />);
    expect(v.container.textContent).toContain('1 cours dû, 3 questions, environ 1 minute.');
  });

  it('sans ligne par cours (repli en mémoire) : seulement l\'en-tête', () => {
    const v = render(<ReviewSummaryView summary={{ lines: [], firstOk: 4, firstTotal: 6 }} minutes={2} remaining={null} onMore={noop} onHome={noop} onTrain={noop} />);
    expect(v.container.textContent).toContain('4 sur 6 justes du premier coup.');
    expect(v.container.querySelector('.list')).toBeNull();
  });
});

describe('Révisions : fin de séance', () => {
  it('le bilan vient du repli des événements, « Encore des révisions » lance une nouvelle séance', async () => {
    load('debut-de-journee');
    h.stub = true;
    const v = await mount(<ReviewScreen rng={seededRng(3)} />);
    const id = h.props.activityId as string;
    // 5 cours dus, ils sont tous faits : 3, 3, 3, 2, 2 justes
    const done = pendingReviews(foldProgress(h.events), TODAY).map((p) => p.courseId);
    expect(done).toHaveLength(5);
    h.endWith.firsts = Array.from({ length: 15 }, (_, i) => ({ activity: 'revision', correct: i < 13 }));
    h.events = [...h.events, ...done.flatMap((c, i) => answersOf(id, c, i < 3 ? 3 : 2, i * 10))];
    fireEvent.click(v.btn('fin-stub')!);
    await flush();
    expect(v.text()).toContain('Séance terminée');
    expect(v.text()).toContain('13 sur 15 justes du premier coup.');
    const summary = reviewSummary(foldProgress(h.events), id, TODAY);
    expect(v.$$('.list-item')).toHaveLength(5);
    expect(v.$$('.list-item')[0]!.textContent).toContain(getCourse(summary.lines[0]!.courseId).shortTitle);
    expect(v.$$('.list-item')[0]!.textContent).toContain('3 sur 3, revient');
    expect(v.text()).toContain('Révisions faites'); // les 5 sont faits, plus rien de dû
    fireEvent.click(v.btn("Revenir à l'accueil")!);
    expect(window.location.hash).toBe('#/');
  });

  it('le repli ne contient pas la séance au bout de 3 s : en-tête avec les réponses en mémoire', async () => {
    vi.useFakeTimers();
    try {
      load('debut-de-journee');
      h.stub = true;
      const v = await mount(<ReviewScreen rng={seededRng(3)} />);
      h.endWith.firsts = Array.from({ length: 15 }, (_, i) => ({ activity: 'revision', correct: i < 12 }));
      fireEvent.click(v.btn('fin-stub')!);
      expect(v.text()).not.toContain('Séance terminée');
      expect(v.btn('Fermer')).not.toBeNull();
      await act(async () => void vi.advanceTimersByTime(3100));
      expect(v.text()).toContain('12 sur 15 justes du premier coup.');
      expect(v.$('.list')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
