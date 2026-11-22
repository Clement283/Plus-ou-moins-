# 05 — Ta page de suivi

*Statut : à valider (version 3)*

Tu y accèdes depuis ton téléphone avec ton propre code. Elle est en **lecture seule**. Elle a trois niveaux :
1. l'**accueil** : la vue d'ensemble ;
2. un **module** ouvert : ses cours ;
3. un **cours** ouvert : son détail.

## 1. L'accueil

```
┌──────────────────────────────────────┐
│  [ Prénom ▾ ]        (choix de l'élève) │
│                                      │
│  AUJOURD'HUI             12 / 15 min  │
│  Révisions 4 · Cours 8 · Entraîn. 0    │
│  Série : 6 jours 🔥                  │
│  ● ● ● ◐ ○ ● ● ● ● ● ◐ ● ● ● …  (28 j) │
│                                      │
│  ⚠ DIFFICULTÉS DU MOMENT (14 jours)   │
│  Cours en difficulté                 │
│   • Cours 5 Multiplier   58 % · 2 révisions ratées │
│   • Cours 4 Soustraire   66 %         │
│  Erreurs qui reviennent              │
│   1. Règle des signes (×)   7 fois    │
│   2. Opposé oublié          4 fois    │
│  Plus gros échecs                    │
│   • −3 × (−4) : raté 3 fois, passé    │
│   • 7 − (−2)  : raté 2 fois           │
│                                      │
│  MODULES EN COURS                    │
│  ▸ Calculs        6 / 8 cours  ★ 14   │
│                                      │
│  ERREURS DE SIGNE (par semaine)      │
│  S1 ████████ 32 %                    │
│  S2 ██████   24 %                    │
│  S3 ████     15 %   ↘ en baisse      │
│                                      │
│  DERNIÈRES ERREURS                   │
│  12/03 −3 × (−4)  a répondu −12 (12) règle des signes │
│  12/03 7 − (−2)   a répondu 5   (9)  opposé oublié │
└──────────────────────────────────────┘
```

**Choix de l'élève.** Si tu suis plusieurs élèves, une liste en haut permet de changer d'élève. L'appli se souvient du dernier élève consulté.

**Aujourd'hui.**
- Le temps de la journée (même calcul que sa jauge, doc 02), réparti en révisions, cours et entraînement, avec une coche quand les 15 minutes sont atteintes.
- **La série** : le nombre de jours d'affilée où l'objectif a été atteint. Si aujourd'hui n'est pas encore atteint, la série compte jusqu'à hier.
- **Les 28 derniers jours** :
  - ● objectif atteint ;
  - ◐ un peu d'activité, mais moins de 15 minutes ;
  - ○ rien.

  En touchant un jour, tu vois le temps par catégorie.

**⚠ Difficultés du moment.** C'est la partie la plus visible, pour savoir **quoi retravailler en cours avec elle**. Elle porte sur les **14 derniers jours**.
- **Cours en difficulté.** Un cours apparaît s'il remplit au moins une de ces conditions :
  - son taux de réussite des 14 derniers jours est sous **70 %** (avec au moins 5 réponses) ;
  - il vient de rater **2 révisions d'affilée** (doc 01).

  Les cours sont classés du plus faible taux au plus fort. On en montre 5 au maximum.
- **Erreurs qui reviennent.** Les 3 types d'erreur les plus fréquents sur 14 jours, tous cours confondus, avec leur nombre. On y trouve les familles signe, écriture et calcul.
- **Plus gros échecs.** Les calculs qu'elle a **ratés plusieurs fois** (le même calcul repassé en fin d'activité, doc 01 §6) ou **passés** avec le bouton « Passer ». On en montre 5 au maximum, les plus récents d'abord. En touchant une ligne, tu vois ses réponses successives.
- **S'il n'y a rien** : « Pas de difficulté particulière en ce moment 👍 ».

**Modules en cours.** Un module par ligne, avec :
- le nombre de cours validés sur le total ;
- le nombre d'étoiles ;
- « terminé » quand tous les cours sont validés ;
- un ⚠ si un de ses cours est en difficulté.

En touchant le module, tu l'ouvres (§2).

**Erreurs de signe par semaine.**
- **Ce qui est compté :** sur les 8 dernières semaines (du lundi au dimanche), la part des calculs ratés à cause d'une **erreur de signe** (famille signe 🔴, doc 06), sur l'ensemble des calculs de la semaine.
- **La flèche** compare la dernière semaine à la moyenne des 3 précédentes :
  - ↘ en baisse ;
  - → stable (écart de moins de 3 points) ;
  - ↗ en hausse.
