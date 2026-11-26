# Cours 4 — Résoudre ax + b = c
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 3 « Diviser des deux côtés » · Sources : cycle 4 p. 10 ; Éduscol, « Résolution des équations, méthode accessible » (d'abord le nombre seul, puis le coefficient).

## Points importants
- À retenir : (1) j'enlève b des deux côtés (b négatif : j'ajoute son opposé) : ax + b = c devient ax = c − b ; (2) je divise les deux membres par a, avec son signe ; (3) je vérifie en remplaçant x dans l'équation de départ.
- Pièges : diviser un seul terme avant d'enlever b (2x + 4 = 10 → 1) ; ajouter b à droite au lieu de le retirer (2x + 3 = 7 → 5) ; s'arrêter à ax = c − b (→ 4) ; perdre le signe en divisant.
- Vu dans ce cours : l'ordre « d'abord le nombre seul, ensuite le coefficient » ; les deux lignes « opération » (2x + 3 − 3 = 7 − 3, puis 2x ÷ 2 = 4 ÷ 2) ; retirer ou ajouter selon le signe de b.
- Reprises : cours 2 (retirer ou ajouter des deux côtés, règle 1 et comparaison), cours 3 (diviser avec le signe de a, règle 2), cours 1 (vérifier en remplaçant, règle 3).
- Écarts et choix : ax + b = c seulement (inconnue des deux côtés : cours suivant) ; a de 2 à 5 au niveau 1, jamais c = 0 ; plus de série de pratique ni d'« Autres façons de faire » ; « comparer deux cas » seulement pour 2x + 3 = 11 contre 2x − 3 = 11.
- Dans l'appli : déroulé guidé, 8 écrans avant l'annonce de la fin ; `courses/equations/equations-resoudre-premier-degre.ts` ; exemple guidé et 5 exercices en `resoudre` ; révision : `saisie` et `resoudre`.

## Fiche
### Structure du cours (déroulé guidé)
1. Deviner : 2x + 3 = 7, combien vaut x ? (ne compte pas).
2. Règle 1 : enlever le nombre seul des deux côtés (2x + 3 = 7, balance) ; petite question : 5x + 2 = 17, que fait-on en premier ?
3. Comparer deux cas (sur place) : 2x + 3 = 11 contre 2x − 3 = 11, retirer ou ajouter 3.
4. Règle 2 : puis diviser par a (2x = 4, reprise du cours 3) ; petite question : −2x + 4 = 10 (signe).
5. Règle 3 : vérifier en remplaçant (x = −3 dans 4x + 5 = −7).
6. Exemple guidé : −3x + 4 = −11 (a négatif, résultat positif), aide d'office, non noté.
7. Annonce de la fin, puis 5 exercices « À toi de résoudre » (niveau 1), fiche mémo.
### Règles (3) et erreurs reconnues
1. J'enlève b d'abord : `signe-b-garde` (→ 5), `diviser-avant` (→ 1).
2. Je divise par a avec son signe : `oublier-diviser` (→ 4), `signe-oublie`.
3. Je vérifie en remplaçant x (pas d'erreur propre).
### Niveaux
1 : a de 2 à 5, b de 1 à 9, x de 1 à 9, signes variés · 2 : a jusqu'à 9, b jusqu'à 20, x jusqu'à 12 · 3 : a jusqu'à 12, b jusqu'à 30, x jusqu'à 15.
### Hors catalogue
Rien. Les exercices portent l'équation en `meta` (a, b, c, latex).
