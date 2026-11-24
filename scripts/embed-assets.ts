/**
 * Embarque les fichiers de apps/web/dist dans le Worker (apps/api/src/assets.generated.ts).
 * Cause : l'upload Workers Static Assets est inutilisable dans l'environnement de déploiement.
 * Les polices .woff/.ttf sont écartées quand un .woff2 de même nom existe (le CSS liste woff2 en premier,
 * et le precache du service worker ne contient que du woff2).
 *   tsx scripts/embed-assets.ts
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'apps/web/dist');
const OUT = resolve(ROOT, 'apps/api/src/assets.generated.ts');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};
const TEXT = new Set(['.html', '.js', '.css', '.webmanifest', '.json', '.svg', '.txt', '.map']);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(DIST).map((p) => '/' + relative(DIST, p).split('\\').join('/'));
const stem = (f: string) => f.replace(/-[A-Za-z0-9_-]{8}\.[a-z0-9]+$/, '');
const woff2Stems = new Set(files.filter((f) => f.endsWith('.woff2')).map(stem));
const kept = files.filter((f) => !/\.(woff|ttf)$/.test(f) || !woff2Stems.has(stem(f))).sort();

const map: Record<string, { body: string; base64: boolean; type: string; etag: string }> = {};
for (const f of kept) {
  const ext = extname(f);
  const buf = readFileSync(join(DIST, f));
  const base64 = !TEXT.has(ext);
  map[f] = {
    body: base64 ? buf.toString('base64') : buf.toString('utf8'),
    base64,
    type: TYPES[ext] ?? 'application/octet-stream',
    etag: `"${createHash('sha1').update(buf).digest('hex').slice(0, 16)}"`,
  };
}
const header = '// Généré par scripts/embed-assets.ts : ne pas éditer, ne pas committer.\nexport type EmbeddedAsset = { body: string; base64: boolean; type: string; etag: string };\n';
writeFileSync(OUT, `${header}export const assets: Record<string, EmbeddedAsset> = ${JSON.stringify(map)};\n`);
console.log(`${kept.length} fichiers embarqués (${files.length - kept.length} polices woff/ttf écartées) -> ${relative(ROOT, OUT)}`);
