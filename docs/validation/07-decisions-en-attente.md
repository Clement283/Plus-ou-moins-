# 07 — Décisions en attente (version détaillée)

*Statut : Validé (2026-11-23) — décisions 1 à 21 prises par le porteur du projet*

## Décisions du porteur du projet

| # | Choix | # | Choix | # | Choix |
|---|---|---|---|---|---|
| 1 | A | 8 | A | 15 | **B** (mélange des niveaux 1, 2, 3) |
| 2 | A | 9 | A | 16 | A |
| 3 | A | 10 | A | 17 | A |
| 4 | **B** (Valider possible, « écriture invalide ») | 11 | A | 18 | **B** (28 jours) |
| 5 | A | 12 | A | 19 | B |
| 6 | A | 13 | A, précisé ci-dessous | 20 | A |
| 7 | A | 14 | A | 21 | A |

**Précision sur le n° 13 :** la règle vaut pour **chaque calcul séparément**. Si elle rate plusieurs calculs plusieurs fois, chacun de ces calculs, raté 2 fois, peut être passé : le bouton « Passer » n'est pas limité à un seul calcul par activité.

Ces décisions complètent les documents 01 à 06 ; en cas de différence, ce document fait foi (notamment pour le n° 4, qui modifie la règle « Valider grisé » du document 03).


Pendant la construction, on a rencontré des situations que les documents 01 à 06 ne prévoyaient pas. Pour chacune, ce document décrit :
- **la situation**, avec un exemple concret ;
- **les options**, avec ce qu'elle verrait ;
- **ma recommandation** (★), et pourquoi.

Pour répondre, tu peux écrire par exemple « 1A, 2A, 3B… », ou simplement « OK pour toutes tes recommandations ».

---

## Partie A — Quand elle tape une réponse mal écrite

*Rappel du document 03 :* rien n'est corrigé automatiquement. Une réponse mal écrite est comptée comme une **erreur d'écriture**, avec une explication.

### 1. Elle tape « 3−4 »

**Situation.** Le calcul est −2 + 5 + (−4). Elle commence à calculer de tête, tape « 3−4 », puis valide par réflexe, sans finir.

- **A ★ — « Écriture invalide »**, avec le message : *« Ta réponse doit être un seul nombre. »*
- **B — « Moins après le nombre »**, avec le message : *« Le signe moins s'écrit avant le nombre : −3. »*

**Pourquoi A :** le message B ne correspond pas à ce qu'elle a fait. Elle n'a pas mal placé un signe, elle a laissé un calcul non terminé. *(Aujourd'hui, B est codé : je corrigerai si tu choisis A.)*

### 2. Elle tape « ((−3)) », ou met des parenthèses dans une fraction

**Situation.** La réponse est −3, et elle tape « ((−3)) » : c'est la bonne valeur, avec des parenthèses en double.

- **A ★ — Comptée fausse : « écriture invalide »**, avec le message *« Cette réponse n'est pas un nombre bien écrit. »* Seule la forme simple « (−3) » reste acceptée.
- **B — Comptée juste.**

**Pourquoi A :** sur une copie, personne n'écrit « ((−3)) ». On veut qu'elle prenne l'habitude d'une écriture propre.

### 3. Elle tape « −07 » ou « −00 »

**Situation.** La réponse est −7, et elle tape « −07 » : le zéro est inutile, mais ce n'est pas faux.

- **A ★ — Comptée juste**, avec un petit message : *« Juste ! On écrit simplement −7. »*
- **B — Comptée fausse.**

**Pourquoi A :** c'est la même règle que « 07 » et « −0 », déjà validée dans le document 03 : le zéro inutile n'est pas une erreur de maths.

### 4. Elle pose une fraction sans rien écrire dedans

**Situation.** Elle touche la touche fraction, la fraction vide apparaît, puis elle veut valider.

- **A ★ — Le bouton Valider reste grisé.**
- **B — Elle peut valider, et c'est compté « écriture invalide ».**

**Pourquoi A :** le document 03 dit « Valider est actif dès qu'il y a au moins un caractère ». Une fraction vide ne contient aucun caractère. Ce n'est pas une aide, elle n'a juste rien écrit.

### 5. Elle tape « )−3 »

**Situation.** Elle tape une parenthèse fermante avant le nombre, par erreur.

- **A ★ — Erreur « parenthèse »**, avec le message *« Une parenthèse fermée doit avoir été ouverte. »*
- **B — « Écriture invalide »**, avec le message général.

**Pourquoi A :** c'est exactement la définition de l'erreur « parenthèse » dans ton document 03. Le message est plus précis et l'aide davantage. *(Aujourd'hui, B est codé : je corrigerai si tu choisis A.)*

