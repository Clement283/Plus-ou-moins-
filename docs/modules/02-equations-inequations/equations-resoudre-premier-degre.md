# Cours 4 — Résoudre ax + b = c
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 3 « Diviser des deux côtés » · Sources : cycle 4 p. 10 ; Éduscol, « Résolution des équations, méthode accessible » (d'abord le nombre seul, puis le coefficient).

## Points importants
- À retenir : (1) j'enlève b des deux côtés (b négatif : j'ajoute son opposé) : ax + b = c devient ax = c − b ; (2) je divise les deux membres par a, avec son signe ; (3) une opération par ligne, puis je vérifie en remplaçant x.
- Pièges : diviser un seul terme avant d'enlever b (2x + 4 = 10 → 1) ; ajouter b à droite au lieu de le retirer (2x + 3 = 7 → 5) ; s'arrêter à ax = c − b (→ 4) ; perdre le signe en divisant.
- Vu dans ce cours : l'ordre « d'abord le nombre seul, ensuite le coefficient » ; les deux lignes « opération » (2x + 3 − 3 = 7 − 3, puis 2x ÷ 2 = 4 ÷ 2) ; enlever un b négatif = ajouter son opposé ; « À toi de résoudre » (1 question de la série, 2 exercices de fin sur 5) ; essayer des valeurs ; vérifier.
- Écarts et choix : ax + b = c seulement (pas d'inconnue des deux côtés : cours suivant) ; a de 2 à 5 au niveau 1 (9, 12 ensuite), jamais c = 0 ; exercices de fin : saisie, résolution, saisie, résolution, saisie ; le cours 2 n'a pas été lu (seulement sa ligne du tableau).
- Dans l'appli : 14 écrans, 3 règles, `courses/equations/equations-resoudre-premier-degre.ts` ; inscrit dans « Essais » ; `endExercises.mix` ; révision/entraînement : `saisie` et `resoudre`.

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Je commence par enlever b des deux côtés (b négatif : j'ajoute son opposé) : ax + b = c devient ax = c − b (évite de diviser d'abord, ou de garder le signe de b à droite).
2. Ensuite je divise les deux membres par a, avec son signe : x = (c − b) ÷ a (évite de s'arrêter à ax = …, ou de perdre le signe).
3. Une opération par ligne, puis je vérifie en remplaçant x (évite de mélanger deux calculs dans une ligne).
### Idée de départ (le pourquoi, avant toute règle)
La balance de 2x + 3 = 7 : 2 paquets de x et 3 jetons pèsent 7. Pour isoler les paquets, on retire d'abord les jetons des deux plateaux, ensuite on partage les paquets.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| `oublier-diviser` | 2x + 3 = 7 → x = 4 (on s'arrête à 2x = 4) | 2 | il reste à diviser par 2 |
| `signe-b-garde` | 2x + 3 = 7 → x = 5 (7 + 3 puis ÷ 2) | 1 | enlever 3 des deux côtés : à droite, 7 − 3 |
| `diviser-avant` | 2x + 4 = 10 → x = 1 (10 ÷ 2 − 4) | 1 | on enlève b d'abord, puis on divise tout le membre |
| `signe-oublie` | −2x + 3 = 9 → x = 3 | 2 | signes contraires : x négatif (règle du cours précédent) |
### Techniques (3)
- Principale (fiche mémo) : **Enlever b, puis diviser par a** · ax + b = c · 3x − 4 = 11 : 3x − 4 + 4 = 11 + 4, 3x = 15, 3x ÷ 3 = 15 ÷ 3, x = 5.
- Étape de la leçon : **Une ligne par opération** (ligne « opération », puis ligne réduite, comme au cahier).
- « Autres façons de faire » : **Essayer des valeurs** (tester 1, 2, 3… comme dans le cours « Tester si un nombre est solution ») ; **Vérifier sa réponse** (remplacer x).
### Reprises
- Cas B à comparer (cours précédent) : 2x = 6 (une opération, on divise) à côté de 2x + 3 = 9 (deux opérations, dans l'ordre).
- Question de la série tirée du cours précédent : « Quelle est la valeur de x ? » pour 6x = −42 (diviser avec le signe).
### Niveaux (les nombres ET la longueur du calcul)
1 : a de 2 à 5, b de 1 à 9, x de 1 à 9 · 2 : a jusqu'à 9, b jusqu'à 20, x jusqu'à 12 · 3 : a jusqu'à 12, b jusqu'à 30, x jusqu'à 15 · signes : a négatif 1 fois sur 4, b et x un fois sur 2 · calculs-pièges : (c + b) et c divisibles par a selon l'erreur. Jamais c = 0.
### Hors catalogue
Rien de nouveau. Résolution complète (`resoudre`) : 2 exercices de fin sur 5, 1 question de la série de pratique, et en révision et entraînement.
