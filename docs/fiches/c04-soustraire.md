# Cours 4 — Soustraire, c'est ajouter l'opposé (version 2, fiche courte)

*Mode autonome (2026-11-25). Référence des textes, des écrans et des messages : la maquette validée `docs/design/ecrans/cours-4-v2.html` (avec les 5 recommandations de son panneau « À décider »). Code : `packages/engine/src/courses/calculs/c04-soustraire.ts` ; textes vérifiés mot pour mot par `test/courses/c04-texts.test.ts`.*

**La règle** (coupée en deux, chacune avec son erreur reconnue) : 1. *Soustraire un nombre, c'est ajouter son opposé : je remplace le − par un +, et je change le signe du nombre qui suit* (`oppose-oublie`) ; 2. *Puis j'additionne : même signe, j'additionne ; signes contraires, je soustrais et je prends le signe du plus grand* (`signe-inverse`).

**Écrans** (7 écrans de leçon, 10 pour apprendre avec la série et les 2 exemples) :
1. Accroche « Soustraire un nombre relatif » + question pour deviner (solde de 5 €, dette de 3 € effacée : 8 € ; ne compte pas).
2. Retrancher une dette : 2 lectures sur la droite (bond de 5 à 8), puis phrase à trous « on va vers la [droite | gauche] ».
3. Comparer 5 − (−3) (A) et 5 + (−3) (B, Cours 2) : « le signe devant la parenthèse » ; une droite, A en 8, B en 2 (ne compte pas).
4. Règle 1 « J'ajoute l'opposé » : deux signes −, l'opposé sur la droite, trous « 5 − (−3) = 5 + [3 | (−3)] » et « 3 − 7 = 3 + [(−7) | 7] », encadré.
5. Règle 2 « Puis j'additionne » : 3 + (−7) [négatif | positif] sur la droite grise, « −4 − 6 = −4 + (−6) = [−10 | 2 | 10] », encadré.
6. Deux petites questions sur un écran (comptées) : réécriture de 6 − (−4) ; résultat de −4 − 6.
7. Autres façons de faire (rappel des 2 règles en tête) : « Petit moins grand : on retourne » (essai 4 − 9) et « Vérifier par l'opération inverse » (essai 2 + (−4)).
8. Série de pratique : droite 2 − (−3) → signe de 3 − 8 → 6 + (−2) + 4 (Cours 3) → taper −3 − (−8).
9. Exemple 1 : −6 − (−10), la ligne = −6 + 10 expliquée (« Je comprends »), puis la case du résultat (comptée).
10. Exemple 2 : 3 − 11, case = 3 + (▢) (non notée), puis case du résultat (comptée). Puis l'annonce des 5 exercices de fin.

**Note du cours :** 13 questions (2 petites + 4 de la série + 2 cases d'exemples + 5 exercices de fin).

**Générateur :** niveau 1 : a − b, nombres de 1 à 9, a et b de signe quelconque (b négatif 1 fois sur 2) ; niveau 2 : de 10 à 99 ; niveau 3 : de 100 à 999, et une fois sur deux deux soustractions à la suite (248 − (−175) − 90 = 248 + 175 + (−90) = 333). Exercices de fin au niveau 1, uniquement des soustractions. Résolution type en 3 lignes : calcul · addition · résultat.

**Choix faits sans document :** l'opposé oublié s'écrit 5 + (−3) dans « Trouver l'erreur » (comme la fiche mémo), et au niveau 3 il est reconnu même si un seul des deux nombres a gardé son signe ; le message `signe-inverse` d'un calcul à deux soustractions dit « regroupe les positifs et les négatifs (Cours 3) » ; la correction juste d'un calcul à trois termes reprend celle du Cours 3 (positifs, négatifs, puis les deux totaux) ; « Comparer deux cas » montre les deux trajets sur une seule droite (de 1 à 8) avec les lignes « A arrive en 8 », « B arrive en 2 » ; formats de révision du Cours 1 (saisie, droite, signe, vrai ou faux, erreur), la droite à toucher sait maintenant dessiner a − b (bond a, puis bond −b).

---

