# 04 — Fabrication des exercices : les règles de tous les types d'exercices

*Statut : Validé (2026-11-22) — version 3*

Ce document est **la règle de référence pour tous les types d'exercices**, dans tous les modules. Chaque chapitre décrit un type : à quoi il sert, ce qu'elle voit, comment l'appli le fabrique, ce qui est interdit, comment on décide si c'est juste et quelle erreur on enregistre. Chaque chapitre se termine par des exemples qui deviendront les tests automatiques.

---

## 0. Règles communes à tous les exercices

- **Où chaque type est utilisé** : voir le tableau du doc 03 §5 (leçon, exercices de fin de cours, révisions, entraînement).
- **Fabriqué à partir du cours.** Chaque cours fournit :
  - un **générateur de calculs par niveau** ;
  - ses **erreurs reconnues**, avec leur détection, leur explication et leur calcul-piège ;
  - une **résolution type** : les lignes d'une résolution correcte, utilisées par « Trouver l'erreur » et « Étiquettes » (doc 06).

  Tous les exercices sont fabriqués avec ces ingrédients. Il n'y a rien à écrire à la main pour l'entraînement et les révisions.
- **Seule la première réponse compte** (doc 01 §6). Une question ratée repasse plus loin, avec le bouton « Passer » à partir du 2e échec.
- **Chaque réponse fausse enregistre une erreur** : une erreur reconnue du cours, une erreur d'écriture (doc 03), ou « autre ».
- **Après une erreur** : la bonne réponse et l'explication, avec des couleurs et des étapes (doc 06).
- **Affichage :** les calculs s'affichent **comme sur une copie** (notation normale, fractions empilées, sans couleur) dans les exercices, l'entraînement et les révisions. Les couleurs et animations sont réservées aux leçons et aux explications.
- **Toujours vérifié avant d'afficher un exercice :**
  - une seule bonne réponse possible ;
  - pas de doublon parmi les choix ou les étiquettes ;
  - des nombres qui restent dans ceux du niveau ;
  - pas de division par 0.

  Si un tirage ne respecte pas ces règles, l'appli en refait un autre.

---

## 1. Réponse écrite

**À quoi ça sert :** faire le calcul seule, sans aide, comme sur une copie.

**Ce qu'elle voit**
```
        −3 × (−4) = ▢
  [ clavier maths du doc 03 ]
```

**Comment on le fabrique :** un calcul tiré par le générateur du cours, au niveau demandé. Pendant une révision ou quand une erreur est fréquente, on utilise le calcul-piège.

**Juste ou faux :** la réponse tapée est lue telle quelle (doc 03 §3), dans cet ordre :
1. l'écriture : une erreur d'écriture éventuelle ;
2. la valeur : juste, ou « Simplifie » ;
3. si c'est faux : l'erreur reconnue du cours (doc 06), sinon « autre ».

**Exemples**
| Calcul | Tapé | Résultat | Erreur enregistrée |
|---|---|---|---|
| −3 × (−4) | 12 | ✅ | — |
| −3 × (−4) | −12 | ❌ | `regle-signes` |
| −3 × (−4) | 12− | ❌ | `moins-apres` |
| −12 ÷ 4 | −12 sur 4 (fraction) | « Simplifie » | aucune (elle corrige) |
| −3 × (−4) | 11 | ❌ | autre |

---

## 2. Compléter le trou

**À quoi ça sert :** raisonner à l'envers et vérifier qu'elle comprend la règle, pas seulement la recette.

**Ce qu'elle voit**
```
        −3 + ▢ = 5
  [ clavier maths ]
```

**Comment on le fabrique :**
- on tire un calcul du cours, puis on cache **un des nombres du calcul** (pas le résultat) ;
- on cache, au hasard, le 1er nombre, le 2e, ou un autre terme s'il y en a plus.

**Interdits :**
- un trou qui aurait **plusieurs réponses** possibles. Par exemple 0 × ▢ = 0 : on ne cache jamais un nombre multiplié par 0 ;
- une réponse en dehors des nombres du niveau ;
- dans le cours « diviser », un trou dont la réponse n'est pas un entier.

**Juste ou faux :** même lecture que la réponse écrite. Si c'est faux et que la réponse est l'**opposé** du nombre caché, on enregistre l'erreur de signe du cours (celle marquée 🔴 dans le doc 06). Sinon, c'est « autre ».

