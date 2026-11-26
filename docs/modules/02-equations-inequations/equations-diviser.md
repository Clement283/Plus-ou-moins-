# Cours 3 — Diviser des deux côtés (ax = c)
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 2 « Ajouter ou retirer le même nombre » (lu seulement dans le tableau du module.md) · Sources : cycle 4 p. 10 ; Éduscol, « Résolution des équations, méthode accessible » (défaire une multiplication par une soustraction).

## Points importants
- À retenir : (1) ax veut dire a × x : je divise les deux membres par a ; (2) je garde le signe de a : même signe, x positif, signes contraires, x négatif ; (3) je vérifie en remplaçant x.
- Pièges : soustraire a au lieu de diviser (3x = 12 → 9) ; multiplier (→ 36) ; perdre le signe (−2x = 6 → 3).
- Vu dans ce cours : la ligne « opération » 3x ÷ 3 = 12 ÷ 3 écrite sous forme ÷ (pas de fraction en étage) ; balance (3 paquets de x) ; diviser par un négatif (règle des signes de la division, module Relatifs) ; vérifier en remplaçant ; « a fois combien ? ».
- Écarts et choix : coefficient a et solution x de 2 à 9 (12, 15 aux niveaux 2 et 3), jamais 0 ni ±1 ; le cours 2 n'a pas été lu (seulement sa ligne du tableau) : la reprise (x + 3 = 12, retirer 3) est à relire ; exercices de fin = « x = ▢ » seulement (résolution complète dès le cours suivant).
- Dans l'appli : 14 écrans, 3 règles, `courses/equations/equations-diviser.ts` (briques dans `lineaire.ts`) ; inscrit dans « Essais » ; révision/entraînement : `saisie` et `resoudre`.

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. 3x veut dire 3 × x : pour défaire « fois a », je divise les deux membres par a (évite de soustraire a).
2. Je divise par a avec son signe : même signe, x positif ; signes contraires, x négatif (évite de perdre le signe).
3. Je vérifie en remplaçant x par ma réponse (évite de rendre une réponse fausse).
### Idée de départ (le pourquoi, avant toute règle)
La balance : 3x, ce sont 3 paquets de x. Si 3 paquets pèsent 12, un paquet pèse 12 ÷ 3. On coupe les deux plateaux en 3.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| `soustraire-coef` | 3x = 12 → x = 9 (12 − 3) | 1 | 3x est une multiplication : on la défait en divisant |
| `multiplier-coef` | 3x = 12 → x = 36 (12 × 3) | 1 | on défait une multiplication par l'opération inverse, la division |
| `signe-oublie` | −2x = 6 → x = 3 ; 3x = −12 → x = 4 | 2 | signes contraires : le résultat est négatif (règle des signes de Relatifs) |
### Techniques (3)
- Principale (fiche mémo) : **Diviser les deux membres par a** · ax = c · −4x = 20 : −4x ÷ (−4) = 20 ÷ (−4), puis x = −5.
- Étape de la leçon : **Écrire la ligne « opération »** · avant de calculer, on écrit ÷ a sous chaque membre.
- « Autres façons de faire » : **Se demander « a fois combien ? »** (3 × ? = 12, calcul mental) ; **Vérifier sa réponse** (remplacer x, cours 1).
### Reprises
- Cas B à comparer (cours 2) : x + 3 = 12 (on retire 3, x = 9) à côté de 3x = 12 (on divise par 3, x = 4).
- Question de la série tirée du cours 2 : « Quelle opération faire des deux côtés pour x + 4 = 11 ? » (retirer 4).
### Niveaux (les nombres ET la longueur du calcul)
1 : a et x de 2 à 9 en valeur absolue, a ou c négatif 3 fois sur 4 · 2 : de 2 à 12 · 3 : de 2 à 15 · calculs-pièges : c − a différent de x (soustraire), a ou c négatif (signe). Pas de x = 0 ni de coefficient 1 ; la longueur ne change pas (une seule opération).
### Hors catalogue
Pas de nouvel écran. Question `resoudre` pour la révision et l'entraînement (pas dans les exercices de fin : à partir du cours 4). Les exercices du cours portent l'équation en `meta.latex` (affichée par l'écran « case à remplir »).
