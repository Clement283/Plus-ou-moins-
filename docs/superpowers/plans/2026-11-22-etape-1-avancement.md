# Étape 1 — Avancement (pour reprendre dans une autre session)

*Mis à jour le 2026-11-24.* Plan : `docs/superpowers/plans/2026-11-22-etape-1-relatifs.md`. Documents validés : `docs/validation/01` à `07` (le 07 complète et prime sur 01–06).

## Fait (construit, testé, relu tâche par tâche)
- Tâche 3 : monorepo, maths exactes.
- Tâche 4 : journal d'événements, jour de Paris.
- Tâche 5 : serveur Cloudflare Worker + D1 (connexion par code, journal idempotent, routes suiveur), script de création de comptes.
- Tâche 6 (partie données) : appli web `apps/web` — IndexedDB, file d'attente hors ligne, synchro, cache par utilisateur. **Pas d'écran.**
- Tâche 7 (partie moteur) : saisie brute avec fraction empilée, lecture et erreurs d'écriture.
- Tâche 8 : module « Calculs », Cours 0 à 7.
- Tâche 9 : fabrication et correction des 8 types d'exercices.
- Tâche 11 : répétition espacée (échelle A–H), validation, rattrapage.
- Tâche 12 : liste des révisions, séances, temps du jour.
- Tâche 13 (partie moteur) : déroulé des activités (repassages, « Passer », entraînement).
- Tâche 14 (partie moteur) : données de la page de suivi.
- Tâche 16 : décisions du doc 07 appliquées.
Tests : `npm test` (moteur 506, web 9, api 9, scripts 7).

## Design (2026-11-23)
- Design system « Cahier au propre » validé : `docs/design/design-system/` (tokens, catalogue, `concept.html`).
- Écrans validés : accueil de l'élève (4 situations) et question de cours.
- Décisions du porteur du projet : série affichée sur l'accueil ; prénom affiché (à ajouter aux comptes) ; fenêtre de 4 cours + barre du module à la place de la bande complète.
- Tous les écrans de `docs/design/ecrans/` validés (consignes : `BRIEF.md`). Seule modification demandée : retirer le taux d'erreurs de signe de l'accueil du suivi (fait ; retiré aussi du doc 05 et du moteur, `packages/engine/src/dashboard.ts`).
- Composants créés dans les pages d'écrans, à intégrer au design system au moment du codage (voir les comptes rendus : ligne de cours repliable, calendrier de points, cases à remplir, étiquettes à classer, écran de résultat, etc.).

## Reste à faire
1. **Étape design** : écrans validés (voir ci-dessus). Icône de l'appli validée (option A « ± », fichiers dans `apps/web/public/icons/`, manifeste branché). Reste : répondre aux « Questions pour toi » en bas de chaque page d'écran avant de coder l'écran concerné.
2. Écrans (parties UI des tâches 6, 7, 10, 13, 14) une fois le design validé.
3. Tâche 15 : déploiement Cloudflare (accès au compte du porteur du projet requis) et comptes réels.
4. Relecture finale de toute la branche.

## Points à reporter dans les écrans
- Erreur d'écriture « 3−4 » : message « Ta réponse doit être un seul nombre. » (doc 07 n° 1).
- Bloc de leçon `tone: 'neutre'` affiché en gris (doc 07 n° 8).
- Page de suivi : état « à rattraper » distinct ; `ModuleView.done`.
- Connexion : le code est insensible aux majuscules/espaces (choix technique annoncé).
- Pas encore d'icônes PWA ; pas de gestion spéciale d'un jeton expiré (401).

## Petits points différés (non bloquants)
Voir la liste « minor (deferred) » relevée par les relectures : applyEvent en O(n) par événement, « 3−(4) » encore « moins après » (proposé : écriture invalide, en attente du porteur du projet), quelques tests à resserrer.

## Écrans (2026-11-23)
- Plan mis à jour (version 3) : phase D, tâches 17 à 28, qui remplace les parties UI des tâches 6, 7, 10, 13, 14.
- Décisions 16 à 19 ajoutées au doc 08 (cours quitté, relire, pas de déconnexion, module terminé).
- Exécution : superpowers:subagent-driven-development, revue téléphone avec ui-design-review:ui-review.

