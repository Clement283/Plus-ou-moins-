# Cours 6 — Diviser deux relatifs (version 2, fiche courte)

*Mode autonome (2026-11-25), sans maquette, une phrase à la fois (`unePhrase: true`). Code : `packages/engine/src/courses/calculs/c06-diviser-deux.ts` ; textes vérifiés par instantané Vitest (`test/courses/__snapshots__/c06.test.ts.snap`), largeur du téléphone par `apps/web/test/c04.test.tsx`.*

**La règle** (trois règles, chacune avec ses erreurs reconnues) : 1. *Diviser, c'est chercher le nombre qui, multiplié par le diviseur, redonne le premier nombre* (`multiplication-au-lieu-division`) ; 2. *Même signe : positif. Signes contraires : négatif* (`regle-signes`, quatre messages : deux négatifs, deux positifs, signe du premier nombre gardé, signe oublié) ; 3. *Je vérifie en multipliant le résultat par le diviseur* (`erreur-table`, quotient décalé de 1).

**Écrans** (7 écrans de leçon, 12 pour apprendre avant l'annonce de la fin) :
1. Accroche « Diviser deux nombres relatifs » + deviner −24 ÷ (−6) (4 / −4 / −30 ; ne compte pas).
2. Diviser, c'est chercher un facteur : 12 ÷ 4 = 3 car 3 × 4 = 12 ; −12 ÷ 4 → nombre qui, multiplié par 4, donne −12 [négatif | positif] ; encadré.
3. Le signe du quotient (technique 1) : −18 ÷ 3 [négatif | positif], −20 ÷ (−4) [positif | négatif], tableau des signes + encadré.
4. Vérifier par la multiplication (technique 2) : 5 × (−7) = [−35 | 35 | −2] pour −35 ÷ (−7) ; −12 ÷ 4 = 3 est [faux | juste] ; encadré.
5. Deux petites questions sur un écran (comptées) : signe de −42 ÷ (−7) ; résultat de 36 ÷ (−4).
6. Comparer −12 ÷ 4 (A) et −3 × 4 (B, Cours 5) : A −3, B −12 : la multiplication défait la division (ne compte pas).
7. Autres façons de faire (rappel des 3 règles en tête) : barrer des zéros (essai −4200 ÷ 600) ; diviser en deux fois (essai −48 ÷ 6).
8. Série de pratique : case de −63 ÷ (−9) au signe déjà écrit → signe de 48 ÷ (−6) → −9 × 3 (Cours 5, multiplication) → taper −72 ÷ (−8).
9. Exemple 1 : −45 ÷ (−9), ligne = +(45 ÷ 9) (« Je comprends »), puis la case (comptée). Exemple 2 : 54 ÷ (−6), le signe (non noté) puis la case (comptée). Puis l'annonce des 5 exercices de fin.

**Note du cours :** 13 questions (2 petites + 4 de la série + 2 cases d'exemples + 5 exercices de fin).

**Générateur** (la division tombe juste : on tire le quotient et le diviseur, puis a = quotient × diviseur ; diviseur jamais nul, quotient jamais nul ; au moins un négatif 3 fois sur 4) : niveau 1, quotient 2 à 9 par diviseur 2 à 9 ; niveau 2, quotient 10 à 30 par diviseur 2 à 9 ; niveau 3, quotient 10 à 99 par diviseur 10 à 40. Exercices de fin au niveau 1. Résolution type : −12 ÷ 4 · = −(12 ÷ 4) · = −3.

**Choix faits sans document :** le quotient de niveau 1 commence à 2 (pas de x ÷ x, qui ne fait rien travailler) ; pas de 0 ÷ n ni de diviseur 0 (jamais générés, donc pas de message) ; pas de format de révision propre (les formats communs suffisent, comme avant) ; l'idée de départ est la réciproque de la multiplication, sans droite graduée ; la vérification par la multiplication est une règle à part entière (étape de la leçon, avec deux actions) et non une simple astuce ; l'erreur « diviser à l'envers » (b ÷ a) n'est pas reconnue car elle ne donne pas un entier ; `erreur-table` = quotient faux de 1 avec le bon signe, avec renvoi à la vérification par la multiplication ; la question du Cours 5 de la série est −9 × 3, avec le piège « −3 » (tu as divisé).

---

