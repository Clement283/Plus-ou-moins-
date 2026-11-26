# Cours 9 — Le signe de ax + b
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 8 « Résoudre une inéquation du premier degré » · Sources : seconde 2026 p. 10-11 (signe d'une expression affine) ; reprise du cours 8 (ax + b ≥ 0 donne x ≥ −b/a si a > 0).

## Points importants
- À retenir : (1) ax + b s'annule pour x = −b/a, solution de ax + b = 0 ; (2) à droite de cette valeur, ax + b a le signe de a ; (3) à gauche, le signe contraire ; on range ces trois faits dans un tableau de signes (valeur en 1re ligne, facteur en 1re colonne, signes − 0 +).
- Pièges : valeur écrite sans changer le signe de b (2x − 6 : 3 ou −3 ?) ; signes à l'envers (signe de a à gauche) ; 0 oublié sous la valeur ; facteur mal recopié sur la ligne.
- Vu dans ce cours : valeur qui annule, signe à droite et à gauche, lien avec ax + b ≥ 0 du cours 8 (a > 0 : x ≥ −b/a ; a < 0 : le sens se retourne), tableau de signes d'un seul facteur (valeurs, lignes, signes).
- Écarts et choix : un seul facteur (produit et quotient aux cours suivants) ; niveau 1 : racine entière non nulle, a de ±1 à ±5 ; niveaux 2 et 3 : racine rationnelle possible ; 5 exercices de fin en tableau complet (valeurs, ligne, signes) ; la leçon montre le tableau d'un facteur dans ses scènes (`Scene.table` : les valeurs d'abord, puis les signes) ; exercices de fin : toujours le tableau complet.
- Dans l'appli : 8 écrans pour apprendre (3 règles, 1 comparaison, 2 petites questions, exemple guidé 3x + 9 en `tableau` complet) ; `essais/inequations-signe-affine.ts` ; révision : `saisie` (la valeur qui annule) et `tableau`.

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. La valeur qui annule ax + b est la solution de ax + b = 0 (erreur : signe de b mal géré).
2. À droite de cette valeur, ax + b a le signe de a (erreur : signes à l'envers).
3. À gauche, il a le signe contraire de a (erreur : signes à l'envers).
### Idée de départ (le pourquoi, avant toute règle)
2x − 6 : négatif pour x = 0 (−6), positif pour x = 5 (4) : le signe change en un seul endroit, là où l'expression vaut 0.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| valeurs | 2x − 6 s'annule en −6 ou en −3 | 1 | on résout 2x − 6 = 0 |
| lignes-facteurs | facteur mal recopié | 1 | la ligne porte le facteur de l'énoncé |
| signe-facteur | − + au lieu de + − pour −x + 4 | 2 | signe de a à droite, contraire à gauche |
| zero-oublie, zero-en-trop | 0 oublié sous la valeur | 1 | 0 sous la valeur qui annule, nulle part ailleurs |
### Techniques (1 à 3)
- Principale (fiche mémo) : valeur qui annule · signe de a à droite · signe contraire à gauche · 2x − 6 : 3 ; − 0 +.
- Autres (étapes de la leçon) : essayer un nombre de chaque côté ; lire ax + b ≥ 0 comme au cours 8.
### Reprises et comparaison
- Deux cas qui se confondent : 2x − 6 contre −2x + 6 : même valeur, signes inversés.
- Reprises : cours 4 (résoudre ax + b = 0), cours 8 (ax + b ≥ 0, sens retourné si a < 0).
- Exemple guidé (cas non montré) : 3x + 9, valeur négative −3, tableau complet.
### Niveaux (les nombres ET la longueur du calcul)
1 : a de ±1 à ±5, racine entière non nulle de ±1 à ±9 · 2 : a de ±2 à ±5, b de ±1 à ±12, racine rationnelle possible · 3 : a de ±2 à ±9, b de ±1 à ±30.
### Hors catalogue
Rien : le tableau de signes se dessine dans les scènes de leçon (`Scene.table`, `upTo`).