**Exemples**
| Affiché | Bonne réponse | Tapé | Erreur enregistrée |
|---|---|---|---|
| −3 + ▢ = 5 | 8 | 8 | — |
| −3 + ▢ = 5 | 8 | −8 | erreur de signe du cours 2 |
| ▢ × (−4) = 12 | −3 | 3 | `regle-signes` |
| 5 − ▢ = 8 | −3 | 3 | `signe-inverse` (cours 4) |
| −12 ÷ ▢ = −3 | 4 | 6 | autre |

Règles vérifiées sur 1 000 tirages : une seule réponse possible ; la réponse est dans les nombres du niveau.

---

## 3. Étiquettes à ordonner

**À quoi ça sert :** retrouver l'ordre des étapes d'une méthode, ou reconstruire une écriture. On apprend le chemin, pas seulement le résultat.

**Ce qu'elle voit**
```
  Remets les étapes dans l'ordre :   −3 × (−4)

  Ta réponse :  [ ] [ ] [ ]

  [ = 12 ]  [ = +(3 × 4) ]  [ = −12 ]  [ −3 × (−4) ]
```

**Comment on le fabrique**
- **Dans les leçons :** les étiquettes sont écrites à la main, dans le doc 06.
- **En entraînement :** on prend la **résolution type** du cours, appliquée à un calcul tiré au hasard. Chaque ligne devient une étiquette, et les étiquettes sont mélangées.
- **À partir du 3e passage** sur ce cours en entraînement, on ajoute **1 étiquette piège** : une ligne fausse produite par une erreur reconnue du cours. C'est le « = −12 » de l'exemple.

**Interdits :**
- deux étiquettes avec le même texte, sauf si leur ordre n'a pas d'importance (elles sont alors interchangeables) ;
- une étiquette piège qui serait aussi juste.

**Juste ou faux :** c'est juste si les étiquettes placées sont **exactement** les bonnes, **dans le bon ordre**. On compare les textes, pas les positions.
- Si l'étiquette piège a été placée : on enregistre l'**erreur qui l'a produite**.
- Si toutes les bonnes étiquettes sont là mais dans le désordre : on enregistre `ordre-etapes`, avec l'explication « Relis la méthode : d'abord …, puis …, enfin … ».

**Exemples**
| Calcul | Placé | Résultat | Erreur enregistrée |
|---|---|---|---|
| −3 × (−4) | −3 × (−4) · = +(3 × 4) · = 12 | ✅ | — |
| −3 × (−4) | −3 × (−4) · = 12 · = +(3 × 4) | ❌ | `ordre-etapes` |
| −3 × (−4) | −3 × (−4) · = +(3 × 4) · = −12 | ❌ | `regle-signes` (étiquette piège) |
| 5 − (−3) | 5 − (−3) · = 5 + 3 · = 8 | ✅ | — |

---

## 4. Trouver l'erreur

**À quoi ça sert :** **se relire**. C'est exactement ce qui lui coûte des points en contrôle : la méthode est juste, mais un signe dérape.

**Ce qu'elle voit**
```
  Une ligne est fausse. Touche-la.

     −3 × (−4)
   = −(3 × 4)      ← elle touche cette ligne
   = −12

  [ Tout est juste ]
```

**Comment on le fabrique :**
- on prend la **résolution type** du cours sur un calcul tiré au hasard ;
- on choisit une erreur reconnue du cours et on la fait apparaître sur **une ligne**. Les lignes suivantes **continuent avec l'erreur**, comme le ferait un élève qui s'est trompé.

  Il faut donc toucher **la première ligne fausse**.
- **1 fois sur 5**, la résolution est **entièrement juste**, et la bonne réponse est le bouton « **Tout est juste** ».

  *Pourquoi :* sinon, elle saurait qu'il y a toujours une erreur, et chercherait au lieu de vraiment relire.

**Interdits :**
- une ligne « fausse » qui serait en fait juste ;
- deux erreurs indépendantes dans la même résolution.

**Juste ou faux :** c'est juste si elle touche la première ligne fausse, ou « Tout est juste » quand tout est juste.
- Si c'est faux, on enregistre l'**erreur qu'elle n'a pas repérée**.
- Si elle a touché « Tout est juste » alors qu'il y avait une erreur, ou une ligne alors que tout était juste, on enregistre `relecture`.

