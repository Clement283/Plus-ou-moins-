# 06 — Contenu des 7 cours « Relatifs »

*Statut : à valider (version 3 — tu peux valider cours par cours)*

## Règles communes à tous les cours (tous les modules)

**Ce qui vaut pour tous les cours :**
- **Intuitif, lisible et compréhensible.** Des phrases courtes, une idée par écran, une étape par ligne.
- **Des couleurs et des animations dans les leçons et les explications**, pour faire comprendre : nombres colorés, bonds qui s'animent sur une droite graduée, étapes qui apparaissent l'une après l'autre, flèches… Les **exercices, révisions et l'entraînement** restent écrits **comme sur une copie**, sans couleur (spec §3).
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
- **Aides visuelles des leçons :** négatifs en rouge, positifs en bleu, droite graduée animée.
- **Erreurs reconnues :** chaque cours a sa liste. Une réponse fausse qui n'y correspond pas est classée **« autre »**, avec l'explication générale du cours. Quand une réponse pourrait correspondre à deux erreurs, on retient la première de la liste.
- **Famille signe** 🔴 : ces erreurs comptent dans l'indicateur « erreurs de signe » de ta page de suivi (doc 05).
- **Erreurs d'écriture** (moins après le nombre, double signe, parenthèse, écriture invalide) : communes à tous les cours (doc 03 §3), vérifiées **avant** les erreurs de calcul.
- **Exemples guidés à compléter :** chaque case vide (▢) est une petite réponse tapée, et elles s'enchaînent dans l'ordre. Une case « signe du résultat » se remplit avec deux gros boutons « + » et « − ».
- **Calcul-piège :** pour chaque erreur reconnue, la colonne « Calcul-piège » dit quel calcul tend ce piège, **sans sortir des nombres du niveau** (doc 01 §5).
- **Classer :** pour ces 7 cours, les cases sont **résultat + / − / 0**.

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
| 3 | −1452 ÷ 12 | −121 |
| 3 | 2808 ÷ (−24) | −117 |
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
