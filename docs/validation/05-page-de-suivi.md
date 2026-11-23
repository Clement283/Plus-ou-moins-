# 05 — Ta page de suivi

*Statut : Validé (2026-11-22) — version 6. 2026-11-23 : taux d'erreurs de signe retiré (décision du porteur du projet) ; toutes les périodes passent à 28 jours, les 4 dernières semaines (décision du porteur du projet).*

Tu y accèdes depuis ton téléphone avec ton propre code. Elle est en **lecture seule**. Elle a trois niveaux :
1. l'**accueil** : simple, l'essentiel d'un coup d'œil ;
2. un **module** ouvert : ses cours ;
3. un **cours** ouvert : son détail.

## 1. L'accueil : simple, l'essentiel d'un coup d'œil

```
┌──────────────────────────────────────┐
│  [ Prénom ▾ ]                         │
│                                      │
│  28 DERNIERS JOURS (4 SEMAINES)                   │
│  ● ● ● ◐ ○ ● ● ● ● ● ◐ ● ● ● ● ●      │
│  ● ● ○ ○ ● ● ● ◐ ● ● ● ● ● ●          │
│  Objectif atteint 21 jours sur 28     │
│                                      │
│  ÉTAT                                │
│  Aujourd'hui   12 / 15 min            │
│  Série         6 jours                │
│  Calculs       6 / 8 cours  ▸         │
│                                      │
│  RÉVISIONS PAS FAITES                │
│  4 en attente · la plus ancienne : lundi │
│                                      │
│  ERREURS LES PLUS COMMUNES (28 j)    │
│  1. Règle des signes (×)   9 fois  ▸  │
│  2. Opposé oublié          4 fois  ▸  │
│  3. Moins après le nombre  2 fois  ▸  │
│                                      │
│  À RETRAVAILLER                      │
│  ⚠ Cours 5 Multiplier   58 %   ▸      │
└──────────────────────────────────────┘
```

Cinq blocs, pas plus.

**Choix de l'élève.** Si tu suis plusieurs élèves, une liste en haut permet de changer d'élève. L'appli se souvient du dernier élève consulté.

**28 derniers jours (les 4 dernières semaines).**
- Un point par jour :
  - ● objectif de 15 minutes atteint ;
  - ◐ un peu d'activité, mais moins de 15 minutes ;
  - ○ rien.
- En dessous : « Objectif atteint N jours sur 28 ».
- En touchant un jour, tu vois le temps par catégorie (révisions, cours, entraînement).

**État.**
- **Aujourd'hui** : le temps de la journée (même calcul que sa jauge, doc 02).
- **Série** : les jours d'affilée où l'objectif a été atteint. Si aujourd'hui n'est pas encore atteint, elle compte jusqu'à hier.
- **Une ligne par module en cours** : cours validés sur le total. En la touchant, tu ouvres le module (§2).

**Révisions pas faites.** Le nombre de révisions en attente (dont la date est passée, doc 02) et la date de la plus ancienne. En touchant, tu vois la liste des cours concernés. Si tout est à jour : « Révisions à jour ✓ ».

**Erreurs les plus communes.** Les 3 types d'erreur les plus fréquents sur 28 jours, tous cours confondus, avec leur nombre : familles signe, écriture et calcul. En touchant une erreur, tu vois **ses derniers calculs ratés de ce type**, avec ce qu'elle a répondu et la bonne réponse. Un calcul abandonné porte la mention « passé ». Les erreurs « autre » qui reviennent souvent sont à signaler : on pourra les ajouter aux erreurs reconnues du cours.

**À retravailler.** Les cours en difficulté, 3 au maximum, du plus faible au plus fort. Un cours est en difficulté si :
- son taux de réussite des 14 derniers jours est sous **70 %** (avec au moins 5 réponses) ;
- **ou** il vient de rater **2 révisions d'affilée** (doc 01).

En touchant un cours, tu l'ouvres (§3). Si aucun cours n'est en difficulté : « Rien à retravailler en ce moment 👍 ».

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
- le **taux de réussite des 28 derniers jours** (exercices, révisions et entraînement ; les questions de leçon et les exemples guidés ne comptent pas) ;
- la **prochaine révision** ;
- un ⚠ s'il est en difficulté (mêmes conditions que « À retravailler », §1).

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
│  SES ERREURS (28 jours)              │
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
- **Ses erreurs sur 28 jours**, par type, du plus fréquent au moins fréquent.
- **Les 10 dernières erreurs de ce cours**, avec sa réponse et la bonne. Un calcul raté plusieurs fois dans la même activité, ou passé, est signalé (« raté 3 fois, passé »).

## Exemples

Journal fictif (cours 5, « multiplier ») :

| Jour | Activité | Temps | Calculs | Ratés |
|---|---|---|---|---|
| lun. 9 mars | cours 5 + révisions | 16 min | 20 | 5 |
| mar. 10 mars | révisions | 6 min | 9 | 2 |
| mer. 11 mars | rien | 0 | 0 | 0 |
| jeu. 12 mars (aujourd'hui) | révisions + entraînement | 15 min | 24 | 3 |

Ce que la page doit afficher le jeudi 12 mars :

| Indicateur | Valeur attendue |
|---|---|
| Aujourd'hui | 15 / 15 min ✓ |
| Série | 1 jour (mercredi manqué ; lundi atteint, mardi non) |
| Points des 4 jours | lun. ● · mar. ◐ · mer. ○ · jeu. ● |
| Taux de réussite du cours 5 (14 jours) | (53 − 10) / 53 = 81 % : pas dans « À retravailler » |

Autres cas :

| Situation | Attendu |
|---|---|
| Cours 4 : 10 réponses sur 14 jours, 6 justes (60 %) | dans « À retravailler », avec ⚠ dans le module |
| Cours 3 : 4 réponses sur 14 jours, 1 juste | pas dans « À retravailler » (moins de 5 réponses) |
| Cours 5 : 90 % de réussite, mais 2 révisions ratées d'affilée | dans « À retravailler » |
| 4 cours en difficulté | les 3 plus faibles affichés |
| 3 révisions en attente depuis lundi, 1 depuis mercredi | « 4 en attente · la plus ancienne : lundi » |
| Aucune révision en attente | « Révisions à jour ✓ » |
| 21 jours avec objectif atteint sur les 28 derniers | « Objectif atteint 21 jours sur 28 » |
| Module « Calculs » : cours 0 à 4 validés, 5 en cours, 6 et 7 pas commencés | accueil : « Calculs 5 / 8 cours » ; module : 6 et 7 « 🔒 pas commencé », 5 « en cours » |
