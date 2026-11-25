// Compile la section « Points importants » de chaque fiche (docs/fiches/*.md) en un seul document : docs/points-importants.md.
// Usage : npx tsx scripts/points-importants.ts
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface Fiche {
  name: string;
  text: string;
}

const SECTION = /^## Points importants[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m;

/** Un module par bloc, un cours par sous-bloc, dans l'ordre des noms de fichiers (cNN-…). */
export function compile(fiches: Fiche[]): string {
  const out = ['# Points importants — tous les cours', '', "Généré par `scripts/points-importants.ts` à partir de `docs/fiches/` : ne pas modifier à la main.", ''];
  let module = '';
  for (const f of [...fiches].sort((a, b) => a.name.localeCompare(b.name))) {
    const title = f.text.match(/^# (.+)$/m)?.[1] ?? f.name;
    const mod = f.text.match(/^Module\s*:\s*([^·\n]+)/m)?.[1]?.trim() ?? 'Sans module';
    const points = f.text.match(SECTION)?.[1]?.trim();
    if (mod !== module) {
      out.push(`## ${mod}`, '');
      module = mod;
    }
    out.push(`### ${title}`, '', points && points.length > 0 ? points : '_Points importants pas encore écrits._', '');
  }
  return out.join('\n').trimEnd() + '\n';
}

if (process.argv[1]?.endsWith('points-importants.ts')) {
  const dir = 'docs/fiches';
  const fiches = existsSync(dir)
    ? readdirSync(dir)
        .filter((n) => /^c\d+.*\.md$/.test(n))
        .map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') }))
    : [];
  writeFileSync('docs/points-importants.md', compile(fiches));
  console.log(`docs/points-importants.md : ${fiches.length} cours`);
}
