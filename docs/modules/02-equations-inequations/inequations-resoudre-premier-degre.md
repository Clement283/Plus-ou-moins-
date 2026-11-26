# Cours 8 — Résoudre une inéquation du premier degré
Module : Équations et inéquations (`docs/modules/02-equations-inequations/module.md`) · Précédent : cours 7 « Écrire un ensemble de solutions en intervalle » · Sources : seconde 2026 p. 5 (automatismes : inéquation du premier degré) et p. 8 (ax + b ⩾ cx + d) ; cycle 4 p. 11.

## Points importants
- À retenir : (1) multiplier ou diviser par un nombre négatif retourne le sens (< devient >, ≤ devient ≥), parce que l'ordre des nombres s'inverse (2 < 5 mais −2 > −5) ; (2) je retire d'abord le nombre seul sans changer le sens, puis je divise par le nombre devant x : le sens ne se retourne que s'il est négatif ; (3) j'écris l'intervalle à partir du sens obtenu après la division, pas du sens de départ.
- Pièges : sens non retourné (−2x < 6 → x < −3) ; signe perdu en divisant par un négatif (x < 3) ; sens retourné à tort (division par un positif, ou en retirant un nombre) ; intervalle lu dans le sens de départ.
- Vu dans ce cours : « le sens se retourne » ; vérifier avec un nombre (x = −5 dans −2x < 6) ; la méthode des équations (retirer b, puis diviser) reprise sur ≥ ; l'écriture en intervalle du cours précédent, avec choix du symbole après la division.
- Écarts et choix : ax + b rel c seulement (pas d'x des deux côtés) ; a, b et x entiers, bornes entières ; a négatif trois fois sur quatre pour que le retournement serve presque toujours ; pas de multiplication par un négatif seule (seulement la division) ; pas de solution vide ou toujours vraie.
- Dans l'appli : 8 écrans pour apprendre (3 règles, 1 comparaison, 2 petites questions, exemple guidé −4x + 5 < 9 en `resoudre`) ; exercices de fin : 2 en `resoudre` (résolution complète), 3 en `intervalle` avec choix du symbole ; `essais/inequations-resoudre-premier-degre.ts` ; révision : `saisie` (la borne), `resoudre`, `intervalle`.

## Fiche
### Règles (3) : une phrase chacune, et l'erreur qu'elle évite
1. Diviser (ou multiplier) par un négatif retourne le sens (erreurs : sens non retourné, signe perdu).
2. Retirer ou ajouter ne change jamais le sens ; diviser par un positif non plus (erreur : sens retourné à tort ; soustraire le coefficient au lieu de diviser).
3. L'intervalle s'écrit avec le sens obtenu après la division (erreurs : mauvais côté, mauvais crochet, crochet fermé contre ∞, bornes à l'envers).
### Idée de départ (le pourquoi, avant toute règle)
−2x < 6 : x = −5 n'est pas solution (−2 × (−5) = 10 n'est pas plus petit que 6). x < −3 serait donc faux : la division par −2 doit retourner le sens.
### Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
|---|---|---|---|
| sens-non-change (résoudre) / sens (intervalle) | −2x < 6 → x < −3 | 1 | on a divisé par un négatif : < devient > |
| signe-perdu-division | −2x < 6 → x > 3 | 1 | 6 ÷ (−2) est négatif |
| sens-change-a-tort | 2x < 6 → x > 3 | 2 | le sens ne change qu'avec un négatif |
| soustraire-coef | −2x < 6 → x > 8 | 2 | on divise par le coefficient, on ne le soustrait pas |
| signe-borne, cote, ordre, crochet, crochet-infini | écritures de l'intervalle (cours 7) | 3 | messages du cours 7 |
### Techniques (1 à 3)
- Principale (fiche mémo) : retirer b · diviser par a · si a < 0, retourner le sens · −2x + 1 ≥ 7 ; −2x ≥ 6 ; x ≤ −3.
- Autres (étapes de la leçon) : vérifier avec un nombre ; deux nombres 2 < 5 multipliés par −1 ; lire l'intervalle après la division.
### Reprises et comparaison
- Deux cas qui se confondent : 2x < 6 contre −2x < 6 : seule la division par un négatif retourne le sens.
- Reprises : cours 3 (diviser avec le signe de a), cours 4 (retirer b, puis diviser), cours 7 (écrire l'intervalle).
- Exemple guidé (cas non montré) : −4x + 5 < 9, donc x > −1.
### Niveaux (les nombres ET la longueur du calcul)
1 : a de ±2 à ±5, b de 1 à 9, x de ±1 à ±9 · 2 : a jusqu'à 9, b jusqu'à 20, x jusqu'à 12 · 3 : a jusqu'à 12, b jusqu'à 30, x jusqu'à 15 · les 4 symboles à tous les niveaux.
### Hors catalogue
Rien : `resoudre` gère les inéquations, `intervalle` en variante `flip` fait choisir le symbole. Les scènes de leçon n'ont pas d'intervalle colorié (voir le cours 7).
