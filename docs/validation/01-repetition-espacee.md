# 01 — Répétition espacée : quand un cours revient, et à quel niveau

*Statut : Validé (2026-11-22) — version 2*

Ce document décrit comment l'appli décide **quels cours faire revenir en révision, quand, et à quel niveau**. Le tableau « Exemples » à la fin deviendra les tests automatiques.

## 1. Ce qu'on suit

On suit **chaque cours séparément**. Pour chaque cours terminé, l'appli retient :

- son **étape** sur l'échelle de temps (A à H, voir §3), qui donne son **niveau** (1, 2 ou 3) ;
- la **date de sa prochaine révision** ;
- s'il vient de **rater** sa dernière révision (pour savoir si c'est un 1er ou un 2e raté d'affilée) ;
- ses **erreurs récentes** (lesquelles, et combien de fois).

Un cours est **« dû »** le jour où sa date de prochaine révision est arrivée ou dépassée.

## 2. Finir un cours

Le déroulé d'un cours est propre à chaque cours (doc 06) : explications et questions de leçon, exemples guidés à compléter, et il se termine toujours par **5 exercices de fin**, avec une réponse tapée, au niveau 1.

Le cours est **validé** quand ces deux conditions sont réunies :
- **au moins 80 % de bonnes réponses sur l'ensemble du cours** (questions de la leçon, exemples guidés et exercices de fin, soit environ 12 réponses) ;
- **et au moins 4 exercices de fin justes sur 5**.

*Pourquoi les deux conditions :* les questions de la leçon sont guidées, donc plus faciles. Sans la 2e condition, elle pourrait valider un cours sans savoir faire le calcul seule.

- **Cours validé** : le cours suivant se débloque, et ce cours gagne sa **1re étoile**. Il entre en révision à l'**étape A** : 1re révision dans 48 heures.
- **Cours non validé** : elle ne refait pas la leçon. On lui propose une **série de rattrapage de 5 exercices** (réponse tapée), validée à **4 sur 5**. Elle peut la recommencer autant de fois que nécessaire, et relire la leçon quand elle veut.

Seule la **première réponse** à chaque question compte dans la note (voir §6).

## 3. L'échelle de temps

| Étape | Niveau | Si la révision est réussie, la suivante vient dans… | Les 3 calculs de ce cours dans une séance |
|---|---|---|---|
| A | 1 | 48 h | 3 au niveau 1 |
| B | 2 | 48 h | 2 au niveau 2 + 1 au niveau 1 |
| C | 2 | 1 semaine | 2 au niveau 2 + 1 au niveau 1 |
| D | 3 | 48 h | 2 au niveau 3 + 1 au niveau 1 ou 2 |
| E | 3 | 1 semaine | idem |
| F | 3 | 1 mois | idem |
| G | 3 | 3 mois | idem |
| H | 3 | 6 mois (on reste à H) | idem |

- **Chaque nouveau niveau commence par 48 h**, parce que la première fois à un nouveau niveau est aussi difficile qu'un nouveau cours.
- **Étoiles :** ★★ en arrivant à l'étape B, ★★★ à l'étape D. Les étoiles affichent le **meilleur niveau atteint** et **ne se perdent jamais**. Sur ta page de suivi, tu vois en plus le **niveau actuel**, qui peut redescendre.
- « 1 mois » = 30 jours, « 3 mois » = 90 jours, « 6 mois » = 180 jours.

## 4. Révision réussie ou ratée

Dans une séance de révision, chaque cours dû a **3 calculs**, mélangés avec ceux des autres cours.

- **Réussie = 3 sur 3** pour ce cours. Sinon, elle est ratée.

| Ce qui se passe | Effet |
|---|---|
| **Réussie** | monte d'une étape ; la révision suivante suit le délai de la nouvelle étape |
| **1er raté** | **même étape** ; la révision revient **le lendemain** |
| **Réussie juste après un 1er raté** | on reprend le rythme normal **à la même étape** (ça « stagne ») ; le prochain succès fera monter |
| **2e raté d'affilée** (et chaque raté suivant) | **descend d'une étape** (jamais sous A) et suit **le délai de cette étape** (48 h au minimum, plus jamais « le lendemain ») |

*Pourquoi :* un cours difficile ne peut revenir **qu'un seul jour de suite** au maximum. Les révisions ne s'accumulent donc pas sur un cours qui coince. Ce cours apparaît avec un ⚠ sur ta page de suivi, et elle peut le retravailler en entraînement.

**La baisse de niveau vient toute seule de l'échelle :** à l'étape D (début du niveau 3), deux ratés d'affilée la font redescendre à C, donc au niveau 2.

