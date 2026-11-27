# Registre des modules

Lu en premier par les skills `plus-ou-moins-creer-un-module-de-cours` et `plus-ou-moins-ecrire-un-cours`. **Seule source de l'ordre des modules.** Un module = un dossier `docs/modules/NN-nom/` avec un `module.md` (descriptif global et points importants du module) et un fichier par cours `nom-du-cours.md` (points importants en haut, fiche en dessous).

| # | Module | Dossier | Cours | État |
|---|---|---|---|---|
| 1 | Relatifs (identifiant `calculs`) | `docs/modules/01-relatifs/` | 0 à 7 | écrit, en ligne |
| 2 | Équations et inéquations | `docs/modules/02-equations-inequations/` | 11 (tous écrits) | module.md validé ; cours 1 à 6 écrits au déroulé guidé et **validés par le porteur du projet le 2026-11-26** ; **cours 7 à 11 écrits le 2026-11-26** (fiches et code) ; tous dans le module Essais, pas encore visibles des élèves ; cours 7 à 11 pas encore relus ni essayés dans l'appli ; écrans codés (intervalle, tableau de signes, réunion ∪, deux solutions, branchée au cours 6 ; intervalle et tableau dans les scènes de leçon) |
| 3 | Priorités | `docs/modules/03-priorites/` | 7 (tous écrits) | module.md validé le 2026-11-27 ; **cours 1 à 7 tous écrits** (fiches et code, module Essais, pas encore relus ni essayés) ; écran « Écris le calcul » (question `ecrire`) codé pour le cours 6 et la partie lettres du cours 7 ; moteur étendu (calcul seul, parenthèses, crochets) ; bâti sur 2 documents de 5e trouvés sur Internet et le plan archivé `docs/validation/10-calculs/B-priorites.md` |
| 4 | Suites numériques | — | — | à créer |
| 5 | Fractions | — | — | plan archivé : `docs/validation/10-calculs/C-fractions.md` ; à y ajouter (décidé le 2026-11-27) : le trait de fraction (venu du module Priorités), les nombres décimaux, les solutions fractionnaires des équations |
| 6 | Discriminant et second degré | — | — | à créer |
| 7 | Carrés et identités remarquables | — | — | plan archivé : `docs/validation/10-calculs/D-carres.md` |

Ordre voulu par le porteur du projet (2026-11-25) : les modules de révision (Relatifs, Priorités, Fractions, Carrés) sont intercalés avec les chapitres de l'année. Les plans archivés de 3, 5 et 7 servent de point de départ : on les réécrit en `module.md` plus court quand vient leur tour.

## Identifiants et numéros de cours
- Un cours a un **identifiant sans numéro** (`equations-premier-degre`), stable, qui sert aussi de nom de fichier (fiche, code, test). Les cours du module 1 gardent leurs anciens identifiants (`c04-soustraire`…) : la progression de l'élève y est attachée.
- Le **numéro affiché** (« Cours 3 ») est **calculé** par l'appli : c'est la place du cours **dans son module**, qui **repart de 1** à chaque module (le module Relatifs, lui, commence au Cours 0 : `firstNumber` dans `ModuleDef`). Insérer un cours décale les numéros de son module tout seul, sans rien renommer. Quand l'appli mêle plusieurs modules (révisions, suivi), le libellé devient « Équations · Cours 3 » (`courseNumberLabel`).
- Dans un texte d'écran, désigner un autre cours par son **titre**, pas par son numéro.

## Qui lit quoi
- **Écrire le cours d'un module** : ce registre ; le `module.md` de **chaque module précédent** ; le `module.md` du module courant ; le **début (points importants, 12 premières lignes) de chaque cours précédent du module** ; la fiche du cours à écrire.
- **Créer un module** : ce registre ; les `module.md` des modules précédents ; les documents de classe et la recherche ; écrit le `module.md` du nouveau module.

## Où est quoi
- Programmes officiels (PDF + texte) : `docs/sources/`.
- Code des cours : `packages/engine/src/courses/<module>/`, inscrits dans l'`index.ts` du dossier.
- Décisions d'écrans validées : `docs/validation/08-decisions-ecrans.md`. Déploiement : `docs/deploiement.md`.
