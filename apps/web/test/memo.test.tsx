import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { MODULES, foldProgress, getCourse, resultOfTally, type AppEvent } from '@pom/engine';
import { scenario, type ScenarioName } from '../../../e2e/fixtures';

const h = vi.hoisted(() => ({ events: [] as AppEvent[] }));
vi.mock('../src/store/sync', () => ({
  useEvents: () => h.events,
  loadAll: vi.fn(async () => h.events),
  recordEvent: vi.fn(async () => undefined),
}));
vi.mock('../src/store/progress', async () => {
  const engine = await import('@pom/engine');
  return {
    useProgress: () => engine.foldProgress(h.events),
    useToday: () => '2026-11-22',
    useReady: () => true,
    useSession: () => ({ token: 't', user: { id: 'u-lea', name: 'Léa', role: 'eleve' } }),
  };
});

import Memo from '../src/screens/Memo';
import Courses from '../src/screens/Courses';
import { RunResultView } from '../src/screens/CourseResult';

const C00 = 'c00-bien-ecrire';
function load(name: ScenarioName | null) {
  h.events = name ? scenario(name).events : [];
}
function mount(ui: React.ReactElement) {
  const view = render(ui);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const text = () => view.container.textContent ?? '';
  const btn = (label: string) => $$('button, a').find((b) => (b.getAttribute('aria-label') ?? b.textContent?.trim()) === label) ?? null;
  return { ...view, $$, text, btn };
}

beforeEach(() => {
  window.location.hash = '';
});
afterEach(cleanup);

describe('écran Fiche mémo', () => {
  it('affiche les 4 blocs, le titre et le bouton Retour', () => {
    const v = mount(<Memo courseId={C00} />);
    const t = v.text();
    expect(t).toContain('Fiche mémo · Cours 0');
    for (const k of ['La règle', 'Exemples', "L'erreur à éviter", "L'astuce"]) expect(t).toContain(k);
    expect(t).toContain('4 × (−3)');
    expect(t).toContain("Cherche d'abord les signes qui se touchent, puis demande-toi pour chaque − : il soustrait, ou c'est le signe d'un nombre ?");
    fireEvent.click(v.btn('Retour')!);
    expect(window.location.hash).toBe('#/cours');
  });
  it('fonctionne hors ligne : aucun appel réseau', () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    mount(<Memo courseId={C00} />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
  it('contient le bouton « Écouter » (emplacement ListenButton)', async () => {
    const src = await import('../src/screens/Memo?raw');
    expect(src.default).toContain('<ListenButton');
  });
});

describe('accès depuis Mes cours', () => {
  it('bouton « Fiche » sur un cours validé, pas sur un cours verrouillé', () => {
    load('debut-de-journee');
    const v = mount(<Courses />);
    fireEvent.click(v.$$('details.crow')[0]!.querySelector('summary')!);
    const fiche = v.btn('Fiche');
    expect(fiche).toBeTruthy();
    fireEvent.click(fiche!);
    expect(window.location.hash).toBe(`#/cours/${C00}/fiche`);
    for (const locked of v.$$('.crow.is-locked')) expect(locked.textContent).not.toContain('Fiche');
  });
  it('avant validation (MEMO_BEFORE_VALIDATION) : la fiche est proposée', () => {
    load(null);
    expect(mount(<Courses />).btn('Fiche')).toBeTruthy();
  });
  it('un cours à valider avec fiche (Cours 4 v2) la propose ; un cours sans fiche n\'a pas de bouton', () => {
    load('cours-a-rattraper');
    const v = mount(<Courses />);
    const row = v.$$('details.crow').find((d) => d.textContent?.includes('À valider'))!;
    expect(row.textContent).toContain('Cours 4');
    expect(row.textContent).toContain('Fiche');
    for (const r of v.$$('details.crow')) {
      const order = Number(/Cours (\d+)/.exec(r.textContent ?? '')?.[1]);
      const course = MODULES[0]!.courseIds.map((id) => getCourse(id)).find((c) => c.order === order);
      if (course && !course.memo) expect(r.textContent, `Cours ${order}`).not.toContain('Fiche');
    }
  });
});

describe('cours validé', () => {
  it('« Voir la fiche mémo » et « Ta fiche mémo est prête »', () => {
    const v = mount(
      <RunResultView variant="cours" courseId={C00} results={['ok']} result={resultOfTally({ first: 12, ok: 12, fin: 5, finOk: 5 }, C00)} />,
    );
    expect(v.text()).toContain('Ta fiche mémo est prête');
    fireEvent.click(v.btn('Voir la fiche mémo')!);
    expect(window.location.hash).toBe(`#/cours/${C00}/fiche`);
  });
  it('sans fiche : rien', () => {
    const v = mount(
      <RunResultView variant="cours" courseId="c05-multiplier-deux" results={['ok']} result={resultOfTally({ first: 12, ok: 12, fin: 5, finOk: 5 }, 'c05-multiplier-deux')} />,
    );
    expect(v.btn('Voir la fiche mémo')).toBeNull();
  });
});
