# 01 — Répétition espacée : quand un calcul revient, quand le niveau monte ou descend

*Statut : à valider*

Ce document décrit comment l'appli décide **quoi faire revenir, quand, et à quel niveau**. Tout ce qui est écrit ici est une proposition de Claude, avec sa raison. Le tableau « Exemples » à la fin deviendra les tests automatiques.

## 1. Ce qu'on suit

On suit **chaque cours séparément**. Pour chaque cours terminé, l'appli retient :

- son **palier**, de 1 à 8 : plus le palier est haut, plus le cours revient rarement ;
- le **niveau** (1, 2 ou 3), qui découle du palier (voir le tableau ci-dessous) ;
- la **prochaine date de révision** ;
- les **erreurs récentes** de ce cours (lesquelles, combien de fois).

*Pourquoi par cours :* un cours = une règle. Si elle rate « moins par moins », c'est le cours « multiplier deux relatifs » qui revient, et on vise ce cas précis à l'intérieur du cours (voir §5).

## 2. Les paliers

| Palier | Niveau des calculs | Revient dans… |
|---|---|---|
| 1 | Niveau 1 | 1 jour |
| 2 | Niveau 1 | 2 jours |
| 3 | Niveau 2 | 4 jours |
| 4 | Niveau 2 | 7 jours |
| 5 | Niveau 3 | 10 jours |
| 6 | Niveau 3 | 15 jours |
| 7 | Niveau 3 | 21 jours |
| 8 | Niveau 3 | 30 jours (on reste à 8) |

C'est le principe validé : **plus elle réussit, plus le palier monte**, donc le cours revient **plus tard et plus dur**. Quand elle se trompe, le palier descend : il revient **plus tôt et plus simple**.

*Pourquoi ces chiffres :* avec deux réussites, elle passe au niveau 2 environ 3 jours après avoir fini le cours. C'est ce que tu imaginais (« le niveau 2 arrive 2-3 sessions après »).

## 3. Finir un cours (et débloquer le suivant)

Un cours se déroule ainsi : mini-leçon → exemples guidés → **10 exercices de fin**, au niveau 1, avec une réponse tapée.

- **8 bonnes réponses sur 10 ou plus** : le niveau 1 est **maîtrisé**. Le cours suivant se débloque et le cours gagne sa **1re étoile**. Il entre en révision au **palier 1**, donc il revient le lendemain.
- **Moins de 8 sur 10** : elle ne refait pas la leçon. On lui propose une **série de rattrapage de 5 calculs**, et elle valide avec **4 sur 5**. Elle peut recommencer le rattrapage autant de fois que nécessaire, ou relire la leçon si elle veut.

*Pourquoi 8 sur 10 :* une ou deux étourderies ne doivent pas la bloquer, mais en dessous, la règle n'est pas acquise.

## 4. Une révision : réussie, moyenne ou ratée

Réviser un cours, c'est faire **3 calculs en QCM** de ce cours, au niveau de son palier actuel.

| Résultat | Effet |
|---|---|
| **3 sur 3 : réussie** | palier + 1 (le cours revient plus tard, et peut changer de niveau) |
| **2 sur 3 : moyenne** | même palier ; il revient après l'intervalle de ce palier |
| **0 ou 1 sur 3 : ratée** | palier − 2 (jamais en dessous de 1) ; il revient plus tôt, et le niveau peut redescendre |

- La prochaine date se calcule toujours **à partir du jour où elle fait la révision**. Une révision faite en retard compte normalement.
- **Étoiles :** elles affichent le **meilleur niveau atteint** (2e étoile en arrivant au palier 3, 3e au palier 5), et **ne se perdent jamais**. Sur ta page de suivi, tu vois en plus le niveau **actuel**, qui peut redescendre.
  *Pourquoi :* perdre une étoile serait démotivant pour elle, et toi tu as l'information exacte.
- **L'entraînement ne change pas les paliers.** C'est de la pratique libre. Ses erreurs comptent quand même dans les « erreurs récentes » et sur ta page de suivi.
  *Pourquoi :* sinon, s'entraîner beaucoup un jour ferait sauter des paliers sans espacement réel.

## 5. Viser l'erreur qu'elle fait

- Les **erreurs récentes** d'un cours sont les erreurs reconnues parmi ses **10 dernières réponses** à ce cours (révisions, exercices et entraînement).
- Quand le cours revient en révision, **au moins 1 des 3 calculs** est choisi pour tendre le piège de l'erreur la plus fréquente. Exemple : si elle rate souvent « − × − », un calcul comme (−6) × (−4).

## 6. Après une erreur, dans l'activité en cours

Pendant un cours, une révision ou un entraînement, quand elle se trompe :

1. elle voit la bonne réponse et l'explication ;
2. **un calcul du même type** (même cours, même niveau, même piège) est remis **3 questions plus loin**, ou à la fin s'il en reste moins de 3 ;
3. ce calcul de rattrapage ne compte **pas** dans le 3 sur 3 de la révision. Il sert à repartir sur une réussite. On ne le remet qu'**une fois** par erreur.

## Exemples

Cours 5, « multiplier deux relatifs ». Elle le termine le **lundi 2 mars 2026** avec 9 sur 10.

| Jour | Ce qu'elle fait | Résultat | Palier → | Niveau | Étoiles | Revient le |
|---|---|---|---|---|---|---|
| lun. 2 mars | exercices de fin | 9 sur 10 | 1 | 1 | ★ | mar. 3 mars |
| mar. 3 mars | révision | 3 sur 3 | 2 | 1 | ★ | jeu. 5 mars |
| jeu. 5 mars | révision | 3 sur 3 | 3 | 2 | ★★ | lun. 9 mars |
| lun. 9 mars | révision (niveau 2) | 1 sur 3 | 1 | 1 | ★★ | mar. 10 mars |
| mar. 10 mars | révision | 2 sur 3 | 1 | 1 | ★★ | mer. 11 mars |
| mer. 11 mars | révision | 3 sur 3 | 2 | 1 | ★★ | ven. 13 mars |
| sam. 14 mars | révision, 1 jour de retard | 3 sur 3 | 3 | 2 | ★★ | mer. 18 mars |
| mer. 18 mars | révision | 3 sur 3 | 4 | 2 | ★★ | mer. 25 mars |
| mer. 25 mars | révision | 3 sur 3 | 5 | 3 | ★★★ | sam. 4 avril |
| sam. 4 avril | révision | 0 sur 3 | 3 | 2 | ★★★ | mer. 8 avril |

Autres cas :

| Situation | Résultat attendu |
|---|---|
| Aucun cours commencé | cours 1 débloqué, tous les autres verrouillés |
| Cours 1 terminé avec 7 sur 10 | pas d'étoile, cours 2 toujours verrouillé, rattrapage proposé |
| Cours 1 : 7 sur 10, puis rattrapage 4 sur 5 | ★, cours 2 débloqué, cours 1 au palier 1, revient le lendemain |
| Cours 1 : 7 sur 10, puis rattrapage 3 sur 5 | toujours verrouillé, nouveau rattrapage proposé |
| Palier 8, révision 3 sur 3 | reste au palier 8, revient dans 30 jours |
| Palier 2, révision 0 sur 3 | palier 1 (pas en dessous), revient le lendemain |
| Entraînement : 10 calculs du cours 5, tous faux | palier inchangé ; erreurs comptées dans les erreurs récentes et sur la page de suivi |
| Erreurs récentes du cours 5 : 3 fois « règle des signes », 1 fois « table » | dans la prochaine révision, au moins 1 calcul vise la règle des signes |
