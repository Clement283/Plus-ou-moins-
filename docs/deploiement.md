# Mise en ligne (Cloudflare)

*Fait le 2026-11-24.* L'appli est en ligne : **https://plus-ou-moins.ballam-clement3.workers.dev**

## Ce qui existe sur le compte Cloudflare « Clement »
- Un Worker `plus-ou-moins` : il sert l'appli (fichiers intégrés au Worker) et l'API `/api/*`.
- Une base D1 `plus-ou-moins` (id `885a9237-8316-45eb-b27f-4383c4333b45`), migration `0001_init.sql` appliquée.
- Deux comptes : l'élève « Myms » et le suiveur « Clément », qui la suit. Les codes ont été donnés une seule fois au porteur du projet ; seuls leurs hachages sont stockés.

*2026-11-25 : compte « Myms » de nouveau supprimé et recréé (id `773bdee4-…`, nouveau code remis au porteur du projet), suivi par « Clément ».*

*2026-11-24 : Cours 0 v2 mis en ligne. Le compte de test « Myms » a été supprimé et recréé (nouvel id `30355faa-…`, nouveau code remis au porteur du projet), suivi par « Clément ». Pour repartir de zéro, il faut recréer le compte : l'appli garde une copie locale des réponses et n'efface jamais son cache.*

## Remettre l'appli en ligne après une modification
Il faut un jeton d'API Cloudflare (Workers Scripts : Modifier, D1 : Modifier, Account Settings : Lu, User Details et Memberships : Lu).

```bash
npm ci
```

```bash
CLOUDFLARE_ACCOUNT_ID=7aeceb03afcfd29a243fabb675907335 npm run deploy
```

`npm run deploy` construit l'appli (sans les pages d'essai), intègre ses fichiers dans le Worker (`scripts/embed-assets.ts`) puis lance `wrangler deploy`.

Pourquoi les fichiers sont intégrés au Worker : dans l'environnement cloud de Claude, le jeton est ajouté automatiquement à chaque requête vers l'API Cloudflare, ce qui casse l'envoi des « Static Assets » (qui utilise un autre jeton temporaire). Les fichiers font 566 Kio compressés, sous la limite de 3 Mio de l'offre gratuite.

## Nouvelle migration de la base

```bash
cd apps/api && npx wrangler d1 migrations apply plus-ou-moins --remote
```

## Créer un compte

```bash
npx tsx scripts/create-user.ts --name Prénom --role eleve --remote
```

```bash
npx tsx scripts/create-user.ts --name Prénom --role suiveur --follows <idDeLeleve> --remote
```

Le code s'affiche une seule fois. Les majuscules et les espaces du code n'ont pas d'importance à la connexion.

## Compte « aperçu » (2026-11-25)
Un compte élève « Aperçu » (id `d3bc24f0-…`, colonne `users.apercu = 1`, migration `0003_apercu.sql`) a tous les cours ouverts : l'appli remplace « verrouillé » par « disponible » pour ce compte (`unlockAll` dans `apps/web/src/store/sync.ts`). Il sert au porteur du projet à relire les cours sans les faire dans l'ordre. Personne ne le suit. Code remis au porteur du projet dans le chat.
Rendre un autre compte « aperçu » : `UPDATE users SET apercu=1 WHERE id='…';` (il faut se reconnecter : l'information arrive à la connexion).
- 2026-11-25 : le compte suiveur « Clément » est aussi « aperçu » : un bouton **« Tester les cours »** sur sa page de suivi ouvre l'appli de l'élève, tous les cours ouverts, avec un bandeau « Mode test · Retour au suivi ». **Rien n'est enregistré** : les réponses restent en mémoire le temps du cours (`volatile` dans `apps/web/src/store/sync.ts`) et sont effacées au retour à l'accueil ou à « Mes cours » ; « Demander à Clément » ne fait rien dans ce mode. Le serveur refuse toujours les réponses d'un suiveur.

## Mise en ligne automatique (GitHub Actions)
Fichier : `.github/workflows/deploy.yml`.
- Sur chaque pull request : les tests seulement (`npm test`).
- Sur chaque push sur `main` : les tests, puis, **seulement s'ils passent**, les migrations D1 en attente (`wrangler d1 migrations apply`) et `npm run deploy`. Tests rouges = rien n'est mis en ligne.
- À faire une fois sur GitHub : *Settings → Secrets and variables → Actions → New repository secret* : `CLOUDFLARE_API_TOKEN` (mêmes droits que ci-dessus). L'identifiant de compte est dans le fichier.
- Sur chaque pull request qui touche à l'appli, aux cours ou aux tests (`apps/`, `packages/`, `e2e/`, `scripts/`…) : travail **« Parcours des cours et captures »** (environ 5 min). Il lance tous les tests e2e (Playwright), dont `e2e/tous-les-cours.spec.ts`, qui joue **chaque cours de chaque module** (et des Essais) du début à la fin avec un compte « aperçu ». Un cours ajouté au registre est testé sans rien écrire ; un **nouveau type d'exercice** doit être appris une fois au parcours (`runCourse` dans `e2e/driver.ts`).
- Dans le même travail, `e2e/captures.spec.ts` prend une capture de chaque écran des cours **ajoutés ou modifiés** par la PR (fichier `packages/engine/src/courses/<module>/<id>.ts` = cours `<id>`). Un commentaire sur la PR donne le lien du .zip (gardé 30 jours), mis à jour à chaque envoi. En local : `CAPTURE_COURSES="c02-additionner-signes-contraires" npm run e2e -- captures` (images dans `captures/`).
- **Bouton « Remettre en ligne »** : onglet *Actions* → *Tests et mise en ligne* (à gauche) → *Run workflow* → branche `main` → *Run workflow*. Relance les tests puis la mise en ligne de la version actuelle de `main`, sans pull request (utile si une mise en ligne a échoué à cause de Cloudflare, ou après avoir changé le secret). Lancé sur une autre branche : les tests seulement, rien n'est mis en ligne.
- **Bouton « Captures d'un cours »** : onglet *Actions* → *Captures d'un cours* → *Run workflow* → taper les cours (séparés par des virgules : numéro `2`, morceau du titre `soustraire`, identifiant, ou `tous`) → *Run workflow*. Lien du .zip en bas de la page du lancement (gardé 30 jours). Fichier `.github/workflows/captures.yml`.
- Après chaque mise en ligne : vérification que la page s'affiche et que l'API répond (401 sans connexion) ; sinon l'étape **« Vérifier que le site répond »** devient rouge.

## Module « Essais » (2026-11-25)
Cours à l'essai, **visibles seulement des comptes « aperçu »** (carte « Essais » en bas de Mes cours). Hors de `MODULES` : l'élève ne le voit jamais, il ne compte ni dans sa progression ni dans le suivi. Tous les cours y sont ouverts. Déclaré dans `packages/engine/src/courses/essais/index.ts` (y ajouter les cours à essayer). Contient pour l'instant le Cours 7 (version 2), `c07b-multiplier-plusieurs`.
