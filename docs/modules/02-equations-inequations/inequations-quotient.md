# Cours 11 — Quotient : la valeur interdite
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 10 « Tableau de signes d'un produit » · Sources : seconde 2026 p. 8 et 10 (signe d'un quotient, valeur interdite) ; reprise des cours 7 (intervalles) et 10 (tableau d'un produit).

## Points importants
- À retenir : (1) un quotient n'existe pas quand le bas vaut 0 : la valeur qui annule le bas est interdite ; (2) dans le tableau, sous la valeur qui annule le haut on écrit 0, sous la valeur qui annule le bas on écrit la double barre ‖ ; le reste suit la règle des signes du produit ; (3) dans S, la valeur interdite n'est jamais comprise : son crochet est ouvert, même avec ≤ ou ≥ ; les 0 du haut sont gardés avec ≥ ou ≤.
- Pièges : 0 au lieu de ‖ sous la valeur interdite ; ‖ sous la valeur du haut ; crochet fermé sur la valeur interdite ; valeur du haut et du bas confondues ; un seul morceau au lieu de deux.
- Vu dans ce cours : valeur interdite, double barre ‖, quotient en fraction, ligne du quotient avec ÷, lecture de S avec ∪ et crochet ouvert sur la valeur interdite ; différence produit contre quotient (en 2, le produit vaut 0, le quotient n'existe pas).
- Écarts et choix : quotient de deux facteurs ax + b seulement, valeurs distinctes (haut et bas ne partagent pas leur valeur) ; niveau 1 : valeurs entières de ±1 à ±6 ; niveau 3 : rationnelles possibles ; exercices de fin : tableau, S, tableau, S, S, avec ≤ ou ≥ le plus souvent ; la leçon montre le tableau en lignes d'écriture.
- Dans l'appli : 8 écrans pour apprendre (3 règles, 1 comparaison produit contre quotient, 2 petites questions, exemple guidé (2x − 6) ÷ (x + 1) en `tableau` complet) ; `essais/inequations-quotient.ts` ; révision : `saisie` (la valeur interdite), `tableau`, `intervalle`.

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Le bas ne peut pas valoir 0 : sa valeur est interdite ; le haut et le bas ont chacun leur ligne (erreurs : valeurs, lignes, ligne du quotient).
2. 0 sous la valeur du haut, ‖ sous la valeur du bas (erreurs : `barre-oubliee`, `barre-en-trop`, 0 oublié ou en trop, règle des signes).
3. La valeur interdite n'est jamais dans S : crochet ouvert (erreur : `crochet`).
### Idée de départ (le pourquoi, avant toute règle)
(x + 1) ÷ (x − 2) pour x = 2 : on diviserait par 0, c'est impossible. Cette valeur doit sortir de S, quelle que soit l'inégalité.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| valeurs-ordre, valeurs, lignes-facteurs, ligne-totale | désordre ; signe de b ; ligne sans ÷ | 1 | une ligne par facteur, quotient écrit haut ÷ bas |
| barre-oubliee, barre-en-trop, zero-oublie, zero-en-trop, signe-facteur, regle-signes | 0 sous la valeur du bas | 2 | ‖ sous le bas, 0 sous le haut |
| crochet, reunion, crochet-infini, cote, ordre, borne, signe-borne | [ sur la valeur interdite | 3 | la valeur interdite est exclue |
### Techniques (1 à 3)
- Principale (fiche mémo) : valeurs · 0 pour le haut, ‖ pour le bas · valeur interdite ouverte · (x + 1) ÷ (x − 2) ≥ 0 ; ]−∞ , −1] ∪ ]2 , +∞[.
- Autres (étapes de la leçon) : se demander « le quotient existe-t-il ? » ; comparer au produit.
### Reprises et comparaison
- Deux cas qui se confondent : (x + 1)(x − 2) ≥ 0 contre (x + 1) ÷ (x − 2) ≥ 0 : même tableau de signes, mais en 2 le produit vaut 0 et le quotient n'existe pas.
- Reprises : cours 10 (tableau d'un produit, lire S), cours 7 (crochets), cours 4 (résoudre ax + b = 0).
- Exemple guidé (cas non montré) : (2x − 6) ÷ (x + 1), valeur interdite −1, tableau complet.
### Niveaux (les nombres ET la longueur du calcul)
1 : valeurs entières de ±1 à ±6, a de ±1 (3 fois sur 4) ou ±2 · 2 : valeurs de ±1 à ±9, a de ±1 à ±4 · 3 : a de ±2 à ±5, b de ±1 à ±12, valeurs rationnelles possibles.
### Hors catalogue
Les scènes de leçon n'ont pas de tableau de signes (lignes d'écriture dans la leçon, vrai tableau à l'exemple guidé). Pas de moyen de garantir une inégalité large dans les exercices de fin : le symbole est tiré au hasard (3 fois sur 4 ≤ ou ≥).
