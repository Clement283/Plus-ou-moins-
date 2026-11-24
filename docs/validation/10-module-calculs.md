# 10 — Plan du module « Calculs » (relatifs, priorités, fractions, carrés)

*Statut : **proposition, à valider par le porteur du projet** — 2026-11-24. Produit avec le skill `plus-ou-moins-creer-un-module-de-cours`. Aucun cours n'est écrit ici : seulement le plan. Aucune page de classe n'a été reçue : les sources sont le programme officiel et la recherche Internet (voir §6 pour ce qui a pu être lu ou non).*

## Résumé pour le porteur du projet

- Le chapitre « Calculs de base » doit couvrir **relatifs, priorités, fractions, carrés** (spec §5). Avec les cours 0 à 7 déjà écrits, il reste **17 cours à ajouter** : cela fait **25 cours en tout**.
- **Ma recommandation : couper en 4 modules**, de 4 à 8 cours chacun : **Relatifs** (cours 0 à 7, déjà faits), **Priorités** (cours 8 à 11), **Fractions** (cours 12 à 18), **Carrés et identités remarquables** (cours 19 à 24). Un module terminé = un badge, plus souvent ; et ce sont des parties qu'on apprend l'une sans l'autre. L'autre choix possible : 3 modules (Priorités et Fractions ensemble) ou un seul module de 25 cours (voir §2).
- **Les cours 0 à 7 sont justes** et je les garde. Quelques retouches à noter : les cours 2 à 7 sont encore en version 1 (négatifs en rouge au lieu d'orange, pas de série de pratique, etc.), à réécrire avec le skill « écrire un cours » ; rien ne manque vraiment pour les relatifs.
- **Cours ajoutés par rapport à la spec §5** (à valider) : « Même priorité : de gauche à droite », « Enlever des parenthèses précédées d'un − », « Mettre au même dénominateur », « Le carré avant × et ÷ », « Le carré d'une somme ou d'une différence », « (a + b)(a − b) » et « Remplacer une lettre par un nombre négatif » (qui mène au calcul de Δ = b² − 4ac). Ce sont les endroits où les élèves de première perdent des points en second degré et en dérivation.
- **Ce qu'il faut ajouter dans l'appli** : une touche « carré / puissance », des générateurs d'expressions avec priorités, des calculs avec fractions, des écrans pour voir les fractions et le carré d'une somme, et la reprise de calculs d'un autre cours (détail §5). Les identités remarquables avec des **lettres** (développer (x + 3)²) demandent une vraie brique « lettres » : je propose de les faire plus tard, et de commencer avec des nombres (21², 19²…).
- Je n'ai pas de document de classe : **si tu en reçois, dis-le avant de valider les modules 2 à 4** (ordre et vocabulaire de la classe à garder).
- 5 questions à la fin de ce document.

---

## 1. Le chapitre

- **Intitulé :** Calculs de base : nombres relatifs, priorités opératoires, fractions, carrés (et identités remarquables sous forme numérique).
- **Classe :** première spécialité mathématiques. Ces notions sont enseignées au collège et en seconde ; en première elles ne sont plus enseignées mais **servent à chaque ligne** du second degré, de la dérivation et des suites.
- **Documents reçus :** aucun. Documents du dépôt lus : spec V1 (§1, §5), docs 06 et 08, skills « créer un module » et « écrire un cours ».
- **Objectifs** (ce qu'elle saura faire en contrôle, sans aide, sans calculatrice) :
  1. Calculer avec des relatifs (+, −, ×, ÷, plusieurs termes, plusieurs facteurs) sans erreur de signe.
  2. Appliquer les priorités : parenthèses, puis × et ÷, puis + et −, de gauche à droite à priorité égale ; enlever des parenthèses précédées d'un −.
  3. Simplifier, additionner, soustraire, multiplier et diviser des fractions, avec le bon signe.
  4. Calculer un carré (surtout d'un négatif), distinguer (−3)² et −3², placer le carré dans les priorités, développer (a + b)², (a − b)² et (a + b)(a − b) avec des nombres.
  5. Remplacer une lettre par un nombre négatif sans perdre les parenthèses, et calculer Δ = b² − 4ac, f(−2), f'(−1)…

**Pourquoi ces objectifs** (ce qui sert l'an prochain) : les calculs de Δ, de racines (−b ± √Δ) / (2a), de f(a) et de f'(a) mélangent exactement ces cinq compétences. Les sites de cours de première spécialité insistent sur les erreurs de signe de b et de c dans Δ (voir §6, sources S9 et S10). *Les programmes de seconde et de première ne détaillent pas ces calculs de base comme chapitre : ils les supposent acquis et demandent de « poursuivre l'acquisition d'automatismes » (S1).*

---

## 2. Découpage en modules

**Longueur :** 8 cours existants + 17 cours proposés = **25 cours**. La spec §5 disait « sans doute 20 à 25 ». Pour un module unique, c'est long : un seul badge à la fin, une progression « 12 / 25 » qui ne bouge pas vite, et un chemin où elle doit passer par les fractions avant de voir un carré, même si c'est le carré qui l'attend au contrôle.

**Ma recommandation : 4 modules** (les cours gardent un numéro continu, unique dans toute l'appli ; le Cours 0 reste l'introduction du 1er module, les autres modules n'ont pas de cours d'introduction).

| Module | Cours | Nb | Pourquoi une partie à part |
|---|---|---|---|
| **A. Relatifs** | 0 à 7 | 8 | Déjà écrit ; c'est le cœur du besoin (signes). |
| **B. Priorités** | 8 à 11 | 4 | Apprenable seul (aucune fraction) ; vu au collège, souvent revu en 6e-5e : court et utile. |
| **C. Fractions** | 12 à 18 | 7 | Un thème clair, avec sa propre progression (simplifier, signe, additionner, multiplier, diviser). |
| **D. Carrés et identités remarquables** | 19 à 24 | 6 | La partie la plus proche du second degré ; demande A et B (et C pour les niveaux 3). |

**Ordre :** A, puis B, puis C, puis D. B avant C parce que les niveaux 3 des fractions mélangent des priorités (1/2 + 1/3 × 3/4) ; D à la fin parce que le dernier cours (Δ) reprend tous les autres.

**Alternative 1 : 3 modules** (A. Relatifs ; B. Priorités et fractions, cours 8 à 18, 11 cours ; C. Carrés et identités, cours 19 à 24). Un peu moins de modules, mais un module de 11 cours.

**Alternative 2 : un seul module « Calculs »** de 25 cours : rien à changer dans l'appli (un module, un chemin), mais un module long. À réserver si tu préfères ne pas toucher à la structure pour l'instant.

**Ce que cela change dans l'appli** (voir aussi §5) : aujourd'hui le module s'appelle « Calculs » et contient les cours 0 à 7. Avec 4 modules, il serait renommé « Relatifs » (même identifiant, mêmes cours, la progression de l'élève n'est pas touchée) et les nouveaux modules s'ajouteraient. Le doc 06 dit qu'un seul module est disponible pour l'instant et que le choix des modules viendra plus tard : en attendant, les modules s'enchaînent dans l'ordre, un module débloquant le suivant quand il est terminé.

---

## 3. Les cours de chaque module

Légende de chaque fiche : **Règle** (une phrase) · **Idée de départ** (le pourquoi) · **Erreurs attendues** (futures erreurs reconnues) · **Astuce** (future fiche mémo) · **Reprises** · **Niveaux 2 et 3** · **Sources**. Les niveaux suivent « même méthode, plus difficile » ; chaque cours dira ses propres nombres au moment de sa spec. Les numéros S1, S2… renvoient au §6.

### Module A. Relatifs (cours 0 à 7) : cours existants

| Cours | Titre | Statut | Ajustement signalé |
|---|---|---|---|
| 0 | Bien écrire un calcul | v3, juste | Aucun. |
| 1 | Additionner deux nombres de même signe | v2, juste | Aucun. |
| 2 | Additionner deux nombres de signes contraires | v1, juste | À réécrire avec le skill cours (droite graduée orange/bleu, série de pratique). Le cas de « deux opposés » (−6 + 6 = 0) est déjà prévu. |
| 3 | Additionner plusieurs relatifs | v1, juste | À réécrire. Le doc 06 parle de négatifs « en rouge » : à passer en **orange** (doc 08 n° 27). |
| 4 | Soustraire, c'est ajouter l'opposé | v1, juste | À réécrire. Contient deux gestes (a − b et a − (−b)) : à couper en deux règles dans le cours si chacune a son erreur reconnue (c'est le cas : `signe-inverse`, `oppose-oublie`). |
| 5 | Multiplier deux relatifs | v1, juste | À réécrire. |
| 6 | Diviser deux relatifs | v1, juste | À réécrire. Le générateur ne fait que des divisions qui « tombent juste » : c'est volontaire, les divisions qui ne tombent pas juste sont dans le module C (fractions). |
| 7 | Multiplier plusieurs relatifs | v1, juste | À réécrire. La règle « je compte les − » prépare (−1)ⁿ et le carré : à rappeler dans le cours 19 (reprise). |

**Cours manquant pour les relatifs ?** Non. J'ai envisagé « comparer et ranger des relatifs » (−7 < −3) et « opposé / valeur absolue » : c'est du collège, utile pour les inéquations mais pas pour le calcul de base. Je ne les ajoute pas ; à dire si tu veux.

**Ajout d'une règle dans le Cours 0 ?** Une seule chose à surveiller : le Cours 0 enseigne les parenthèses autour d'un **négatif**. Le module B introduit les parenthèses de **calcul** ((3 + 4) × 2). Ce sont deux rôles des parenthèses, comme le « − » a deux rôles : c'est traité dans le cours 10, pas besoin de toucher au Cours 0.

---

### Module B. Priorités (cours 8 à 11)

#### Cours 8 — × et ÷ avant + et −
- **Règle :** *Dans un calcul sans parenthèses, je fais les multiplications et les divisions d'abord, puis les additions et les soustractions.*
- **Idée de départ :** un calcul est une somme de **blocs** : 3 + 4 × 2, c'est « 3 pièces et 2 paquets de 4 pièces » = 11 pièces. Le × « colle » plus fort que le +. On souligne les blocs avant de calculer.
- **Erreurs attendues :**
  - `gauche-a-droite` : 3 + 4 × 2 = 14 (addition d'abord). C'est l'erreur la plus fréquente : Éduscol décrit exactement ce cas (S2, S3).
  - `produit-sur-mauvais-nombres` : 3 + 4 × 2 = 3 × 4 + 2 = 14 ou 3 + 4 × 2 = 6 + 4 = 10 (on multiplie le mauvais voisin).
  - `signe-perdu` (famille signe 🔴) : 3 − 2 × (−4) : elle calcule 2 × (−4) = −8 puis 3 − 8 = −5 au lieu de 3 − (−8) = 11.
- **Astuce (fiche mémo) :** « Je souligne les × et ÷ : chaque bloc souligné est un seul nombre. Ensuite je calcule les blocs, puis je termine avec + et −. » (méthode des blocs, courante chez les profs ; voir S3, S4).
- **Reprises :** naturelles : le cours contient la soustraction de relatifs (cours 4) et la multiplication (cours 5), c'est ce qui permet le piège « signe-perdu ».
- **Niveaux :** N1 : une addition et un produit, nombres 1 à 9 (2 + 3 × 4), au moins un négatif. N2 : deux produits (3 × 4 − 2 × 5) ou une division. N3 : trois blocs avec négatifs et divisions (−6 ÷ 3 + 4 × (−2) − 5), nombres plus grands.
- **Sources :** S2, S3, S4 ; spec §5 n° 8.

#### Cours 9 — Même priorité : de gauche à droite *(cours ajouté)*
- **Règle :** *Quand deux opérations ont la même priorité (+ et − ensemble, × et ÷ ensemble), je calcule de gauche à droite.*
- **Idée de départ :** 10 − 3 + 2 : « j'avais 10, j'enlève 3, j'ajoute 2 », et on lit dans l'ordre. Pourquoi : le − s'attache au nombre qui le suit, comme le signe d'un terme (lien avec le Cours 0 et le Cours 4).
- **Erreurs attendues :**
  - `plus-avant-moins` : 10 − 3 + 2 = 5 (elle fait 3 + 2 d'abord).
  - `fois-avant-division` : 12 ÷ 3 × 2 = 2 (elle fait 3 × 2 d'abord) au lieu de 8.
- **Astuce :** « Plusieurs + et − de suite, ou plusieurs × et ÷ de suite : je lis comme un livre, de gauche à droite. » Option : pour + et −, voir chaque − comme le signe du nombre qui le suit (10 + (−3) + 2), ce qui rejoint le cours 3.
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
- **Astuce :** « Parenthèse = un seul nombre. Je la calcule jusqu'au bout, puis je la remplace par son résultat. »
- **Reprises :** cours 8 et 9 (la suite du calcul après la parenthèse) ; cours 2 (3 − 5 = −2, qui est dans la parenthèse).
- **Niveaux :** N1 : une parenthèse, une autre opération (2 × (3 + 4)). N2 : parenthèse avec soustraction donnant un négatif (6 × (2 − 5)). N3 : deux parenthèses, ou parenthèses imbriquées (−2 × (3 − (5 − 8))), avec un négatif écrit entre parenthèses (Cours 0) à côté d'une parenthèse de calcul.
- **Sources :** S2, S3, S4 ; spec §5 n° 9.

#### Cours 11 — Enlever des parenthèses précédées d'un − *(cours ajouté)*
- **Règle :** *Une parenthèse précédée d'un − : le − change le signe de tout ce qu'il y a dedans ; précédée d'un +, rien ne change.*
- **Idée de départ :** « enlever une dette » (cours 4) appliqué à un paquet : 8 − (3 + 2) : j'enlève un paquet qui vaut 5, donc 8 − 5 = 3 ; et en enlevant les morceaux un par un : 8 − 3 − 2. Si le paquet contient une dette : 8 − (3 − 2) = 8 − 3 + 2.
- **Erreurs attendues :**
  - `un-seul-signe-change` (🔴) : 8 − (3 − 2) = 8 − 3 − 2 = 3 (on n'a changé que le 3, pas le −2) ; c'est **l'erreur** de la dérivée de f − g et des soustractions de polynômes en première (S5).
  - `moins-oublie` : 8 − (3 + 2) = 8 − 3 + 2 = 7.
- **Astuce :** « Un − devant une parenthèse : je change le signe de **chaque** terme dedans (+ devient −, − devient +). » Contrôle : toujours possible en calculant d'abord la parenthèse (cours 10), donc le résultat doit être le même.
- **Reprises :** cours 4 (l'opposé), cours 10 (parenthèses d'abord : la méthode de contrôle), cours 9.
- **Niveaux :** N1 : 8 − (3 + 2), 8 − (3 − 2). N2 : trois termes dans la parenthèse, parenthèse en tête (−(4 − 7) + 2). N3 : deux parenthèses (10 − (4 − 9) − (−2 + 3)).
- **Pourquoi ce cours est ajouté :** ce n'est pas dans la spec §5, mais c'est la source n° 1 d'erreurs de signe dans le second degré et la dérivation, et il ne demande que les cours 4 et 10. *Les lettres viendront plus tard : ici, uniquement des nombres.*
- **Sources :** S5 (« distribuer le signe − »), S2.

---

### Module C. Fractions (cours 12 à 18)

*Constat commun (Éduscol, S6) : beaucoup d'erreurs viennent d'une image fausse de la fraction : « deux nombres l'un sur l'autre » au lieu d'un nombre (une part, un quotient). Les cours de ce module commencent donc par une image : parts d'un tout et droite graduée, et rappellent que la fraction est une **division** (lien avec le cours 6).*

#### Cours 12 — Simplifier une fraction
- **Règle :** *Pour simplifier, je divise le numérateur et le dénominateur par le même nombre, jusqu'à ne plus pouvoir.*
- **Idée de départ :** 6/9 et 2/3 sont **la même part**, découpée autrement (parts égales, puis regroupées) ; la fraction est le résultat de 6 ÷ 9. Simplifier, c'est l'écrire avec les plus gros morceaux. Lien avec le « Calcul pas fini : simplifie » déjà dans l'appli (doc 03).
- **Erreurs attendues :**
  - `simplification-partielle` : 12/18 = 6/9 et elle s'arrête (non irréductible).
  - `simplifier-une-somme` : (2 + 6)/2 = 6 (elle « barre » le 2 de la somme au lieu de 8/2 = 4) ; classique en première pour les racines (−b ± √Δ)/2a (S7).
  - `un-seul-cote` : elle divise le haut mais pas le bas (12/18 → 6/18).
- **Astuce :** « Je cherche un nombre qui divise **les deux** (2, 3, 5 ; critères de divisibilité). Je recommence jusqu'à ce qu'il n'y en ait plus. On ne barre que des **facteurs**, jamais des termes d'une somme. »
- **Reprises :** cours 6 (diviser) ; naturelle : la table de multiplication (erreur-table du cours 5).
- **Niveaux :** N1 : numérateur et dénominateur de 1 à 20, un seul passage. N2 : deux passages (36/48), nombres jusqu'à 100. N3 : fractions négatives, ou déjà simplifiées (piège : « rien à simplifier »), nombres jusqu'à 200.
- **Sources :** S6, S7 ; spec §5 n° 10.

#### Cours 13 — Le signe d'une fraction
- **Règle :** *Le signe d'une fraction se met devant la barre : −2/3 = (−2)/3 = 2/(−3) ; (−2)/(−3) = 2/3 ; un − au numérateur et un − au dénominateur s'annulent.*
- **Idée de départ :** une fraction est une division : (−2) ÷ 3, 2 ÷ (−3) (signes contraires : −), (−2) ÷ (−3) (même signe : +) : c'est le cours 6. Le « − » se place où on veut ; en contrôle on l'écrit **devant la fraction**.
- **Erreurs attendues :**
  - `deux-moins-restent` (🔴) : (−2)/(−3) = −2/3.
  - `moins-au-denominateur` : 2/(−3) laissé tel quel, ou lu comme positif.
  - `signe-perdu-a-la-simplification` : −12/18 = 2/3.
- **Astuce :** « Je compte les signes − en haut et en bas : pair → +, impair → − (comme au cours 7). Puis je place le − devant. »
- **Reprises :** cours 6 (diviser des relatifs), cours 12 (simplifier, quand les deux sont combinés).
- **Niveaux :** N1 : un seul signe − (2/(−3), −2/3). N2 : deux signes (−5)/(−7), puis simplification en plus. N3 : signes à plusieurs endroits, −(−4)/6, fractions à simplifier.
- **Sources :** S6, spec §5 n° 11. *À décider (question 4) : écriture attendue du résultat.*

#### Cours 14 — Additionner, soustraire : même dénominateur
- **Règle :** *Même dénominateur : j'additionne (ou je soustrais) les numérateurs, je garde le dénominateur.*
- **Idée de départ :** 3 septièmes + 2 septièmes = 5 septièmes : on compte des parts de même taille, comme on compte des euros (« 3 pièces + 2 pièces = 5 pièces »). Image : une barre découpée en 7 parts, 3 colorées puis 2 de plus.
- **Erreurs attendues :**
  - `additionne-les-dessous` : 3/7 + 2/7 = 5/14 (le dénominateur est aussi additionné) : erreur n° 1 sur les fractions (S6).
  - `signe-numerateur` (🔴) : 3/7 − 5/7 = 2/7 (au lieu de −2/7).
  - `non-simplifie` : 1/6 + 2/6 = 3/6 (arrêt trop tôt ; traité par le message « Simplifie. », doc 03).
- **Astuce :** « Les dénominateurs disent **le nom des parts** (septièmes). On ne change pas de nom quand on additionne, on additionne **combien il y en a**. »
- **Reprises :** cours 1 à 4 (additionner et soustraire des relatifs, ici sur les numérateurs), cours 12 (simplifier le résultat), cours 13 (signe).
- **Niveaux :** N1 : dénominateurs 2 à 9, numérateurs positifs, résultat simple. N2 : numérateurs négatifs, résultat à simplifier. N3 : trois fractions de même dénominateur, négatifs, grands numérateurs.
- **Sources :** S6 ; spec §5 n° 12.

#### Cours 15 — Mettre au même dénominateur *(cours ajouté : coupé du n° 13 de la spec)*
- **Règle :** *Je multiplie le numérateur et le dénominateur par le même nombre : la fraction ne change pas de valeur.*
- **Idée de départ :** 1/2 = 3/6 : couper chaque part en 3 ne change pas la quantité (c'est l'inverse de simplifier, cours 12).
- **Erreurs attendues :**
  - `ajoute-au-lieu-de-multiplier` : 1/2 = 3/4 (« +2 » en haut et en bas) : 1/2 → (1 + 2)/(2 + 2) (S6).
  - `un-seul-cote` : 1/2 = 3/2.
  - `mauvais-facteur` : 3/4 = 8/12 (le facteur n'est pas le même en haut et en bas).
- **Astuce :** « Pour passer de 4 à 12, je me demande : *par combien* ? Ici par 3. Je multiplie **aussi** le haut par 3. »
- **Reprises :** cours 12 (le chemin inverse), cours 5 (tables de multiplication).
- **Niveaux :** N1 : un des deux dénominateurs est multiple de l'autre, facteur 2 à 5 (3/4 = ▢/12). N2 : facteurs jusqu'à 9, numérateurs négatifs. N3 : deux fractions à mettre au même dénominateur sans que l'un divise l'autre (3/4 et 5/6 → 9/12 et 10/12).
- **Pourquoi un cours à part :** c'est une méthode distincte, avec ses erreurs ; elle sert aussi à comparer et à simplifier.
- **Sources :** S6 ; spec §5 n° 13 (première moitié).

#### Cours 16 — Additionner, soustraire : dénominateurs différents
- **Règle :** *Dénominateurs différents : je les mets d'abord au même dénominateur (cours 15), puis j'additionne les numérateurs (cours 14).*
- **Idée de départ :** 1/2 + 1/3 : on ne peut pas additionner des moitiés et des tiers (tailles de parts différentes) ; on les découpe en sixièmes : 3/6 + 2/6 = 5/6 (S6 : exemple classique de l'erreur 2/5).
- **Erreurs attendues :**
  - `additionne-tout` : 1/2 + 1/3 = 2/5 (haut + haut, bas + bas), erreur la plus courante (S6).
  - `produit-des-denominateurs-sans-adapter` : 1/2 + 1/3 = 1/6 ou 2/6.
  - `entier-oublie` : 3 − 2/5 = 1/5 (l'entier n'est pas mis en fraction 3 = 15/5).
  - `non-simplifie` (traité par « Simplifie. »).
- **Astuce :** « Je cherche un dénominateur commun (le plus petit multiple commun si je le vois, sinon le produit), je réécris, puis comme au cours 14. Un entier est une fraction : 3 = 3/1. »
- **Reprises :** cours 14 et 15 (naturelles : le cours contient les deux).
- **Niveaux :** N1 : un dénominateur multiple de l'autre (1/2 + 1/4). N2 : dénominateurs premiers entre eux (1/2 + 1/3), négatifs. N3 : dénominateurs avec facteur commun (5/6 − 3/4), un entier, trois fractions.
- **Sources :** S6 (Éduscol : addition « des numérateurs entre eux et des dénominateurs entre eux ») ; spec §5 n° 13.

#### Cours 17 — Multiplier des fractions
- **Règle :** *Je multiplie les numérateurs entre eux et les dénominateurs entre eux (avec la règle des signes), puis je simplifie.*
- **Idée de départ :** « les 2/3 de 3/4 » : prendre une fraction d'une fraction. Image : un rectangle découpé en lignes et colonnes (aire).
- **Erreurs attendues :**
  - `denominateur-commun-inutile` : 2/3 × 3/4 = 6/12 → bon, mais ensuite elle cherche un dénominateur commun avant : confusion avec l'addition (S6) ; ou 2/3 × 3/4 = 2/4 × 3/3 (mélange).
  - `regle-signes` (🔴) : (−2/3) × (−3/4) = −1/2 (cours 5).
  - `simplifier-avant-oublie` : pas d'erreur de fond, mais un résultat non simplifié (message « Simplifie. »).
  - `entier-fois-fraction` : 2 × 3/4 = 6/8 (elle multiplie aussi le dénominateur) au lieu de 6/4.
- **Astuce :** « Multiplier : tout en haut avec tout en haut, tout en bas avec tout en bas. Pas besoin de dénominateur commun. Je peux simplifier **avant** (en croix) pour avoir de petits nombres. »
- **Reprises :** cours 5 et 7 (signes), cours 12 (simplifier).
- **Niveaux :** N1 : deux fractions positives, résultat à simplifier au plus une fois. N2 : un négatif, un entier. N3 : trois fractions ou simplification en croix nécessaire, négatifs.
- **Sources :** S6 ; spec §5 n° 14.

#### Cours 18 — Diviser par une fraction
- **Règle :** *Diviser par une fraction, c'est multiplier par son inverse.*
- **Idée de départ :** « combien de fois 1/4 dans 3 ? » : 3 ÷ 1/4 = 12 (chaque unité contient 4 quarts) : on multiplie par 4 = l'inverse de 1/4.
- **Erreurs attendues :**
  - `inverse-mauvaise-fraction` : 2/3 ÷ 3/4 = 3/2 × 3/4 (inversion de la première fraction).
  - `divise-en-haut-en-bas` : 2/3 ÷ 3/4 = (2 ÷ 3)/(3 ÷ 4) (division terme à terme).
  - `inverse-oublie` : 2/3 ÷ 3/4 = 2/3 × 3/4 = 1/2.
  - `signe-inverse` (🔴) : l'inverse de −3/4 écrit 4/3 (signe perdu) au lieu de −4/3.
- **Astuce :** « Je recopie la première, je change ÷ en ×, je retourne la **seconde**. » (Chez beaucoup de profs : « je garde, je change, je retourne ».)
- **Reprises :** cours 17 (naturelle : après avoir retourné, on multiplie), cours 6 et 13 (signes).
- **Niveaux :** N1 : deux fractions positives, résultat simple. N2 : une fraction négative, un entier (3 ÷ 2/5). N3 : fractions négatives et simplification, ou fraction sur fraction (écrite avec une grande barre).
- **Sources :** S6 ; spec §5 n° 15.

---

### Module D. Carrés et identités remarquables (cours 19 à 24)

*Les cours 22 à 24 se font d'abord **avec des nombres** (21², 19², 51 × 49), dans l'esprit calcul mental ; les identités remarquables avec lettres sont proposées plus tard (§5, question 3). Selon une présentation académique de la réforme de 2026, les identités remarquables sont déplacées de la seconde vers la première (S8) : raison de plus de les préparer ici.*

#### Cours 19 — Le carré d'un nombre
- **Règle :** *Le carré d'un nombre, c'est ce nombre multiplié par lui-même ; le carré d'un nombre négatif est positif.*
- **Idée de départ :** un carré de côté 3 a pour aire 3 × 3 = 9 (image) ; (−3)² = (−3) × (−3) : deux signes − (cours 5, cours 7 : nombre pair de −) donc +.
- **Erreurs attendues :**
  - `carre-egal-double` : 3² = 6 (× 2 au lieu de × 3).
  - `carre-negatif-negatif` (🔴) : (−3)² = −9 (le signe − « reste »). Erreur classique, souvent attribuée à la calculatrice (S9).
  - `table-carres` : 7² = 42, 8² = 54… (carrés mal connus).
- **Astuce :** « Carré = nombre × lui-même. Les carrés de 1 à 15 sont à savoir par cœur (1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225). Un carré n'est **jamais négatif**. »
- **Reprises :** cours 5 (règle des signes), cours 7 (compter les −).
- **Niveaux :** N1 : carrés de 1 à 9, négatifs inclus. N2 : de 10 à 15 et multiples de 10 (30², (−20)²). N3 : décimaux simples (0,5²), fractions ((−2/3)² = 4/9, reprise des cours 17 et 13), nombres jusqu'à 30.
- **Sources :** S9, S10 ; spec §5 n° 16.

#### Cours 20 — (−3)² ou −3² : la parenthèse décide
- **Règle :** *L'exposant 2 ne s'applique qu'à ce qui est juste devant lui : (−3)² = 9, mais −3² = −(3²) = −9.*
- **Idée de départ :** −3² se lit « l'opposé de 3² » : le carré passe **avant** le signe − (comme × passe avant + au cours 8). Les parenthèses disent « le signe fait partie du nombre ». Même idée que le Cours 0 : le − a deux rôles (ici : signe d'un nombre, ou opposé d'un résultat). C'est le piège de **b² dans Δ = b² − 4ac** (spec §5 n° 17).
- **Erreurs attendues :**
  - `moins-dans-le-carre` (🔴) : −3² = 9.
  - `parentheses-sans-effet` : (−3)² = −9.
  - `soustraire-un-carre` : 5 − 3² = 2² = 4 (elle fait 5 − 3 d'abord) ; 5 − (−3)² = 5 − 9 = −4 oublié ou mal signé.
- **Astuce :** « Je me demande : le signe − est-il **dans** la parenthèse (alors il est carré aussi) ou **devant** (alors il attend le carré) ? Sur la calculatrice : toujours (−3)². »
- **Reprises :** cours 19 (le carré), cours 8 et 10 (priorités, parenthèses), cours 4 (5 − (−9)).
- **Niveaux :** N1 : −3² et (−3)² (nombres 1 à 9). N2 : 5 − 3², 5 − (−3)², −(−3)². N3 : −2² + (−2)² − 3², avec des nombres jusqu'à 12.
- **Sources :** S9, S10 (b négatif dans Δ) ; spec §5 n° 17.

#### Cours 21 — Le carré avant × et ÷ *(cours ajouté)*
- **Règle :** *Le carré se calcule avant × et ÷ ; pour carrer un produit, il faut des parenthèses : 2 × 3² = 18, mais (2 × 3)² = 36.*
- **Idée de départ :** le carré est la priorité la plus forte, juste après les parenthèses : 2 × 3² = 2 × 9. C'est le cours 8 avec un niveau de plus (« 3² est un bloc »).
- **Erreurs attendues :**
  - `fois-avant-carre` : 2 × 3² = 6² = 36.
  - `carre-du-produit` : (2 × 3)² = 2 × 3² = 18, ou 2² × 3 = 12 (l'exposant s'applique à un seul facteur).
  - `distribue-le-carre-sur-somme` : (2 + 3)² = 2² + 3² = 13 (voir cours 22, qui traite le fond).
- **Astuce :** « Ordre complet : parenthèses, **carrés**, × et ÷, + et −. Je souligne d'abord les carrés. »
- **Reprises :** cours 8 (priorités), cours 20 (le signe devant un carré).
- **Niveaux :** N1 : a × b² avec 1 à 9. N2 : (a × b)², 2 × (−3)². N3 : deux carrés et un produit (3 × (−2)² − 4 × 5²), parenthèses imbriquées.
- **Pourquoi ce cours est ajouté :** chaque terme 4ac de Δ et chaque a x² d'un trinôme demande cette priorité ; ce n'est pas dans la spec.
- **Sources :** S2, S3, S9.

#### Cours 22 — Le carré d'une somme ou d'une différence (a + b)², (a − b)²
- **Règle :** *(a + b)² = a² + 2ab + b² ; (a − b)² = a² − 2ab + b². Le carré d'une somme n'est **pas** la somme des carrés.*
- **Idée de départ :** un grand carré de côté a + b coupé en 4 morceaux : un carré a², un carré b² et **deux** rectangles ab (image). Avec des nombres : (3 + 4)² = 49 = 9 + 24 + 16, et pas 9 + 16 = 25. Calcul mental : 21² = (20 + 1)² = 400 + 40 + 1 = 441 ; 19² = (20 − 1)² = 400 − 40 + 1 = 361.
- **Erreurs attendues :**
  - `carre-de-chaque-terme` (🔴) : (a + b)² = a² + b² (S11, S12, S13 : « l'erreur la plus fréquente »).
  - `double-produit-oublie` ou `produit-simple` : (a + b)² = a² + ab + b² (le 2 manque).
  - `signe-du-milieu` : (a − b)² = a² + 2ab + b² ou a² − 2ab − b² (signe de b² mal mis, S11).
- **Astuce :** « Un carré, un **double produit**, un carré. Le double produit prend le signe du milieu ; le dernier carré est **toujours +**. » Contrôle numérique : (a + b)² doit être plus grand que a² + b² quand a et b sont positifs.
- **Reprises :** cours 10 (« la parenthèse d'abord » donne la même valeur : (3 + 4)² = 7² = 49, qui sert de vérification), cours 19 et 20 (carrés, signes).
- **Niveaux :** N1 : (a + b)² avec a de 10, 20, 50 et b de 1 à 5 (calcul mental) ; une règle à la fois (somme, puis différence : deux règles dans le cours). N2 : mélange somme/différence, a = 30, 40, 100. N3 : b négatif (a + (−b))², a et b plus grands, ou 2ab à calculer avec des fractions simples.
- **Sources :** S11, S12, S13, S8 (place dans le programme).

#### Cours 23 — Le produit (a + b)(a − b)
- **Règle :** *(a + b)(a − b) = a² − b².*
- **Idée de départ :** deux parenthèses, mêmes nombres, signes contraires : les doubles produits s'annulent (+ab − ab). Calcul mental : 51 × 49 = (50 + 1)(50 − 1) = 2500 − 1 = 2499.
- **Erreurs attendues :**
  - `carre-de-la-somme` : (a + b)(a − b) = a² + b² ou (a + b)² (le signe − est oublié).
  - `carre-de-la-difference` : (a + b)(a − b) = (a − b)² ou a² − 2ab + b².
  - `signe-du-b2` : (a + b)(a − b) = a² + b² (le b² doit être précédé de −).
- **Astuce :** « Même nombre, signes contraires : "le carré du premier moins le carré du second". Je repère la **moyenne** : 49 et 51 sont autour de 50. »
- **Reprises :** cours 22 (naturelle : les mêmes carrés, le double produit disparaît), cours 20 (−b²).
- **Niveaux :** N1 : a de 10, 20, 50 et b de 1 à 5. N2 : a de 30, 40, 100 ; calcul inverse (reconnaître 99 × 101). N3 : 7,5 × 6,5 ; (2a + 3)(2a − 3) avec des nombres.
- **Sources :** S11, S12, S13.

#### Cours 24 — Remplacer une lettre par un nombre négatif (et calculer Δ) *(cours ajouté)*
- **Règle :** *Quand je remplace une lettre par un nombre négatif, je mets **toujours** le nombre entre parenthèses, puis je calcule avec les priorités.*
- **Idée de départ :** x² avec x = −2 : si je recopie −2² je lis « −4 » : les parenthèses gardent le signe dans le carré. Même chose pour −b avec b = −5 : −(−5) = 5. C'est un cours qui **utilise** les autres : un assemblage guidé.
- **Erreurs attendues :**
  - `parentheses-oubliees` (🔴) : x² avec x = −2 donne −2² = −4 ; 3x² − x + 1 avec x = −2 : 3 × −2² …
  - `moins-b-perdu` : −b avec b = −5 donne −5 (au lieu de 5) (S10, source commerciale, à considérer comme indicative).
  - `signe-de-4ac` : Δ = b² − 4ac avec a = 2, c = −3 donne 25 − 24 = 1 (au lieu de 25 + 24 = 49) (S9, S10).
  - `oubli-du-4` ou `b-sans-carre` : Δ = b² − ac ; Δ = b − 4ac (S10).
- **Astuce :** « Je recopie la formule, je remplace **chaque** lettre par son nombre **entre parenthèses**, et seulement ensuite je calcule : carrés, produits, puis + et −. »
- **Reprises :** cours 20 (signe et carré), cours 21 (carré avant ×), cours 11 (−(−12) = +12), cours 10 (parenthèses). Pour la formule de Δ : toutes.
- **Niveaux :** N1 : f(x) = x² + 3 ou 2x − 5 avec x négatif (1 à 5). N2 : 3x² − x + 1 avec x = −2, a x² + b x + c. N3 : Δ = b² − 4ac avec a, b, c de signes quelconques (a ou c négatif), et à la fin f(−1)/2 avec des fractions simples.
- **Pourquoi ce cours est ajouté :** c'est le cas d'usage pour lequel le module existe (spec §1 : « erreurs de signes, … fractions »). **Réponse numérique seulement**, mais la formule est affichée avec des lettres : besoin dans l'appli (§5).
- **Sources :** S9, S10, S14 (programme de première : second degré, dérivation).

---

## 4. Les reprises entre cours

Règles du skill : pas d'écran de rappel ; une des 4 questions de la série de pratique **et** un des deux cas de « Comparer deux cas » viennent d'un cours précédent **à partir du 2e cours d'un module**. Pour le **1er cours** d'un module, les deux viennent du cours lui-même. Jamais de calculs d'anciens cours dans les 5 exercices de fin.

« Reprise naturelle » : méthode contenue dans le cours, sans question à ajouter.

| Cours | Reprise naturelle (contenue) | Série de pratique : la question intercalée vient de… | Comparer deux cas : cas A (ce cours) / cas B (cours précédent) |
|---|---|---|---|
| 0 | — | — (1er cours) | — |
| 1 | cours 0 (écriture) | — (Cours 1 est le 1er cours de relatifs de signe) | deux cas du cours lui-même (v2 existant) |
| 2 | cours 1 | cours 1 : −4 + (−3) | A : −7 + 2 / B : −7 + (−2) (cours 1) |
| 3 | cours 1, 2 | cours 2 : −3 + 5 | A : −2 + 5 + (−4) / B : −2 + 5 (cours 2) |
| 4 | cours 1, 2, 3 | cours 3 : 6 + (−2) + 4 | A : 5 − (−3) / B : 5 + (−3) (cours 2) |
| 5 | — (nouvelle opération) | cours 4 : 5 − (−3) | A : −3 × (−4) / B : −3 + (−4) (cours 1) |
| 6 | cours 5 (même règle des signes) | cours 5 : −8 × 5 | A : −12 ÷ 4 / B : −12 × 4 (cours 5) |
| 7 | cours 5 | cours 6 : −35 ÷ (−7) | A : −2 × 3 × (−4) / B : −2 × 3 (cours 5) |
| **8** | cours 4, 5 | — (1er cours du module B) : les 4 questions sont sur ce cours | deux cas de ce cours : 3 + 2 × 4 / 3 × 2 + 4 |
| 9 | cours 3, 4 | cours 8 : 3 + 4 × 2 | A : 10 − 3 + 2 / B : 10 − 3 × 2 (cours 8) |
| 10 | cours 8, 9 | cours 9 : 12 ÷ 3 × 2 | A : (3 + 4) × 2 / B : 3 + 4 × 2 (cours 8) |
| 11 | cours 4, 9, 10 | cours 10 : 2 × (3 − 5) | A : 8 − (3 + 2) / B : 8 − 3 + 2 (cours 9) |
| **12** | cours 6 (diviser) | — (1er cours du module C) | deux cas de ce cours : 12/18 / 12/19 |
| 13 | cours 6, 12 | cours 12 : 12/18 | A : (−6)/(−9) / B : −6/9 (cours 12) |
| 14 | cours 1 à 4 (sur les numérateurs) | cours 13 : (−3)/(−6) | A : 3/7 + 2/7 / B : 3/(−7) + 2/7 (cours 13) |
| 15 | cours 12 (à l'envers), 5 | cours 14 : 3/7 − 5/7 | A : 3/4 = ▢/12 / B : 6/9 = ▢/3 (cours 12) |
| 16 | cours 14, 15 | cours 14 : 2/5 + 1/5 | A : 2/5 + 1/10 / B : 2/5 + 1/5 (cours 14) |
| 17 | cours 5, 12 | cours 16 : 1/2 + 1/3 | A : 2/3 × 3/4 / B : 2/3 + 3/4 (cours 16) |
| 18 | cours 17, 13 | cours 17 : −2/3 × 3/4 | A : 2/3 ÷ 3/4 / B : 2/3 × 3/4 (cours 17) |
| **19** | cours 5, 7 | — (1er cours du module D) | deux cas de ce cours : (−3)² / 3² |
| 20 | cours 19 | cours 19 : 7² | A : −3² / B : (−3)² (cours 19) |
| 21 | cours 8, 20 | cours 20 : 5 − 3² | A : 5 × 3² / B : 5 − 3² (cours 20) |
| 22 | cours 10 (contrôle), 19, 20 | cours 10 : (2 + 5) × 3 | A : (3 + 4)² / B : 3² + 4² (cours 19) |
| 23 | cours 22 | cours 22 : (20 + 1)² | A : (5 + 2)(5 − 2) / B : (5 + 2)² (cours 22) |
| 24 | cours 8, 10, 11, 19, 20, 21 | cours 20 : (−4)² − 3 | A : 3 × (−2)² / B : 3 × −2² (cours 20) |

**Une remarque sur les premiers cours de modules B, C, D :** le skill dit que les deux cas viennent du cours lui-même. Mais ces cours sont précisément ceux où un entraînement intercalé avec un cours du module précédent serait le plus utile (par ex. cours 8, 12 ou 19 avec un calcul du cours 5). Je ne le propose pas pour respecter le skill ; à dire si tu veux une exception (voir « ce qui m'a manqué », rapport).

**Reprises transversales, hors des cours** (révisions, entraînement, échauffement) : toute la progression du module A reste dans les révisions ; les modules B à D y ajoutent leurs cours au fur et à mesure. Les cours 8 à 11 reprennent naturellement 4 et 5 ; les cours 17 et 18 reprennent 5 à 7 ; le cours 24 reprend à peu près tout.

---

## 5. Ce qui manque dans l'appli

*(Constat établi en lisant `docs/validation/03-clavier-et-reponses.md`, `packages/engine/src/courses/calculs/` et `packages/engine/src/math/expr.ts` sans les modifier. À vérifier au moment de coder le premier cours qui en a besoin.)*

**Déjà là :** la fraction empilée au clavier (doc 03 §2), les messages « Simplifie. » / « Le calcul n'est pas fini : simplifie. », des valeurs rationnelles et un nœud puissance dans le modèle d'expressions (`expr.ts`), les briques de cours (étapes interactives, série de pratique, droite graduée, `trou`, `choix`, `reecrire`).

| Besoin | Pour quels cours | Remarque |
|---|---|---|
| **Générateur d'expressions à plusieurs opérations**, avec arbre de calcul et **résolution type étape par étape** (« 3 + 4 × 2 → 3 + 8 → 11 ») | 8 à 11, 21, 24 | Le générateur des cours 0 à 7 fait une seule opération ou une somme/un produit de plusieurs termes. |
| **Évaluateurs « à erreur »** : fonctions qui calculent avec la mauvaise règle (gauche à droite, parenthèse ignorée, numérateurs et dénominateurs additionnés…) | 8 à 11, 14 à 18, 22 à 24 | C'est ce qui permet de **reconnaître** l'erreur d'après la réponse tapée, sans liste à la main : si la réponse vaut le résultat de l'évaluateur fautif, c'est cette erreur. |
| **Réponse « fraction »** : forme attendue (irréductible ?), signe, entier ou fraction | 12 à 18, 19 (N3), 24 (N3) | Question 4. La fraction empilée existe au clavier ; la correction doit comparer des **valeurs** et signaler « non simplifié ». |
| **Touche carré / puissance** (x², et peut-être xⁿ) | 19 à 24 | Le clavier de réponse doit rester complet (« il ne dicte jamais la réponse »). La puissance existe dans `expr.ts` ; l'**affichage empilé** et la **saisie** sont à faire. Saisie de (−3)² sans oublier de parenthèses : le cours 0 couvre l'écriture. |
| **Touche et affichage d'une lettre (x)** | 24 ; plus tard identités avec lettres | Pour le cours 24 : lettre affichée dans la formule, **réponse numérique** (pas de lettre dans la réponse). |
| **Comparateur d'expressions littérales (développer (x + 3)²)** | seulement pour l'option « identités avec lettres » | Normalisation de polynôme : à ne développer que si la question 3 est « avec lettres ». |
| **Brique d'écran « fractions en parts »** (barre ou disque découpé, colorier, additionner des parts) | 12, 14, 15, 16 | Réutilisable aussi pour 17 (rectangle). Dans les leçons, couleurs autorisées ; **grise pendant une question** (doc 08 n° 27). |
| **Brique d'écran « carré découpé »** (aire (a + b)² en 4 morceaux) | 19, 22, 23 | Même principe. |
| **Scène de calcul touchable** (« Touche l'opération à faire en premier », souligner un bloc) | 8 à 11, 21 | Le skill mentionne cette scène dans la maquette `cours-0-v3.html` ; elle sert ici de geste principal. Une question dyslexique-friendly : le calcul reste écrit normalement en haut, les choix en bas. |
| **Reprise de calculs d'un autre cours dans le moteur** | tous les cours à partir du 2e d'un module (§4) | La série de pratique et « Comparer deux cas » doivent pouvoir appeler le **générateur et les messages d'un autre cours par son identifiant**. Pour les 1ers cours des modules B, C, D, c'est dans le même module ; pour la suite, entre modules. À vérifier si le moteur fait déjà référence à un cours précédent (le doc 08 n° 35 le décide, le doc 06 le décrit pour les cours 2 à 7, mais le code actuel ne l'a que pour le cours 1). |
| **Écouter (synthèse vocale) pour fractions et puissances** | 12 à 24 | Écrire les textes lus : « trois septièmes », « moins trois au carré, c'est neuf », « moins trois, tout au carré » vs « moins, trois au carré » (cours 20 : cas à tester à l'oral, c'est justement la nuance). |
| **Modules multiples** (si découpage en 4) : renommer « Calculs » en « Relatifs » ; progression « 5 / 8 », badge, accueil (« Prochain cours » qui passe au module suivant), Mes cours groupé par module, révisions mélangeant les modules commencés | A à D | Écrit dans le doc 06 (« Les modules ») ; l'accueil « Module terminé » existe (doc 08 n° 19). À vérifier : le passage automatique au module suivant quand le choix des modules n'est pas encore là (question 1). |
| **Fiche mémo** avec une petite figure (parts, aire) | 12 à 24 | Le doc 08 n° 38 décrit la fiche en texte : décider si une figure y est autorisée. |

---

## 6. Sources

**Statut de lecture honnête :** j'ai fait des recherches sur Internet et lu les extraits renvoyés ; **je n'ai pas pu ouvrir** les PDF de programme eux-mêmes (le site snes.edu n'est pas joignable depuis cette session). Les points tirés du programme sont donc des **extraits de recherche**, à vérifier dans le texte officiel avant d'écrire les cours concernés. Les liens vers des sites commerciaux sont marqués : ils servent à repérer les erreurs, pas à fixer le programme.

*Documents du dépôt*
- D1 — `docs/superpowers/specs/2026-11-22-plus-ou-moins-v1-design.md` (§1, §5).
- D2 — `docs/validation/06-cours-relatifs.md` (cours 0 à 7).
- D3 — `docs/validation/08-decisions-ecrans.md` (n° 20 à 42), `docs/validation/03-clavier-et-reponses.md`.
- D4 — Skills `plus-ou-moins-creer-un-module-de-cours` et `plus-ou-moins-ecrire-un-cours`.

*Programmes officiels*
- S1 — Programme de mathématiques de seconde générale et technologique (arrêté, annexe, en vigueur depuis 2019) : « poursuivre en seconde l'acquisition d'automatismes initiée au collège… activités rituelles, notamment de calcul… pratique régulière du calcul numérique et du calcul littéral ». <https://www.snes.edu/IMG/pdf/maths_annexe_2egt_bo.pdf> (extrait de recherche) ; autre copie : <https://ent2d.ac-bordeaux.fr/disciplines/mathematiques/wp-content/uploads/sites/3/2026/06/1-Programme-denseignement-de-mathematiques-de-la-classe-de-seconde-generale-et-technologique.pdf>.
- S14 — Programme de spécialité de mathématiques de première générale (BO, annexe) : second degré (discriminant, forme canonique), dérivation. <https://www.snes.edu/IMG/pdf/maths_spe_annexe_1eg_bo.pdf> ; version 2026 : <https://ent2d.ac-bordeaux.fr/disciplines/mathematiques/wp-content/uploads/sites/3/2026/06/3-Programme-denseignement-de-specialite-de-mathematiques-de-la-classe-de-premiere-de-la-voie-generale.pdf>. Éduscol, ressource « programmes de seconde, première, terminale » : <https://eduscol.education.fr/document/24568/download> (apparue dans les recherches, non ouverte). Ce que dit la recherche : aucun thème de la spécialité de première ne s'appelle « automatismes » (contrairement à la voie technologique).
- S8 — Présentation académique des nouveaux programmes (juin 2026) : « Des contenus de 2nde à automatismes à décaler en 1ère : les identités remarquables ; la résolution des inéquations ». <https://mathematiques.ac-normandie.fr/IMG/pdf/nouveaux_programmes_lyce_es_r26_pre_sentation_ens.pdf> (extrait de recherche ; contexte non entièrement clair, **à vérifier**).

*Erreurs des élèves et méthodes*
- S2 — Éduscol, ressources sur les priorités opératoires (erreurs sur 6 + 4 × 2 : addition d'abord, ou multiplication des mauvais nombres) : <https://eduscol.education.fr/document/60854/download>, <https://eduscol.education.fr/document/58329/download>, <https://eduscol.education.fr/document/60848/download>, <https://eduscol.education.fr/document/60851/download>.
- S3 — Fiche de révision CRPE, « Opérations, priorités opératoires » (« les parenthèses, puis les multiplications et divisions, puis les additions et soustractions. À priorité égale, on calcule de gauche à droite. ») : <https://travail-industrie.com/concours/crpe/mathematiques/operations-et-priorites>.
- S4 — Priorités dans les calculs (collège, académie de Normandie) : <https://le-castillon-le-pieux.college.ac-normandie.fr/IMG/pdf/Priorites_dans_les_calculs.pdf> ; IREM / Publimath : <https://bibnum.publimath.fr/ITO/ITO13002.pdf> (étude : 12 + 4 ÷ 2 et 2 + 3 × 4 sont les calculs qui font le plus d'erreurs en 6e).
- S5 — « Distribuer le signe − » (5 − (3x + 2)) dans « Les erreurs fréquentes en maths » : <https://cours-et-fiches.com/college/maths/erreurs-frequentes-maths/> (site de cours, non officiel).
- S6 — Éduscol, fractions : la fraction vue comme « deux entiers accolés » conduit à additionner séparément numérateurs et dénominateurs (1/2 + 1/3 = 2/5) : <https://eduscol.education.fr/document/60845/download> ; analyse d'erreurs académie de Bordeaux : <https://ent2d.ac-bordeaux.fr/disciplines/mathematiques/wp-content/uploads/sites/3/2026/05/Fiche-1-de-retour-sur-exos-5-analyse-des-erreurs.pdf> ; IREM de Grenoble : <https://irem.univ-grenoble-alpes.fr/medias/fichier/8x7_1570692898474-pdf> (lu en partie seulement).
- S7 — « Simplifier » une somme : erreur classique citée dans les ressources fractions (S6) ; la même erreur réapparaît sur (−b ± √Δ)/2a (S10).
- S9 — Cours de première spécialité, second degré (calcul de Δ) : <https://paternaultlouis.forge.apps.education.fr/cours-1generale-spe-math/03-second-degre/cours.pdf> ; bilan : <https://paternaultlouis.forge.apps.education.fr/cours-1generale-spe-math/03-second-degre/bilan.pdf> ; <https://colbert-maths.github.io/site/Cours/01.Pratique_calculatoire.pdf> (pratique calculatoire).
- S10 — Erreurs sur Δ = b² − 4ac (b négatif, signe de −4ac, oubli du 4, 2a) : <https://www.omnicalculator.com/fr/mathematiques/calculateur-discriminant> (**site commercial**, à prendre comme indication, pas comme statistique).
- S11 — Identités remarquables, pièges (a + b)² ≠ a² + b², terme 2ab oublié, signe de b² dans (a − b)² : <https://cours-et-fiches.com/college/maths/identites-remarquables/>.
- S12 — Les trois identités remarquables (Digischool) : <https://www.digischool.fr/cours/les-trois-identites-remarquables-vr7m> ; carré d'une somme et géométrie : <https://www.digischool.fr/cours/identites-remarquables-et-geometrie-pnq0>.
- S13 — Éduscol, ressource sur le calcul algébrique : <https://eduscol.education.fr/document/22051/download> (apparue dans les recherches sur les identités remarquables, non ouverte).

*Non trouvé* : aucune source ouverte ne traitait de −3² contre (−3)², ni de la priorité du carré ; le texte du cours 20 s'appuie sur la règle standard (le carré passe avant le signe −) et sur S9/S10 pour le lien avec Δ. À confirmer avec les documents de classe.

---

## Questions pour toi (5 au plus)

1. **Découpage :** 4 modules (Relatifs / Priorités / Fractions / Carrés et identités), 3 modules (Priorités et Fractions ensemble) ou un seul module de 25 cours ? **Ma recommandation : 4 modules**, pour des badges plus fréquents et des modules qu'on apprend séparément ; l'appli enchaîne les modules dans l'ordre en attendant « choisir ses modules ».
2. **Les 7 cours ajoutés** (hors spec §5) : « Même priorité : de gauche à droite » (9), « Enlever des parenthèses précédées d'un − » (11), « Mettre au même dénominateur » (15), « Le carré avant × et ÷ » (21), « (a ± b)² » (22), « (a + b)(a − b) » (23) et « Remplacer une lettre par un nombre négatif / calculer Δ » (24). Tu les gardes ? **Ma recommandation : oui, les 7**, ce sont les endroits où les erreurs de signe reviennent en second degré et en dérivation ; les plus faciles à retirer en cas de doute sont les cours 21 et 23.
3. **Identités remarquables : avec des nombres ou avec des lettres ?** **Recommandation : d'abord avec des nombres** (21², 19², 51 × 49), ce qui n'exige pas de brique « lettres » dans l'appli ; les identités avec lettres ((x + 3)²) dans un futur module « Calcul littéral », quand on aura la touche x et la correction d'expressions littérales.
4. **Fractions : forme exigée de la réponse.** Faut-il exiger la fraction **irréductible** avec le signe **devant la barre** (−2/3) ? **Recommandation : oui**, c'est ce qu'on attend en contrôle ; une réponse juste mais non simplifiée reçoit « Simplifie. » (comme au doc 03, sans compter faux), sauf dans le cours 12 où elle est fausse.
5. **Documents de classe.** Peux-tu m'envoyer un cours, un cahier ou des exercices de l'élève ? **Recommandation : valider maintenant le module A (déjà écrit) et attendre ces documents avant de valider B, C et D**, pour garder l'ordre et le vocabulaire de la classe (par exemple si la classe appelle « simplification » ou « réduction au même dénominateur » autrement, ou si le prof donne une astuce propre pour les identités).
