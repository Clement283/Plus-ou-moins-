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
- Les tests e2e (Playwright) ne sont pas lancés par cette automatisation.
