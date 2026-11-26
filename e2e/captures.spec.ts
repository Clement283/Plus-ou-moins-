import { mkdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { ESSAIS, MODULES, getCourse } from '@pom/engine';
import { accounts } from './accounts';
import { login, runCourse } from './driver';

/**
 * Captures d'écran des cours ajoutés ou modifiés par une pull request (lancé par GitHub Actions).
 * CAPTURE_FILES : les fichiers modifiés, un par ligne ; un fichier `packages/engine/src/courses/<module>/<id>.ts` désigne
 * le cours `<id>`. CAPTURE_COURSES (séparés par des virgules : identifiant, numéro, morceau du titre, `tous`) les donne directement. Sans l'un ni l'autre :
 * aucun test. Images : $CAPTURE_DIR/<id>/NN-partie-P[-etape-E].png (défaut : captures/ à la racine).
 */
const KNOWN = new Set([...MODULES, ESSAIS].flatMap((m) => m.courseIds));
const fromFiles = (process.env.CAPTURE_FILES ?? '')
  .split('\n')
  .filter((f) => /packages\/engine\/src\/courses\/.+\.ts$/.test(f))
  .map((f) => basename(f, '.ts'));
/** Sans accents ni majuscules, pour comparer ce qui est tapé dans le bouton « Captures d'un cours ». */
const plain = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
/**
 * Ce que désigne un mot de CAPTURE_COURSES : un identifiant (`c02-additionner-signes-contraires`), un numéro (`2`, le
 * « Cours 2 » de chaque module), un morceau du titre ou de l'identifiant (`soustraire`), ou `tous`.
 */
function resolve(word: string): string[] {
  const w = plain(word);
  if (!w) return [];
  if (w === 'tous') return [...KNOWN];
  if (KNOWN.has(w)) return [w];
  // un numéro : les cours des modules (pas les Essais, dont le numéro est celui de leur fichier)
  if (/^\d+$/.test(w)) return MODULES.flatMap((m) => m.courseIds).filter((id) => getCourse(id).order === Number(w));
  return [...KNOWN].filter((id) => id.includes(w) || plain(getCourse(id).title).includes(w));
}
const asked = (process.env.CAPTURE_COURSES ?? '').split(',').flatMap(resolve);
const IDS = [...new Set([...fromFiles, ...asked])].filter((id) => KNOWN.has(id));
if (process.env.CAPTURE_COURSES?.trim() && asked.length === 0) throw new Error(`Aucun cours ne correspond à « ${process.env.CAPTURE_COURSES} ».`);
const DIR = process.env.CAPTURE_DIR ?? 'captures';

test.describe('Captures des cours de la pull request', () => {
  test.setTimeout(600_000);

  for (const id of IDS) {
    test(`captures : ${getCourse(id).title} (${id})`, async ({ page }) => {
      const dir = join(DIR, id);
      mkdirSync(dir, { recursive: true });
      let n = 0;
      const shot = async (name: string) => {
        await page.addStyleTag({ content: '.answer__caret{animation:none!important}' });
        await page.waitForTimeout(1300); // les animations d'une étape durent jusqu'à ~1,2 s
        await page.screenshot({ path: join(dir, `${String(++n).padStart(2, '0')}-${name}.png`), fullPage: true });
      };
      await login(page, accounts().capture.code);
      await page.goto(`/#/cours/${id}`);
      await runCourse(page, id, {
        onScreen: (_p, at) => shot(at.type === 'fin' ? 'exercice-de-fin' : `partie-${at.part}${at.step === null ? '' : `-etape-${at.step + 1}`}`),
      });
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      await shot('resultat');
    });
  }
});
