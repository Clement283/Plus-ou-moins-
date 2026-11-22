# 03 — Clavier maths, réponses acceptées et types d'exercices

*Statut : Validé (2026-11-22) — version 3*

## 1. Le principe : tout est manuel, rien n'est corrigé automatiquement

*Règle du porteur du projet :* l'appli **ne modifie jamais ce qu'elle tape**. Une faute corrigée automatiquement sur le téléphone est une faute qu'elle ne voit pas, et qu'elle refera sur sa copie. Donc :

- chaque touche ajoute **exactement un caractère, à la fin**, dans l'ordre tapé ;
- **aucun déplacement de signe**, aucun zéro retiré, aucune parenthèse ajoutée ou fermée, aucune mise en forme ;
- c'est **le texte brut** qui est corrigé. Les fautes d'écriture (moins après le nombre, parenthèse oubliée…) sont des **erreurs reconnues**, avec leur explication (§3).

Même règle pour les touches des modules suivants (carré, racine…) : elles s'ajouteront comme de simples caractères.

## 2. Le clavier

Le clavier du téléphone ne s'ouvre jamais. À sa place, l'appli affiche son propre clavier maths, toujours au même endroit, en bas de l'écran.

```
┌───────┬───────┬───────┬───────┐
│   7   │   8   │   9   │   ⌫   │
├───────┼───────┼───────┼───────┤
│   4   │   5   │   6   │   −   │
├───────┼───────┼───────┼───────┤
│   1   │   2   │   3   │   /   │
├───────┼───────┼───────┼───────┤
│   (   │   0   │   )   │Valider│
└───────┴───────┴───────┴───────┘
```

- **0 à 9, −, /, ( et )** : chaque touche écrit son caractère à la fin de la réponse.
- **⌫** : efface le dernier caractère.
- **Valider** : envoie la réponse telle quelle. Il est actif dès qu'il y a **au moins un caractère**. On ne grise pas une réponse « mal écrite » : ce serait une aide qu'elle n'a pas sur sa copie.
- La réponse s'affiche **exactement comme tapée**, sur une ligne, dans l'écriture normale d'une copie, sans couleur ni signe agrandi. Une fraction s'écrit donc en ligne : −2/3.
- **Pas de virgule** : il n'y a pas de nombres décimaux dans le module 1.
- Au plus **12 caractères**, pour que la réponse tienne à l'écran. Les touches suivantes sont sans effet.

## 3. Comment la réponse est corrigée

Dans les cours « Relatifs », toutes les réponses attendues sont des **nombres entiers**. On lit le texte brut :

**Écritures acceptées** (juste) :
| Tapé | Bonne réponse | Résultat |
|---|---|---|
| −8 | −8 | ✅ |
| (−8) | −8 | ✅ (écriture correcte, même si les parenthèses sont inutiles) |
| −0 | 0 | ✅ avec « On écrit simplement 0. » |
| 07 | 7 | ✅ avec « On écrit simplement 7. » |

**Calcul pas fini** (pas compté faux, elle peut corriger et revalider) :
| Tapé | Bonne réponse | Message |
|---|---|---|
| −12/4 | −3 | « Le calcul n'est pas fini : simplifie. » |
| 6/2 | 3 | « Simplifie. » |

*Pourquoi :* dans le cours « diviser », écrire −12/4, c'est ne pas faire la division. En contrôle, on attend −3.