- La date suivante se calcule toujours **à partir du jour où elle fait la révision**. Une révision faite en retard compte normalement.
- **L'entraînement ne change jamais les étapes ni les dates.** C'est de la pratique libre. Ses erreurs comptent quand même dans les « erreurs récentes » et sur ta page de suivi.
- **On ne peut pas réviser en avance** un cours qui n'est pas encore dû. Pour pratiquer, il y a l'entraînement.

## 5. Viser l'erreur qu'elle fait

- Les **erreurs récentes** d'un cours sont les erreurs reconnues parmi ses **10 dernières réponses** à ce cours (cours, révisions et entraînement).
- Pour chaque erreur reconnue, le document 06 indique **quel calcul tend ce piège**. Par exemple, pour « règle des signes » : deux nombres négatifs.
- Quand le cours revient en révision et qu'il a des erreurs récentes, **au moins 1 de ses 3 calculs** est un calcul-piège de l'erreur la plus fréquente.

## 6. Après une erreur, pendant une activité

Pendant un cours, une révision ou un entraînement, quand elle se trompe :

1. elle voit la **bonne réponse et l'explication** ;
2. **un calcul du même type** (même cours, même niveau, même piège) est remis **3 questions plus loin**, ou à la fin s'il en reste moins de 3 ;
3. **exactement le même calcul revient à la fin** de l'activité. S'il est encore raté, il revient de nouveau à la fin ;
4. **à partir du 2e échec sur le même calcul**, un petit bouton discret **« Passer »** apparaît. Si elle passe, la correction s'affiche étape par étape. Le calcul est compté comme raté et apparaît comme **« passé »** sur ta page de suivi.

**Seule la première réponse compte** dans la note du cours et dans le 3 sur 3 de la révision. Les repassages et les calculs du même type servent à apprendre.

## Exemples

Cours 5, « multiplier deux relatifs ». Elle le valide le **lundi 2 mars 2026**.

| Jour | Ce qu'elle fait | Résultat | Étape → | Niveau | Étoiles | Prochaine révision |
|---|---|---|---|---|---|---|
| lun. 2 mars | cours validé | — | A | 1 | ★ | mer. 4 mars |
| mer. 4 mars | révision | 3 sur 3 | B | 2 | ★★ | ven. 6 mars |
| ven. 6 mars | révision | 2 sur 3 (1er raté) | B | 2 | ★★ | sam. 7 mars |
| sam. 7 mars | révision | 3 sur 3 | B (stagne) | 2 | ★★ | lun. 9 mars |
| lun. 9 mars | révision | 3 sur 3 | C | 2 | ★★ | lun. 16 mars |
| lun. 16 mars | révision | 3 sur 3 | D | 3 | ★★★ | mer. 18 mars |
| mer. 18 mars | révision | 1 sur 3 (1er raté) | D | 3 | ★★★ | jeu. 19 mars |
| jeu. 19 mars | révision | 2 sur 3 (2e raté) | C | 2 | ★★★ | jeu. 26 mars |
| jeu. 26 mars | révision | 3 sur 3 | D | 3 | ★★★ | sam. 28 mars |
| lun. 30 mars | révision, 2 jours de retard | 3 sur 3 | E | 3 | ★★★ | lun. 6 avril |
| lun. 6 avril | révision | 3 sur 3 | F | 3 | ★★★ | mer. 6 mai |

Autres cas :

| Situation | Résultat attendu |
|---|---|
| Aucun cours commencé | cours 1 débloqué, tous les autres verrouillés |
| Cours 1 : 11 sur 12 en tout, dont 5 sur 5 aux exercices de fin | validé ★, cours 2 débloqué, étape A, révision dans 48 h |
| Cours 1 : 10 sur 12 en tout (83 %), mais 3 sur 5 aux exercices de fin | non validé, rattrapage proposé, cours 2 verrouillé |
| Cours 1 : 9 sur 12 en tout (75 %), dont 4 sur 5 aux exercices de fin | non validé (moins de 80 %), rattrapage proposé |
| Non validé, puis rattrapage 4 sur 5 | validé ★, cours 2 débloqué, étape A |
| Non validé, puis rattrapage 3 sur 5 | toujours non validé, nouveau rattrapage proposé |
| Étape A, 1er raté puis 2e raté | reste à A (on ne descend pas sous A) ; 1er raté : revient le lendemain ; 2e raté : revient dans 48 h |
| Étape H, révision réussie | reste à H, revient dans 6 mois |
| Étape F (1 mois), 1er raté puis 2e raté | 1er raté : F, revient le lendemain ; 2e raté : E, revient dans 1 semaine |
| Entraînement : 10 calculs du cours 5, tous faux | étape et date inchangées ; erreurs comptées dans les erreurs récentes et sur la page de suivi |
| Erreurs récentes du cours 5 : 3 fois « règle des signes », 1 fois « table » | à la prochaine révision, au moins 1 des 3 calculs vise la règle des signes |
| Même calcul raté 2 fois dans une activité | le bouton « Passer » apparaît |
