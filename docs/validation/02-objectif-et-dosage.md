# 02 — Objectif du jour et dosage des révisions

*Statut : à valider*

Ce document décrit comment on compte les 15 minutes, combien de révisions on lui propose chaque jour, et ce que montre l'écran d'accueil. Ce sont des propositions de Claude, avec leur raison.

## 1. Comment on compte le temps

- **On compte le temps passé sur chaque question**, de son affichage jusqu'à la réponse. Une question compte **au maximum 2 minutes**.
  *Pourquoi :* si elle pose le téléphone au milieu d'un calcul, on ne compte pas une demi-heure.
- **Les parties « explication » d'une leçon** comptent **au maximum 3 minutes** chacune.
- **Le chronomètre s'arrête** quand l'appli passe en arrière-plan (téléphone verrouillé, autre appli ouverte).
- Le temps est rangé dans trois catégories : **révisions**, **cours** (leçon, exemples, exercices de fin, rattrapage) et **entraînement**.
- Le jour commence et se termine à **minuit, heure de Paris**.

## 2. La jauge des 15 minutes

- La jauge se remplit avec **tout le temps de la journée**, toutes catégories confondues.
- À 15 minutes : **« Objectif atteint ! »**. Elle peut continuer, et la jauge affiche alors le temps en plus (par exemple 22 / 15 min).
- La répartition de référence est de **5 minutes de révisions et 10 minutes de cours**. Elle n'est pas imposée : elle sert à **doser le nombre de révisions** (voir §3).

## 3. Combien de révisions chaque jour : le lot du jour

Une révision = un cours révisé = 3 calculs en QCM. Elle prend **environ 1 minute**.

**Formule proposée :**

> **Temps de révisions du jour = la moitié du temps de cours de son dernier jour d'activité**, avec **au moins 5 minutes** et **au plus 20 minutes**.
> **Lot du jour** = autant de révisions que ce temps (1 révision ≈ 1 minute), sans dépasser le nombre de révisions dues.

- Avec 10 minutes de cours la veille, le lot fait **5 révisions** (5 min). C'est la règle validée : « 15 min par jour → 5 min de révisions le lendemain ».
- Avec 1 heure de cours la veille, le lot fait 30 révisions, ramenées à **20** par le plafond.
- Le **« dernier jour d'activité »** est le dernier jour où elle a fait des cours, avant aujourd'hui. *Pourquoi :* si elle ne fait rien le week-end, le lundi est dosé sur son vendredi, pas sur zéro.
- **Plafond de 20 minutes.** *Pourquoi :* même après une grosse journée, les révisions ne doivent pas devenir une corvée. Celles qui dépassent sont reportées.

## 4. Les révisions reportées

Quand plus de révisions sont dues que le lot du jour, celles en trop sont **reportées au lendemain**, jamais perdues. Le lot du jour prend en premier :

1. les cours dont la **dernière révision a été ratée** ;
2. puis ceux qui ont **le plus de retard** (date prévue la plus ancienne) ;
3. à égalité, ceux au **palier le plus bas** (les moins solides).

## 5. Les révisions en plus

Une fois le lot du jour terminé, un bouton **« Encore des révisions »** apparaît s'il reste des révisions reportées. Elles comptent normalement : palier, dates, statistiques. S'il n'en reste aucune, l'appli propose plutôt l'**entraînement**.

*On ne peut pas réviser en avance un cours qui n'est pas encore dû.* *Pourquoi :* ça casserait l'espacement. Pour pratiquer quand même, il y a l'entraînement.

## 6. L'écran d'accueil

```
┌──────────────────────────────┐
│  Aujourd'hui   ▓▓▓▓▓░░░  8 / 15 min │
│                              │
│  ┌────────────────────────┐  │
│  │ Révisions du jour       │  │  ← mise en avant quand il y en a
│  │ 5 révisions · ~5 min    │  │
│  │        [ Réviser ]      │  │
│  └────────────────────────┘  │
│                              │
│  Prochain cours              │
│  Cours 4 · Soustraire        │
│        [ Commencer ]          │  ← toujours accessible
│                              │
│  [ Entraînement ]  [ Mes cours ★ ] │
└──────────────────────────────┘
```

- **Les révisions sont en haut** quand il y en a, mais le bouton du prochain cours reste **toujours actif** : elle peut sauter les révisions.
- Une fois le lot fait, la carte devient « Révisions faites ✓ », avec « Encore des révisions » s'il en reste.
- **« Mes cours »** montre la liste des cours avec leurs étoiles. Elle peut y relire une leçon à tout moment.

## Exemples

| Dernier jour d'activité : minutes de cours | Révisions dues aujourd'hui | Temps de révisions | Lot du jour | Reportées |
|---|---|---|---|---|
| 10 min (rythme de 15 min par jour) | 4 | 5 min | 4 | 0 |
| 10 min | 8 | 5 min | 5 | 3 |
| 4 min | 6 | 5 min (minimum) | 5 | 1 |
| 30 min | 12 | 15 min | 12 | 0 |
| 60 min | 25 | 20 min (plafond) | 20 | 5 |
| 2 h de cours | 25 | 20 min (plafond) | 20 | 5 |
| Absente 10 jours ; dernier jour : 10 min | 12 | 5 min | 5 | 7 |
| Tout premier jour, aucun cours fait | 0 | — | 0 | 0 |
| Aucun cours fait la veille (week-end) ; vendredi : 20 min | 9 | 10 min | 9 | 0 |

Comptage du temps :

| Situation | Temps compté |
|---|---|
| Question affichée, réponse 40 s plus tard | 40 s |
| Question affichée, téléphone posé, réponse 10 min plus tard | 2 min |
| Explication de leçon lue pendant 1 min 30 | 1 min 30 |
| Appli en arrière-plan 5 min au milieu d'une question | ces 5 min ne comptent pas |
| Réponse à 23 h 59, puis à 0 h 01 (heure de Paris) | la 1re compte pour hier, la 2e pour aujourd'hui |
