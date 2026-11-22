# 02 — Objectif du jour et liste des révisions

*Statut : à valider (version 3)*

Ce document décrit comment on compte les 15 minutes, comment les révisions dues sont proposées, et ce que montre l'écran d'accueil. Ce sont des propositions de Claude, avec leur raison.

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
- La répartition de référence est de **5 minutes de révisions et 10 minutes de cours**. Elle n'est pas imposée, et le temps de cours n'est jamais limité.

## 3. Les révisions : une liste, sans calcul de dosage

*Décision du porteur du projet : pas de formule liée au temps de cours. Le temps de cours n'est jamais limité, et chaque cours dû donne simplement 3 questions de révision.*

**La liste des révisions.** Chaque cours terminé a **sa date de prochaine révision**, enregistrée une fois pour toutes. Elle n'est modifiée qu'à deux moments : quand le cours est validé, et quand une révision de ce cours est faite (doc 01). **On ne recalcule rien chaque jour** : pour savoir ce qui est dû, l'appli lit simplement la liste et prend les cours dont la date est arrivée ou passée.

**Un cours dû = 3 questions.** C'est tout.

**Les séances de révision.** Les cours dus sont proposés par **séances courtes de 5 cours au maximum**, soit 15 questions et environ 5 minutes.
- Dans une séance, les questions des différents cours sont **entremêlées** au hasard, et non regroupées par cours. Elle doit reconnaître seule quelle règle appliquer, comme en contrôle.
- Après une séance, s'il reste des cours dus, le bouton **« Encore des révisions »** lance la séance suivante. Elle peut enchaîner autant de séances qu'elle veut.
- Elle peut aussi s'arrêter : les cours dus restants le restent, et ils passent en priorité les jours suivants.
- *Pourquoi 5 cours par séance (ma proposition) :* une séance reste courte et motivante, même après une absence. Ça correspond aux « 5 minutes de révisions » de la répartition de référence.

## 4. Dans quel ordre on prend les cours dus

Quand il y a plus de 5 cours dus, chaque séance prend en premier :

1. les cours dont la **dernière révision a été ratée** ;
2. puis ceux qui ont **le plus de retard** (date prévue la plus ancienne : « premier arrivé, premier servi ») ;
3. à égalité, ceux à l'**étape la plus basse** de l'échelle (les moins solides).

## 5. Ce qu'on ne peut pas faire

- **Réviser en avance** un cours qui n'est pas encore dû. *Pourquoi :* ça casserait l'espacement. Pour pratiquer quand même, il y a l'**entraînement**.
- **Réviser deux fois le même cours le même jour.** Après une révision, juste ou ratée, sa prochaine date est au plus tôt le lendemain (doc 01).

Quand il ne reste plus aucun cours dû, la carte « Révisions » affiche « Révisions faites ✓ », et l'appli propose l'entraînement.

## 6. L'écran d'accueil

```
┌──────────────────────────────┐
│  Aujourd'hui   ▓▓▓▓▓░░░  8 / 15 min │
│                              │
│  ┌────────────────────────┐  │
│  │ Révisions du jour       │  │  ← mise en avant quand il y en a
│  │ 5 cours · 15 questions  │  │
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
- Après une séance, la carte propose « Encore des révisions » s'il reste des cours dus, puis devient « Révisions faites ✓ ».
- **« Mes cours »** montre la liste des cours avec leurs étoiles. Elle peut y relire une leçon à tout moment.

## Exemples

| Cours dus aujourd'hui | Séances proposées | Détail |
|---|---|---|
| 0 | aucune | « Révisions faites ✓ » + entraînement proposé |
| 3 | 1 séance | 3 cours, 9 questions |
| 5 | 1 séance | 5 cours, 15 questions |
| 7 | 2 séances | 5 cours (15 questions), puis 2 cours (6 questions) via « Encore des révisions » |
| 12 (retour après une absence) | 3 séances | 5 + 5 + 2 cours |
| 12, elle s'arrête après la 1re séance | — | les 7 restants sont toujours dus demain, et passent avant les nouveaux |
| 7 dus dont 1 raté hier | 2 séances | le cours raté est dans la 1re séance |
| Cours révisé ce matin (raté) | — | pas de nouvelle révision de ce cours aujourd'hui ; dû demain |
| 2 h de cours aujourd'hui | — | le temps de cours n'est jamais limité ; chaque cours validé entre dans la liste, avec sa 1re révision dans 48 h |

Comptage du temps :

| Situation | Temps compté |
|---|---|
| Question affichée, réponse 40 s plus tard | 40 s |
| Question affichée, téléphone posé, réponse 10 min plus tard | 2 min |
| Explication de leçon lue pendant 1 min 30 | 1 min 30 |
| Appli en arrière-plan 5 min au milieu d'une question | ces 5 min ne comptent pas |
| Réponse à 23 h 59, puis à 0 h 01 (heure de Paris) | la 1re compte pour hier, la 2e pour aujourd'hui |
