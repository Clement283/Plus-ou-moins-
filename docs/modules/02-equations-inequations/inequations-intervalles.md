# Cours 7 — Écrire un ensemble de solutions en intervalle
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 6 « Équation produit nul » · Sources : seconde 2026 p. 7 (intervalles, notation [a, +∞[ avec virgule) ; seconde 2026 p. 8 (ensemble des solutions d'une inéquation).

## Points importants
- À retenir : (1) un intervalle s'écrit avec deux bornes, la plus petite à gauche : −∞ si les valeurs vont vers la gauche (x < 3 donne ]−∞ , 3[), +∞ si elles vont vers la droite ; (2) crochet fermé (tourné vers la borne) si la borne est comprise (≤ ou ≥), ouvert si elle est exclue (< ou >) ; (3) contre ∞, le crochet est toujours ouvert, car ∞ n'est pas un nombre.
- Pièges : crochet fermé contre ∞ ([−∞ , 3]) ; mauvais côté (x < 3 écrit ]3 , +∞[) ; bornes à l'envers ; bonne borne, mauvais crochet (x < 3 écrit ]−∞ , 3]) ; signe de la borne perdu (x > −2 écrit ]2 , +∞[).
- Vu dans ce cours : intervalle, bornes, crochet ouvert / fermé, ±∞ (jamais atteint), virgule entre les bornes (`SEP` de l'appli) ; lecture d'un intervalle en inégalité (petite question) ; la borne est exclue ou comprise (comparaison x < 3 contre x ≤ 3).
- Écarts et choix : bornes entières (niveau 1 : 1 à 9, négatives une fois sur trois ; niveau 2 : 10 à 30 ; niveau 3 : 10 à 99, les deux signes) ; l'élève ne résout rien ici (inéquations au cours suivant) ; les scènes de leçon colorient l'intervalle sur la droite (`Scene.interval`, rond plein pour une borne comprise) ; l'écran de comparaison (`compare`) n'a pas d'intervalle : il reste en lignes d'écriture.
- Dans l'appli : 8 écrans pour apprendre (3 règles, 1 comparaison, 2 petites questions, exemple guidé x > −2), 5 exercices de fin en question `intervalle` ; `essais/inequations-intervalles.ts` ; révision : `saisie` (la borne) et `intervalle`.

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Les deux bornes sont rangées de la plus petite à la plus grande ; −∞ à gauche si les valeurs vont vers la gauche, +∞ à droite sinon (erreurs : mauvais côté, bornes à l'envers, signe de la borne).
2. Borne comprise (≤ ou ≥) : crochet fermé, tourné vers la borne ; borne exclue (< ou >) : crochet ouvert, tourné à l'opposé (erreur : mauvais crochet).
3. Contre ∞, le crochet est toujours ouvert (erreur : [−∞ , 3]).
### Idée de départ (le pourquoi, avant toute règle)
x < 3 a une infinité de solutions (2, 1, 0, −1, 1,5…) : on ne peut pas les écrire toutes. L'intervalle les résume par ses deux bouts.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| cote | x < 3 écrit ]3 , +∞[ | 1 | regarde le sens de l'inégalité : plus petit, donc vers la gauche |
| ordre | ]3 , −∞[ | 1 | la plus petite borne à gauche |
| signe-borne | x > −2 écrit ]2 , +∞[ | 1 | même nombre, mais pas le même signe |
| crochet | x < 3 écrit ]−∞ , 3] | 2 | 3 est exclu : le crochet s'en éloigne |
| crochet-infini | x ≥ 3 écrit [3 , +∞] | 3 | on n'atteint jamais l'infini : crochet ouvert |
### Techniques (1 à 3)
- Principale (fiche mémo) : x < 3 · plus petit à gauche · crochet selon < ≤ · ∞ toujours ouvert · x < 3 ; ]−∞ , 3[.
- Autres (étapes de la leçon) : se demander « 3 est-il une solution ? » pour choisir le crochet ; lire les valeurs sur la droite (vers la gauche ou vers la droite).
### Reprises et comparaison
- Deux cas qui se confondent : x < 3 contre x ≤ 3 : seul le crochet change (3 exclu ou compris).
- Exemple guidé (cas non montré) : x > −2, borne négative et +∞ : ]−2 , +∞[.
### Niveaux (les nombres ET la longueur du calcul)
1 : bornes de 1 à 9, négatives une fois sur trois · 2 : de 10 à 30, les deux signes · 3 : de 10 à 99, les deux signes · les quatre symboles à tous les niveaux.
### Hors catalogue
Rien : l'intervalle colorié existe dans les scènes de leçon (`Scene.interval`). Seul l'écran « comparer deux cas » ne sait pas le dessiner.
