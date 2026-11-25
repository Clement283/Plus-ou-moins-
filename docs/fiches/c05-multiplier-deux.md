# Cours 5 — Multiplier deux nombres relatifs (version 2, fiche courte)

*Mode autonome (2026-11-25), sans maquette. Code : `packages/engine/src/courses/calculs/c05-multiplier-deux.ts` ; textes vérifiés mot pour mot par `test/courses/c05-texts.test.ts`, largeur du téléphone par `apps/web/test/c04.test.tsx` et `c05.test.tsx`.*

**La règle** (coupée en deux, chacune avec ses erreurs reconnues) : 1. *Même signe : le produit est positif. Signes contraires : le produit est négatif* (`regle-signes`) ; 2. *Je multiplie les nombres sans leur signe, puis je mets le signe du produit* (`addition-au-lieu-multiplication`, `erreur-table`).

**Écrans** (7 écrans de leçon, 12 pour apprendre avant l'annonce de la fin) :
1. Accroche « Multiplier deux nombres relatifs » + deviner −3 × (−4) (12 / −12 / −7 ; ne compte pas).
2. Multiplier, c'est répéter : 3 × 2 = 2 + 2 + 2, 3 × (−2) = trois dettes de 2 € [−6 | 6 | 1] ; la suite 3 × (−2), 2 × (−2), 1 × (−2) monte de 2, donc −1 × (−2) = [2 | −2 | 0].
3. Règle 1 « Le signe du produit » : −4 × (−5) [positif | négatif], 6 × (−7) = −42, 7 × (−2) « le plus grand ne compte pas » [négatif | positif], tableau des signes + encadré.
4. Règle 2 « Les nombres d'abord, le signe ensuite » (technique 2) : −8 × 5, 8 × 5 = [40 | 13 | 45], puis [−40 | 40], encadré.
5. Deux petites questions sur un écran (comptées) : signe de −6 × (−3) ; résultat de 4 × (−9).
6. Comparer −3 × (−4) (A) et −3 − 4 (B, Cours 4) : « A positif, B négatif » ; la règle des signes de l'addition n'est pas celle de la multiplication (ne compte pas).
7. Autres façons de faire (rappel des 2 règles en tête) : calcul mental d'un produit (essai −6 × 13) ; multiplier par −1 (essai −1 × (−8)).
8. Série de pratique : case de −7 × (−3) avec le signe déjà écrit → signe de 8 × (−6) → −4 − 3 (Cours 4) → taper −6 × (−7).
9. Exemple 1 : −5 × (−8), la ligne = +(5 × 8) (« Je comprends »), puis la case du résultat (comptée).
10. Exemple 2 : 9 × (−6), le signe (non noté) puis la case du résultat (comptée). Puis l'annonce des 5 exercices de fin.

**Note du cours :** 13 questions (2 petites + 4 de la série + 2 cases d'exemples + 5 exercices de fin).

**Générateur** (a × b, au moins un négatif 3 fois sur 4 ; pour deux facteurs le calcul ne s'allonge pas, c'est le Cours 7) : niveau 1, facteurs de 1 à 9 ; niveau 2, un facteur de 11 à 20 par 2 à 9, ou les tables de 11 et 12 (11 à 12 par 2 à 12) ; niveau 3, deux facteurs à deux chiffres (10 à 99 par 10 à 19). Exercices de fin au niveau 1. Résolution type : −3 × (−4) · = +(3 × 4) · = 12. Révisions : saisie, signe, vrai ou faux, trouver l'erreur.

**Choix faits sans document :** `regle-signes` garde un seul identifiant (stats et pièges inchangés) mais son message dépend du calcul : deux négatifs (« pas comme l'addition »), signes contraires avec le positif plus grand (« le signe du plus grand, c'est la règle de l'addition »), signes contraires sinon (« il manque le signe »), deux positifs ; l'idée de départ utilise les dettes puis la suite qui monte de 2 (pas de droite graduée) ; le niveau 3 limite un facteur à 10–19 pour rester calculable de tête (technique 3) ; la droite n'est pas un format de révision (pas de bonds pour un produit) ; les anciens écrans « Classer » et « Étiquettes » de la leçon sont remplacés par la série.

---

