# Cours 7 — Multiplier plusieurs relatifs
Module : Relatifs · Cours liés : cours 5 (multiplier deux relatifs), cours 6 (diviser : même règle des signes) · Plan : docs/validation/10-module-calculs.md (§A, cours 7) · Sources : programme de 3e/2de (calcul numérique), plan du module

## Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Je multiplie les nombres deux par deux, de gauche à droite (évite : additionner ou mélanger les opérations).
2. Je compte les signes − : nombre pair, résultat positif ; impair, négatif (évite : se tromper de signe en route).
3. J'écris le signe d'abord, puis je multiplie tous les nombres sans leur signe (évite : oublier un facteur).

## Idée de départ (le pourquoi)
Multiplier plusieurs nombres, c'est répéter la multiplication de deux nombres (cours 5) : chaque facteur négatif change le signe une fois.

## Erreurs attendues → règle
| id | réponse fausse typique | règle | message (idée) |
|---|---|---|---|
| addition-au-lieu-multiplication | −2 × 3 × (−4) → 5 ou −3 | 1 | on multiplie, on n'additionne pas |
| parite-signes | −24 au lieu de 24 (deux −) ; 24 au lieu de −24 (un ou trois −) | 2 | compter les − : pair +, impair − (deux messages) |
| facteur-oublie | produit de seulement deux des trois nombres | 3 | un facteur a été oublié |

## Techniques (4)
- Principale (fiche mémo) : **Je compte les −** · produit de plus de deux facteurs · (−2) × 3 × (−4) : deux −, donc positif ; 2 × 3 × 4 = 24.
- Étape de la leçon : **Deux par deux** · avancer pas à pas · (−2) × (−4) = 8 puis 8 × 3 = 24.
- « Autres façons de faire » : **Réordonner les facteurs** · deux facteurs font un nombre rond · 25 × (−7) × 4 = (25 × 4) × (−7) = −700 ; **Chercher le 0** · avant de calculer, un facteur nul rend tout nul.

## Reprises
- Cas B à comparer : une division du cours 6, ex. −24 ÷ (−4), à côté d'un produit de trois facteurs (les deux se confondent sur le signe).
- Question de la série tirée d'un cours précédent : une division du cours 6.

## Niveaux (les nombres ET la longueur du calcul)
Le niveau allonge le calcul autant qu'il agrandit les nombres (décision du porteur du projet, comme au cours 3). Signes mélangés, au moins un négatif, jamais de 0 dans les exercices. Le calcul doit rester calculable de tête et tenir dans la largeur d'un téléphone.

## Hors catalogue
Rien.

## Points importants
- À retenir : (1) je multiplie deux par deux, de gauche à droite ; (2) je compte les signes moins : pair, positif, impair, négatif ; (3) j'écris le signe, puis je multiplie tous les nombres sans leur signe.
- Pièges : addition au lieu de multiplication (−3 pour −2 × 3 × (−4)) ; signe faux par mauvais comptage (−24 au lieu de 24) ; facteur oublié (−6 ou 8).
- Écarts et choix : technique principale de la mémo = « Je compte les −», « deux par deux » sert d'étape ; niveaux 3 facteurs (1), 3 ou 4 (2), 4 facteurs jusqu'à 9 (3) pour tenir dans la largeur du téléphone, à valider ; question de la série tirée d'une division (id 'c06-diviser-deux' supposé).
- Dans l'appli : 15 écrans pour apprendre, 14 questions notées (3 petites, 4 de série, 2 d'exemples, 5 de fin) ; fichier c07b-multiplier-plusieurs.ts (essai de comparaison).
