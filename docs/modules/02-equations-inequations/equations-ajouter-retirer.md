# Cours 2 — Retirer ou ajouter le même nombre des deux côtés
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 1 « Tester si un nombre est solution » · Sources : cycle 4 p. 10 ; seconde 2026 p. 8 (a + x = b) ; Éduscol, « Résolution des équations, méthode accessible » (balance, transposition à éviter).

## Points importants
- À retenir : (1) ce que je fais d'un membre, je le fais de l'autre ; (2) je fais l'opération contraire du nombre collé à x (x + 3 : je retire 3 ; x − 3 : j'ajoute 3) ; (3) je calcule l'autre membre avec les relatifs, puis j'écris x = …
- Pièges : changer un seul membre (x = 7 pour x + 3 = 7 − 3…) ; mauvais sens (10 au lieu de 4) ; signe du résultat quand le membre de droite est plus petit (4 − 9).
- Vu dans ce cours : balance, « des deux côtés », opération contraire, ligne « opération » (x + 3 − 3 = 7 − 3), x tout seul, vérifier en remplaçant.
- Écarts et choix : x + b = c seulement, b de signe quelconque (x − 3 = 5 = « ajouter ») ; x et c entiers, négatifs à partir du niveau 2 ; équations en noir.
- Dans l'appli : 15 écrans pour apprendre, 3 règles ; série de pratique avec « À toi de résoudre » en 4e question ; `essais/equations-ajouter-retirer.ts` (module Essais) ; l'exercice garde c − b dans `expr` et l'équation dans `meta` (b, c).

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Ce que je fais d'un côté du signe =, je le fais de l'autre côté (évite de changer un seul membre).
2. Je fais l'opération contraire de celle qui est collée à x : x + 3, je retire 3 ; x − 3, j'ajoute 3 (évite le mauvais sens).
3. Je calcule l'autre membre (règle des signes du module Relatifs), puis j'écris x = … (évite l'erreur de signe).
### Idée de départ (le pourquoi, avant toute règle)
Une équation est une balance en équilibre. Si on enlève 3 d'un plateau seulement, elle penche : on enlève 3 de l'autre aussi.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| `un-seul-cote` | x + 3 = 7 → 7 (3 retiré à gauche seulement) | 1 | le même nombre aussi à droite |
| `mauvais-sens` | x + 3 = 7 → 10 ; x − 3 = 5 → 2 | 2 | x + 3 : on retire ; x − 3 : on ajoute |
| `signe-calcul` | x + 9 = 4 → 5 au lieu de −5 | 3 | 4 − 9 passe de l'autre côté de 0 |
### Techniques (3)
- Principale (fiche mémo) : **La ligne « opération »** · toute équation x + b = c · x + 3 = 7 ; x + 3 − 3 = 7 − 3 ; x = 4.
- Étape de la leçon : **L'opération contraire** · x − 3 = 5 : on ajoute 3 des deux côtés, x = 8.
- « Autres façons de faire » : **Quel nombre ?** (de tête, petits nombres) ; **Vérifier en remplaçant** (cours précédent).
### Reprises
- Cas B à comparer : 4 + 3 (remplacer x par 4, cours « Tester si un nombre est solution ») à côté de 7 − 3 (retirer 3 pour trouver x).
- Question de la série tirée du cours précédent : 4 est-il solution de x + 5 = 9 ?
### Niveaux (les nombres ET la longueur du calcul)
1 : b de 2 à 9, x de 1 à 9, c positif · 2 : b de 10 à 30, x et c de −30 à 30 · 3 : b de 10 à 99, x de −99 à 99. Calculs-pièges : c plus petit que b (signe), b négatif (sens).
### Hors catalogue
Rien. `resoudre` (« À toi de résoudre ») en 4e question de la série : la ligne « opération » écrite par l'élève est la décision des cours 2 à 4. Ailleurs : `trou` sur la ligne opération, `saisie` de x.
