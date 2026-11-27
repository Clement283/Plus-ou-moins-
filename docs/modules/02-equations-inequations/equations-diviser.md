# Cours 3 — Diviser des deux côtés (ax = c)
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 2 « Retirer ou ajouter le même nombre des deux côtés » · Sources : cycle 4 p. 10 ; Éduscol, « Résolution des équations, méthode accessible » (défaire une multiplication par une soustraction).

## Points importants
- À retenir : (1) ax veut dire a × x : je divise les deux membres par a ; (2) je garde le signe de a : même signe, x positif, signes contraires, x négatif ; (3) je vérifie en remplaçant x.
- Pièges : soustraire a au lieu de diviser (3x = 12 → 9) ; multiplier (→ 36) ; perdre le signe (−2x = 6 → 3).
- Vu dans ce cours : la ligne « opération » 3x ÷ 3 = 12 ÷ 3 (÷, pas de fraction en étage) ; balance (3 paquets de x) ; diviser par un négatif ; vérifier en remplaçant (reprise du cours 1) ; retirer ou diviser (reprise du cours 2).
- Écarts et choix : a et x de 2 à 9 en valeur absolue (12, 15 aux niveaux 2 et 3), jamais 0 ni ±1 ; « comparer deux cas » seulement pour x + 3 = 12 contre 3x = 12 ; plus de série de pratique ni d'« Autres façons de faire ».
- Dans l'appli : déroulé guidé, 8 écrans avant l'annonce de la fin ; `courses/equations/equations-diviser.ts` (briques dans `lineaire.ts`) ; exemple guidé et 5 exercices en `resoudre` ; révision : `saisie` et `resoudre`.

## Fiche
### Structure du cours (déroulé guidé)
1. Deviner : 3x = 12, combien vaut x ? (ne compte pas).
2. Règle 1 : la balance, 3 paquets de x qui pèsent 12, on partage en 3 ; petite question : 5x = 35.
3. Comparer deux cas (sur place) : 3x = 12 contre x + 3 = 12, diviser ou retirer.
4. Règle 2 : le signe de a (−2x = 6, x = −3) ; petite question : 4x = −20.
5. Règle 3 : vérifier en remplaçant (5 × (−7) = −35).
6. Exemple guidé : −6x = −42 (deux négatifs, x positif), aide d'office, non noté.
7. Annonce de la fin, puis 5 exercices « À toi de résoudre » (niveau 1), fiche mémo.
### Règles (3) et erreurs reconnues
1. 3x veut dire 3 × x : je divise les deux membres par a : `soustraire-coef` (→ 9), `multiplier-coef` (→ 36).
2. Je divise par a avec son signe : `signe-oublie` (−2x = 6 → 3).
3. Je vérifie en remplaçant x (pas d'erreur propre).
### Niveaux
1 : a et x de 2 à 9, a ou c négatif · 2 : de 2 à 12 · 3 : de 2 à 15 · pièges : c − a ≠ x, a ou c négatif.
### Hors catalogue
Rien. Les exercices portent l'équation en `meta` (a, b, c, latex).
