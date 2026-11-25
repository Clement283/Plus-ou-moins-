# 10 — Module B. Priorités (cours 8 à 11)

*Extrait du plan du module « Calculs » (ancien fichier unique `10-module-calculs.md`, découpé le 2026-11-25). Index et autres parties : `00-vue-d-ensemble.md` (§1 le chapitre, §2 découpage et ordre des modules), `A-relatifs.md`, `B-priorites.md`, `C-fractions.md`, `D-carres.md`, `reprises-et-appli.md` (§4, §5), `sources.md` (§6 : S1, S2…), `decisions.md`. Les renvois « §N » et « S1… » du texte pointent vers ces fichiers.*


#### Cours 8 — × et ÷ avant + et −
- **Règle :** *Dans un calcul sans parenthèses, je fais les multiplications et les divisions d'abord, puis les additions et les soustractions.*
- **Idée de départ :** un calcul est une somme de **blocs** : 3 + 4 × 2, c'est « 3 pièces et 2 paquets de 4 pièces » = 11 pièces. Le × « colle » plus fort que le +. On souligne les blocs avant de calculer.
- **Erreurs attendues :**
  - `gauche-a-droite` : 3 + 4 × 2 = 14 (addition d'abord). C'est l'erreur la plus fréquente : Éduscol décrit exactement ce cas (S2, S3).
  - `produit-sur-mauvais-nombres` : 3 + 4 × 2 = 3 × 4 + 2 = 14 ou 3 + 4 × 2 = 6 + 4 = 10 (on multiplie le mauvais voisin).
  - `signe-perdu` (famille signe 🔴) : 3 − 2 × (−4) : elle calcule 2 × (−4) = −8 puis 3 − 8 = −5 au lieu de 3 − (−8) = 11.
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Méthode des blocs** *(fiche mémo : la principale)* — *Quand :* un calcul avec +, − et ×, ÷ sans parenthèses. *Exemple :* 3 + 4 × 2 : je souligne 4 × 2, c'est un seul nombre (8), puis 3 + 8 = 11. *Piège évité :* additionner 3 + 4 en premier (14).
  2. **Dessiner les paquets** *(étape de la leçon)* — *Quand :* pour comprendre pourquoi. *Exemple :* 3 pièces et 2 paquets de 4 pièces : 3 + 8 = 11 pièces.
  3. **Une ligne par étape** *(écran « Autres façons de faire »)* — *Quand :* calculs longs. *Exemple :* je recopie ce qui ne bouge pas et je remplace un bloc par son résultat : 6 + 5 × 4 → 6 + 20 → 26. *Piège évité :* perdre un terme en route.
  4. **Le signe se colle au bloc qui suit** *(écran « Autres façons de faire »)* — *Quand :* − devant un produit. *Exemple :* 3 − 2 × (−4) : le bloc est 2 × (−4) = −8, donc 3 − (−8) = 11. *Piège évité :* calculer 3 − 8.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Reprises :** naturelles : le cours contient la soustraction de relatifs (cours 4) et la multiplication (cours 5), c'est ce qui permet le piège « signe-perdu ».
- **Niveaux :** N1 : une addition et un produit, nombres 1 à 9 (2 + 3 × 4), au moins un négatif. N2 : deux produits (3 × 4 − 2 × 5) ou une division. N3 : trois blocs avec négatifs et divisions (−6 ÷ 3 + 4 × (−2) − 5), nombres plus grands.
- **Sources :** S2, S3, S4 ; spec §5 n° 8.

#### Cours 9 — Même priorité : de gauche à droite *(cours ajouté)*
- **Règle :** *Quand deux opérations ont la même priorité (+ et − ensemble, × et ÷ ensemble), je calcule de gauche à droite.*
- **Idée de départ :** 10 − 3 + 2 : « j'avais 10, j'enlève 3, j'ajoute 2 », et on lit dans l'ordre. Pourquoi : le − s'attache au nombre qui le suit, comme le signe d'un terme (lien avec le Cours 0 et le Cours 4).
- **Erreurs attendues :**
  - `plus-avant-moins` : 10 − 3 + 2 = 5 (elle fait 3 + 2 d'abord).
  - `fois-avant-division` : 12 ÷ 3 × 2 = 2 (elle fait 3 × 2 d'abord) au lieu de 8.
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Lire comme un livre** *(fiche mémo : la principale)* — *Quand :* plusieurs + et − de suite, ou plusieurs × et ÷ de suite. *Exemple :* 10 − 3 + 2 = 7 + 2 = 9 ; 12 ÷ 3 × 2 = 4 × 2 = 8. *Piège évité :* faire 3 + 2 d'abord (5) ou 3 × 2 d'abord (2).
  2. **Le − se colle au nombre suivant** *(étape de la leçon)* — *Quand :* pour réordonner une somme. *Exemple :* 10 − 3 + 2 = 10 + (−3) + 2 = 10 + 2 + (−3) = 9 : on peut changer l'ordre en gardant chaque signe.
  3. **Le ÷ se colle au nombre suivant** *(écran « Autres façons de faire »)* — *Quand :* série de × et ÷. *Exemple :* 12 ÷ 3 × 2 = 12 × 2 ÷ 3 = 24 ÷ 3 = 8 ; 24 ÷ 4 × 3 = 6 × 3 = 18. *Piège évité :* remplacer ÷ 3 × 2 par ÷ 6.
  4. **Repérer ce qui s'annule** *(écran « Autres façons de faire »)* — *Quand :* un nombre qu'on ajoute et qu'on retire. *Exemple :* 17 − 9 + 9 = 17 ; 8 − 5 + 5 = 8.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Reprises :** naturelle : contient les additions/soustractions du cours 3 et 4 et les × ÷ des cours 5 à 7. Le cas « on ne mélange pas : × avant + » du cours 8 revient dans la série de pratique.
- **Niveaux :** N1 : trois termes, 1 à 9 (8 − 5 + 3). N2 : quatre termes ou ×÷ à la suite (24 ÷ 4 × 3). N3 : mélange avec blocs et négatifs (−12 ÷ 3 × (−2) − 5 + 4).
- **Pourquoi un cours à part :** deux erreurs reconnues différentes de celles du cours 8, et une règle qui se retient autrement (« dans l'ordre de lecture »). Une nouvelle méthode = un nouveau cours.
- **Sources :** S2, S3, S4 (erreurs 10 − 3 + 2 et 12 ÷ 3 × 2 : classiques de 6e-5e).

#### Cours 10 — Les parenthèses d'abord
- **Règle :** *Je calcule d'abord ce qui est entre parenthèses, puis je continue avec les priorités.*
- **Idée de départ :** les parenthèses disent « ce paquet est un seul nombre » (comme les blocs du cours 8, mais choisis par celui qui écrit). (3 + 4) × 2 = 7 × 2 : « 2 sacs de 3 + 4 pièces ». Elle a déjà vu un autre rôle des parenthèses au Cours 0 : autour d'un **négatif** (5 + (−2) n'est pas une parenthèse de calcul). Le cours le dit : « deux rôles, comme le − ».
- **Erreurs attendues :**
  - `parentheses-ignorees` : (3 + 4) × 2 = 3 + 8 = 11.
  - `parenthese-negatif-confondue` : dans 5 + (−2) × 3, elle croit qu'il y a un calcul à faire d'abord dans (−2) (elle perd du temps) ou, l'inverse, elle calcule (5 + (−2)) × 3 (elle déplace la parenthèse).
  - `signe-devant-parenthese` (🔴) : 2 × (3 − 5) = 2 × 2 = 4 (perte du signe en 3 − 5 = −2).
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Parenthèse = un seul nombre** *(fiche mémo : la principale)* — *Quand :* une parenthèse de calcul. *Exemple :* (3 + 4) × 2 : je calcule 3 + 4 = 7, je remplace, 7 × 2 = 14. *Piège évité :* ignorer la parenthèse (3 + 8 = 11).
  2. **Entourer et calculer à côté** *(étape de la leçon)* — *Quand :* pour ne pas mélanger. *Exemple :* je trace la parenthèse au crayon et je la calcule sur le côté.
  3. **Contrôle par la distributivité** *(écran « Autres façons de faire »)* — *Quand :* somme multipliée par un nombre. *Exemple :* (3 + 4) × 2 = 3 × 2 + 4 × 2 = 6 + 8 = 14 : même résultat.
  4. **De l'intérieur vers l'extérieur** *(écran « Autres façons de faire »)* — *Quand :* parenthèses imbriquées. *Exemple :* −2 × (3 − (5 − 8)) : 5 − 8 = −3 ; 3 − (−3) = 6 ; −2 × 6 = −12. *Piège évité :* commencer par la parenthèse de l'extérieur.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Reprises :** cours 8 et 9 (la suite du calcul après la parenthèse) ; cours 2 (3 − 5 = −2, qui est dans la parenthèse).
- **Niveaux :** N1 : une parenthèse, une autre opération (2 × (3 + 4)). N2 : parenthèse avec soustraction donnant un négatif (6 × (2 − 5)). N3 : deux parenthèses, ou parenthèses imbriquées (−2 × (3 − (5 − 8))), avec un négatif écrit entre parenthèses (Cours 0) à côté d'une parenthèse de calcul.
- **Sources :** S2, S3, S4 ; spec §5 n° 9.

#### Cours 11 — Enlever des parenthèses précédées d'un − *(cours ajouté)*
- **Règle :** *Une parenthèse précédée d'un − : le − change le signe de tout ce qu'il y a dedans ; précédée d'un +, rien ne change.*
- **Idée de départ :** « enlever une dette » (cours 4) appliqué à un paquet : 8 − (3 + 2) : j'enlève un paquet qui vaut 5, donc 8 − 5 = 3 ; et en enlevant les morceaux un par un : 8 − 3 − 2. Si le paquet contient une dette : 8 − (3 − 2) = 8 − 3 + 2.
- **Erreurs attendues :**
  - `un-seul-signe-change` (🔴) : 8 − (3 − 2) = 8 − 3 − 2 = 3 (on n'a changé que le 3, pas le −2) ; c'est **l'erreur** de la dérivée de f − g et des soustractions de polynômes en première (S5).
  - `moins-oublie` : 8 − (3 + 2) = 8 − 3 + 2 = 7.
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Je change le signe de chaque terme** *(fiche mémo : la principale)* — *Quand :* un − devant une parenthèse. *Exemple :* 8 − (3 − 2) = 8 − 3 + 2 = 7 ; un + devant : rien ne change. *Piège évité :* ne changer que le premier terme.
  2. **Réécrire −(a − b) = b − a** *(étape de la leçon)* — *Quand :* un − devant une différence. *Exemple :* −(4 − 7) = 7 − 4 = 3 : la différence se retourne.
  3. **Contrôle : la parenthèse d'abord** *(écran « Autres façons de faire »)* — *Quand :* après avoir enlevé les parenthèses. *Exemple :* 8 − (3 − 2) = 8 − 1 = 7 et 8 − 3 + 2 = 7 : même résultat.
  4. **Souligner chaque terme** *(écran « Autres façons de faire »)* — *Quand :* parenthèses de trois termes ou plus. *Exemple :* 10 − (4 − 9 + 1) : je souligne 4, −9, 1 et je change chaque signe.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Reprises :** cours 4 (l'opposé), cours 10 (parenthèses d'abord : la méthode de contrôle), cours 9.
- **Niveaux :** N1 : 8 − (3 + 2), 8 − (3 − 2). N2 : trois termes dans la parenthèse, parenthèse en tête (−(4 − 7) + 2). N3 : deux parenthèses (10 − (4 − 9) − (−2 + 3)).
- **Pourquoi ce cours est ajouté :** ce n'est pas dans la spec §5, mais c'est la source n° 1 d'erreurs de signe dans le second degré et la dérivation, et il ne demande que les cours 4 et 10. *Les lettres viendront plus tard : ici, uniquement des nombres.*
- **Sources :** S5 (« distribuer le signe − »), S2.

---

