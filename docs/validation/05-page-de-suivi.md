# 05 — Ta page de suivi

*Statut : à valider*

Tu y accèdes depuis ton téléphone avec ton propre code. Elle est en **lecture seule**.

## 1. À quoi elle ressemble

```
┌───────────────────────────────────┐
│  [ Prénom ▾ ]       (choix de l'élève) │
│                                   │
│  AUJOURD'HUI          12 / 15 min  │
│  Révisions 4 · Cours 8 · Entraîn. 0 │
│  Série : 6 jours 🔥               │
│                                   │
│  28 DERNIERS JOURS                │
│  ● ● ● ◐ ○ ● ● ● ● ● ◐ ● ● ● …    │
│  ● objectif atteint  ◐ moins de 15 min  ○ rien │
│                                   │
│  ERREURS DE SIGNE (par semaine)   │
│  S1 ████████ 32 %                 │
│  S2 ██████   24 %                 │
│  S3 ████     15 %   ↘ en baisse   │
│                                   │
│  PAR COURS                        │
│  1 Addition même signe  ★★★ niv.3  95 % │
│  2 Signes contraires    ★★  niv.2  81 % │
│  5 Multiplier           ★★  niv.1  62 % ⚠ │
│                                   │
│  ERREURS LES PLUS FRÉQUENTES      │
│  1. Règle des signes (×)   9 fois  │
│  2. Opposé oublié          4 fois  │
│                                   │
│  DERNIÈRES ERREURS                │
│  12/03 (−3) × (−4)  a répondu −12  (12) règle des signes │
│  12/03 7 − (−2)     a répondu 5    (9)  opposé oublié │
└───────────────────────────────────┘
```

## 2. Ce que montre chaque partie, et comment c'est calculé

**Choix de l'élève.** Si tu suis plusieurs élèves, une liste en haut permet de changer d'élève. L'appli se souvient du dernier élève consulté.

**Aujourd'hui.** Le temps de la journée (même calcul que sa jauge, doc 02), réparti en révisions, cours et entraînement, avec une coche quand les 15 minutes sont atteintes.

**Série.** Le nombre de jours d'affilée où l'objectif de 15 minutes a été atteint. Si aujourd'hui n'est pas encore atteint, la série compte jusqu'à hier : elle ne tombe à zéro que si un jour entier est manqué.

**28 derniers jours.** Un point par jour :
- ● objectif atteint ;
- ◐ un peu d'activité, mais moins de 15 minutes ;
- ○ rien.

En touchant un jour, tu vois le détail (temps par catégorie).

**Erreurs de signe par semaine.** Sur les 8 dernières semaines (du lundi au dimanche), la part des calculs ratés à cause d'une **erreur de signe**, sur l'ensemble des calculs faits cette semaine-là. Les erreurs de signe sont celles marquées « famille signe » dans le doc 06 : signe oublié, signe du mauvais nombre, règle des signes, opposé oublié… La flèche compare la dernière semaine à la moyenne des 3 précédentes : ↘ en baisse, → stable (écart de moins de 3 points), ↗ en hausse.

*C'est l'indicateur de réussite du projet* : la courbe doit baisser.

**Par cours.** Pour chaque cours commencé :
- les étoiles (meilleur niveau atteint) ;
- le **niveau actuel** ;
- le **taux de réussite des 30 derniers jours** (exercices, révisions et entraînement ; les questions de leçon et les exemples guidés ne comptent pas) ;
- un ⚠ si ce taux est sous **70 %**, pour repérer d'un coup d'œil quoi retravailler en cours.

**Erreurs les plus fréquentes.** Les 3 types d'erreur les plus fréquents sur les 30 derniers jours, tous cours confondus.

**Dernières erreurs.** Les 10 dernières erreurs, avec la date, le calcul, **ce qu'elle a répondu**, la bonne réponse et le type d'erreur reconnu (ou « autre »). C'est ce qui te montre *comment* elle se trompe.

## Exemples

Journal fictif (cours 5, « multiplier ») :

| Jour | Activité | Temps | Calculs | Ratés | dont erreurs de signe |
|---|---|---|---|---|---|
| lun. 9 mars | cours 5 + révisions | 16 min | 20 | 5 | 4 |
| mar. 10 mars | révisions | 6 min | 9 | 2 | 1 |
| mer. 11 mars | rien | 0 | 0 | 0 | 0 |
| jeu. 12 mars (aujourd'hui) | révisions + entraînement | 15 min | 24 | 3 | 1 |

Ce que la page doit afficher le jeudi 12 mars :

| Indicateur | Valeur attendue |
|---|---|
| Aujourd'hui | 15 / 15 min ✓ |
| Série | 1 jour (mercredi manqué ; lundi atteint, mardi non) |
| Points des 4 jours | lun. ● · mar. ◐ · mer. ○ · jeu. ● |
| Erreurs de signe, semaine du 9 mars | 6 erreurs de signe sur 53 calculs = 11 % |
| Taux de réussite du cours 5 (30 jours) | (53 − 10) / 53 = 81 % (pas de ⚠) |
| Dernières erreurs | les 10 ratés, du plus récent au plus ancien |
