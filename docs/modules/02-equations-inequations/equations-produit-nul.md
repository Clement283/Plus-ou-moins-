# Cours 6 — Équation produit nul (ax + b)(cx + d) = 0
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 5 « Résoudre ax + b = cx + d » · Sources : cycle 4 p. 11 ; seconde 2026 p. 8 ; 1re 2019 p. 7 (forme factorisée du second degré).

## Points importants
- À retenir : (1) un produit est nul si l'un de ses facteurs est nul (seulement quand il vaut 0) ; (2) je résous chaque facteur égal à 0 comme une équation ordinaire ; (3) chaque facteur donne une solution : j'écris les deux, S = {−4 ; 1}.
- Pièges : signe oublié (x + 2 = 0 → 2) ; diviser oublié (2x − 8 = 0 → 8) ; donner l'autre solution ; croire qu'un produit égal à 6 a un facteur égal à 6.
- Vu dans ce cours : facteur, produit nul, « ou » entre deux équations, S = {… ; …} avec deux valeurs ; chaque facteur se résout comme au cours précédent.
- Écarts et choix : le moteur ne lit pas le produit : exercices de fin = saisie d'une seule solution (« la plus petite » ou « la plus grande », produit affiché) et « À toi de résoudre » sur un seul facteur (px + q = 0, produit non affiché) ; pas de solution double ni de x(x − 3) = 0 ; solutions entières distinctes.
- Dans l'appli : 8 écrans pour apprendre (3 règles, 1 comparaison, 2 petites questions, exemple guidé = un facteur), exercices de fin saisie / résoudre / saisie / résoudre / saisie ; `essais/equations-produit-nul.ts`. Manque : lecture du produit par « À toi de résoudre » et saisie des deux solutions.

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Un produit est nul si l'un de ses facteurs est nul (et seulement si le produit vaut 0, pas 6).
2. Je résous chaque facteur égal à 0 comme une équation ordinaire : x + 2 = 0 donne x = −2 (erreurs : signe oublié, division oubliée).
3. Chaque facteur donne une solution : j'écris les deux (erreur : s'arrêter à une seule).
### Idée de départ (le pourquoi, avant toute règle)
(x + 2)(x − 3) = 0 : on ne sait pas résoudre un produit d'un coup, mais 5 × 0 = 0 : il suffit qu'un facteur vaille 0. Deux équations simples remplacent une équation difficile.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| signe-oublie | x + 2 = 0 → x = 2 | 2 | on retire 2 des deux côtés : x = −2 |
| diviser-oublie | 2x − 8 = 0 → x = 8 | 2 | il reste 2x = 8, on divise par 2 |
| autre-solution | donne l'autre solution quand on demande la plus petite (ou la plus grande) | 3 | chaque facteur donne une solution |
### Techniques (1 à 3)
- Principale (fiche mémo) : facteur par facteur · produit égal à 0 · (x + 2)(x − 3) = 0 ; x + 2 = 0 ou x − 3 = 0 ; x = −2 ou x = 3.
- Autres (étapes de la leçon) : tester une valeur dans le produit (5 × 0) ; chaque facteur se résout comme au cours 4 (retirer, puis diviser).
### Reprises et comparaison
- Deux cas qui se confondent : (x + 2)(x − 3) = 0 contre (x + 2)(x − 3) = 6 : on ne peut dire « un facteur vaut 0 » que pour 0.
- Exemple guidé (cas non montré) : (3x + 9)(x − 2) = 0, facteur 3x + 9 = 0 : coefficient et résultat négatif (x = −3).
### Niveaux (les nombres ET la longueur du calcul)
1 : (x + m)(x + n), m et n de ±1 à ±9, un coefficient 2 de temps en temps · 2 : un facteur ax + b, a de 2 à 4, racine de ±1 à ±6 · 3 : deux facteurs avec coefficient, racines jusqu'à ±9 · calculs-pièges : coefficient différent de 1 (diviser-oublie).
### Hors catalogue
Nouvelle brique nécessaire pour la version idéale : lecture du produit (x + 2)(x − 3) = 0 par « À toi de résoudre » et saisie de deux solutions (→ mode maquette). Version actuelle : saisie d'une solution (la plus petite ou la plus grande) et « À toi de résoudre » sur un seul facteur.
