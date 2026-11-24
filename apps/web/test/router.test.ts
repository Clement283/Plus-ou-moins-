import { describe, expect, it } from 'vitest';
import { parseRoute, toHash, type Route } from '../src/router';

describe('routes de la v2', () => {
  it('parse la fiche mémo', () => expect(parseRoute('#/cours/c01/fiche')).toEqual({ name: 'fiche', id: 'c01' }));
  it('aller-retour des 5 routes ajoutées', () => {
    const routes: Route[] = [
      { name: 'fiche', id: 'c00-bien-ecrire' },
      { name: 'echauffement' },
      { name: 'questions' },
      { name: 'question', id: 'q 1' },
      { name: 'suivi-question', eleve: 'e1', id: 'q1' },
    ];
    for (const r of routes) expect(parseRoute(toHash(r))).toEqual(r);
    expect(toHash({ name: 'fiche', id: 'c01' })).toBe('#/cours/c01/fiche');
    expect(toHash({ name: 'suivi-question', eleve: 'e1', id: 'q1' })).toBe('#/suivi/e1/question/q1');
  });
  it('les routes existantes ne changent pas', () => {
    expect(parseRoute('#/cours/c01/relire/2')).toEqual({ name: 'relire', id: 'c01', part: 2 });
    expect(parseRoute('#/questions/a/b')).toEqual({ name: 'inconnu' });
  });
});
