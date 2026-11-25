# Plus ou moins — consignes de session

## Travail
- **Une branche par activité** (`cours-8-priorites`, `fix-connexion`…), jamais sur `main`. En session cloud la branche est imposée (`ccr-…`) : le titre de la pull request nomme l'activité.
- Commiter et pousser sur la branche. `npm test` vert avant de proposer la fusion (test instable connu : `apps/web/test/store.test.tsx`).
- **Pull request vers `main`, fusionnée par Clément seulement.** Ne jamais pousser ni fusionner sur `main` sans demande explicite.
- Cours à l'essai : module « Essais » (`packages/engine/src/courses/essais/index.ts`), visible des comptes « aperçu » seulement.

## Mise en ligne (GitHub Actions, `.github/workflows/deploy.yml`)
- Pull request : tests (`npm ci`, `npm test`).
- Fusion dans `main` : tests, puis si verts : migrations D1 + `npm run deploy` (Cloudflare). Secret GitHub : `CLOUDFLARE_API_TOKEN`.
- Pas de déploiement à la main depuis une session (réseau Cloudflare bloqué). Échec : lire l'étape rouge dans l'onglet *Actions* ; test instable : *Re-run failed jobs*. Détails : `docs/deploiement.md`.
- Les tests e2e (`npm run e2e`) ne sont pas lancés par l'automatisation.

## Modules et cours (organisation des documents)
- Registre : `docs/modules.md` (ordre des modules). Un module = `docs/modules/NN-nom/` avec `module.md` (descriptif global, points importants, liste des cours) et un fichier par cours `cNN-nom.md` (points importants en haut, fiche dessous).
- Écrire un cours : lire `docs/modules.md`, le `module.md` de chaque module précédent et du module courant, `head -n 12` de chaque cours précédent du module, puis la fiche du cours. Skills : `plus-ou-moins-creer-un-module-de-cours`, `plus-ou-moins-ecrire-un-cours`.
- `docs/validation/` = archives (plans d'origine des modules 3, 5, 7, décisions d'écrans) : ne pas les lire en entier.
- Avancement : `docs/superpowers/plans/2026-11-22-etape-1-avancement.md` (lire la fin).

## Économiser le contexte
- Gros fichiers : lecture ciblée (`grep -n`, `sed -n`), jamais en entier. Sorties de commandes : `| tail`, `grep`, pas de journaux complets.
