# Registre des modules et des cours

Fichier **lu par les skills** `plus-ou-moins-creer-un-module-de-cours` et `plus-ou-moins-ecrire-un-cours` (et mis à jour par le premier). Il est la seule source de l'ordre des modules, des numéros de cours et de l'état d'avancement : les skills ne contiennent aucun plan.

## Ordre voulu des modules (porteur du projet, 2026-11-25)

| # | Module | Cours | État | Plan |
|---|---|---|---|---|
| 1 | Relatifs (identifiant `calculs`) | 0 à 7 | écrits | `docs/validation/10-module-calculs.md` §A et `docs/validation/06-cours-relatifs.md` |
| 2 | Équations et inéquations | — | à planifier | — |
| 3 | Priorités | 8 à 11 (provisoires) | plan validé | `docs/validation/10-module-calculs.md` §B |
| 4 | Suites numériques | — | à planifier | — |
| 5 | Fractions | 12 à 18 (provisoires) | plan validé | `docs/validation/10-module-calculs.md` §C |
| 6 | Discriminant et second degré | — | à planifier | — |
| 7 | Carrés et identités remarquables | 19 à 24 (provisoires) | plan validé | `docs/validation/10-module-calculs.md` §D |

## À trancher (bloque la planification des modules 2, 4 et 6)

Le doc 10 numérote les cours 8 à 24 dans l'ordre A, B, C, D. L'ordre ci-dessus intercale trois nouveaux modules : les numéros « provisoires » ne tiennent plus. Option recommandée : un **identifiant de cours stable** (`cNN`, jamais renuméroté) et un **ordre d'apprentissage** donné par cette table.

## Où est quoi

- Fiches de cours (une par cours, lues par le skill cours) : `docs/fiches/cNN-nom.md`.
- Programmes officiels (PDF + texte) : `docs/sources/`.
- Code des cours : `packages/engine/src/courses/<module>/`, inscrits dans l'`index.ts` du dossier.
- Décisions d'écrans validées : `docs/validation/08-decisions-ecrans.md`.