---

## Partie B — Les cours

### 6. Cours 1 : l'erreur de signe avec deux nombres **positifs**

**Situation.** Le Cours 1 (« additionner deux nombres de même signe ») contient aussi des calculs comme 4 + 6. Si elle répond −10, l'appli reconnaît l'erreur « signe oublié ». Mais le texte validé est : *« Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! »* Ici, ce serait faux : les deux nombres sont positifs.

- **A ★ — Deux messages :** le texte validé quand les deux nombres sont négatifs, et *« Les deux nombres sont positifs : le résultat est positif aussi. »* quand ils sont positifs.
- **B — Un message neutre pour les deux cas :** *« Même signe : le résultat garde ce signe. »*

**Pourquoi A :** le message colle exactement au calcul qu'elle a sous les yeux.

### 7. Cours 0 : le piège « parenthèse » aux niveaux 1 et 2

**Situation.** Quand elle oublie souvent de fermer une parenthèse, l'appli lui propose des calculs « pièges » sur ce point. Ton document 06 indique ce piège « au niveau 3, avec parenthèses ». Mais aux niveaux 1 et 2, les calculs sont courts, et les grandes parenthèses du niveau 3 n'existent pas encore.

- **A ★ — Aux niveaux 1 et 2**, le piège est une parenthèse non fermée autour d'un négatif, par exemple *« 4 × (−3 »*.
- **B — Aux niveaux 1 et 2**, pas de piège « parenthèse » : seulement à partir du niveau 3.

**Pourquoi A :** c'est exactement l'oubli qu'on veut lui faire repérer, et ça reste dans les calculs simples de son niveau.

### 8. Cours 0 : la règle « pas de parenthèses en tête »