## Écrans terminés (2026-11-24)
- Phase D (tâches 17 à 28) faite, relue tâche par tâche (relecture du code + comparaison sur téléphone avec les maquettes + UI Design Review), puis relecture finale de toute la phase et une vague de corrections (entraînement qui ne démarrait pas, chargement local d'abord, LaTeX brut dans un QCM du Cours 0).
- Lots de décisions du porteur du projet : D1 (erreur serveur à la connexion, « Quel est le signe du résultat ? », « 3−(4) »), D2 (doc 09 : titres et « Fais attention » ; « série de validation » à la place de « rattrapage »).
- Tests : moteur 577, web 224, api 9, scripts 7 ; E2E Playwright (iPhone 13, serveur local) 3 parcours. Captures : `npm run shots -- <écran>`.

### Choix faits sans document (à revoir si besoin)
- Travail directement sur `main` (consigne de la session).
- « Entrer » grisé tant que le champ du code est vide (la maquette le dessine actif).
- Polices : les calculs KaTeX sont rendus en Lexend (design system « police unique »).
- Après une erreur : « Pas tout à fait. » au 1er échec, « Pas encore. » ensuite (maquette des révisions) ; phrases « reviendra… » dans toutes les activités ; pastilles « Même genre… » / « Le calcul raté… » seulement en révision.
- Après « Passer » : la règle du cours et la résolution ligne par ligne.
- « Passer » sous le clavier pour les réponses tapées.
- « → » et « · » gardés dans les textes validés des cours (doc 06, doc 09).
- Entraînement : retour à l'écran Entraînement à la fin d'une série (pas d'écran de résultat dessiné) ; pas de confirmation pour quitter ; aucun cours coché au départ ; série masquée à 0 jour ; minutes arrondies vers le bas.
- Révisions : on quitte une séance sans confirmation ; noms courts des cours dans le bilan (maquette).
- Relire la leçon pendant une série de validation : la série est abandonnée après « Quitter la série de validation ? Tu recommenceras une nouvelle série de 5. » ; même boîte pour la croix.
- Navigation : relire finit sur Mes cours ; la croix d'un résultat mène à l'accueil si validé, sinon à Mes cours.

### Questions encore ouvertes pour le porteur du projet
- Page de suivi : noms des erreurs (16 inventés), raison « sous 70 % », messages de cas rares, ligne « Calculs, terminé » pour un module fini.
- Cours 4, écran 1 : texte du doc 06 gardé (la maquette avait une autre phrase).

## Mise en ligne (2026-11-24) — tâche 15 faite
- En ligne : https://plus-ou-moins.ballam-clement3.workers.dev (compte Cloudflare « Clement »). Voir `docs/deploiement.md`.
- Comptes réels : Myms (élève) et Clément (suiveur). Codes remis au porteur du projet dans le chat, une seule fois.
- Choix technique : les fichiers de l'appli sont intégrés au Worker (l'envoi « Static Assets » est cassé par l'injection du jeton dans l'environnement cloud).
- Corrigé au passage : le serveur ignore maintenant tous les espaces du code (pas seulement ceux du début et de la fin).

## Cours 0 v2 (2026-11-24)
- Nouveaux types de question : petite question à un toucher (choix), « Réécris » au clavier à l'écran, « Toucher la faute » (une case par symbole), Classer en glisser-déposer ou toucher-puis-case.
- Explications pas à pas (« Suite » puis « Suivant », « Revoir » rejoue l'animation) ; une question ratée en leçon revient plus loin (repassage).
- Les réponses sont en bas de l'écran, le calcul et la consigne en haut.
- Résultat raté : les deux conditions, puis « Tes erreurs : » avec une ligne par règle et « Relire la règle N ».
- Mes cours et accueil : « Dernier essai : … » avec la raison (cours à valider) et lien vers la règle.
- Point B8 (écran de résultat sauté) : `e2e/resultat.spec.ts` fait tout le Cours 0 en ratant les 5 exercices de fin et arrive sur « Le cours 0 n'est pas encore validé » ; bug non reproduit, rien à corriger.
- Les e2e existants suivent le Cours 0 v2 (`e2e/driver.ts` : étapes, choix, Réécris, Classer, cases de la faute, « Passer »).
- Tests : moteur 613, web 272, api 19, scripts 7 ; e2e 4 parcours verts.

## Reprendre : développement des écrans (nouvelle session)
1. Lire ce fichier, le plan, `docs/validation/01` à `08` (08 et 07 priment), `docs/design/design-system/README.md` et `docs/design/ecrans/BRIEF.md` + les pages d'écrans.
2. Mettre à jour le plan (superpowers:writing-plans) : remplacer les parties UI des tâches 6, 7, 10, 13, 14 par des tâches d'écrans qui suivent les maquettes validées et le design system (tokens dans `apps/web/src/theme.css`), en s'appuyant sur les fonctions du moteur déjà construites (`@pom/engine` : buildQuestion/checkAnswer, readRaw/pressKey, createActivity/answer/skip, nextReviewSession, trainingSeries, foldProgress/applyEvent, dailyTime, computeDashboard) et sur `apps/web/src/store/sync.ts`.
3. Exécuter avec superpowers:subagent-driven-development (un assistant code, un autre vérifie), relecture visuelle sur téléphone avec le plugin UI Design Review.
4. Puis tâche 15 (déploiement Cloudflare, accès du porteur du projet via le formulaire de secrets) et relecture finale de toute la branche.

## Où on en est (2026-11-25, pour reprendre)
- Skills : `.claude/skills/plus-ou-moins-ecrire-un-cours/` et `plus-ou-moins-creer-un-module-de-cours/` (à jour).
- Plan du module Calculs validé : `docs/validation/10-module-calculs.md` (index ; un fichier par module dans `docs/validation/10-calculs/`) (4 modules, 25 cours, 97 techniques, programmes officiels dans `docs/sources/`).
- Code (plan `docs/superpowers/plans/2026-11-25-cours-1-v2-et-fonctions.md`) : vagues 1 à 3 + T15 (Cours 0 v3) fusionnées ; finitions UI faites ; **reste** : T13 (e2e, en cours), T14 (relecture finale, migration D1 `0002_questions.sql` à appliquer en ligne, mise en ligne).
- Cours 2 : **maquette validée le 2026-11-25 avec 2 fusions** (écran « Revenir à 0 » → étape de « Règle 2 » ; récapitulatif → « Autres façons de faire »), spec v2 dans le doc 06 et **code livré** (`c02-additionner-signes-contraires.ts`, 16 parties, note de 15 questions). **Nouvelle brique réutilisable : la partie `autres`** (écran « Autres façons de faire », composant web `Autres.tsx`) ; la droite graduée donne des hauteurs d'arc différentes aux bonds qui se superposent. Reste : formats de révision propres au Cours 2, e2e du Cours 2, captures téléphone.
- Ensuite : cours 3 à 7 avec le skill, puis modules B, C, D (documents de classe attendus).

## Mise en ligne (2026-11-25)
- En ligne : Cours 0 v3, 1 v2, 2 v2, 3 v2 ; fiche mémo, échauffement, Demander à Clément, Écouter, sons. Migration D1 `0002_questions.sql` appliquée en ligne.
- e2e : 14/14 (T13). Relecture finale (T14) : pas de bloquant ; 3 petits correctifs faits (IndexedDB `blocking`, fiche inconnue, nom du suiveur).
- Reste : maquette Cours 4 (`docs/design/ecrans/cours-4-v2.html`) à valider ; puis Cours 5 à 7 ; modules B, C, D.
- Non fait : le driver e2e ne parcourt pas encore les Cours 2 et 3 (partie `autres`).
- Maquette Cours 4 validée telle quelle (2026-11-25), avec les 5 recommandations.
- **Nouvelle méthode (2026-11-25, pour consommer moins)** : skill `plus-ou-moins-ecrire-un-cours`, section « Choisir le mode ». Prochaine étape, dans une **nouvelle conversation** : coder le Cours 4 d'après sa maquette validée, puis les Cours 5, 6, 7 en mode autonome, un assistant par cours, l'un après l'autre, puis une seule mise en ligne.

## Cours 4 et 5 v2 (2026-11-25) — en ligne
- Cours 4 v2 (d'après la maquette validée) et Cours 5 v2 (mode autonome) codés, fiches courtes « version 2 » dans le doc 06, mis en ligne.
- Tests : moteur 911, api 35, web 428, scripts 7. Nouvelle aide de test `apps/web/test/phoneWidth.ts` (largeur téléphone, Cours 1 à 5).
- Choix sans document : voir les fiches du doc 06 (Cours 4 : formats de révision du Cours 1 ajoutés, niveau 3 à deux soustractions ; Cours 5 : un seul identifiant `regle-signes` avec message selon le calcul, niveau 3 limité à 10–99 × 10–19, pas de droite graduée).
- Déploiement depuis le cloud : `npm run deploy` construit, puis wrangler a besoin de `CLOUDFLARE_API_TOKEN` factice (le proxy injecte le vrai) : `cd apps/api && CLOUDFLARE_API_TOKEN=x CLOUDFLARE_ACCOUNT_ID=7aeceb03afcfd29a243fabb675907335 npx wrangler deploy`.
- À reprendre : `e2e/shots.ts` (parcours `courseTo`) suit encore l'ancien Cours 4 ; test `store.test.tsx` parfois instable sous charge.
- Ensuite : Cours 6 et 7 en mode autonome, puis modules B, C, D.

## Cours 6 v2 (2026-11-25) — poussé sur main, PAS encore en ligne
- Cours 6 « Diviser deux relatifs » codé en mode autonome (un assistant Sonnet, `unePhrase: true`), fiche courte dans le doc 06. 14 parties, 12 écrans pour apprendre, note de 13 questions ; série de pratique avec une question du Cours 5 (−9 × 3).
- Textes vérifiés par instantané (`test/courses/__snapshots__/c06.test.ts.snap`), pas de fichier c06-texts.
- Choix sans document : voir la fiche (3 règles dont `regle-signes` à 4 messages, quotient du niveau 1 de 2 à 9, pas de 0 ÷ n, pas de formats de révision propres).
- Tests : moteur 949, api 35, web 432, scripts 7.
- Ensuite : Cours 7 en mode autonome, puis modules B, C, D. Toujours à reprendre : `e2e/shots.ts`, `store.test.tsx` instable sous charge.
- Mise en ligne bloquée : le réseau de la session refuse api.cloudflare.com (aucun jeton enregistré, demande refusée). À refaire : `npm run deploy` puis `cd apps/api && CLOUDFLARE_API_TOKEN=x CLOUDFLARE_ACCOUNT_ID=7aeceb03afcfd29a243fabb675907335 npx wrangler deploy`, une fois le domaine autorisé.

## Mise en ligne du Cours 6 et compte « aperçu » (2026-11-25)
- Cours 6 en ligne (le domaine Cloudflare est joignable depuis cette session-ci).
- Cours 6 : 214 000 jetons et 37 actions sur Sonnet (Cours 5 : 260 000 et 54 sur Opus).
- Compte « Aperçu » : tous les cours ouverts, voir `docs/deploiement.md`.

## Mode test et connexion expirée (2026-11-25)
- Compte Clément : bouton « Tester les cours » (tous les cours ouverts, rien n'est enregistré, réponses effacées en fermant le cours). Voir `docs/deploiement.md`.
- L'appli relit le compte à chaque ouverture (`/api/me`) : un réglage changé après la connexion arrive sans se reconnecter.
- Jeton refusé (401) : l'appli revenait déjà à la connexion ; elle affiche maintenant « Ta connexion a expiré » et rappelle que le code reste le même (le point « pas de gestion d'un jeton expiré » plus haut est donc réglé).
- Corrigé : `resetStore` remet aussi `seed` à zéro (cause du test `store.test.tsx` instable).
- Leçon : ne jamais supprimer de jetons par tranche horaire (une vraie connexion du porteur du projet a été effacée) ; supprimer seulement le jeton de test identifié par son hachage.

## Cours 7 v2 (2026-11-25) — poussé sur main, PAS encore en ligne
- Cours 7 « Multiplier plusieurs relatifs » codé en mode autonome (un assistant Sonnet, `unePhrase: true`), fiche courte dans le doc 06. 14 parties, 12 écrans pour apprendre, note de 13 questions ; série de pratique avec une division du Cours 6 (−56 ÷ 7). Textes vérifiés par instantané (`test/courses/__snapshots__/c07.test.ts.snap`).
- Générateur : niveau 1 = 3 facteurs de 1 à 9 ; niveau 2 = 4 facteurs de 1 à 6 ; niveau 3 = 5 à 6 facteurs de 1 à 5 (le calcul s'allonge, les nombres rapetissent pour tenir dans la largeur du téléphone). Pas de 0 généré.
- Choix sans document : voir la fiche (3 règles : « deux par deux », « je compte les − », « le signe d'abord » ; erreur ajoutée `facteur-oublie`).
- Reste : l'animation `CompterLesMoins` (`anims/index.tsx`) n'est plus utilisée par le Cours 7 mais gardée (référencée par `feedback.test.tsx`). `e2e/shots.ts` : capture du Cours 7 retirée.
- Consommation de l'assistant : 231 000 jetons, 44 actions, sur Sonnet (Cours 6 : 214 000 et 37).
- Tests : moteur 986, api 35, web 439, scripts 7 (tous verts).
- Mise en ligne bloquée : le proxy de la session refuse api.cloudflare.com (403) ; l'autorisation de l'hôte a été refusée. À refaire une fois le domaine autorisé : `npm run deploy` (construit), puis `cd apps/api && CLOUDFLARE_API_TOKEN=x CLOUDFLARE_ACCOUNT_ID=7aeceb03afcfd29a243fabb675907335 npx wrangler deploy`.
- Ensuite : modules B, C, D (documents de classe attendus).

## Module 2 « Équations et inéquations » : cours 1 à 4 (2026-11-26), pull request #7, pas encore fusionnée
- Plan validé : `docs/modules/02-equations-inequations/module.md` (11 cours). Programmes téléchargés dans `docs/sources/` : seconde 2026 et cycle 4 2026. **Manque : le programme de 1re spécialité 2026** (celui de 2019 est cité pour le second degré) ; pas de cours du prof reçu.
- Moteur : `packages/engine/src/math/equation.ts`, `solve.ts`, `parse-equation.ts` (équations et inéquations du 1er degré, fractions écrites, jugement d'une ligne quelle que soit la méthode de l'élève) ; question `resoudre` (`exercises/resoudre.ts`, `Resoudre.tsx`) ; champ `helped` (indice, « avec aide » dans le suivi). Maquette validée : `docs/design/ecrans/equations-resolution-ligne.html`.
- Cours 1 à 4 écrits par des assistants Sonnet, dans le module « Essais » (comptes aperçu seulement), fiches dans le dossier du module :
  - cours 1 `equations-tester-solution` : 190 000 jetons, 32 actions ; cours 2 `equations-ajouter-retirer` : 197 000 et 43 (fiche comprise) ; cours 3 `equations-diviser` et 4 `equations-resoudre-premier-degre` par un seul assistant : 266 000 et 59, soit environ 133 000 par cours.
  - Le 2e cours d'un même assistant coûte moins cher (les documents ne sont lus qu'une fois).
- Tests : moteur 1 148, api 35, web 452 (verts après fusion des trois branches).
- À vérifier : reprises entre les cours 2 et 3 (le cours 3 a été écrit sans voir le cours 2) ; l'écran « Calcul passé » du cours 2 ; le cours 1 n'a pas de « solution ou pas solution » dans ses exercices de fin ; textes d'écran non relus.
- Reste du module : cours 5 à 11 (fiches à écrire), maquettes d'intervalles et de tableau de signes.
