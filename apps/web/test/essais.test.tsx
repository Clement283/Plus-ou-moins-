import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { foldProgress } from '@pom/engine';

const h = vi.hoisted(() => ({ apercu: false }));
vi.mock('../src/store/sync', () => ({ useEvents: () => [], loadAll: vi.fn(async () => []), recordEvent: vi.fn() }));
vi.mock('../src/store/progress', async () => {
  const engine = await import('@pom/engine');
  return {
    useProgress: () => engine.foldProgress([]),
    useToday: () => '2026-11-22',
    useReady: () => true,
    useSession: () => ({ token: 't', user: { id: 'u', name: 'Léa', role: 'eleve', ...(h.apercu ? { apercu: true } : {}) } }),
  };
});

import Courses from '../src/screens/Courses';

afterEach(cleanup);

describe('Module « Essais » (réservé aux comptes aperçu)', () => {
  it("l'élève ne le voit pas", () => {
    h.apercu = false;
    const v = render(<Courses />);
    expect(v.container.textContent).not.toContain('Essais');
    expect(v.container.textContent).not.toContain('version 2');
  });

  it('le compte aperçu voit le cours en essai, ouvert, sans toucher au module Calculs', () => {
    h.apercu = true;
    const v = render(<Courses />);
    const t = v.container.textContent ?? '';
    expect(t).toContain('Essais');
    expect(t).toContain('version 2');
    expect(t).toContain('0 cours sur 8 validés');
    expect(foldProgress([]).courses['c07b-multiplier-plusieurs']!.status).toBe('disponible');
  });
});
