# Registre des modules

Lu en premier par les skills `plus-ou-moins-creer-un-module-de-cours` et `plus-ou-moins-ecrire-un-cours`. **Seule source de l'ordre des modules.** Un module = un dossier `docs/modules/NN-nom/` avec un `module.md` (descriptif global et points importants du module) et un fichier par cours `cNN-nom.md` (points importants en haut, fiche en dessous).

| # | Module | Dossier | Cours | État |
|---|---|---|---|---|
| 1 | Relatifs (identifiant `calculs`) | `docs/modules/01-relatifs/` | 0 à 7 | écrit, en ligne |
| 2 | Équations et inéquations | — | — | à créer |
| 3 | Priorités | — | — | plan archivé : `docs/validation/10-calculs/B-priorites.md` |
| 4 | Suites numériques | — | — | à créer |
| 5 | Fractions | — | — | plan archivé : `docs/validation/10-calculs/C-fractions.md` |
| 6 | Discriminant et second degré | — | — | à créer |
| 7 | Carrés et identités remarquables | — | — | plan archivé : `docs/validation/10-calculs/D-carres.md` |

Ordre voulu par le porteur du projet (2026-11-25) : les modules de révision (Relatifs, Priorités, Fractions, Carrés) sont intercalés avec les chapitres de l'année. Les plans archivés de 3, 5 et 7 servent de point de départ : on les réécrit en `module.md` plus court quand vient leur tour.

## Numéros de cours
Chaque cours a un **identifiant stable** (`cNN`, jamais renuméroté). L'ordre d'apprentissage est celui de ce tableau puis de la liste des cours du `module.md`. Les numéros 8 à 24 du plan archivé sont provisoires : le premier module à créer reprend à partir de `c08`.

## Qui lit quoi
- **Écrire le cours d'un module** : ce registre ; le `module.md` de **chaque module précédent** ; le `module.md` du module courant ; le **début (points importants, 12 premières lignes) de chaque cours précédent du module** ; la fiche du cours à écrire.
- **Créer un module** : ce registre ; les `module.md` des modules précédents ; les documents de classe et la recherche ; écrit le `module.md` du nouveau module.

## Où est quoi
- Programmes officiels (PDF + texte) : `docs/sources/`.
- Code des cours : `packages/engine/src/courses/<module>/`, inscrits dans l'`index.ts` du dossier.
- Décisions d'écrans validées : `docs/validation/08-decisions-ecrans.md`. Déploiement : `docs/deploiement.md`.
