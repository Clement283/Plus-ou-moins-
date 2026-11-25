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

## Économiser le contexte
- Ne pas lire en entier les gros fichiers : `docs/validation/10-module-calculs.md` (600 lignes, ~41 000 tokens) → lire son « Résumé » (lignes 1–20) puis le cours voulu (`grep -n "^#### Cours"` puis lecture ciblée). Idem `docs/validation/06-cours-relatifs.md`.
- Avancement : `docs/superpowers/plans/2026-11-22-etape-1-avancement.md` (lire la fin). Écrire un cours : skills `plus-ou-moins-ecrire-un-cours`, `plus-ou-moins-creer-un-module-de-cours`.
- Sorties de commandes : `| tail`, `grep`, pas de journaux complets.