Après la réponse, on montre la ligne fausse corrigée, en couleur.

**Exemples**
| Résolution affichée | Bonne réponse | Elle touche | Erreur enregistrée |
|---|---|---|---|
| −3 × (−4) / = −(3 × 4) / = −12 | ligne 2 | ligne 2 | — |
| −3 × (−4) / = −(3 × 4) / = −12 | ligne 2 | ligne 3 | `regle-signes` |
| 5 − (−3) / = 5 − 3 / = 2 | ligne 2 | ligne 2 | — |
| 5 − (−3) / = 5 + 3 / = 8 | « Tout est juste » | ligne 3 | `relecture` |
| −2 + 5 + (−4) / = 5 + (−2) + (−4) / = 5 + (−6) / = 1 | ligne 4 | « Tout est juste » | `relecture` |

Règle vérifiée sur 1 000 tirages : environ 1 résolution sur 5 entièrement juste (entre 15 % et 25 %).

---

## 5. Relier les paires

**À quoi ça sert :** enchaîner plusieurs petits calculs vite, de façon ludique.

**Ce qu'elle voit**
```
   −3 × (−4)           −9
   6 × (−2)            12
   −5 × (−2)           10
   3 × (−3)           −12
```

**Comment on le fabrique :**
- **4 calculs** du même cours, au niveau demandé ;
- leurs 4 résultats sont mélangés dans la colonne de droite ;
- elle touche un calcul, puis son résultat. Une paire juste se grise.

**Interdits :** deux résultats égaux. Les 4 résultats doivent être **tous différents**.

**Juste ou faux :**
- **chaque paire** est une réponse. Une paire fausse est montrée, puis elle réessaie ;
- l'exercice compte comme **juste** si les 4 paires sont justes du premier coup ;
- pour une paire fausse, on cherche l'erreur reconnue avec le **résultat qu'elle a choisi** pour ce calcul.

**Exemples**
| Calcul | Résultat choisi | Erreur enregistrée |
|---|---|---|
| −3 × (−4) | 12 | — |
| −3 × (−4) | −12 | `regle-signes` |
| 6 × (−2) | 10 | autre |

Règle vérifiée sur 1 000 tirages : 4 résultats tous différents.

---

## 6. Classer

**À quoi ça sert :** reconnaître vite une propriété **sans faire tout le calcul**. Pour les relatifs, c'est le signe du résultat. Pour d'autres modules, ce sera d'autres cases (par exemple Δ > 0, Δ = 0, Δ < 0).

**Ce qu'elle voit**
```
   Range chaque calcul :

   −2 × 3    −4 × (−5)    7 × (−1)    2 × 8

   [ Résultat + ]   [ Résultat − ]
```

**Comment on le fabrique :**
- **4 calculs** du cours, au niveau demandé ;
- les cases sont définies par le cours. Pour les 7 cours « Relatifs » : **+ / − / 0**. La case « 0 » n'apparaît que si un des calculs vaut 0 ;
- au moins un calcul dans chaque case affichée.

**Juste ou faux :**
- l'exercice compte comme **juste** si les 4 calculs sont bien rangés du premier coup ;
- un calcul mal rangé est montré, et on enregistre l'erreur de signe du cours (🔴).

**Exemples**
| Calculs | Rangement attendu |
|---|---|
| −2 × 3 · −4 × (−5) · 7 × (−1) · 2 × 8 | − · + · − · + |
| −3 + 5 · 4 + (−9) · −6 + 6 · −1 + (−2) | + · − · 0 · − (case « 0 » affichée) |

Règle vérifiée sur 1 000 tirages : 4 calculs, au moins un dans chaque case affichée.

---

## 7. QCM

**À quoi ça sert :** vérifier vite qu'une règle est acquise (révisions, entraînement).

### 7.1 Le principe

- **4 choix** : la bonne réponse et 3 **pièges**, dans un ordre mélangé à chaque question.
- Jamais deux fois la même valeur, et la bonne réponse n'est jamais parmi les pièges.
- **Deux sortes de pièges :**
  - **piège typique** : le résultat d'une erreur reconnue du cours ;
  - **piège non typique** : une valeur plausible, qui ne correspond à aucune erreur précise.
- **Chaque choix est relié à une erreur** : un piège typique enregistre l'erreur correspondante, un piège non typique enregistre « autre ».

### 7.2 Comment le mélange évolue

