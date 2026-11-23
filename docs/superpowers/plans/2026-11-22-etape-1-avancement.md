# Étape 1 — Avancement (pour reprendre dans une autre session)

*Mis à jour le 2026-11-23.* Plan : `docs/superpowers/plans/2026-11-22-etape-1-relatifs.md`. Documents validés : `docs/validation/01` à `07` (le 07 complète et prime sur 01–06).

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

## Reprendre : développement des écrans (nouvelle session)
1. Lire ce fichier, le plan, `docs/validation/01` à `08` (08 et 07 priment), `docs/design/design-system/README.md` et `docs/design/ecrans/BRIEF.md` + les pages d'écrans.
2. Mettre à jour le plan (superpowers:writing-plans) : remplacer les parties UI des tâches 6, 7, 10, 13, 14 par des tâches d'écrans qui suivent les maquettes validées et le design system (tokens dans `apps/web/src/theme.css`), en s'appuyant sur les fonctions du moteur déjà construites (`@pom/engine` : buildQuestion/checkAnswer, readRaw/pressKey, createActivity/answer/skip, nextReviewSession, trainingSeries, foldProgress/applyEvent, dailyTime, computeDashboard) et sur `apps/web/src/store/sync.ts`.
3. Exécuter avec superpowers:subagent-driven-development (un assistant code, un autre vérifie), relecture visuelle sur téléphone avec le plugin UI Design Review.
4. Puis tâche 15 (déploiement Cloudflare, accès du porteur du projet via le formulaire de secrets) et relecture finale de toute la branche.
