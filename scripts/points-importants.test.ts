import { describe, expect, it } from 'vitest';
import { compile } from './points-importants';

const fiche = (n: string, mod: string, points: string | null) => ({
  name: `${n}.md`,
  text: `# Cours ${n} — Titre ${n}\nModule : ${mod} · Précédent : -\n\n## Règles\nx\n${points === null ? '' : `\n## Points importants\n${points}\n`}\n## Niveaux\ny\n`,
});

describe('compile', () => {
  it('regroupe par module, dans l’ordre des fichiers, avec seulement les points importants', () => {
    const md = compile([fiche('c08', 'Priorités', '- B'), fiche('c06', 'Relatifs', '- A'), fiche('c07', 'Relatifs', null)]);
    expect(md.indexOf('## Relatifs')).toBeLessThan(md.indexOf('## Priorités'));
    expect(md).toContain('### Cours c06 — Titre c06\n\n- A');
    expect(md).toContain('_Points importants pas encore écrits._');
    expect(md).not.toContain('## Niveaux');
    expect(md.match(/## Relatifs/g)).toHaveLength(1);
  });
});
