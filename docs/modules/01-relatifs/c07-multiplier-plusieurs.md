# Cours 7 — Multiplier plusieurs relatifs
Module : Relatifs · Cours liés : cours 5 (multiplier deux relatifs), cours 6 (diviser : même règle des signes) · Plan : docs/modules/01-relatifs/module.md · Sources : programme de 3e/2de (calcul numérique), plan du module

## Points importants
- À retenir : (1) je multiplie deux par deux, de gauche à droite ; (2) je compte les signes − : pair, positif ; impair, négatif ; (3) j'écris le signe, puis je multiplie tous les nombres sans leur signe.
- Pièges : addition au lieu de multiplication (−3 pour −2 × 3 × (−4)) ; mauvais comptage des signes (−24 au lieu de 24) ; facteur oublié (−6 ou 8).
- Vu dans ce cours : produit de plus de deux facteurs, « Je compte les − », « deux par deux », réordonner les facteurs, chercher le 0. Sert plus tard pour (−1)ⁿ et le carré.
- Écarts et choix : niveaux de 3 à 4 facteurs pour tenir dans la largeur du téléphone ; question de la série tirée du cours 6.
- Dans l'appli : `c07-multiplier-plusieurs.ts` (une 2e version à l'essai, `c07b`, est dans le module « Essais », visible des comptes aperçu seulement).

## Fiche
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