- *C'est l'indicateur de réussite du projet* : la courbe doit baisser.
- **Les erreurs d'écriture** (famille « écriture », doc 03) n'y sont pas mélangées.

**Dernières erreurs.**
- **Ce qui est affiché :** les 10 dernières erreurs, avec la date, le calcul, **ce qu'elle a répondu**, la bonne réponse et l'erreur reconnue (ou « autre »).
- Un calcul abandonné porte la mention **« passé »**.
- Les erreurs « autre » qui reviennent souvent sont à signaler : on pourra les ajouter aux erreurs reconnues du cours.

## 2. Un module ouvert

```
┌──────────────────────────────────────┐
│  ← Calculs           6 / 8 cours      │
│                                      │
│  0 Bien écrire       ★★★ niv.3  97 %  │
│    prochaine révision : 12 avril      │
│  1 Addition même signe ★★★ niv.3  95 % │
│    prochaine révision : 2 avril       │
│  2 Signes contraires ★★  niv.2  81 %   │
│    prochaine révision : demain        │
│  3 Plusieurs relatifs ★★ niv.2  88 %   │
│  4 Soustraire        ★★  niv.2  66 % ⚠ │
│  5 Multiplier        ★★  niv.1  58 % ⚠ │
│    2 révisions ratées d'affilée       │
│  6 Diviser           🔒 pas commencé   │
│  7 Plusieurs facteurs 🔒 pas commencé  │
└──────────────────────────────────────┘
```

Pour chaque cours :
- les **étoiles** (meilleur niveau atteint) ;
- le **niveau actuel** (qui peut redescendre) ;
- le **taux de réussite des 30 derniers jours** (exercices, révisions et entraînement ; les questions de leçon et les exemples guidés ne comptent pas) ;
- la **prochaine révision** ;
- un ⚠ s'il est en difficulté (mêmes conditions qu'au §1).

Les cours pas encore commencés sont affichés « 🔒 pas commencé », et le cours en cours d'apprentissage « en cours ».

## 3. Un cours ouvert

```
┌──────────────────────────────────────┐
│  ← Cours 5 · Multiplier deux relatifs │
│  ★★ · niveau actuel 1 · étape A       │
│  Validé le 2 mars · prochaine révision demain │
│                                      │
│  RÉVISIONS                           │
│  04/03 ✓  06/03 ✗  07/03 ✓  09/03 ✓    │
│  16/03 ✓  18/03 ✗  19/03 ✗            │
│                                      │
│  SES ERREURS (30 jours)              │
│  Règle des signes   7  ████████       │
│  Erreur de table    2  ██             │
│  Autre              1  █              │
│                                      │
│  DERNIÈRES ERREURS DU COURS          │
│  19/03 −6 × (−4)  a répondu −24 (24)   │
│  18/03 −3 × (−7)  a répondu −21 (21)   │
└──────────────────────────────────────┘
```

- **L'état du cours** : étoiles, niveau actuel, étape sur l'échelle de temps (doc 01), date de validation, prochaine révision.
- **L'historique des révisions** : chaque révision, avec sa date et réussie ✓ ou ratée ✗.
- **Ses erreurs sur 30 jours**, par type, du plus fréquent au moins fréquent.
- **Les 10 dernières erreurs de ce cours**, avec sa réponse et la bonne.

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
| Taux de réussite du cours 5 (30 jours, et 14 jours) | (53 − 10) / 53 = 81 % : pas de ⚠, n'apparaît pas dans « Difficultés du moment » |
| Dernières erreurs | les 10 ratés, du plus récent au plus ancien |

Autres cas :

| Situation | Attendu |
|---|---|
| Cours 4 : 10 réponses sur 14 jours, 6 justes (60 %) | dans « Cours en difficulté », avec ⚠ dans le module |
| Cours 3 : 4 réponses sur 14 jours, 1 juste | pas dans « Cours en difficulté » (moins de 5 réponses) |
| Cours 5 : 90 % de réussite, mais 2 révisions ratées d'affilée | dans « Cours en difficulté » : « 2 révisions ratées » |
| −3 × (−4) raté 3 fois dans une activité puis passé | dans « Plus gros échecs » : « raté 3 fois, passé » |
| Un calcul raté une fois puis réussi au repassage | pas dans « Plus gros échecs » |
| Aucune difficulté sur 14 jours | « Pas de difficulté particulière en ce moment 👍 » |
| Module « Calculs » : cours 0 à 4 validés, 5 en cours, 6 et 7 pas commencés | accueil : « Calculs 5 / 8 cours » ; module : 6 et 7 « 🔒 pas commencé », 5 « en cours » |
