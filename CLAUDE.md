# Plus ou moins — consignes pour chaque session Claude

## Façon de travailler (obligatoire)
1. **Une branche par activité, jamais directement sur `main`.** Une nouvelle activité (un cours, une correction, un module…) = une branche à part, nommée d'après l'activité : `cours-8-priorites`, `fix-connexion`, `essai-suites`, `docs-deploiement`… Dans une session cloud, la branche peut être imposée par l'environnement (`ccr-…`) : on travaille alors dessus, et le titre de la pull request dit l'activité.
2. **On commite et on pousse sur cette branche** au fil du travail. Rien n'arrive en ligne tant que la branche n'est pas fusionnée.
3. **Avant de proposer la fusion :** `npm test` doit être vert (moteur, api, web, scripts). Un test qui passe au deuxième essai seulement est à signaler (test instable connu : `apps/web/test/store.test.tsx` sous charge).
4. **Quand c'est sûr :** ouvrir une **pull request** vers `main` (titre = l'activité, texte = ce qui change, tests lancés, ce qui reste à voir). **Clément la fusionne lui-même** (bouton *Merge* dans GitHub). Claude ne fusionne pas et ne pousse jamais sur `main` sans demande explicite.
5. **La fusion dans `main` met en ligne toute seule** (voir ci-dessous). Vérifier ensuite le résultat dans l'onglet *Actions* du dépôt.
6. Cours à l'essai : les mettre dans le module « Essais » (`packages/engine/src/courses/essais/index.ts`), visible seulement des comptes « aperçu ». Ne pas les ajouter au module Calculs tant qu'ils ne sont pas validés (voir `docs/deploiement.md`).

## Mise en ligne automatique : GitHub Actions
- Fichier : `.github/workflows/deploy.yml`, workflow « Tests et mise en ligne ».
- **Sur chaque pull request** (et chaque push de branche avec PR) : job `Tests` = `npm ci` puis `npm test`.
- **Sur chaque push sur `main`** (donc à chaque fusion) : job `Tests`, puis, **seulement s'il est vert**, job `Mise en ligne Cloudflare` : migrations D1 en attente (`wrangler d1 migrations apply plus-ou-moins --remote`) puis `npm run deploy` (construit l'appli, l'intègre au Worker, déploie). Tests rouges = rien n'est mis en ligne.
- **Secret requis :** `CLOUDFLARE_API_TOKEN` dans GitHub (*Settings → Secrets and variables → Actions*). Droits du jeton : Workers Scripts (Modifier), D1 (Modifier), Paramètres du compte (Lire). L'identifiant de compte est dans le fichier du workflow. Le jeton ne se donne jamais dans le chat.
- Les tests e2e Playwright (`npm run e2e`) ne sont **pas** lancés par l'automatisation.
- Les sessions cloud de Claude n'ont pas accès à `api.cloudflare.com` : **on ne déploie pas à la main depuis une session**, on passe par la fusion.
- En cas d'échec : ouvrir l'exécution dans l'onglet *Actions*, lire l'étape en rouge, corriger sur la branche. Test instable : *Re-run failed jobs*.
- Détails et autres réglages (comptes, migrations, compte « aperçu ») : `docs/deploiement.md`.

## Où trouver le reste
- Avancement et décisions : `docs/superpowers/plans/2026-11-22-etape-1-avancement.md`, `docs/validation/`.
- Plan des modules : `docs/validation/10-module-calculs.md` (ordre des modules, §2).
- Écrire un cours : skills `plus-ou-moins-ecrire-un-cours` et `plus-ou-moins-creer-un-module-de-cours` (dans `.claude/skills/`).