**Situation.** Dans la leçon du Cours 0, chaque règle a un exemple ✓ en vert et un contre-exemple ✗ en rouge. Mais pour la règle 2 (« en tête d'un calcul, pas de parenthèses pour un négatif : −3 + 5 »), le contre-exemple « (−3) + 5 » n'est pas faux, seulement inutile. Le marquer ✗ en rouge lui apprendrait une fausse règle.

- **A ★ — L'afficher en gris :** *« (−3) + 5 : pas faux, mais inutile »*.
- **B — Pas de contre-exemple** pour cette règle.

**Pourquoi A :** ça lui montre la différence entre « faux » et « inutile », ce qui l'aidera à ne pas paniquer en contrôle.

### 9. Cours 5 : le piège « erreur de table »

**Situation.** Ton document 06 prévoit que, si elle se trompe souvent dans ses tables (3 × 4 = 15), le piège vise **les tables qu'elle a ratées**. Pour l'instant, le moteur choisit une table au hasard (sauf la table de 1), parce qu'il ne connaît pas encore son historique de tables.

- **A ★ — On garde « une table au hasard » pour la V1**, et on vise ses tables ratées quand on branchera l'historique aux écrans.
- **B — Je le fais tout de suite**, avant les écrans.

**Pourquoi A :** le piège reste utile (une multiplication à réviser), et le ciblage précis est plus simple à faire au moment où l'historique est affiché.

---

## Partie C — Les révisions et le déroulé des activités

### 10. Le mélange des formats dans une révision

**Situation.** Ton document 04 dit : dans une révision, chaque cours a 3 questions, surtout des QCM, avec au plus 1 « vrai ou faux » et au plus 1 « classer ». Il ne dit pas à quelle fréquence.

- **A ★ — Pour chaque cours révisé :** 1 chance sur 4 d'avoir un « vrai ou faux », 1 chance sur 4 d'avoir un « classer », et le reste en QCM. En moyenne, sur une séance de 15 questions : environ 1 vrai ou faux, 1 classer et 13 QCM.
- **B — Plus de variété :** 1 chance sur 2 pour chacun (environ 2 à 3 de chaque par séance).
- **C — Moins :** uniquement des QCM.

**Pourquoi A :** le QCM reste le plus fiable pour vérifier qu'une règle est acquise, et on peut tomber juste par hasard au « vrai ou faux » une fois sur deux. Un peu de variété suffit à casser la routine.

### 11. Quelles erreurs l'appli peut viser en révision

**Situation.** Quand elle fait souvent la même erreur sur un cours, la révision lui pose un calcul « piège » sur cette erreur (document 01 §5). Mais si son erreur la plus fréquente est classée « autre » (une erreur que l'appli ne reconnaît pas), il n'existe pas de calcul piège pour elle.

- **A ★ — On vise l'erreur reconnue la plus fréquente**, et on ignore les « autre ».
- **B — Si l'erreur la plus fréquente est « autre »**, pas de calcul piège du tout dans cette révision.

**Pourquoi A :** il reste toujours utile de cibler une vraie erreur connue. Les erreurs « autre » qui reviennent apparaissent sur ta page de suivi, et on pourra les ajouter aux erreurs reconnues.

### 12. Après une erreur : combien de calculs « du même type » ?

**Situation.** Document 01 §6 : après une erreur, un calcul du même type revient 3 questions plus loin, et le même calcul revient à la fin. Exemple : elle rate −3 × (−4). Plus loin, elle a −6 × (−2) (même type). À la fin, elle retrouve −3 × (−4).

Mais si elle rate aussi −6 × (−2), ou à nouveau −3 × (−4) à la fin, faut-il ajouter encore un calcul du même type ?

- **A ★ — Un seul calcul du même type par erreur de départ.** Si elle rate encore, seul le calcul exact revient à la fin, jusqu'à ce qu'il soit juste (ou qu'elle appuie sur « Passer »).
- **B — Un nouveau calcul du même type à chaque erreur.**

**Pourquoi A :** avec B, une activité où elle bloque pourrait s'allonger sans fin, ce qui la découragerait. Toi, tu verras sur ta page de suivi qu'elle a bloqué.

### 13. Quand le bouton « Passer » apparaît

**Situation.** Document 01 : « Passer » apparaît à partir du 2e échec sur le même calcul. Exemple :
1. elle rate −3 × (−4) une 1re fois ;
2. plus tard, elle rate le calcul du même type −6 × (−2) ;
3. à la fin, −3 × (−4) revient.

Le bouton « Passer » doit-il déjà être là ?

- **A ★ — Non :** seuls comptent les échecs sur **le même calcul** (−3 × (−4)). « Passer » apparaît s'il est raté une 2e fois.
- **B — Oui :** tous les échecs du même type comptent.

**Pourquoi A :** c'est la lecture exacte de ton document (« sur le même calcul »), et elle garde une vraie chance de réussir.

### 14. Quand il reste moins de 3 questions

**Situation.** Elle rate l'avant-dernière question. Le calcul du même type ne peut pas venir « 3 questions plus loin », donc il va à la fin (document 01). Mais à la fin, il y a aussi la répétition exacte du calcul raté. Lequel passe en premier ?

- **A ★ — Le calcul du même type d'abord**, puis la répétition exacte.
- **B — La répétition exacte d'abord.**

**Pourquoi A :** elle s'entraîne d'abord sur un calcul voisin, puis prouve qu'elle sait faire celui qu'elle a raté.

### 15. Le niveau des calculs en entraînement

**Situation.** En entraînement (libre, sur les cours déjà faits), à quel niveau sont les calculs ?

- **A ★ — Au niveau actuel de chaque cours** (celui de la répétition espacée).
- **B — Un mélange des niveaux 1, 2 et 3.**
- **C — Elle choisit le niveau.**

**Pourquoi A :** c'est son vrai niveau du moment, et le parcours reste simple, sans choix à faire (tu voulais éviter les niveaux « à gauche, à droite »).

### 16. QCM « paires de signes » quand la bonne réponse est 0

**Situation.** La formule « paires de signes » (document 04) propose la réponse, son opposé, un autre nombre et son opposé (9, −9, 6, −6). Si la réponse est 0, comme pour −7 + 7, c'est impossible : 0 n'a pas d'opposé.

- **A ★ — Dans ce cas, on utilise la formule « mélangée ».**

**Pourquoi :** c'est la seule possibilité, il n'y a pas vraiment de choix ici. Je te le signale pour que tu le saches.

---

## Partie D — Ta page de suivi

### 17. Un module terminé

**Situation.** Le bloc « État » de ton accueil a une ligne par module **en cours**, par exemple « Calculs 6 / 8 cours ». Quand les 8 cours sont validés, le module est terminé.

- **A ★ — Il disparaît du bloc « État »**, mais reste visible (avec un badge « terminé ») dans la liste des modules.
- **B — Il reste dans « État » avec la mention « terminé ».**

**Pourquoi A :** l'accueil reste centré sur ce qui est en cours, comme tu voulais quelque chose de simple. *(Avec un seul module en V1, ça n'arrivera qu'à la fin.)*

### 18. « Il y a un mois » pour la tendance des erreurs de signe

*Obsolète depuis le retrait du taux d'erreurs de signe (2026-11-23).*

**Situation.** Le bloc « État » compare les erreurs de signe des 7 derniers jours avec les mêmes 7 jours **il y a un mois**. Exemple : le 22 décembre, on compare la semaine du 16 au 22 décembre avec celle du 16 au 22 novembre.

- **A ★ — « Un mois » = le même jour du mois précédent.** S'il n'existe pas, comme le 31 mars, on prend le dernier jour du mois, ici le 28 février.
- **B — « Un mois » = toujours 4 semaines (28 jours).**

**Pourquoi A :** c'est ce que tout le monde comprend par « il y a un mois ». *(B serait aussi tout à fait correct, c'est une question de goût.)*

### 19. Un cours « à rattraper »

**Situation.** Elle a fini un cours sans le valider (moins de 80 %, ou moins de 4 sur 5 aux exercices de fin) : le rattrapage lui est proposé. Dans la vue du module, sur ta page de suivi, comment l'afficher ?

- **A — « en cours »**, comme un cours commencé.
- **B ★ — « à rattraper »**, avec une mention distincte.

**Pourquoi B :** c'est plus précis pour toi, puisque tu vois qu'elle bloque à la fin d'un cours. *(Aujourd'hui, A est codé : je corrigerai si tu choisis B, ce que je recommande.)*

### 20. Combien de calculs ratés quand tu touches une erreur

**Situation.** Dans le bloc « Erreurs les plus communes », tu touches une erreur, par exemple « Règle des signes : 9 fois ». Combien de calculs ratés afficher ?

- **A ★ — Les 10 derniers.**
- **B — Tous, sur les 30 jours.**

**Pourquoi A :** c'est suffisant pour voir comment elle se trompe, sans une liste trop longue sur téléphone.

### 21. Un cours à 69,6 % de réussite

**Situation.** « À retravailler » liste les cours **sous 70 %**. Un cours à 69,6 % s'afficherait « 70 % » une fois arrondi, et serait pourtant marqué ⚠. Tu verrais alors « 70 % ⚠ », ce qui paraît incohérent.

- **A ★ — On compare avec le pourcentage affiché** : 69,6 % s'affiche « 70 % », donc pas de ⚠.
- **B — On compare avec la valeur exacte** : ⚠, même si « 70 % » est affiché.

**Pourquoi A :** ce que tu vois à l'écran est toujours cohérent.
