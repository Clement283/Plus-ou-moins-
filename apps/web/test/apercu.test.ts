import { describe, expect, it } from 'vitest';
import { foldProgress } from '@pom/engine';
import { unlockAll } from '../src/store/sync';

describe('compte « aperçu »', () => {
  it('ouvre tous les cours verrouillés et garde le même objet tant que la progression ne change pas', () => {
    const p = foldProgress([]);
    expect(Object.values(p.courses).some((c) => c.status === 'verrouille')).toBe(true);
    const u = unlockAll(p);
    expect(Object.values(u.courses).every((c) => c.status !== 'verrouille')).toBe(true);
    expect(unlockAll(p)).toBe(u);
    expect(Object.values(p.courses).some((c) => c.status === 'verrouille')).toBe(true);
  });
});