**Erreurs d'écriture** (comptées fausses, avec leur explication, valables dans **tous les cours**) :
| Identifiant | Exemple tapé | Explication affichée |
|---|---|---|
| `moins-apres` | 3− | « Le signe moins s'écrit **avant** le nombre : −3. » |
| `double-signe` | −−3 | « Il y a deux signes moins à la suite. Un nombre n'a qu'un signe : −3 ou 3. » |
| `parenthese` | (−3 ou −3) | « Une parenthèse ouverte doit être fermée, et une parenthèse fermée doit avoir été ouverte. » |
| `ecriture-invalide` | 5/0, /, −, 3(4 | « Cette réponse n'est pas un nombre bien écrit. » (pour 5/0 : « On ne divise jamais par 0. ») |

- **L'ordre de vérification :** d'abord l'écriture. Si la réponse est mal écrite, c'est une erreur d'écriture, et on ne cherche pas d'erreur de calcul. Sinon, on compare la valeur à la bonne réponse, puis on cherche l'erreur de calcul du cours (doc 06).
- Exemple : la bonne réponse est −3 et elle tape « 3− ». C'est `moins-apres`, pas une erreur de signe de calcul : elle avait le bon résultat, mais mal écrit.
- **Sur ta page de suivi**, ces erreurs forment une famille **« écriture »**, séparée de la famille « signe ».

**Pour les cours de fractions** (étapes suivantes), il faudra choisir si la forme simplifiée est exigée, et comment traiter 2/(−3). Je ferai une proposition avec ces cours.

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

## 5. Les types d'exercices et où on les utilise

Ces 8 types servent **pour tous les modules**, pas seulement pour les relatifs.

| Type | Comment on répond | Leçon | Exercices de fin | Révisions | Entraînement |
|---|---|---|---|---|---|
| **Réponse écrite** | clavier maths (§1) | ✓ | ✓ | | ✓ |
| **Compléter le trou** (−3 + ▢ = 5) | clavier maths, dans la case | ✓ | ✓ | | ✓ |
| **Étiquettes à ordonner** | toucher pour placer (§4) | ✓ | | | ✓ |
| **Trouver l'erreur** | une résolution en plusieurs lignes ; toucher la ligne fausse | ✓ | | | ✓ |
| **Relier les paires** | 4 calculs à gauche, 4 résultats à droite (dans le désordre) ; toucher un calcul puis son résultat ; une paire juste se grise | ✓ | | | ✓ |
| **Classer** | des éléments à ranger dans 2 ou 3 cases (ex. résultat + / − / 0) ; toucher l'élément puis la case | ✓ | | ✓ | ✓ |
| **QCM** | toucher un des 4 choix (doc 04) | | | ✓ | ✓ |
| **Vrai ou faux** | deux gros boutons « Vrai » et « Faux » | | | ✓ | ✓ |

- **Les exercices de fin de cours** n'utilisent que la réponse écrite et le trou à compléter : sans aide, comme en contrôle.
- **Les révisions** n'utilisent que des formats rapides.
- **La leçon et l'entraînement** utilisent la variété, pour apprendre et pour le plaisir.
- **Juste ou faux, pour les exercices à plusieurs éléments :** « Relier les paires » et « Classer » sont justes seulement si **tout** est juste. Un élément mal placé est montré, et c'est l'erreur reconnue de ce calcul qui est enregistrée.
- **La droite graduée** n'est pas un type d'exercice. C'est une image d'explication dans certaines leçons.

## Exemples

| Touches | Affiché | Bonne réponse | Résultat |
|---|---|---|---|
| `−` `8` | −8 | −8 | ✅ juste |
| `8` `−` | 8− | −8 | ❌ `moins-apres` |
| `−` `−` `8` | −−8 | −8 | ❌ `double-signe` |
| `8` | 8 | −8 | ❌ erreur de calcul du cours (ex. `signe-oublie`) |
| `(` `−` `8` `)` | (−8) | −8 | ✅ juste |
| `(` `−` `8` | (−8 | −8 | ❌ `parenthese` |
| `0` `7` | 07 | 7 | ✅ juste, avec « On écrit simplement 7. » |
| `−` `0` | −0 | 0 | ✅ juste, avec « On écrit simplement 0. » |
| `−` `1` `2` `/` `4` | −12/4 | −3 | « Simplifie. » (pas compté faux) |
| `5` `/` `0` | 5/0 | 5 | ❌ `ecriture-invalide` (« On ne divise jamais par 0. ») |
| `−` | − | −3 | ❌ `ecriture-invalide` |
| `3` `⌫` `4` | 4 | 4 | ✅ juste |
| (rien) | | — | Valider grisé |
| 13 touches | les 12 premiers caractères | — | la 13e touche est sans effet |
