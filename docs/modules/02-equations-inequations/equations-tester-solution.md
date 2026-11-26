# Cours 1 — Tester si un nombre est solution
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : module Relatifs, cours 7 « Multiplier plusieurs relatifs » · Sources : seconde 2026 p. 8 (« ensemble des solutions ») ; 1re 2019 p. 16 (« statut des égalités ») ; Éduscol, « Résolution des équations, méthode accessible » (difficulté : comprendre ce qu'est une inconnue).

## Points importants
- À retenir : (1) je remplace x par le nombre, entre parenthèses s'il est négatif ; (2) je calcule chaque membre à part ; (3) même résultat des deux côtés : solution, sinon : pas solution.
- Pièges : 2x lu « 2 collé à 3 » (23) ou « 2 + 3 » ; signe perdu sans parenthèses (5 − x pour x = −3 → 2) ; conclure en ne calculant qu'un membre.
- Vu dans ce cours : inconnue, équation, membre de gauche / de droite, solution ; « 2x » veut dire 2 × x ; vérifier une solution (servira à chaque cours du module).
- Écarts et choix : membres de la forme ax + b seulement (× puis +, connu du collège), car le module Priorités vient après ; pas de x² ; nombres testés entiers de −9 à 9.
- Dans l’appli : écrit, module « Essais » (`packages/engine/src/courses/essais/equations-tester-solution.ts`, test `equations-tester-solution.test.ts`) ; s’appuie sur `src/math/equation.ts`. Exercices de fin : saisie de la valeur d’un membre (gauche, parfois droite), l’équation et le nombre testé affichés au-dessus ; la conclusion « solution / pas solution » est travaillée dans la leçon (choix), pas dans les exercices de fin.
- Choix sans document : erreur `un-seul-membre` non détectée en saisie (traitée par les messages des choix de la leçon) ; membres écrits ax + b ou b + ax, jamais −x en tête ; niveau 3 : coefficients jusqu’à 6 pour tenir dans la largeur du téléphone.

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Je remplace x par le nombre partout, avec des parenthèses s'il est négatif (évite 23 pour 2x et le signe perdu).
2. Je calcule le membre de gauche, puis celui de droite, séparément (évite de tout mélanger en une ligne).
3. Si les deux résultats sont égaux, le nombre est solution ; sinon il ne l'est pas (évite de conclure sur un seul côté).
### Idée de départ (le pourquoi, avant toute règle)
Une équation est une question : « pour quel nombre les deux côtés donnent-ils la même chose ? ». Tester, c'est essayer une réponse, comme on pèse sur une balance.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| `x-colle` | 2x pour x = 3 → 23 ; pour x = −3 → −1 (2 + (−3)) | 1 | 2x veut dire 2 × x |
| `parentheses-oubliees` | 5 − x pour x = −3 → 2 au lieu de 8 | 1 | un négatif se met entre parenthèses, puis soustraire = ajouter l'opposé |
| `un-seul-membre` | « solution » parce que la gauche vaut le nombre testé, ou sans calculer la droite | 3 | on compare la gauche à la droite, pas au nombre |
| `signe-relatif` | 3 × (−2) + 4 → 10 | 2 | erreur de signe du module Relatifs (renvoi à la règle des signes) |
### Techniques (3)
- Principale (fiche mémo) : **Remplacer, calculer, comparer** · toute équation · x = −2 dans 3x + 4 = x : gauche 3 × (−2) + 4 = −2, droite −2 → solution.
- Étape de la leçon : **Parenthèses d'abord** · nombre négatif · écrire 3 × ( ) + 4, puis mettre −2 dans la case.
- « Autres façons de faire » : **Essayer pour trouver** (tester −1, 0, 1, 2… quand on n'a pas de méthode) ; **Vérifier sa réponse** (après une résolution, on remplace).
### Reprises
- Cas B à comparer : 2 + (−3) (module Relatifs, cours 2) à côté de 2x pour x = −3 : addition contre multiplication.
- Question de la série tirée du module précédent : 5 − (−3) (cours 4 « Soustraire, c'est ajouter l'opposé »), le calcul exact de 5 − x pour x = −3.
### Niveaux (les nombres ET la longueur du calcul)
1 : ax + b = c, a et b de −9 à 9, nombre testé de −5 à 5 · 2 : ax + b = cx + d · 3 : un membre à trois termes (ax + b − cx), nombre testé de −9 à 9 · calculs-pièges : x négatif avec un « − x », a négatif. Moitié des nombres testés solutions, moitié non.
### Hors catalogue
Pas de nouvel écran (saisie d'un entier, choix « solution / pas solution »). Moteur prêt : `packages/engine/src/math/equation.ts` (membres avec x, `memberLatex`, `substitute` qui rend le calcul 3 × (−2) + 4, `isSolution`, `solveLinear`) ; le générateur du cours reste à écrire avec le cours.
