# Cours 10 — Tableau de signes d'un produit, et lecture de S
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 9 « Le signe de ax + b » · Sources : seconde 2026 p. 8 et 10 (signe d'un produit, tableau de signes) ; reprise du cours 7 (intervalles) et du cours 9 (signe de ax + b).

## Points importants
- À retenir : (1) une ligne par facteur, avec les valeurs qui les annulent rangées de la plus petite à la plus grande en 1re ligne ; (2) dans chaque colonne, deux signes pareils donnent +, deux signes différents donnent −, un facteur nul rend le produit nul (0) ; (3) pour résoudre « produit ≥ 0 » (ou >, ≤, <), je garde les colonnes qui conviennent, avec les 0 si l'inégalité est large, puis j'écris un intervalle par morceau, reliés par ∪.
- Pièges : valeurs dans le désordre ; signe d'un facteur à l'envers (a négatif) ; règle des signes mal appliquée ; 0 oublié ou en trop ; un seul morceau au lieu de deux ; crochet fermé contre ∞ ; crochet ouvert pour un 0 gardé (≥, ≤).
- Vu dans ce cours : tableau d'un produit de deux facteurs ax + b (valeurs, lignes, signes), colonnes, 0 du produit, lecture de S avec ∪, lien avec les cours 7 (crochets) et 9 (signe d'un facteur).
- Écarts et choix : produit de deux facteurs seulement (jamais de quotient : cours 11) ; valeurs distinctes ; niveau 1 : valeurs entières de ±1 à ±6, a de ±1 ou ±2 ; niveau 3 : valeurs rationnelles possibles ; exercices de fin : tableau, S, tableau, S, S (tableau complet à chaque fois) ; la leçon montre le tableau en lignes d'écriture (pas de scène « tableau »).
- Dans l'appli : 8 écrans pour apprendre (3 règles, 1 comparaison, 2 petites questions, exemple guidé (3x + 6)(x − 4) en `tableau` complet) ; `essais/inequations-tableau-signes-produit.ts` ; révision : `saisie` (la plus petite valeur), `tableau`, `intervalle`.

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Une ligne par facteur ; les valeurs qui annulent chaque facteur, rangées dans l'ordre croissant (erreurs : désordre, facteur mal recopié).
2. Dans chaque colonne : signes pareils +, différents −, un facteur nul donne 0 (erreurs : règle des signes, 0 oublié ou en trop, signe d'un facteur).
3. S : colonnes qui conviennent, 0 compris si ≥ ou ≤, un intervalle par morceau relié par ∪ (erreurs : un seul morceau, crochets).
### Idée de départ (le pourquoi, avant toute règle)
(x − 2)(x + 1) pour x = 0 : (−2) × 1 = −2, négatif. Le produit change de signe quand l'un des facteurs change de signe : un tableau range tous ces changements.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| valeurs-ordre, valeurs, lignes-facteurs, ligne-totale | valeurs dans le désordre ; −2 au lieu de 2 | 1 | on range de la plus petite à la plus grande |
| signe-facteur, regle-signes, zero-oublie, zero-en-trop | + × − noté + ; 0 oublié | 2 | pareils +, différents − ; 0 sous la valeur |
| reunion, crochet, crochet-infini, cote, ordre, borne, signe-borne | un seul morceau ; [ contre ∞ | 3 | un intervalle par morceau, reliés par ∪ |
### Techniques (1 à 3)
- Principale (fiche mémo) : une ligne par facteur · règle des signes colonne par colonne · garder les colonnes qui conviennent · (x − 2)(x + 1) ≥ 0 ; ]−∞ , −1] ∪ [2 , +∞[.
- Autres (étapes de la leçon) : essayer un nombre dans le produit (x = 0) ; relier S au cours 7.
### Reprises et comparaison
- Deux cas qui se confondent : (x − 1)(x + 4) ≥ 0 contre ≤ 0 : même tableau, deux morceaux ou un seul.
- Reprises : cours 9 (signe de ax + b), cours 7 (intervalles, crochets).
- Exemple guidé (cas non montré) : (3x + 6)(x − 4), tableau complet.
### Niveaux (les nombres ET la longueur du calcul)
1 : valeurs entières de ±1 à ±6, a de ±1 (3 fois sur 4) ou ±2 · 2 : valeurs de ±1 à ±9, a de ±1 à ±4 · 3 : a de ±2 à ±5, b de ±1 à ±12, valeurs rationnelles possibles.
### Hors catalogue
Les scènes de leçon n'ont pas de tableau de signes : lignes d'écriture dans la leçon, vrai tableau à l'exemple guidé. Pas de moyen de varier `ask` selon le rang de l'exercice de fin : `ask` par défaut (tout) partout.
