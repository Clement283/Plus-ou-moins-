# 03 — Clavier maths et réponses acceptées

*Statut : à valider*

## 1. Le clavier

Le clavier du téléphone ne s'ouvre jamais. À sa place, l'appli affiche son propre clavier maths, toujours au même endroit, en bas de l'écran.

```
┌───────┬───────┬───────┬───────┐
│   7   │   8   │   9   │   ⌫   │
├───────┼───────┼───────┼───────┤
│   4   │   5   │   6   │   −   │
├───────┼───────┼───────┼───────┤
│   1   │   2   │   3   │  a/b  │
├───────┴───────┼───────┴───────┤
│       0       │    Valider    │
└───────────────┴───────────────┘
```

- **Chiffres de 0 à 9.**
- **−** : met un signe moins devant le nombre en cours. Un deuxième appui l'enlève.
- **a/b** : transforme le nombre tapé en **numérateur** d'une fraction, puis le curseur passe au **dénominateur**. La fraction s'affiche **empilée, comme sur une copie** (numérateur au-dessus, barre, dénominateur en dessous).
- **⌫** : efface le dernier caractère. Sur un dénominateur vide, il revient au numérateur.
- **Valider** : envoie la réponse. Le bouton est **grisé tant que la réponse est incomplète**.
- La zone de réponse s'affiche **dans l'écriture normale d'une copie**, sans couleur ni signe agrandi.
- **Pas de virgule** : il n'y a pas de nombres décimaux dans le module 1.

*Pourquoi une touche « − » qui s'ajoute devant le nombre :* elle écrit le signe à l'endroit où elle l'écrirait sur sa copie, mais elle ne peut pas mettre un « − » au milieu d'un nombre par erreur.

## 2. Comment on tape

| Pour obtenir | Elle tape |
|---|---|
| −8 | `−` `8`, ou `8` `−` (le signe se place toujours devant) |
| 12 | `1` `2` |
| −2/3 | `−` `2` `a/b` `3` |
| 2/(−3) | `2` `a/b` `−` `3` (le signe se met sur le dénominateur) |

Règles de saisie :
- **Pas de zéro inutile au début** : taper `0` puis `7` donne `7`.
- **6 chiffres maximum** par nombre (numérateur ou dénominateur).

## 3. Quelles réponses sont acceptées

Dans les cours « Relatifs », toutes les réponses attendues sont des **nombres entiers**.

| Réponse tapée | Bonne réponse | Accepté ? | Message |
|---|---|---|---|
| −8 | −8 | ✅ | — |
| 8 | −8 | ❌ | erreur reconnue (voir les explications de chaque cours) |
| −0 | 0 | ✅ | « Juste ! On écrit simplement 0. » |
| −12/4 | −3 | ❌ | « Le calcul n'est pas fini : simplifie. » Ce n'est **pas** compté comme une erreur de calcul : elle peut corriger et revalider. |
| 6/2 | 3 | ❌ | même chose : « Simplifie. » |
| (vide) | — | Valider grisé | — |
| `−` seul | — | Valider grisé | — |
| 5/ (dénominateur vide) | — | Valider grisé | — |
| 5/0 | — | Valider grisé | « Le dénominateur ne peut pas être 0. » |

*Pourquoi refuser −12/4 :* dans le cours « diviser », écrire −12/4, c'est ne pas faire la division. En contrôle, on attend −3.

**Pour les cours de fractions** (étapes suivantes), il faudra choisir si la forme simplifiée est exigée. Je proposerai à ce moment-là : simplifiée exigée, et −2/3 comme 2/(−3) acceptés, avec le message « On écrit plutôt −2/3 ». Ce sera validé avec ces cours.

## 4. Les étiquettes à remettre dans l'ordre

```
  Ta réponse :  [ 5 ] [ + ] [   ] [   ]

  Étiquettes :  [ 3 ]  [ − ]  [ + ]  [ 5 ]
```

- **Toucher une étiquette** la place à la fin de la ligne réponse.
- **Toucher une étiquette déjà placée** la renvoie dans la réserve.
- **Valider** devient actif quand toutes les étiquettes nécessaires sont placées.
- Il peut y avoir des **étiquettes en trop**, qui servent de pièges. Il faut alors en placer exactement le bon nombre.

*Pourquoi toucher plutôt que glisser :* glisser des petits éléments sur un téléphone est imprécis et frustrant. Toucher est rapide et fiable, et c'est aussi le fonctionnement de Babbel et Duolingo.

## Exemples

| Touches | Affiché | Bonne réponse | Résultat |
|---|---|---|---|
| `8` `−` | −8 | −8 | ✅ juste |
| `−` `8` | −8 | −8 | ✅ juste |
| `−` `−` `8` | 8 | −8 | ❌ faux |
| `0` `7` | 7 | 7 | ✅ juste |
| `−` `0` | −0 | 0 | ✅ juste, avec « On écrit simplement 0. » |
| `1` `2` `a/b` `4` `−` | −12/4 | −3 | ❌ « Simplifie. » (pas compté faux) |
| `5` `a/b` | 5/▢ | — | Valider grisé |
| `5` `a/b` `0` | 5/0 | — | Valider grisé + message |
| `3` `a/b` `⌫` | 3 | 3 | ✅ juste (⌫ revient au numérateur) |
| (rien) | ▢ | — | Valider grisé |
| `1` `2` `3` `4` `5` `6` `7` | 123456 | — | le 7 est ignoré (6 chiffres max) |