**Au début (moins de 5 QCM sur ce cours)** : la bonne réponse, **2 pièges typiques** et 1 piège non typique.

**Ensuite**, au hasard, une fois sur deux :
- **« paires de signes »** : la bonne réponse, **son opposé**, un autre nombre **et son opposé**. Par exemple 9, −9, 6, −6. Elle doit trouver la valeur **et** le signe ;
- **« mélangée »** : la bonne réponse, 1 piège typique et 2 pièges non typiques. L'opposé n'est pas forcément là.

S'il manque des pièges typiques, on complète avec des pièges non typiques.

### 7.3 Les pièges non typiques

- **Même ordre de grandeur :**
  - réponse entre −20 et 20 : ±1, ±2 ou ±3 ;
  - au-delà : ±10 %, ±20 % ou quelques dizaines, arrondis à un entier.
- **Signe :** celui de la bonne réponse une fois sur deux, l'autre sinon (imposé en « paires de signes »).
- **Entiers** si la réponse est entière.
- **Pas de 0**, sauf si la réponse est entre −3 et 3.

### 7.4 Exemples

| Calcul | Bonne réponse | QCM déjà vus | Formule | Choix (avant mélange) et erreur reliée |
|---|---|---|---|---|
| −3 × (−3) | 9 | 0 | début | 9 ✓ · −9 *règle des signes* · 6 *addition au lieu de multiplication* · 8 *autre* |
| −3 × (−3) | 9 | 7 | paires de signes | 9 ✓ · −9 *règle des signes* · 6 *addition* · −6 *addition* |
| −3 × (−3) | 9 | 7 | mélangée | 9 ✓ · −6 *addition* · 11 *autre* · 7 *autre* |
| −3 + (−5) | −8 | 2 | début | −8 ✓ · 8 *signe oublié* · −2 *soustraction au lieu d'addition* · −7 *autre* |
| −3 + 5 | 2 | 10 | paires de signes | 2 ✓ · −2 *signe du mauvais nombre* · 8 *addition au lieu de soustraction* · −8 *idem* |
| 5 − (−3) | 8 | 10 | mélangée | 8 ✓ · 2 *opposé oublié* · 11 *autre* · −9 *autre* |
| −248 + 75 | −173 | 12 | mélangée | −173 ✓ · 173 *signe du mauvais nombre* · −190 *autre* · 156 *autre* |
| −7 + 7 | 0 | 0 | début | 0 ✓ · −14 *addition au lieu de soustraction* · 14 *idem* · 1 *autre* |

Règles vérifiées sur 1 000 QCM : toujours 4 choix ; la bonne réponse exactement une fois ; aucun doublon ; tous entiers si la réponse est entière ; en « paires de signes », chaque choix a son opposé (sauf 0).

---

## 8. Vrai ou faux

**À quoi ça sert :** un contrôle éclair, en une seconde.

**Ce qu'elle voit**
```
        −3 × (−4) = −12

     [ Vrai ]      [ Faux ]
```

**Comment on le fabrique :**
- une fois sur deux, le résultat affiché est le **bon** (réponse : Vrai) ;
- sinon, c'est un **piège**, choisi comme pour le QCM : typique au début, puis mélange.

**Juste ou faux :** si elle répond « Vrai » à un résultat faux, on enregistre l'erreur reliée au piège. Si elle répond « Faux » à un résultat juste, on enregistre « autre ».

**Exemples**
| Affiché | Bonne réponse | Elle répond | Erreur enregistrée |
|---|---|---|---|
| −3 × (−4) = 12 | Vrai | Vrai | — |
| −3 × (−4) = −12 | Faux | Vrai | `regle-signes` |
| −3 × (−4) = 12 | Vrai | Faux | autre |

Règle vérifiée sur 1 000 tirages : environ la moitié « Vrai » (entre 45 % et 55 %).

---

## 9. Comment une séance de révision choisit les formats

Pour chaque révision (3 questions d'un même cours) :
- surtout des **QCM** ;
- au plus **1 « Vrai ou faux »** ;
- au plus **1 « Classer »**, qui compte pour **une** des 3 questions.

*Pourquoi limiter le « Vrai ou faux » :* on peut tomber juste au hasard une fois sur deux.

| Vérification | Attendu |
|---|---|
| Une révision | 3 questions : au plus 1 vrai ou faux, au plus 1 classer, le reste en QCM |
