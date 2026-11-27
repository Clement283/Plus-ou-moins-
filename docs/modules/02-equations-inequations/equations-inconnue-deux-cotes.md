# Cours 5 — Résoudre ax + b = cx + d
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 4 « Résoudre ax + b = c » · Sources : cycle 4 p. 10 ; seconde 2026 p. 5 (automatismes : a𝑥 + b = c𝑥 + d) ; Éduscol, « Résolution des équations, méthode accessible ».

## Points importants
- À retenir : (1) je retire le terme en x de droite des deux côtés ; (2) je compte les x qui restent (7x − 3x = 4x, x veut dire 1x) ; (3) je finis comme au cours précédent : le nombre seul, puis la division.
- Pièges : ajouter cx au lieu de le retirer ; oublier le x de droite (diviser par a) ; ajouter b au lieu de le retirer ; signe du résultat.
- Vu dans ce cours : « tous les x du même côté » ; on retire le terme en x de droite (jamais de x négatif à gauche) ; coefficient 1 écrit x ; ligne « opération » 4x + 3 − x = x + 18 − x ; revenir à ax + b = c.
- Écarts et choix : a > c + 1 toujours (coefficient restant ≥ 2, x à gauche) ; niveau 1 : x positif, b de signe quelconque, d positif ; x négatif aux niveaux 2 et 3 et dans l'exemple guidé ; pas de x à droite plus grand qu'à gauche, pas de parenthèses.
- Dans l'appli : 8 écrans pour apprendre (3 règles, 1 comparaison, 2 petites questions, exemple guidé), 5 exercices de fin `resoudre` ; `essais/equations-inconnue-deux-cotes.ts` ; écran « À toi de résoudre » partout (indice « avec aide »).

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Je retire le terme en x de droite des deux côtés : il disparaît à droite (erreur : l'ajouter au lieu de le retirer).
2. Je compte les x qui restent à gauche : je soustrais les coefficients, et x veut dire 1x (erreur : oublier les x de droite et diviser par a).
3. Je finis comme avant : je retire le nombre seul, puis je divise (erreur : ajouter le nombre au lieu de le retirer, perdre le signe).
### Idée de départ (le pourquoi, avant toute règle)
Il y a des x des deux côtés : on ne peut pas encore isoler x. On regroupe les x d'un seul côté pour retomber sur ax + b = c, déjà connu.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| ajouter-x | 3x + 2 = x + 8 → x = 6 ÷ 4 (on ajoute x) | 1 | on retire x des deux côtés, on ne l'ajoute pas |
| x-oublie | 7x + 2 = 3x + 14 → 12 ÷ 7 (x de droite oublié) | 2 | on soustrait les x : 7x − 3x = 4x, on divise par 4 |
| nombre-mal-deplace | 5x − 4 = 2x + 8 → (8 − 4) ÷ 3 | 3 | l'opération contraire de − 4 est + 4 |
| signe-resultat | x = 12 ÷ 3 donné −4 | 3 | signe du résultat |
### Techniques (1 à 3)
- Principale (fiche mémo) : regrouper puis finir · quand x est des deux côtés · 4x + 5 = x + 14 ; 3x + 5 = 14 ; 3x = 9 ; x = 3.
- Autres (étapes de la leçon) : x veut dire 1x (6x − x = 5x) ; on retire d'abord le terme en x, ensuite le nombre seul.
### Reprises et comparaison
- Deux cas qui se confondent : 2x + 3 = 11 (cours précédent) contre 2x + 3 = x + 11 : le premier geste change (retirer 3, ou retirer x).
- Exemple guidé (cas non montré par la leçon) : 4x + 9 = x − 3, résultat négatif (x = −4).
### Niveaux (les nombres ET la longueur du calcul)
1 : a de 3 à 6, c de 1 à a − 2, x de 1 à 6, b de ±1 à ±9 (d positif) · 2 : a de 4 à 9, x et b négatifs possibles · 3 : a jusqu'à 12, b jusqu'à 30, x jusqu'à 15 · calculs-pièges : division qui tombe juste.
### Hors catalogue
Rien.
