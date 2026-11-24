# 06 — Module 1 « Calculs » : contenu des cours de l'étape 1

*Statut : Validé (2026-11-22) — version 4*

## Les modules

- **Les cours sont regroupés en modules.** Chaque module a :
  - **un thème** (sa thématique) ;
  - **ses couleurs** (définies à l'étape design visuel) ;
  - **sa liste de cours, dans l'ordre**.
- **Un module se complète** : quand tous ses cours sont validés, il est **terminé**. Elle voit sa progression (par exemple « 5 / 8 cours ») et un badge à la fin.
- **Plus tard**, elle pourra **choisir ses modules** selon ce qu'elle fait en classe avec son prof : un module débloque son premier cours dès qu'elle le choisit. **Pour l'instant, un seul module est disponible : « Calculs ».**
- Les révisions mélangent les cours de **tous** les modules commencés.

## Module 1 « Calculs »

- **Thème :** les bases du calcul, sans lesquelles on perd des points partout (second degré, fractions, équations…).
- **Couleurs :** à définir à l'étape design visuel.
- **Cours de l'étape 1** (ce document) :
  - Cours 0 : Bien écrire un calcul (introduction du module) ;
  - Cours 1 à 7 : les relatifs.
- **Étapes suivantes** (même module) : priorités, fractions, carrés (spec §5).


## Règles communes à tous les cours (tous les modules)

**Ce qui vaut pour tous les cours :**
- **Intuitif, lisible et compréhensible.** Des phrases courtes, une idée par écran, une étape par ligne.
- **Des couleurs et des animations dans les leçons et les explications**, pour faire comprendre : nombres colorés, bonds qui s'animent sur une droite graduée, étapes qui apparaissent l'une après l'autre, flèches… Les **exercices, révisions et l'entraînement** sont écrits **comme sur une copie** : aucune couleur qui donne un indice avant la réponse ; après la réponse, vert = juste et rouge = faux (doc 08 n° 27).
- **Le déroulé est propre à chaque cours.** Un cours est une suite de parties : explications, questions de leçon, exemples guidés, exercices. Il peut alterner, par exemple « explication → exemple guidé → 2e explication → exemple guidé → exercices ». Ce qui ne change pas : un cours se **termine par 5 exercices de fin**, sans aide, qui servent à le valider (doc 01 §2).
- **Les niveaux sont propres à chaque cours.** Chaque cours dit ce qui rend son niveau 2 et son niveau 3 plus difficiles : des nombres plus grands, plus de termes, des fractions, des puissances, une inconnue… Le seul principe commun : **même méthode, plus difficile**. Une nouvelle méthode = un nouveau cours.
- **Chaque cours fournit :**
  - son générateur par niveau ;
  - ses erreurs reconnues, avec leur détection, leur explication et leur calcul-piège ;
  - sa **résolution type**, c'est-à-dire les lignes d'une résolution correcte, utilisées par « Trouver l'erreur » et les étiquettes d'entraînement (doc 04).

**Ce qui vaut pour les 7 cours « Relatifs » :**
- **Déroulé :** mini-leçon en 4 ou 5 parties, puis 2 exemples guidés, puis les 5 exercices de fin.
- **Niveaux :** pour ces cours, la difficulté vient de la taille des nombres. Niveau 1 : de 1 à 9 ; niveau 2 : des dizaines (ou plus de termes) ; niveau 3 : des centaines. *Ce choix est propre à ces cours, pas une règle générale.*
- **Écriture des calculs :** un nombre négatif est entre parenthèses, sauf s'il est le premier terme : −3 + (−5), 4 × (−7).
- **Aides visuelles des leçons :** négatifs en orange, positifs en bleu (jamais en rouge, réservé aux erreurs), droite graduée animée (doc 08 n° 27).
- **Erreurs reconnues :** chaque cours a sa liste. Une réponse fausse qui n'y correspond pas est classée **« autre »**, avec l'explication générale du cours. Quand une réponse pourrait correspondre à deux erreurs, on retient la première de la liste.
- **Famille signe** 🔴 : ces erreurs comptent, comme les autres, dans « Erreurs les plus communes » de ta page de suivi (doc 05).
- **Erreurs d'écriture** (moins après le nombre, double signe, parenthèse, écriture invalide) : communes à tous les cours (doc 03 §3), vérifiées **avant** les erreurs de calcul.
- **Exemples guidés à compléter :** chaque case vide (▢) est une petite réponse tapée, et elles s'enchaînent dans l'ordre. Une case « signe du résultat » se remplit avec deux gros boutons « + » et « − ».
- **Calcul-piège :** pour chaque erreur reconnue, la colonne « Calcul-piège » dit quel calcul tend ce piège, **sans sortir des nombres du niveau** (doc 01 §5).
- **Classer :** pour ces 7 cours, les cases sont **résultat + / − / 0**.

---

## Cours 0 — Bien écrire un calcul (introduction du module)

*Version 2 (2026-11-24), remplace la version 1. Maquette validée : `docs/design/ecrans/cours-0-v2.html`. Ce cours sert de **modèle** pour réécrire les cours 1 à 7 (voir doc 08, n° 20 à 31).*

**La règle :** *Un calcul s'écrit d'une seule façon correcte : il faut savoir le lire et l'écrire sans ambiguïté.*

**L'idée de départ :** le signe − a **deux rôles**, soustraire (7 − 3) ou dire qu'un nombre est négatif (−3). Les 4 règles servent à toujours savoir quel rôle joue chaque −.

**Les règles d'écriture enseignées**
1. **Deux signes ne se suivent jamais.** Après +, −, × ou ÷, un nombre négatif se met **entre parenthèses** : 4 × (−3), 5 + (−2), 7 − (−1), 8 ÷ (−4).
2. **En tête d'un calcul, pas de parenthèses** pour un négatif : −3 + 5. (−3) + 5 n'est pas faux mais inutile : dans ce cours, une réponse tapée « (−3) + 5 » compte **comme une faute** (doc 08 n° 25).
3. **Le signe − d'un nombre négatif s'écrit avant le nombre** : −3, jamais 3−.
4. **Une parenthèse ouverte se ferme** : (−3), jamais (−3 tout seul.

**Déroulé (20 écrans)**

Types d'écrans utilisés : **explication pas à pas** (une grande zone de calcul en haut qui se transforme à chaque « Suite », les phrases s'ajoutent dessous, bouton « Revoir » pour rejouer l'animation de l'étape) ; **petite question** (un toucher) ; **question pour deviner** (ne compte pas) ; Classer, Quelle règle ?, Réécris, Toucher la faute. Tout ce qu'on touche est en bas de l'écran.

*Leçon (12 écrans, pastille « Cours 0 · Leçon · étape N sur 12 »)*
1. **Accroche + deviner.** « En maths, un calcul doit se lire d'une seule façon. S'il est mal écrit, on peut se tromper même en connaissant la méthode. Dans ce cours, tu vas apprendre 4 règles d'écriture. » Question pour deviner : « Pour commencer, à ton avis : ce calcul est-il bien écrit ? 4 × −3 » [Oui] [Non]. Réponse attendue : Non. Retour : « Il est mal écrit. Ce n'est pas grave de ne pas le savoir encore : c'est justement ce que ce cours explique. »
2. **Explication « Le signe − a deux rôles »** (4 étapes). Rôle 1 : soustraire, 7 − 3 (« on enlève 3 à 7 »). Rôle 2 : dire qu'un nombre est négatif, −3 (« moins trois »). « Quand tu lis un calcul, tu dois toujours savoir quel rôle joue chaque −. Les 4 règles de ce cours servent à ça. »
3. **Petites questions (2).** « Dans 8 − 5, à quoi sert le − ? » [À soustraire] [À dire que 5 est négatif] → À soustraire. « Et dans −6 + 2 ? » → À dire que 6 est négatif.
4. **Explication règle 1** (5 étapes) : 4 × −3 ; les signes collés surlignés qui tremblent (« deux signes se touchent ») ; « Ce −, il soustrait ? Ou c'est le signe du 3 ? » ; les parenthèses arrivent, 4 × (−3) (« −3 est un seul nombre ») ; encadré Règle 1.
5. **Explication règle 1, exemples** (4 étapes) : 5 + −2 → 5 + (−2) ; 7 − −1 → 7 − (−1) ; 8 ÷ −4 → 8 ÷ (−4), parenthèses surlignées. « Le nombre ne change pas, le résultat non plus. »
6. **Petite question.** « Comment écrire correctement 5 + −2 ? » [(5 + −2)] [5 + (−2)] [5 (+ −2)]. Chaque mauvais choix a son explication.
7. **Règle 2, deviner puis expliquer.** « Ce calcul commence par un nombre négatif. Faut-il des parenthèses autour de −3 ? −3 + 5 » [Oui] [Non] → Non (« Devant −3, il n'y a aucun signe. Rien ne se touche. »). Puis encadré Règle 2 et « (−3) + 5 : pas faux, mais inutile » (pastille grise, pas de symbole « ~ »).
8. **Explication règle 3** (5 étapes) : 3− + 4 ; le − après le 3 surligné ; « Soustraire quoi ? Juste après, il y a un + » ; le − glisse devant le 3 ; encadré Règle 3.
9. **Petites questions (2).** « Le signe − d'un nombre négatif se met… » [avant le nombre] [après le nombre]. « Lequel est bien écrit ? » [7−] [−7].
10. **Explication règle 4** (5 étapes) : 4 × (−3 ; la parenthèse ouverte surlignée ; « Où s'arrête le nombre ? » ; la parenthèse fermante arrive (« comme des guillemets ») ; encadré Règle 4.
11. **Petite question.** « Que manque-t-il à ce calcul ? 4 × (−3 » [(] [)] [−].
12. **Récapitulatif** des 4 règles, chacune avec un exemple juste et un exemple faux.

*À toi*
13. **Classer en glisser-déposer.** « Fais glisser chaque calcul du bas de l'écran vers la bonne case. Tu peux aussi toucher un calcul, puis toucher la case. » Cases « Bien écrit » / « Mal écrit » en haut, calculs en bas : 4 × (−3) → bien · 5 + −2 → mal · −3 + 5 → bien · 3− + 4 → mal (affiché exactement « 3− + 4 »). Après Valider, chaque calcul mal écrit montre sa correction et le numéro de la règle.
14. **Quelle règle ?** Calcul en haut : 7 − −1 = 8. « Ce calcul est mal écrit. Quelle règle n'est pas respectée ? » [Deux signes se touchent] [Le moins est après le nombre] [Une parenthèse n'est pas fermée]. Après la réponse, la correction 7 − (−1) = 8 apparaît.

*Exemples guidés*
15. **Réécris 6 × −2.** « Ce calcul est mal écrit. Réécris-le correctement. » Elle tape le calcul **en entier** avec le clavier complet. Attendu : 6 × (−2).
16. **Réécris 3− + 4.** Attendu : −3 + 4. « (−3) + 4 » compte comme une faute.

*Fin*
17. **Annonce** : « Place aux 5 exercices de fin. Cette fois, pas d'aide. Ils ressemblent à ce que tu verras en contrôle. Pour valider le cours, il faut : au moins 4 exercices de fin justes sur 5 ; et 80 % de bonnes réponses sur tout le cours. Si tu n'y arrives pas, ce n'est pas grave : tu feras une série de validation. Ce sont 5 exercices, sans refaire la leçon. »
18. **5 exercices de fin « Toucher la faute »** (générés, 1 fois sur 5 tout est bien écrit). « Ce calcul est-il bien écrit ? » Le calcul en haut, écrit normalement. « S'il est mal écrit, touche l'endroit de la faute dans les cases en bas. Chaque symbole du calcul a sa case. » En bas : le même calcul découpé en cases de même taille (un nombre = une case, chaque signe et chaque parenthèse = une case), puis « Tout est bien écrit ». Aucune couleur avant la réponse.
19. **Résultat** (validé ou non, voir doc 08 n° 29).
20. **Mes cours** garde la raison d'un échec (doc 08 n° 29).

**Note du cours** (doc 08 n° 21) : comptent les 6 petites questions (parties 2, 3, 6, 9, 10 et 12 ; écrans 3, 6, 9, 11), Classer, Quelle règle ?, les 2 exemples guidés et les 5 exercices de fin, soit 15 questions. Les 2 questions pour deviner (écrans 1 et 7) ne comptent pas. Validation : 80 % sur les 15 **et** au moins 4 exercices de fin sur 5.

**Retours d'erreur précis**
| Écran | Réponse | Message |
|---|---|---|
| 3 | « À dire que 5 est négatif » | « Ici le − est entre deux nombres : on enlève 5 à 8. C'est une soustraction. » |
| 3 | « À soustraire » (−6 + 2) | « Il n'y a rien avant le − : on ne peut rien soustraire. C'est le signe du nombre −6. » |
| 6 | (5 + −2) | « Les parenthèses doivent entourer le nombre négatif, pas tout le calcul. Ici + et − se touchent encore. » |
| 6 | 5 (+ −2) | « Le + est une opération : il reste en dehors. Seul le nombre négatif −2 va entre parenthèses. » |
| 9 | après le nombre / 7− | « Le signe se met devant : −7. Écrit après, on croirait une soustraction. » |
| 11 | ( | « Une parenthèse est déjà ouverte. Il manque celle qui la ferme : « ) ». » |
| 11 | − | « Le − est déjà là, devant le 3. Il manque la parenthèse qui ferme : « ) ». » |
| 14 | Le moins est après le nombre | « Le − de −1 est bien devant le 1. Le problème : deux − se touchent. » |
| 14 | Une parenthèse n'est pas fermée | « Il n'y a aucune parenthèse ici. Le problème : deux − se touchent. » |
| 15 | 6 × −2 | « Le × et le − se touchent encore. Mets −2 entre parenthèses. » |
| 15 | 6 × (−2 | « La parenthèse ouverte doit se fermer. » |
| 15 | 6 × (2−) ou 6 × 2− | « Le signe − se met avant le 2. » |
| 15 | 6 × (−n), n ≠ 2 | « L'écriture est bonne, mais le nombre a changé. Garde −2. » |
| 15 | (6 × −2) | « Les parenthèses doivent entourer le nombre négatif, pas tout le calcul. » |
| 15 | autre | « Garde le même calcul, et mets le nombre négatif entre parenthèses. » |
| 16 | (−3) + 4 | « Pas tout à fait. En tête du calcul, on n'écrit pas de parenthèses : −3 + 4. » |
| 16 | 3− + 4 | « Le − est toujours après le 3. Il doit aller devant. » |
| 16 | 3 + 4 | « Le 3 est négatif : garde son signe −, devant le nombre. » |
| 16 | autre | « Garde les mêmes nombres. Le signe − va devant le 3. » |
| 18 | faute non repérée | l'explication de la faute (tableau des erreurs reconnues) + le calcul corrigé |

« Étape par étape » après une erreur aux écrans 15 et 16 : 3 vraies étapes (écran 15 : « Repère les deux signes qui se touchent : × et −. » · « Mets le nombre négatif entre parenthèses : (−2). » · « Le calcul bien écrit : 6 × (−2). » ; écran 16 : « Le signe − est après le 3 : il doit aller devant. » · « Le nombre négatif est en tête du calcul : pas besoin de parenthèses. » · « Le calcul bien écrit : −3 + 4. »).

**En révision et en entraînement :** « Lequel est bien écrit ? » (4 écritures du même calcul, une seule correcte), Classer bien écrit / mal écrit, **Quelle règle n'est pas respectée ?** (calcul généré avec une faute, 3 choix), **Réécris correctement** (calcul généré avec une faute, elle tape le calcul entier) et **Toucher la faute** (même présentation qu'aux exercices de fin).

**Générateur**
| Niveau | Calculs affichés |
|---|---|
| 1 | une seule opération, de 1 à 9 : 4 × (−3) |
| 2 | deux opérations : 5 + (−2) × 3 |
| 3 | trois opérations ou plus, avec parenthèses : −6 − (−2) × (4 + (−1)) |

Les écritures fausses sont fabriquées en appliquant l'une des fautes ci-dessous à un calcul bien écrit.

**Erreurs reconnues**
| Identifiant | La faute non repérée | Explication affichée | Règle | Calcul-piège |
|---|---|---|---|---|
| `signes-colles` | deux signes qui se suivent (4 × −3) | « Deux signes ne se suivent jamais : 4 × (−3). » | 1 | un négatif après × ou ÷ |
| `parentheses-en-tete` | parenthèses autour d'un négatif en tête, dans une réponse tapée | « En tête du calcul, on n'écrit pas de parenthèses : −3 + 4. » | 2 | (Réécris uniquement) un négatif en tête |
| `moins-apres` | le − après le nombre (3−) | « Le signe moins s'écrit avant le nombre : −3. » | 3 | un négatif en tête |
| `parenthese` | parenthèse non fermée ou en trop | « Une parenthèse ouverte doit être fermée. » | 4 | niveau 3, avec parenthèses |

*Note :* dans « Toucher la faute », « Classer » et « Lequel est bien écrit ? », (−3) + 5 n'est jamais affiché comme une faute : on ne montre que de vraies fautes. La faute `parentheses-en-tete` n'existe que pour une réponse tapée dans ce cours.

**Résolution type** (pour Toucher la faute) : le calcul lui-même, découpé en cases (un nombre = une case, chaque signe et chaque parenthèse = une case).

**Exemples (Toucher la faute)**
| Calcul affiché | Bonne réponse | Elle touche | Erreur enregistrée |
|---|---|---|---|
| 4 × −3 | la case « × » ou la case « − » | « − » | — |
| 4 × (−3) | « Tout est bien écrit » | « × » | `relecture` |
| 5 + (−2) × 3− | la case « − » après le 3 | « Tout est bien écrit » | `moins-apres` |
| −6 − (−2 × 4 | la case « ( » non fermée | « ( » | — |

---|---|
| 1 | une seule opération, de 1 à 9 : 4 × (−3) |
| 2 | deux opérations : 5 + (−2) × 3 |
| 3 | trois opérations ou plus, avec parenthèses : −6 − (−2) × (4 + (−1)) |

Les écritures fausses sont fabriquées en appliquant l'une des fautes ci-dessous à un calcul bien écrit.

**Erreurs reconnues**
| Identifiant | La faute non repérée | Explication affichée | Calcul-piège |
|---|---|---|---|
| `signes-colles` | deux signes qui se suivent (4 × −3) | « Deux signes ne se suivent jamais : 4 × (−3). » | un négatif après × ou ÷ |
| `moins-apres` | le − après le nombre (3−) | « Le signe moins s'écrit avant le nombre : −3. » | un négatif en tête |
| `parenthese` | parenthèse non fermée ou en trop | « Une parenthèse ouverte doit être fermée. » | niveau 3, avec parenthèses |

*Note :* (−3) + 5 en tête n'est pas faux, juste inutile. On ne le présente jamais comme une erreur.

**Résolution type** (pour Trouver l'erreur) : le calcul lui-même, découpé en morceaux touchables (nombres, signes, parenthèses).

**Exemples**
| Calcul affiché | Bonne réponse | Elle touche | Erreur enregistrée |
|---|---|---|---|
| 4 × −3 | « × − » | « × − » | — |
| 4 × (−3) | « Tout est bien écrit » | « × » | `relecture` |
| 5 + (−2) × 3− | « 3− » | « Tout est bien écrit » | `moins-apres` |
| −6 − (−2 × 4 | « (−2 × 4 » | « (−2 × 4 » | — |

---

## Cours 1 — Additionner deux nombres de même signe

**La règle :** *Même signe : j'additionne les nombres sans leur signe, et je garde le signe.*

**Mini-leçon**
1. **Explication, avec une image.** « Tu dois 3 €, puis encore 5 €. Tu dois 8 € en tout. » Droite graduée : départ de 0, bond de −3, puis bond de −5, arrivée à −8. Le calcul s'écrit −3 + (−5) = −8.
2. **Explication de la règle.**
   - −3 + (−5) → les deux sont négatifs → 3 + 5 = 8 → je garde le − → **−8**
   - 4 + 6 → les deux sont positifs → **10**
3. **Étiquettes à ordonner** pour −2 + (−7) : `Les deux sont négatifs` · `2 + 7 = 9` · `Je garde le signe −` · `Résultat : −9`
4. **Réponse à écrire :** −2 + (−6) = ? (réponse : −8)

**Exemples guidés**
- −4 + (−9) = −( 4 + ▢ ) = ▢ → 9, puis −13
- −6 + (−1) = −( ▢ + 1 ) = ▢ → 6, puis −7

**Générateur**
| Niveau | Forme | Nombres |
|---|---|---|
| 1 | a + b, de même signe (négatifs 7 fois sur 10) | de 1 à 9 |
| 2 | même chose | de 10 à 99 |
| 3 | même chose | de 100 à 999 |

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : −3 + (−5) · = −(3 + 5) · = −8

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Calcul-piège |
|---|---|---|---|
| `signe-oublie` 🔴 | la réponse est l'opposé de la bonne réponse | « Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! » | deux négatifs |
| `soustraction-au-lieu-addition` | la réponse vaut ±(grand − petit) | « Même signe : on **additionne** les nombres, on ne les soustrait pas. 3 + 5 = 8, donc −8. » | deux nombres d'écart important, ex. −2 + (−9) |

**Exemples de calculs**
| Niveau | Calcul | Réponse |
|---|---|---|
| 1 | −3 + (−5) | −8 |
| 1 | −7 + (−2) | −9 |
| 1 | 4 + 6 | 10 |
| 2 | −34 + (−58) | −92 |
| 2 | −17 + (−66) | −83 |
| 2 | 45 + 38 | 83 |
| 3 | −348 + (−275) | −623 |
| 3 | −509 + (−187) | −696 |
| 3 | −120 + (−880) | −1000 |

**Réponse donnée → erreur reconnue** (calcul −3 + (−5) = −8) : 8 → `signe-oublie` · −2 → `soustraction-au-lieu-addition` · 2 → `soustraction-au-lieu-addition` · −7 → autre

---

## Cours 2 — Additionner deux nombres de signes contraires

**La règle :** *Signes contraires : je soustrais le plus petit (sans signe) du plus grand (sans signe), et je prends le signe du plus grand.*

**Mini-leçon**
1. **Explication, avec une image.** « Tu dois 3 € et tu gagnes 5 €. Il te reste 2 €. » Droite graduée : départ de −3, bond de +5, arrivée à 2. Le calcul s'écrit −3 + 5 = 2.
2. **Explication de la règle.**
   - −3 + 5 → signes contraires → 5 − 3 = 2 → 5 est le plus grand, il est positif → **2**
   - 4 + (−9) → signes contraires → 9 − 4 = 5 → 9 est le plus grand, il est négatif → **−5**
   - −6 + 6 → **0** (deux opposés s'annulent)
3. **Étiquettes à ordonner** pour 4 + (−9) : `Signes contraires` · `9 − 4 = 5` · `9 est le plus grand : signe −` · `Résultat : −5`
4. **Réponse à écrire :** −7 + 2 = ? (réponse : −5)
5. **Relier les paires :** −3 + 5 ↔ 2 · 4 + (−9) ↔ −5 · −6 + 6 ↔ 0 · 7 + (−2) ↔ 5

**Exemples guidés**
- −8 + 3 : 8 − 3 = ▢, le plus grand est 8, donc le résultat est ▢ → 5, puis −5
- 9 + (−4) : 9 − 4 = ▢, le plus grand est 9, donc le résultat est ▢ → 5, puis 5

**Générateur**
| Niveau | Forme | Nombres |
|---|---|---|
| 1 | a + b, de signes contraires, dans un ordre au hasard ; 1 fois sur 10, deux opposés | de 1 à 9 |
| 2 | même chose | de 10 à 99 |
| 3 | même chose | de 100 à 999 |

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : −3 + 5 · = +(5 − 3) · = 2

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Calcul-piège |
|---|---|---|---|
| `signe-du-mauvais-nombre` 🔴 | la réponse est l'opposé de la bonne réponse (bonne réponse ≠ 0) | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). » | le plus grand (sans signe) est négatif, ex. 3 + (−8) |
| `addition-au-lieu-soustraction` | la réponse vaut ±(a + b sans les signes) | « Signes contraires : on **soustrait**. 5 − 3 = 2. » | le négatif en premier, ex. −7 + 4 |

**Exemples de calculs**
| Niveau | Calcul | Réponse |
|---|---|---|
| 1 | −3 + 5 | 2 |
| 1 | 4 + (−9) | −5 |
| 1 | −6 + 6 | 0 |
| 2 | −47 + 29 | −18 |
| 2 | 63 + (−18) | 45 |
| 2 | −25 + 71 | 46 |
| 3 | −248 + 75 | −173 |
| 3 | 512 + (−689) | −177 |
| 3 | −903 + 450 | −453 |

**Réponse donnée → erreur reconnue** (calcul −3 + 5 = 2) : −2 → `signe-du-mauvais-nombre` · 8 → `addition-au-lieu-soustraction` · −8 → `addition-au-lieu-soustraction` · 3 → autre

---

## Cours 3 — Additionner plusieurs relatifs

**La règle :** *Je regroupe les positifs, puis les négatifs, puis je termine avec la règle des signes contraires.*

**Mini-leçon**
1. **Explication, avec une image.** −2 + 5 + (−4) : les positifs en bleu (5), les négatifs en rouge (−2 et −4). Positifs : 5. Négatifs : −2 + (−4) = −6. Puis 5 + (−6) = −1.
2. **Explication de la règle,** sur 3 + (−3) + 3 :
   - positifs : 3 + 3 = 6
   - négatifs : −3
   - 6 + (−3) = **3**
3. **Étiquettes à ordonner** pour 7 + (−1) + (−8) : `Positifs : 7` · `Négatifs : −1 + (−8) = −9` · `7 + (−9)` · `Résultat : −2`
4. **Réponse à écrire :** −2 + 5 + (−4) = ? (réponse : −1)

**Exemples guidés**
- 6 + (−2) + 4 : positifs 6 + 4 = ▢ ; négatifs −2 ; résultat ▢ → 10, puis 8
- −5 + 3 + (−1) : positifs 3 ; négatifs −5 + (−1) = ▢ ; résultat ▢ → −6, puis −3

**Générateur**
| Niveau | Forme | Nombres |
|---|---|---|
| 1 | 3 termes, au moins un positif et un négatif | de 1 à 9 |
| 2 | 4 ou 5 termes, au moins un positif et un négatif | de 1 à 20 |
| 3 | 4 termes, au moins un positif et un négatif | de 10 à 999 |

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : −2 + 5 + (−4) · = 5 + (−2) + (−4) · = 5 + (−6) · = −1

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Calcul-piège |
|---|---|---|---|
| `signe-inverse` 🔴 | la réponse est l'opposé de la bonne réponse (bonne réponse ≠ 0) | « Regarde qui gagne : le total des positifs ou celui des négatifs ? Le résultat prend son signe. » | totaux des positifs et des négatifs proches |
| `tout-additionne` | la réponse vaut ±(la somme de tous les nombres sans leur signe) | « Les négatifs ne s'ajoutent pas aux positifs : ils se **retranchent**. Regroupe-les d'abord. » | au moins deux négatifs |
| `terme-oublie` | la réponse est le résultat du calcul avec un terme en moins | « Il manque un nombre : coche chaque terme quand tu l'as utilisé. » | un terme 1 ou −1, facile à oublier |

**Exemples de calculs**
| Niveau | Calcul | Réponse |
|---|---|---|
| 1 | 3 + (−3) + 3 | 3 |
| 1 | −2 + 5 + (−4) | −1 |
| 1 | 7 + (−1) + (−8) | −2 |
| 2 | 12 + (−7) + 5 + (−9) + 4 | 5 |
| 2 | −15 + 8 + (−3) + 11 | 1 |
| 2 | 6 + (−20) + 9 + (−4) + (−2) | −11 |
| 3 | 248 + (−27) + 15 + (−132) | 104 |
| 3 | −512 + 340 + (−95) + 18 | −249 |
| 3 | 130 + (−760) + 415 + (−99) | −314 |

**Réponse donnée → erreur reconnue** (calcul −2 + 5 + (−4) = −1) : 1 → `signe-inverse` · 11 → `tout-additionne` · −11 → `tout-additionne` · −6 → `terme-oublie` (le 5 oublié) · 3 → `terme-oublie` (le −4 oublié) · 4 → autre

---

## Cours 4 — Soustraire, c'est ajouter l'opposé

**La règle :** *Soustraire un nombre, c'est ajouter son opposé.* a − b = a + (−b), et a − (−b) = a + b.

**Mini-leçon**
1. **Explication, avec une image.** « Enlever une dette de 3 €, c'est comme gagner 3 €. » 5 − (−3) = 5 + 3 = 8. Le « − (−» est entouré, avec une flèche vers « + ».
2. **Explication de la règle.** Je transforme, puis j'applique les cours 1 et 2 :
   - 5 − (−3) = 5 + 3 = **8**
   - 3 − 7 = 3 + (−7) = **−4**
   - −4 − 6 = −4 + (−6) = **−10**
3. **Étiquettes à ordonner** : réécrire 5 − (−3) comme une addition. Étiquettes `5` · `+` · `3` · `−` (la dernière est un piège). Réponse : `5` `+` `3`.
4. **Réponse à écrire :** −2 − (−9) = ? (réponse : 7)
5. **Trouver l'erreur :** « 6 − (−2) = 6 − 2 = 4 ». La 2e étape est fausse : 6 − (−2) = 6 + 2 = 8.

**Exemples guidés**
- 6 − (−4) = 6 + ▢ = ▢ → 4, puis 10
- 2 − 8 = 2 + ( ▢ ) = ▢ → −8, puis −6

**Générateur**
| Niveau | Forme | Nombres |
|---|---|---|
| 1 | a − b ; a et b positifs ou négatifs ; b négatif au moins 1 fois sur 2 | de 1 à 9 |
| 2 | même chose | de 10 à 99 |
| 3 | même chose | de 100 à 999 |

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : 5 − (−3) · = 5 + 3 · = 8

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Calcul-piège |
|---|---|---|---|
| `signe-inverse` 🔴 | la réponse est l'opposé de la bonne réponse (bonne réponse ≠ 0) | « Transforme d'abord en addition, puis applique la règle : même signe ou signes contraires ? » | a plus petit que b, ex. 3 − 8 |
| `oppose-oublie` 🔴 | la réponse vaut a + b (le signe de b n'a pas été changé) | « Soustraire, c'est **ajouter l'opposé** : 5 − (−3) devient 5 + 3. » | b négatif, ex. 6 − (−4) |

**Exemples de calculs**
| Niveau | Calcul | Réponse |
|---|---|---|
| 1 | 5 − (−3) | 8 |
| 1 | 3 − 7 | −4 |
| 1 | −4 − 6 | −10 |
| 2 | 45 − (−27) | 72 |
| 2 | 18 − 63 | −45 |
| 2 | −34 − (−50) | 16 |
| 3 | 248 − (−175) | 423 |
| 3 | 316 − 804 | −488 |
| 3 | −527 − (−390) | −137 |

**Réponse donnée → erreur reconnue :**
- 5 − (−3) = 8 : 2 → `oppose-oublie` · −8 → `signe-inverse`
- 3 − 7 = −4 : 4 → `signe-inverse` · 10 → `oppose-oublie`
- −4 − 6 = −10 : 2 → `oppose-oublie` · 10 → `signe-inverse` · −2 → autre

---

## Cours 5 — Multiplier deux relatifs

**La règle :** *Même signe → résultat positif. Signes contraires → résultat négatif.* Puis je multiplie les nombres sans leur signe.

**Mini-leçon**
1. **Explication, avec une image.** Le tableau des signes, en couleur :
   ```
   +  ×  +  =  +
   −  ×  −  =  +
   +  ×  −  =  −
   −  ×  +  =  −
   ```
   Le moyen de s'en souvenir : « deux signes pareils → + ; deux signes différents → − ».
2. **Explication de la règle.**
   - −3 × (−4) → même signe → + → 3 × 4 = 12 → **12**
   - 6 × (−7) → signes contraires → − → 6 × 7 = 42 → **−42**
3. **Étiquettes à ordonner** pour −4 × (−3) : `Même signe → +` · `4 × 3 = 12` · `Résultat : 12`
4. **Réponse à écrire :** −8 × 5 = ? (réponse : −40)
5. **Classer** (résultat + ou −, sans calculer) : −2 × 3 → − · −4 × (−5) → + · 7 × (−1) → − · 2 × 8 → +

**Exemples guidés**
- −5 × (−6) : signe du résultat ▢ (+), puis 5 × 6 = ▢ → 30, résultat ▢ → 30
- 7 × (−3) : signe du résultat ▢ (−), puis 7 × 3 = ▢ → 21, résultat ▢ → −21

  *Note (vaut pour les cours 5, 6 et 7) :* une case « signe du résultat » se remplit avec deux gros boutons « + » et « − », pas avec le clavier.

**Générateur**
| Niveau | Forme | Nombres |
|---|---|---|
| 1 | a × b, au moins un négatif 3 fois sur 4 | de 1 à 9 (les tables) |
| 2 | même chose | un nombre de 10 à 99 et l'autre de 2 à 9 |
| 3 | même chose | les deux de 10 à 99 |

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : −3 × (−4) · = +(3 × 4) · = 12

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Calcul-piège |
|---|---|---|---|
| `regle-signes` 🔴 | la réponse est l'opposé de la bonne réponse (bonne réponse ≠ 0) | « − × − = + et + × − = −. Deux signes pareils → + ; différents → −. » | deux négatifs |
| `addition-au-lieu-multiplication` | la réponse vaut a + b, ou ±(a + b sans les signes) | « Ici, c'est une **multiplication** : × et pas +. » | petits nombres, ex. −2 × 3 |
| `erreur-table` | même signe que la bonne réponse, mais elle est décalée d'un des deux nombres (ex. 3 × 4 → 9, 15, 8 ou 16) | « Le signe est bon ! Vérifie la multiplication : 3 × 4 = 12. » | les tables qu'elle a ratées |

**Exemples de calculs**
| Niveau | Calcul | Réponse |
|---|---|---|
| 1 | −3 × (−4) | 12 |
| 1 | 6 × (−7) | −42 |
| 1 | −8 × 5 | −40 |
| 2 | −12 × 7 | −84 |
| 2 | −25 × (−4) | 100 |
| 2 | 15 × (−6) | −90 |
| 3 | −23 × (−14) | 322 |
| 3 | 35 × (−21) | −735 |
| 3 | −48 × (−12) | 576 |

**Réponse donnée → erreur reconnue** (calcul −3 × (−4) = 12) : −12 → `regle-signes` · −7 → `addition-au-lieu-multiplication` · 7 → `addition-au-lieu-multiplication` · 9 → `erreur-table` · 16 → `erreur-table` · 11 → autre

---

## Cours 6 — Diviser deux relatifs

**La règle :** *La même que pour multiplier : même signe → positif ; signes contraires → négatif.* Puis je divise les nombres sans leur signe.

**Mini-leçon**
1. **Explication, avec une image.** Le tableau des signes du cours 5, avec ÷ à la place de ×. « Bonne nouvelle : c'est la même règle ! »
2. **Explication de la règle.**
   - −12 ÷ 4 → signes contraires → − → 12 ÷ 4 = 3 → **−3**
   - −35 ÷ (−7) → même signe → + → 35 ÷ 7 = 5 → **5**
3. **Étiquettes à ordonner** pour 24 ÷ (−6) : `Signes contraires → −` · `24 ÷ 6 = 4` · `Résultat : −4`
4. **Réponse à écrire :** −18 ÷ (−3) = ? (réponse : 6)

**Exemples guidés**
- −20 ÷ 5 : signe du résultat ▢ (−), puis 20 ÷ 5 = ▢ → 4, résultat ▢ → −4
- −36 ÷ (−9) : signe du résultat ▢ (+), puis 36 ÷ 9 = ▢ → 4, résultat ▢ → 4

**Générateur** : la division tombe **toujours juste**. On choisit le quotient q et le diviseur b, puis on pose a = q × b. Jamais de division par 0.
| Niveau | Quotient q | Diviseur b |
|---|---|---|
| 1 | de 1 à 9 | de 2 à 9 |
| 2 | de 10 à 30 | de 2 à 9 |
| 3 | de 10 à 99 | de 10 à 40 |

Les signes de a et de b sont tirés au hasard, avec au moins un négatif 3 fois sur 4.

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : −12 ÷ 4 · = −(12 ÷ 4) · = −3

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Calcul-piège |
|---|---|---|---|
| `regle-signes` 🔴 | la réponse est l'opposé de la bonne réponse | « Même règle que pour × : signes pareils → + ; différents → −. » | deux négatifs |
| `multiplication-au-lieu-division` | la réponse vaut ±(a × b) | « Ici, c'est une **division** : ÷ et pas ×. » | petit quotient, ex. −8 ÷ (−4) |

**Exemples de calculs**
| Niveau | Calcul | Réponse |
|---|---|---|
| 1 | −12 ÷ 4 | −3 |
| 1 | −35 ÷ (−7) | 5 |
| 1 | 24 ÷ (−6) | −4 |
| 2 | −126 ÷ 6 | −21 |
| 2 | 152 ÷ (−8) | −19 |
| 2 | −270 ÷ (−9) | 30 |
| 3 | −1188 ÷ 12 | −99 |
| 3 | 2208 ÷ (−24) | −92 |
| 3 | −3366 ÷ (−34) | 99 |

**Réponse donnée → erreur reconnue** (calcul −12 ÷ 4 = −3) : 3 → `regle-signes` · −48 → `multiplication-au-lieu-division` · 48 → `multiplication-au-lieu-division` · −4 → autre

---

## Cours 7 — Multiplier plusieurs relatifs

**La règle :** *Je compte les signes − : nombre pair → résultat positif ; nombre impair → résultat négatif.* Puis je multiplie les nombres sans leur signe.

**Mini-leçon**
1. **Explication, avec une image.** −2 × 3 × (−4) : les « − » sont entourés en rouge et comptés : 2 signes −, c'est pair, donc le résultat est positif. Puis 2 × 3 × 4 = 24 → **24**.
2. **Explication de la règle.**
   - −1 × (−5) × (−2) → 3 signes − → impair → − → 1 × 5 × 2 = 10 → **−10**
   - 4 × (−3) × 2 → 1 signe − → impair → − → **−24**
3. **Étiquettes à ordonner** pour −2 × (−3) × (−1) × 4 : `Je compte les − : 3` · `3 est impair → −` · `2 × 3 × 1 × 4 = 24` · `Résultat : −24`
4. **Réponse à écrire :** −2 × 3 × (−4) = ? (réponse : 24)

**Exemples guidés**
- −3 × (−2) × (−2) : nombre de signes − = ▢ → 3 ; signe du résultat ▢ (−) ; 3 × 2 × 2 = ▢ → 12 ; résultat ▢ → −12
- 5 × (−1) × (−2) : nombre de signes − = ▢ → 2 ; signe du résultat ▢ (+) ; 5 × 1 × 2 = ▢ → 10 ; résultat ▢ → 10

**Générateur**
| Niveau | Forme | Nombres |
|---|---|---|
| 1 | 3 facteurs, au moins un négatif | de 1 à 5 |
| 2 | 4 facteurs, au moins un négatif | de 1 à 5 |
| 3 | 5 facteurs, au moins un négatif | de 1 à 6 |

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : −2 × 3 × (−4) · = +(2 × 3 × 4) · = 24 (2 signes −, pair)

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Calcul-piège |
|---|---|---|---|
| `parite-signes` 🔴 | la réponse est l'opposé de la bonne réponse | « Compte les signes − : pair → + ; impair → −. » | nombre pair de négatifs (2 ou 4) |
| `addition-au-lieu-multiplication` | la réponse vaut la somme des facteurs, ou ±(leur somme sans les signes) | « Ici, on **multiplie** tous les nombres. » | facteurs petits (1 à 3) |

**Exemples de calculs**
| Niveau | Calcul | Réponse |
|---|---|---|
| 1 | −2 × 3 × (−4) | 24 |
| 1 | −1 × (−5) × (−2) | −10 |
| 1 | 4 × (−3) × 2 | −24 |
| 2 | −2 × (−3) × (−1) × 4 | −24 |
| 2 | 3 × (−2) × (−5) × (−2) | −60 |
| 2 | −4 × (−1) × (−3) × (−2) | 24 |
| 3 | −2 × 3 × (−5) × (−1) × 6 | −180 |
| 3 | −3 × (−2) × (−4) × (−1) × (−5) | −120 |
| 3 | 2 × (−6) × (−3) × (−1) × (−4) | 144 |

**Réponse donnée → erreur reconnue** (calcul −2 × 3 × (−4) = 24) : −24 → `parite-signes` · −3 → `addition-au-lieu-multiplication` · 9 → `addition-au-lieu-multiplication` · 20 → autre
