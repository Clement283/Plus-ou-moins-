# Cours 1 — Tester si un nombre est solution
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : module Relatifs, cours 7 « Multiplier plusieurs relatifs » · Sources : seconde 2026 p. 8 (« ensemble des solutions ») ; 1re 2019 p. 16 (« statut des égalités ») ; Éduscol, « Résolution des équations, méthode accessible » (difficulté : comprendre ce qu'est une inconnue).

## Points importants
- À retenir : (1) je remplace x par le nombre, entre parenthèses s'il est négatif ; (2) je calcule chaque membre à part, une opération par ligne, les produits d'abord ; (3) même résultat des deux côtés : solution, sinon : pas solution.
- Pièges : 2x lu « 2 collé à 3 » (23) ou « 2 + 3 » ; signe perdu sans parenthèses (5 − x pour x = −3 → 2) ; priorité oubliée (4 + 3x lu (4 + 3) × x) ; conclure en comparant au nombre testé ou en ne calculant qu'un membre.
- Vu dans ce cours : inconnue, équation, membre de gauche / de droite, solution ; « 2x » veut dire 2 × x ; vérifier une solution (servira à chaque cours du module).
- Écarts et choix : membres ax + b ou b + ax (niveau 2 : ax + b = cx + d) ; pas de x² ; nombres testés entiers ; pas de comparaison de deux cas (rien ne se confond vraiment) ; pas de série de pratique ni d'« Autres façons de faire ».
- Dans l'appli : déroulé guidé, 8 écrans avant l'annonce de la fin (exemple guidé compris) ; `essais/equations-tester-solution.ts` ; exemple guidé et 5 exercices de fin en « Calculer par lignes » (`calculer`, indice d'office dans l'exemple guidé : `guided`).

## Fiche
### Structure du cours (déroulé guidé)
1. Deviner : 3 est-il solution de 2x + 1 = 7 ? (ne compte pas).
2. « Pourquoi on teste » : l'équation est une question, la balance (1 petite action).
3. Règle 1 : remplacer x par −2 dans 3x + 4 = x, parenthèses ; petite question : 5 − x pour x = −3.
4. Règle 2 : calculer le membre de gauche ligne par ligne (3 × (−2) + 4 : produit, puis somme) ; petite question : 6 + 2x (la multiplication d'abord).
5. Règle 3 : comparer (x = −2 solution, x = 1 pas solution).
6. Exemple guidé (non noté) : x = 5 dans 7 − 2x = x − 8, aide d'office à chaque ligne, puis « solution ou pas ».
7. Annonce de la fin, puis 5 exercices « Calculer par lignes » (niveau 1), fiche mémo.
### Règles (3) et erreurs reconnues
1. Remplacer x, parenthèses si négatif : `x-colle`, `parentheses-oubliees`.
2. Un membre à part, produits d'abord : `priorite`, `signe` (règle des signes du module Relatifs).
3. Comparer les deux résultats : `verdict` (donner la valeur de l'autre membre ; en « calculer », mauvais oui/non).
### Niveaux
1 : ax + b = c, nombre testé de −5 à 5 · 2 : ax + b = cx + d · 3 : membre à trois termes, nombre testé jusqu'à 9. Moitié des nombres testés sont solutions.
### Hors catalogue
Rien : « Calculer par lignes » existe (module Équations, maquette validée).
