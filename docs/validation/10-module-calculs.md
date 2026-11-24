# 10 — Plan du module « Calculs » (relatifs, priorités, fractions, carrés)

*Statut : **validé le 2026-11-25** par le porteur du projet (voir « Décisions » à la fin). **Documents de classe attendus pour affiner les modules B, C et D** (ordre, vocabulaire, astuces de la classe). Plan produit le 2026-11-24 avec le skill `plus-ou-moins-creer-un-module-de-cours`, complété le 2026-11-25 (rubrique « Astuces et techniques » pour chaque cours, programmes officiels lus et cités au §6). Aucun cours n'est écrit ici : seulement le plan.*

## Résumé pour le porteur du projet

- Le chapitre « Calculs de base » doit couvrir **relatifs, priorités, fractions, carrés** (spec §5). Avec les cours 0 à 7 déjà écrits, il reste **17 cours à ajouter** : cela fait **25 cours en tout**.
- **Chaque cours propose plusieurs techniques ; l'élève peut choisir la sienne.** Chaque cours a une rubrique « Astuces et techniques » de 3 ou 4 entrées (nom court, quand l'utiliser, exemple chiffré, piège évité) : regrouper les positifs puis les négatifs, compter les signes, passer par l'opposé, vérifier par l'opération inverse ou par l'ordre de grandeur, calcul mental, schémas, simplifier en croix, dénominateur commun le plus petit ou produit des dénominateurs, astuce des 5 (35² = 1225), (a + b)(a − b) pour 49 × 51… La technique **principale** va dans la fiche mémo ; les autres deviennent des étapes de la leçon ou un écran « Autres façons de faire ».
- **Décision : 4 modules**, de 4 à 8 cours chacun : **Relatifs** (cours 0 à 7, déjà faits), **Priorités** (cours 8 à 11), **Fractions** (cours 12 à 18), **Carrés et identités remarquables** (cours 19 à 24). Un module terminé = un badge, plus souvent ; et ce sont des parties qu'on apprend l'une sans l'autre. Les autres choix étudiés (3 modules, ou un seul de 25 cours) sont écartés (voir §2).
- **Les cours 0 à 7 sont justes** et je les garde. Quelques retouches à noter : les cours 2 à 7 sont encore en version 1 (négatifs en rouge au lieu d'orange, pas de série de pratique, etc.), à réécrire avec le skill « écrire un cours » ; rien ne manque vraiment pour les relatifs.
- **Cours ajoutés par rapport à la spec §5** (les 7 sont gardés) : « Même priorité : de gauche à droite », « Enlever des parenthèses précédées d'un − », « Mettre au même dénominateur », « Le carré avant × et ÷ », « Le carré d'une somme ou d'une différence », « (a + b)(a − b) » et « Remplacer une lettre par un nombre négatif » (qui mène au calcul de Δ = b² − 4ac). Ce sont les endroits où les élèves de première perdent des points en second degré et en dérivation.
- **Ce qu'il faut ajouter dans l'appli** : une touche « carré / puissance », des générateurs d'expressions avec priorités, des calculs avec fractions, des écrans pour voir les fractions et le carré d'une somme, et la reprise de calculs d'un autre cours (détail §5). Les identités remarquables avec des **lettres** (développer (x + 3)²) demandent une vraie brique « lettres » : elles viendront dans un futur module « Calcul littéral » ; ici, des nombres (21², 19²…).
- Module A validé maintenant ; **documents de classe attendus pour affiner B, C et D** (ordre et vocabulaire de la classe à garder).
- **Programmes officiels lus** (seconde, première spécialité, cycle 4) : citations et pages au §6 ; les points « à vérifier » sont corrigés et les écarts avec le plan sont listés.
- Les décisions du porteur du projet sont à la fin (« Décisions »).

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

**Pourquoi ces objectifs** (ce qui sert l'an prochain) : les calculs de Δ, de racines (−b ± √Δ) / (2a), de f(a) et de f'(a) mélangent exactement ces cinq compétences. Les sites de cours de première spécialité insistent sur les erreurs de signe de b et de c dans Δ (voir §6, sources S9 et S10). *Les programmes de seconde et de première ne détaillent pas ces calculs de base comme chapitre : ils les supposent acquis. Seconde : « Il est important en classe de seconde de poursuivre l'acquisition d'automatismes initiée au collège » (S1, p. 3). Première : « Il importe de poursuivre l'entraînement des élèves dans ce domaine par la pratique régulière du calcul numérique et du calcul littéral » (S14, p. 3). Le détail est au §6.*


### Ce que le programme de 3e attend déjà

Le programme de cycle 4 (5e, 4e, 3e) est enregistré dans `docs/sources/maths_cycle4_annexe2_bo.pdf` (le même fichier couvre les trois années ; pages du PDF). On ne reprend pas tout le collège : voici les bases de **fin de 3e** utiles au module.

- **Fractions** (p. 10) : « Additionner, soustraire, multiplier et diviser des fractions » ; « Mettre une fraction sous forme irréductible ». Base des cours 12 à 18 : attendue de tout élève de fin de 3e.
- **Multiples et diviseurs** (p. 11) : factoriser un entier (60 = 2² × 3 × 5), simplifier une fraction dont les termes sont dans une même table, trouver un dénominateur commun, critères de divisibilité par 2, 3, 5, 9. Les techniques des cours 12 et 16 s'appuient dessus.
- **Puissances et racine carrée** (p. 10-11) : puissance comme produit itéré, exposants négatifs, notation scientifique ; « Donner les carrés des nombres entiers compris entre 0 et 12 » ; équations x² = a. Le cours 19 s'appuie sur les carrés de 0 à 12.
- **Calcul littéral** (p. 11) : valeur d'une expression avec des puissances, « – (5 – 4x) = –5 + 4x » (cours 11), double distributivité, équation produit nul, et « Manipuler les trois identités remarquables pour développer et factoriser » : **les cours 22 et 23 revoient donc du programme de 3e**, ce qui justifie leur place même sans décalage vers la première.
- **Base de 3e qui manque au plan** : la **double distributivité** (p. 11), qui précède les identités remarquables ; à rappeler dans le cours 22 (aire en 4 morceaux) ou à traiter dans le futur module « Calcul littéral ». Aucun cours du plan n'a à être supprimé ; les cours 12 à 18 et 22 à 23 sont des consolidations du collège, pas des nouveautés.

---

## 2. Découpage en modules

**Longueur :** 8 cours existants + 17 cours proposés = **25 cours**. La spec §5 disait « sans doute 20 à 25 ». Pour un module unique, c'est long : un seul badge à la fin, une progression « 12 / 25 » qui ne bouge pas vite, et un chemin où elle doit passer par les fractions avant de voir un carré, même si c'est le carré qui l'attend au contrôle.

**Décision : 4 modules** (les cours gardent un numéro continu, unique dans toute l'appli ; le Cours 0 reste l'introduction du 1er module, les autres modules n'ont pas de cours d'introduction).

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

Légende de chaque fiche : **Règle** (une phrase) · **Idée de départ** (le pourquoi) · **Erreurs attendues** (futures erreurs reconnues) · **Astuces et techniques** (2 à 4 entrées : nom, quand, exemple chiffré, piège évité ; la principale va dans la fiche mémo, les autres deviennent des étapes de la leçon ou l'écran « Autres façons de faire », l'élève choisit sa technique) · **Reprises** · **Niveaux 2 et 3** · **Sources**. Les niveaux suivent « même méthode, plus difficile » ; chaque cours dira ses propres nombres au moment de sa spec. Les numéros S1, S2… renvoient au §6.

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

**Astuces et techniques des cours 0 à 7** (nouveau : à ajouter au plan de chaque cours, et à intégrer lors de la réécriture des cours 2 à 7 ; pour les cours 0 et 1 déjà écrits, les techniques marquées « écran Autres façons de faire » sont à ajouter à la prochaine version).

- **Cours 0** :
  - **Astuces et techniques** (3 entrées ; l'élève choisit la sienne) :
    1. **Parenthèses autour d'un négatif** *(fiche mémo : la principale)* — *Quand :* dès qu'un nombre négatif suit une opération. *Exemple :* 5 + (−2) et jamais 5 + −2. *Piège évité :* deux signes collés qu'on ne sait plus lire.
    2. **Lire à voix haute** *(étape de la leçon)* — *Quand :* pour vérifier ce qu'on a écrit. *Exemple :* 8 − (−3) se lit « huit moins, moins trois » : on entend les deux rôles du −.
    3. **Nommer chaque signe** *(écran « Autres façons de faire »)* — *Quand :* en relisant un calcul de gauche à droite. *Exemple :* pour chaque −, dire « opération » ou « signe du nombre ». *Piège évité :* confondre le − d'opération et le − du nombre.
    *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3.
- **Cours 1** :
  - **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
    1. **Je garde le signe et j'additionne** *(fiche mémo : la principale)* — *Quand :* deux nombres de même signe. *Exemple :* −4 + (−3) = −(4 + 3) = −7. *Piège évité :* additionner puis oublier le signe.
    2. **Deux bonds dans le même sens** *(étape de la leçon)* — *Quand :* pour comprendre pourquoi (droite graduée). *Exemple :* deux bonds vers la gauche : on s'éloigne de 0, on arrive à −7.
    3. **Calcul mental par décomposition** *(écran « Autres façons de faire »)* — *Quand :* nombres à deux chiffres. *Exemple :* −27 + (−38) = −(27 + 40 − 2) = −65.
    4. **Vérifier l'ordre de grandeur** *(écran « Autres façons de faire »)* — *Quand :* après le calcul. *Exemple :* le résultat est plus loin de 0 que chacun des deux nombres : −7 est plus loin que −4 et −3. *Piège évité :* trouver −1 au lieu de −7.
    *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Cours 2** :
  - **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
    1. **Le plus grand sans le signe gagne** *(fiche mémo : la principale)* — *Quand :* signes contraires. *Exemple :* −7 + 2 : 7 > 2 donc le résultat est négatif ; 7 − 2 = 5 ; résultat −5. *Piège évité :* prendre le signe du premier nombre au lieu du signe du plus grand.
    2. **Décomposer jusqu'à 0** *(étape de la leçon)* — *Quand :* quand l'un des nombres est un peu plus grand que l'autre. *Exemple :* −7 + 9 = −7 + 7 + 2 = 2 ; −6 + 6 = 0 (deux opposés).
    3. **Commencer par le positif** *(écran « Autres façons de faire »)* — *Quand :* quand le calcul commence par un négatif. *Exemple :* −7 + 2 = 2 + (−7) = 2 − 7 : on lit « 2 moins 7 » (commutativité). *Piège évité :* partir d'un négatif et se perdre sur la droite.
    4. **Le signe du résultat se devine** *(écran « Autres façons de faire »)* — *Quand :* pour vérifier. *Exemple :* le résultat a le signe du nombre le plus loin de 0 : −7 + 2 est négatif.
    *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Cours 3** :
  - **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
    1. **Regrouper les positifs, puis les négatifs** *(fiche mémo : la principale)* — *Quand :* plus de deux nombres, signes mélangés. *Exemple :* 5 + (−8) + 3 + (−2) = (5 + 3) + (−8 − 2) = 8 + (−10) = −2 ; on peut réécrire l'addition dans l'ordre qu'on veut (ou d'abord les négatifs, puis les positifs), chaque nombre garde son signe. *Piège évité :* perdre un signe en déplaçant un nombre.
    2. **De gauche à droite, pas à pas** *(étape de la leçon)* — *Quand :* quand on préfère un seul calcul à la fois. *Exemple :* 5 − 8 = −3 ; −3 + 3 = 0 ; 0 − 2 = −2.
    3. **Chercher les opposés et les nombres ronds** *(écran « Autres façons de faire »)* — *Quand :* dès qu'un nombre et son opposé sont dans la somme. *Exemple :* 7 + (−4) + (−7) + 10 : 7 et −7 s'annulent ; −4 + 10 = 6 (associativité).
    4. **Cocher chaque nombre utilisé** *(écran « Autres façons de faire »)* — *Quand :* longues sommes. *Exemple :* barrer chaque terme au fur et à mesure. *Piège évité :* en oublier un.
    *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Cours 4** :
  - **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
    1. **Soustraire, c'est ajouter l'opposé** *(fiche mémo : la principale)* — *Quand :* toute soustraction. *Exemple :* 5 − (−3) = 5 + 3 = 8 ; 5 − 3 = 5 + (−3) = 2. *Piège évité :* faire comme si le − devant la parenthèse n'existait pas.
    2. **Retrancher une dette** *(étape de la leçon)* — *Quand :* pour comprendre 5 − (−3). *Exemple :* enlever une dette de 3, c'est être plus riche de 3 ; sur la droite, soustraire va dans le sens contraire.
    3. **Petit moins grand : on retourne** *(écran « Autres façons de faire »)* — *Quand :* quand on retranche un plus grand nombre. *Exemple :* 3 − 8 = −(8 − 3) = −5. *Piège évité :* soustraire dans le mauvais sens.
    4. **Vérifier par l'opération inverse** *(écran « Autres façons de faire »)* — *Quand :* après une soustraction. *Exemple :* 5 − (−3) = 8 car 8 + (−3) = 5.
    *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Cours 5** :
  - **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
    1. **Règle des signes** *(fiche mémo : la principale)* — *Quand :* tout produit de deux relatifs. *Exemple :* signes identiques : +, signes contraires : − ; (−3) × (−4) = +12. *Piège évité :* mettre le signe des nombres au lieu de celui du produit.
    2. **Les nombres d'abord, le signe ensuite** *(étape de la leçon)* — *Quand :* pour ne faire qu'une chose à la fois. *Exemple :* (−3) × 4 : 3 × 4 = 12, un seul − donc −12.
    3. **Calcul mental d'un produit** *(écran « Autres façons de faire »)* — *Quand :* produits à deux chiffres. *Exemple :* 7 × 12 = 70 + 14 = 84 ; 25 × (−4) = −100.
    4. **Passer par l'opposé** *(écran « Autres façons de faire »)* — *Quand :* quand un facteur est −1. *Exemple :* (−1) × 7 = −7 : multiplier par −1 donne l'opposé.
    *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Cours 6** :
  - **Astuces et techniques** (3 entrées ; l'élève choisit la sienne) :
    1. **Même règle des signes que pour ×** *(fiche mémo : la principale)* — *Quand :* toute division de deux relatifs. *Exemple :* −12 ÷ 4 = −3 ; −12 ÷ (−4) = 3. *Piège évité :* oublier que la règle est la même que pour la multiplication.
    2. **Vérifier par la multiplication** *(étape de la leçon)* — *Quand :* après une division. *Exemple :* −12 ÷ 4 = −3 car −3 × 4 = −12.
    3. **Barrer des zéros ou diviser en deux fois** *(écran « Autres façons de faire »)* — *Quand :* nombres ronds ou diviseur composé. *Exemple :* 350 ÷ 50 = 35 ÷ 5 = 7 ; 36 ÷ 4 = 18 ÷ 2 = 9.
    *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3.
- **Cours 7** :
  - **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
    1. **Je compte les −** *(fiche mémo : la principale)* — *Quand :* produit de plus de deux facteurs. *Exemple :* (−2) × 3 × (−4) : deux − donc positif ; 2 × 3 × 4 = 24 ; nombre pair de − : +, impair : −. *Piège évité :* mélanger les signes en calculant.
    2. **Deux par deux** *(étape de la leçon)* — *Quand :* pour avancer pas à pas. *Exemple :* (−2) × (−4) = 8 puis 8 × 3 = 24.
    3. **Réordonner les facteurs** *(écran « Autres façons de faire »)* — *Quand :* quand deux facteurs font un nombre rond. *Exemple :* 25 × (−7) × 4 = (25 × 4) × (−7) = −700 (commutativité, associativité).
    4. **Chercher le 0** *(écran « Autres façons de faire »)* — *Quand :* avant de calculer. *Exemple :* un seul facteur nul rend tout le produit nul.
    *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.

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

### Module C. Fractions (cours 12 à 18)

*Constat commun (Éduscol, S6) : beaucoup d'erreurs viennent d'une image fausse de la fraction : « deux nombres l'un sur l'autre » au lieu d'un nombre (une part, un quotient). Les cours de ce module commencent donc par une image : parts d'un tout et droite graduée, et rappellent que la fraction est une **division** (lien avec le cours 6).*

#### Cours 12 — Simplifier une fraction
- **Règle :** *Pour simplifier, je divise le numérateur et le dénominateur par le même nombre, jusqu'à ne plus pouvoir.*
- **Idée de départ :** 6/9 et 2/3 sont **la même part**, découpée autrement (parts égales, puis regroupées) ; la fraction est le résultat de 6 ÷ 9. Simplifier, c'est l'écrire avec les plus gros morceaux. Lien avec le « Calcul pas fini : simplifie » déjà dans l'appli (doc 03).
- **Erreurs attendues :**
  - `simplification-partielle` : 12/18 = 6/9 et elle s'arrête (non irréductible).
  - `simplifier-une-somme` : (2 + 6)/2 = 6 (elle « barre » le 2 de la somme au lieu de 8/2 = 4) ; classique en première pour les racines (−b ± √Δ)/2a (S7).
  - `un-seul-cote` : elle divise le haut mais pas le bas (12/18 → 6/18).
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Diviser par les petits nombres premiers** *(fiche mémo : la principale)* — *Quand :* on ne voit pas tout de suite le bon diviseur. *Exemple :* 36/48 → ÷ 2 : 18/24 → ÷ 2 : 9/12 → ÷ 3 : 3/4. *Piège évité :* s'arrêter trop tôt.
  2. **Critères de divisibilité** *(étape de la leçon)* — *Quand :* pour choisir le diviseur sans tâtonner. *Exemple :* par 2 : dernier chiffre pair ; par 3 : somme des chiffres divisible par 3 ; par 5 : fini par 0 ou 5 ; par 9 : somme divisible par 9 ; 84/126 : 8 + 4 = 12 et 1 + 2 + 6 = 9 donc par 3 : 28/42, puis par 2 et par 7 : 2/3.
  3. **Décomposer en facteurs puis barrer des facteurs** *(écran « Autres façons de faire »)* — *Quand :* grands nombres. *Exemple :* 36/48 = (2 × 2 × 3 × 3)/(2 × 2 × 2 × 2 × 3) = 3/4. *Piège évité :* barrer un terme d'une somme : (2 + 6)/2 n'est pas 6.
  4. **Diviser d'un coup par le plus grand diviseur commun** *(écran « Autres façons de faire »)* — *Quand :* quand on le repère (même table, ou différence). *Exemple :* 36/48 : 12 divise les deux, 36 ÷ 12 = 3 et 48 ÷ 12 = 4. Pour le trouver, il divise aussi la différence 48 − 36 = 12. 15/35 : même table de 5, 3/7.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (3 entrées ; l'élève choisit la sienne) :
  1. **Je compte les −** *(fiche mémo : la principale)* — *Quand :* signes en haut et en bas. *Exemple :* (−6)/(−9) : deux − donc +, 6/9 = 2/3 ; 2/(−3) : un − donc −2/3. *Piège évité :* laisser deux − qui s'annulent.
  2. **Signe de côté, fraction ensuite** *(étape de la leçon)* — *Quand :* signe et simplification dans la même fraction. *Exemple :* −12/18 : je mets le − de côté, 12/18 = 2/3, je le remets : −2/3. *Piège évité :* perdre le signe en simplifiant.
  3. **Lire comme une division** *(écran « Autres façons de faire »)* — *Quand :* pour comprendre pourquoi. *Exemple :* (−2)/3 = (−2) ÷ 3 ; 2/(−3) = 2 ÷ (−3) ; (−2)/(−3) = (−2) ÷ (−3) : cours 6.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3.
- **Reprises :** cours 6 (diviser des relatifs), cours 12 (simplifier, quand les deux sont combinés).
- **Niveaux :** N1 : un seul signe − (2/(−3), −2/3). N2 : deux signes (−5)/(−7), puis simplification en plus. N3 : signes à plusieurs endroits, −(−4)/6, fractions à simplifier.
- **Sources :** S6, spec §5 n° 11. *Décidé : fraction irréductible, signe devant la barre (voir « Décisions »).*

#### Cours 14 — Additionner, soustraire : même dénominateur
- **Règle :** *Même dénominateur : j'additionne (ou je soustrais) les numérateurs, je garde le dénominateur.*
- **Idée de départ :** 3 septièmes + 2 septièmes = 5 septièmes : on compte des parts de même taille, comme on compte des euros (« 3 pièces + 2 pièces = 5 pièces »). Image : une barre découpée en 7 parts, 3 colorées puis 2 de plus.
- **Erreurs attendues :**
  - `additionne-les-dessous` : 3/7 + 2/7 = 5/14 (le dénominateur est aussi additionné) : erreur n° 1 sur les fractions (S6).
  - `signe-numerateur` (🔴) : 3/7 − 5/7 = 2/7 (au lieu de −2/7).
  - `non-simplifie` : 1/6 + 2/6 = 3/6 (arrêt trop tôt ; traité par le message « Simplifie. », doc 03).
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Je garde le dénominateur, j'additionne les numérateurs** *(fiche mémo : la principale)* — *Quand :* même dénominateur. *Exemple :* 3/7 + 2/7 = 5/7. *Piège évité :* additionner aussi les dénominateurs (5/14).
  2. **Compter des parts** *(étape de la leçon)* — *Quand :* pour comprendre. *Exemple :* 3 septièmes + 2 septièmes = 5 septièmes : on compte des parts de même taille.
  3. **Un seul numérateur pour tout le calcul** *(écran « Autres façons de faire »)* — *Quand :* plusieurs fractions de même dénominateur. *Exemple :* 3/7 − 5/7 + 1/7 = (3 − 5 + 1)/7 = −1/7 (cours 3 sur les numérateurs). *Piège évité :* mal signer 3 − 5.
  4. **Numérateur = dénominateur** *(écran « Autres façons de faire »)* — *Quand :* résultat qui tombe sur 1. *Exemple :* 1/6 + 5/6 = 6/6 = 1.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Même facteur en haut et en bas** *(fiche mémo : la principale)* — *Quand :* écrire une fraction avec un autre dénominateur. *Exemple :* 3/4 = ▢/12 : 4 × 3 = 12, donc 3 × 3 = 9 ; 3/4 = 9/12. *Piège évité :* ajouter le même nombre en haut et en bas.
  2. **Se demander « par combien ? »** *(étape de la leçon)* — *Quand :* trouver le facteur. *Exemple :* de 4 à 12 : 12 ÷ 4 = 3.
  3. **Une fraction égale à 1** *(écran « Autres façons de faire »)* — *Quand :* pour comprendre pourquoi la valeur ne change pas. *Exemple :* 3/4 × 3/3 = 9/12 car 3/3 = 1.
  4. **Produit en croix pour vérifier** *(écran « Autres façons de faire »)* — *Quand :* vérifier deux fractions égales. *Exemple :* 3/4 = 9/12 car 3 × 12 = 4 × 9 = 36.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Plus petit dénominateur commun** *(fiche mémo : la principale)* — *Quand :* dénominateurs différents. *Exemple :* 5/6 − 3/4 : multiples de 6 : 6, 12 ; de 4 : 4, 8, 12 ; 12 : 10/12 − 9/12 = 1/12. *Piège évité :* prendre un dénominateur qui n'est multiple que d'un des deux.
  2. **Produit des dénominateurs** *(étape de la leçon)* — *Quand :* quand on ne voit pas le plus petit. *Exemple :* 1/2 + 1/3 : 2 × 3 = 6 ; 5/6 − 3/4 : 6 × 4 = 24 : 20/24 − 18/24 = 2/24 = 1/12 (marche toujours, mais simplifier après).
  3. **Un entier est une fraction** *(écran « Autres façons de faire »)* — *Quand :* un entier dans le calcul. *Exemple :* 3 − 2/5 = 15/5 − 2/5 = 13/5. *Piège évité :* oublier de mettre l'entier sur le même dénominateur.
  4. **Ordre de grandeur** *(écran « Autres façons de faire »)* — *Quand :* vérifier la somme. *Exemple :* 1/2 + 1/3 doit dépasser 1/2 : 2/5 = 0,4 est trop petit, 5/6 convient.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Haut avec haut, bas avec bas** *(fiche mémo : la principale)* — *Quand :* produit de fractions. *Exemple :* 2/3 × 3/4 = 6/12 = 1/2. *Piège évité :* chercher un dénominateur commun.
  2. **Simplifier avant (en croix)** *(étape de la leçon)* — *Quand :* nombres qui se simplifient entre numérateur et dénominateur. *Exemple :* 2/3 × 3/4 : je barre 3 et 3, 2 et 4 : 1/2 (on barre des facteurs, jamais des termes d'une somme).
  3. **Le signe d'abord** *(écran « Autres façons de faire »)* — *Quand :* fractions négatives. *Exemple :* (−2/3) × (−3/4) : deux − donc +, puis 1/2.
  4. **Un entier est une fraction sur 1 ; schéma de l'aire** *(écran « Autres façons de faire »)* — *Quand :* entier × fraction, et pour voir pourquoi. *Exemple :* 2 × 3/4 = 2/1 × 3/4 = 6/4 = 3/2 ; « les 2/3 de 3/4 » : rectangle en lignes et en colonnes. *Piège évité :* multiplier aussi le dénominateur.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Je garde, je change, je retourne** *(fiche mémo : la principale)* — *Quand :* division de fractions. *Exemple :* 2/3 ÷ 3/4 = 2/3 × 4/3 = 8/9. *Piège évité :* retourner la première fraction.
  2. **Combien de fois ?** *(étape de la leçon)* — *Quand :* pour comprendre. *Exemple :* 3 ÷ 1/4 = 12 : il y a 4 quarts dans chaque unité, 3 × 4.
  3. **L'inverse garde son signe** *(écran « Autres façons de faire »)* — *Quand :* fraction négative. *Exemple :* l'inverse de −3/4 est −4/3 ; l'inverse de 5 est 1/5. *Piège évité :* écrire 4/3.
  4. **Vérifier par la multiplication** *(écran « Autres façons de faire »)* — *Quand :* après la division. *Exemple :* 2/3 ÷ 3/4 = 8/9 car 8/9 × 3/4 = 24/36 = 2/3 ; simplifier en croix avant de multiplier.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Reprises :** cours 17 (naturelle : après avoir retourné, on multiplie), cours 6 et 13 (signes).
- **Niveaux :** N1 : deux fractions positives, résultat simple. N2 : une fraction négative, un entier (3 ÷ 2/5). N3 : fractions négatives et simplification, ou fraction sur fraction (écrite avec une grande barre).
- **Sources :** S6 ; spec §5 n° 15.

---

### Module D. Carrés et identités remarquables (cours 19 à 24)

*Les cours 22 à 24 se font d'abord **avec des nombres** (21², 19², 51 × 49), dans l'esprit calcul mental ; les identités remarquables avec lettres viendront plus tard dans un module « Calcul littéral » (§5, décisions). Les identités remarquables sont au programme de 3e (cycle 4, p. 11) et de seconde (p. 7), et la première les réutilise (p. 5) : ces cours sont des consolidations.*

#### Cours 19 — Le carré d'un nombre
- **Règle :** *Le carré d'un nombre, c'est ce nombre multiplié par lui-même ; le carré d'un nombre négatif est positif.*
- **Idée de départ :** un carré de côté 3 a pour aire 3 × 3 = 9 (image) ; (−3)² = (−3) × (−3) : deux signes − (cours 5, cours 7 : nombre pair de −) donc +.
- **Erreurs attendues :**
  - `carre-egal-double` : 3² = 6 (× 2 au lieu de × 3).
  - `carre-negatif-negatif` (🔴) : (−3)² = −9 (le signe − « reste »). Erreur classique, souvent attribuée à la calculatrice (S9).
  - `table-carres` : 7² = 42, 8² = 54… (carrés mal connus).
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Nombre fois lui-même** *(fiche mémo : la principale)* — *Quand :* tout carré. *Exemple :* (−3)² = (−3) × (−3) = 9 ; un carré n'est jamais négatif. *Piège évité :* écrire −9.
  2. **Carrés à connaître** *(étape de la leçon)* — *Quand :* calcul mental. *Exemple :* carrés de 0 à 12 (programme du collège) : 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144 ; puis 13² = 169, 14² = 196, 15² = 225.
  3. **Astuce des 5** *(écran « Autres façons de faire »)* — *Quand :* un nombre qui finit par 5. *Exemple :* 35² : 3 × 4 = 12, puis 25 : 1225 ; 65² : 6 × 7 = 42, puis 25 : 4225.
  4. **Multiples de 10, décimaux, carré suivant** *(écran « Autres façons de faire »)* — *Quand :* calcul mental. *Exemple :* 30² = 3² × 100 = 900 ; 0,5² = 0,25 ; 13² = 12² + 25 = 169 (n + 1)² = n² + 2n + 1.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Le signe est-il dans la parenthèse ?** *(fiche mémo : la principale)* — *Quand :* un − devant un carré. *Exemple :* (−3)² = 9 : le signe est carré aussi ; −3² = −(3²) = −9 : le carré passe avant. *Piège évité :* lire −3² comme (−3)².
  2. **Mettre soi-même les parenthèses** *(étape de la leçon)* — *Quand :* −3² écrit sans parenthèses. *Exemple :* −3² = −(3 × 3) = −9.
  3. **Le signe attendu avant de calculer** *(écran « Autres façons de faire »)* — *Quand :* vérifier. *Exemple :* un carré est positif : (−3)² > 0 ; −3² est l'opposé d'un carré : négatif.
  4. **Remplacer le carré par son résultat** *(écran « Autres façons de faire »)* — *Quand :* 5 − (−3)². *Exemple :* (−3)² = 9, puis 5 − 9 = −4 (cours 4). *Piège évité :* faire 5 − (−3) d'abord.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Ordre complet** *(fiche mémo : la principale)* — *Quand :* calculs avec carrés, produits, sommes. *Exemple :* parenthèses, carrés, × et ÷, + et − : je souligne les carrés d'abord ; 2 × 3² = 2 × 9 = 18. *Piège évité :* faire 2 × 3 = 6 puis 6² = 36.
  2. **Un carré est un bloc** *(étape de la leçon)* — *Quand :* reprise de la méthode des blocs (cours 8). *Exemple :* 3 × (−2)² − 4 × 5² : blocs 3 × 4 = 12 et 4 × 25 = 100 ; 12 − 100 = −88.
  3. **Deux chemins pour (a × b)²** *(écran « Autres façons de faire »)* — *Quand :* carré d'un produit. *Exemple :* (2 × 3)² = 6² = 36 ou 2² × 3² = 4 × 9 = 36. *Piège évité :* écrire (2 × 3)² = 2 × 3².
  4. **Mettre les parenthèses qu'on veut** *(écran « Autres façons de faire »)* — *Quand :* pour que le calcul dise ce qu'on pense. *Exemple :* (2 × 3)² pour carrer le produit, 2 × 3² pour carrer le 3.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Un carré, un double produit, un carré** *(fiche mémo : la principale)* — *Quand :* (a + b)² ou (a − b)². *Exemple :* 21² = (20 + 1)² = 400 + 40 + 1 = 441 ; 19² = (20 − 1)² = 400 − 40 + 1 = 361. *Piège évité :* oublier le double produit ou le signe devant.
  2. **Calcul mental près d'un nombre rond** *(étape de la leçon)* — *Quand :* carrés proches de 10, 50, 100. *Exemple :* 99² = (100 − 1)² = 10 000 − 200 + 1 = 9 801 ; 102² = 10 404.
  3. **Le schéma de l'aire** *(écran « Autres façons de faire »)* — *Quand :* pour voir le 2ab. *Exemple :* grand carré de côté a + b = un carré a², un carré b², et deux rectangles ab.
  4. **Contrôler avec la parenthèse d'abord** *(écran « Autres façons de faire »)* — *Quand :* après développement. *Exemple :* (3 + 4)² = 7² = 49 et 9 + 24 + 16 = 49 ; (a + b)² dépasse a² + b² si a et b sont positifs ; 19² finit par 1 car 9² = 81.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Carré du premier moins carré du second** *(fiche mémo : la principale)* — *Quand :* (a + b)(a − b). *Exemple :* (5 + 2)(5 − 2) = 25 − 4 = 21. *Piège évité :* écrire a² + b².
  2. **Chercher le nombre du milieu** *(étape de la leçon)* — *Quand :* un produit de nombres voisins. *Exemple :* 49 × 51 : milieu 50, écart 1 : 50² − 1² = 2 499 ; 28 × 32 = 900 − 4 = 896 ; 7,5 × 6,5 = 49 − 0,25 = 48,75.
  3. **Dans l'autre sens** *(écran « Autres façons de faire »)* — *Quand :* différence de deux carrés. *Exemple :* 101² − 99² = (101 − 99)(101 + 99) = 2 × 200 = 400.
  4. **Les doubles produits s'annulent** *(écran « Autres façons de faire »)* — *Quand :* pour vérifier ou comprendre. *Exemple :* (a + b)(a − b) = a² − ab + ab − b² : +ab et −ab disparaissent.
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
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
- **Astuces et techniques** (4 entrées ; l'élève choisit la sienne) :
  1. **Parenthèses autour du nombre remplacé** *(fiche mémo : la principale)* — *Quand :* remplacer une lettre par un nombre négatif. *Exemple :* x² avec x = −2 : (−2)² = 4 ; et non −2² = −4. *Piège évité :* oublier la parenthèse et perdre le signe dans le carré.
  2. **Un tableau de substitution** *(étape de la leçon)* — *Quand :* plusieurs lettres (Δ = b² − 4ac). *Exemple :* a = 2, b = −5, c = −3 : je recopie la formule avec les parenthèses avant de calculer.
  3. **Un morceau à la fois** *(écran « Autres façons de faire »)* — *Quand :* formule longue. *Exemple :* b² = (−5)² = 25 ; 4ac = 4 × 2 × (−3) = −24 ; Δ = 25 − (−24) = 49. *Piège évité :* écrire 25 − 24 = 1.
  4. **Le signe attendu** *(écran « Autres façons de faire »)* — *Quand :* vérifier Δ. *Exemple :* si a et c ont des signes contraires, ac < 0 donc −4ac > 0 : Δ est plus grand que b².
  *Placement :* fiche mémo = n°1 ; étape(s) de la leçon = n°2 ; écran « Autres façons de faire » = n°3, 4.
- **Reprises :** cours 20 (signe et carré), cours 21 (carré avant ×), cours 11 (−(−12) = +12), cours 10 (parenthèses). Pour la formule de Δ : toutes.
- **Niveaux :** N1 : f(x) = x² + 3 ou 2x − 5 avec x négatif (1 à 5). N2 : 3x² − x + 1 avec x = −2, a x² + b x + c. N3 : Δ = b² − 4ac avec a, b, c de signes quelconques (a ou c négatif), et à la fin f(−1)/2 avec des fractions simples.
- **Pourquoi ce cours est ajouté :** c'est le cas d'usage pour lequel le module existe (spec §1 : « erreurs de signes, … fractions »). **Réponse numérique seulement**, mais la formule est affichée avec des lettres : besoin dans l'appli (§5).
- **Sources :** S9, S10, S14 (programme de première : second degré, dérivation).

---

## 4. Les reprises entre cours

Règles du skill : pas d'écran de rappel ; une des 4 questions de la série de pratique **et** un des deux cas de « Comparer deux cas » viennent d'un cours précédent. **Pour le 1er cours d'un module (8, 12, 19), ils viennent du module précédent** (décision du 2026-11-25) ; pour les autres cours, du cours précédent du module. Jamais de calculs d'anciens cours dans les 5 exercices de fin.

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
| **8** | cours 4, 5 | cours 5 (module A) : −6 × 3 | A : 3 + (−2) × 4 / B : 3 + (−2) + 4 (cours 3, module A) |
| 9 | cours 3, 4 | cours 8 : 3 + 4 × 2 | A : 10 − 3 + 2 / B : 10 − 3 × 2 (cours 8) |
| 10 | cours 8, 9 | cours 9 : 12 ÷ 3 × 2 | A : (3 + 4) × 2 / B : 3 + 4 × 2 (cours 8) |
| 11 | cours 4, 9, 10 | cours 10 : 2 × (3 − 5) | A : 8 − (3 + 2) / B : 8 − 3 + 2 (cours 9) |
| **12** | cours 6 (diviser) | cours 9 (module B) : 12 ÷ 3 × 2 | A : (2 + 6)/2 / B : 2 + 6 ÷ 2 (cours 8, module B : la barre de fraction se comporte comme des parenthèses) |
| 13 | cours 6, 12 | cours 12 : 12/18 | A : (−6)/(−9) / B : −6/9 (cours 12) |
| 14 | cours 1 à 4 (sur les numérateurs) | cours 13 : (−3)/(−6) | A : 3/7 + 2/7 / B : 3/(−7) + 2/7 (cours 13) |
| 15 | cours 12 (à l'envers), 5 | cours 14 : 3/7 − 5/7 | A : 3/4 = ▢/12 / B : 6/9 = ▢/3 (cours 12) |
| 16 | cours 14, 15 | cours 14 : 2/5 + 1/5 | A : 2/5 + 1/10 / B : 2/5 + 1/5 (cours 14) |
| 17 | cours 5, 12 | cours 16 : 1/2 + 1/3 | A : 2/3 × 3/4 / B : 2/3 + 3/4 (cours 16) |
| 18 | cours 17, 13 | cours 17 : −2/3 × 3/4 | A : 2/3 ÷ 3/4 / B : 2/3 × 3/4 (cours 17) |
| **19** | cours 5, 7 | cours 13 (module C) : (−8)/(−2) | A : (−3)² / B : (−6)/(−3) (cours 13, module C : deux signes − qui donnent +, mais pas par la même règle) |
| 20 | cours 19 | cours 19 : 7² | A : −3² / B : (−3)² (cours 19) |
| 21 | cours 8, 20 | cours 20 : 5 − 3² | A : 5 × 3² / B : 5 − 3² (cours 20) |
| 22 | cours 10 (contrôle), 19, 20 | cours 10 : (2 + 5) × 3 | A : (3 + 4)² / B : 3² + 4² (cours 19) |
| 23 | cours 22 | cours 22 : (20 + 1)² | A : (5 + 2)(5 − 2) / B : (5 + 2)² (cours 22) |
| 24 | cours 8, 10, 11, 19, 20, 21 | cours 20 : (−4)² − 3 | A : 3 × (−2)² / B : 3 × −2² (cours 20) |

**Décision sur les premiers cours de modules B, C, D :** exception du skill retenue : pour les cours 8, 12 et 19, la question intercalée et un cas de « Comparer deux cas » viennent du **module précédent** (lignes en gras ci-dessus). Les cours 8, 12 et 19 appellent donc le générateur et les messages d'un cours d'un autre module (voir §5, « Reprise de calculs d'un autre cours »). Le cours 1, premier cours du module A, n'a pas de module précédent.

**Reprises transversales, hors des cours** (révisions, entraînement, échauffement) : toute la progression du module A reste dans les révisions ; les modules B à D y ajoutent leurs cours au fur et à mesure. Les cours 8 à 11 reprennent naturellement 4 et 5 ; les cours 17 et 18 reprennent 5 à 7 ; le cours 24 reprend à peu près tout.

---

## 5. Ce qui manque dans l'appli

*(Constat établi en lisant `docs/validation/03-clavier-et-reponses.md`, `packages/engine/src/courses/calculs/` et `packages/engine/src/math/expr.ts` sans les modifier. À vérifier au moment de coder le premier cours qui en a besoin.)*

**Déjà là :** la fraction empilée au clavier (doc 03 §2), les messages « Simplifie. » / « Le calcul n'est pas fini : simplifie. », des valeurs rationnelles et un nœud puissance dans le modèle d'expressions (`expr.ts`), les briques de cours (étapes interactives, série de pratique, droite graduée, `trou`, `choix`, `reecrire`).

| Besoin | Pour quels cours | Remarque |
|---|---|---|
| **Générateur d'expressions à plusieurs opérations**, avec arbre de calcul et **résolution type étape par étape** (« 3 + 4 × 2 → 3 + 8 → 11 ») | 8 à 11, 21, 24 | Le générateur des cours 0 à 7 fait une seule opération ou une somme/un produit de plusieurs termes. |
| **Évaluateurs « à erreur »** : fonctions qui calculent avec la mauvaise règle (gauche à droite, parenthèse ignorée, numérateurs et dénominateurs additionnés…) | 8 à 11, 14 à 18, 22 à 24 | C'est ce qui permet de **reconnaître** l'erreur d'après la réponse tapée, sans liste à la main : si la réponse vaut le résultat de l'évaluateur fautif, c'est cette erreur. |
| **Réponse « fraction »** : forme attendue (irréductible, signe devant la barre, décision du 2026-11-25), entier ou fraction | 12 à 18, 19 (N3), 24 (N3) | La fraction empilée existe au clavier ; la correction doit comparer des **valeurs** et signaler « non simplifié » (« Simplifie. », faux seulement dans le cours 12). |
| **Touche carré / puissance** (x², et peut-être xⁿ) | 19 à 24 | Le clavier de réponse doit rester complet (« il ne dicte jamais la réponse »). La puissance existe dans `expr.ts` ; l'**affichage empilé** et la **saisie** sont à faire. Saisie de (−3)² sans oublier de parenthèses : le cours 0 couvre l'écriture. |
| **Touche et affichage d'une lettre (x)** | 24 ; plus tard identités avec lettres | Pour le cours 24 : lettre affichée dans la formule, **réponse numérique** (pas de lettre dans la réponse). |
| **Comparateur d'expressions littérales (développer (x + 3)²)** | futur module « Calcul littéral » | Normalisation de polynôme : hors de ce plan (décision : identités avec des nombres d'abord). |
| **Brique d'écran « fractions en parts »** (barre ou disque découpé, colorier, additionner des parts) | 12, 14, 15, 16 | Réutilisable aussi pour 17 (rectangle). Dans les leçons, couleurs autorisées ; **grise pendant une question** (doc 08 n° 27). |
| **Brique d'écran « carré découpé »** (aire (a + b)² en 4 morceaux) | 19, 22, 23 | Même principe. |
| **Scène de calcul touchable** (« Touche l'opération à faire en premier », souligner un bloc) | 8 à 11, 21 | Le skill mentionne cette scène dans la maquette `cours-0-v3.html` ; elle sert ici de geste principal. Une question dyslexique-friendly : le calcul reste écrit normalement en haut, les choix en bas. |
| **Reprise de calculs d'un autre cours dans le moteur** | tous les cours à partir du 2e d'un module (§4) | La série de pratique et « Comparer deux cas » doivent pouvoir appeler le **générateur et les messages d'un autre cours par son identifiant**. Pour les 1ers cours des modules B, C, D (8, 12, 19), c'est **dans le module précédent** ; pour les autres, dans le même module. À vérifier si le moteur fait déjà référence à un cours précédent (le doc 08 n° 35 le décide, le doc 06 le décrit pour les cours 2 à 7, mais le code actuel ne l'a que pour le cours 1). |
| **Écouter (synthèse vocale) pour fractions et puissances** | 12 à 24 | Écrire les textes lus : « trois septièmes », « moins trois au carré, c'est neuf », « moins trois, tout au carré » vs « moins, trois au carré » (cours 20 : cas à tester à l'oral, c'est justement la nuance). |
| **Modules multiples** (si découpage en 4) : renommer « Calculs » en « Relatifs » ; progression « 5 / 8 », badge, accueil (« Prochain cours » qui passe au module suivant), Mes cours groupé par module, révisions mélangeant les modules commencés | A à D | Écrit dans le doc 06 (« Les modules ») ; l'accueil « Module terminé » existe (doc 08 n° 19). À vérifier : le passage automatique au module suivant quand le choix des modules n'est pas encore là (décision : les modules s'enchaînent dans l'ordre). |
| **Fiche mémo** avec une petite figure (parts, aire) | 12 à 24 | Le doc 08 n° 38 décrit la fiche en texte : décider si une figure y est autorisée. |
| **Écran « Autres façons de faire »** (2 ou 3 techniques en cartes, avec un exemple chiffré chacune ; l'élève choisit celle qu'elle essaie) | 0 à 24 | À écrire avec les briques existantes (étapes, `choix`, scène de calcul) si possible ; une brique de « cartes de techniques » n'est à créer que si aucune ne convient. Les entrées marquées « étape de la leçon » dans les fiches n'ont pas besoin de cet écran. |

---

## 6. Sources

**Statut de lecture :** les trois programmes officiels ont été **téléchargés et lus en entier** le 2026-11-25 (voir ci-dessous) ; leurs PDF et le texte extrait (`pdftotext -layout`) sont dans `docs/sources/`. Éduscol (eduscol.education.fr) n'a pas pu être ouvert depuis cette session (connexion refusée par le réseau) : les ressources Éduscol (S2, S6, S13) restent des **extraits de recherche**, non relus. Les liens vers des sites commerciaux sont marqués : ils servent à repérer les erreurs, pas à fixer le programme.

*Programmes officiels enregistrés dans `docs/sources/`* (les numéros de page sont ceux des PDF)
- `maths_annexe_2egt_bo.pdf` / `.txt` — seconde générale et technologique, annexe du BO (PDF du 2019-01-17), 16 p. Source : <https://www.snes.edu/IMG/pdf/maths_annexe_2egt_bo.pdf>.
- `maths_spe_annexe_1eg_bo.pdf` / `.txt` — première générale, spécialité mathématiques, annexe du BO (PDF du 2019-01-17), 16 p. Source : <https://www.snes.edu/IMG/pdf/maths_spe_annexe_1eg_bo.pdf>.
- `maths_cycle4_annexe2_bo.pdf` / `.txt` — « Annexe 2 – Programme de mathématiques pour le cycle 4 » (PDF créé en février 2026, **inclut la troisième**, organisé par année : cinquième, quatrième, troisième), 20 p. Source : <https://www.education.gouv.fr/sites/default/files/document/Annexe%202%20%E2%80%93%20Programme%20de%20math%C3%A9matiques%20pour%20le%20cycle%204-480716.pdf>. **Statut réglementaire exact (en vigueur ou projet) à confirmer** : le fichier lui-même ne l'indique pas.

**Points « à vérifier » du plan, après lecture**

| Point du plan | Résultat | Citation exacte |
|---|---|---|
| S1 : automatismes en seconde (extrait de recherche) | **Confirmé, citation corrigée.** La phrase « pratique régulière du calcul numérique et du calcul littéral » n'est **pas** dans le programme de seconde : elle est dans celui de première (voir S14). | Seconde p. 3 : « Il est important en classe de seconde de poursuivre l'acquisition d'automatismes initiée au collège. L'installation de ces automatismes est favorisée par la mise en place d'activités rituelles, notamment de calcul (mental ou réfléchi, numérique ou littéral). » Seconde p. 5 : « développer la pratique du calcul numérique ou algébrique » ; « en veillant à l'acquisition des automatismes, par la pratique fréquente de calculs routiniers » ; « ils consolident la pratique du calcul sur les fractions ». |
| S14 : « aucun thème de la spécialité de première ne s'appelle automatismes » | **Confirmé.** Le mot n'apparaît que dans l'introduction (p. 2) ; aucun thème n'a ce nom. | Première p. 2 : « l'élève doit disposer d'automatismes ». Première p. 3 : « Il importe de poursuivre l'entraînement des élèves dans ce domaine par la pratique régulière du calcul numérique et du calcul littéral, sous ses diverses formes : mentale, écrite, instrumentée. » |
| S8 : « identités remarquables à décaler de la seconde vers la première » (présentation académique 2026, « à vérifier ») | **Non vérifiable avec les PDF lus, et contraire à leur contenu.** Le programme de seconde lu (2019) les place en seconde ; le programme de cycle 4 (2026) les place en **troisième** ; le programme de première lu (2019) les suppose acquises. Le décalage annoncé par S8 n'est donc pas dans les textes officiels que j'ai ouverts (il concerne peut-être un programme de seconde plus récent que celui du fichier). Ne pas s'appuyer sur S8 pour justifier les cours 22 et 23 : les identités sont bien du programme (3e, seconde), et la première les réutilise. | Seconde p. 7 : « Identités a² − b² = (a − b)(a + b), (a + b)² = a² + 2ab + b² et (a − b)² = a² − 2ab + b², à savoir utiliser dans les deux sens. » Cycle 4, troisième, p. 11 : « Manipuler les trois identités remarquables pour développer et factoriser ». Première p. 5 : « [L'étude des fonctions polynômes du second degré] réactive les connaissances acquises en seconde (fonction carré, identités remarquables) qu'elle permet de consolider. » |
| « Les résultats fractionnaires sous forme irréductible » (décision sur la forme de la réponse) | **Confirmé** : c'est au programme de seconde, de troisième. | Seconde p. 7 : « Présenter les résultats fractionnaires sous forme irréductible. » Cycle 4, troisième, p. 10 : « Mettre une fraction sous forme irréductible » ; « Rendre irréductible une fraction. » |
| Cours 21, 24 : carré dans les priorités, calcul de f(x), Δ | **Confirmé** (calcul de Δ en première). | Première p. 7 : « Forme canonique d'une fonction polynôme du second degré. Discriminant. Factorisation éventuelle. Résolution d'une équation du second degré. » ; p. 9 : « Fonction dérivée des fonctions carré, cube, inverse, racine carrée. » |
| Cours 19 : « carrés de 1 à 15 à savoir par cœur » | **À corriger : le programme demande 0 à 12.** 13², 14², 15² restent une bonne idée (calcul mental) mais ne sont pas exigés. | Cycle 4, cinquième, p. 8 : « Connaitre les carrés des entiers de 0 à 12. » ; quatrième p. 9 : « Connaitre et reconnaitre les carrés parfaits des entiers de 0 à 12 ». |
| Priorités opératoires, relatifs, fractions : place dans le cycle 4 | **Confirmé.** | Cinquième, p. 7 : « Connaitre et utiliser les priorités opératoires. » ; p. 8 : « Additionner plusieurs nombres décimaux relatifs. », « Connaitre et justifier les situations dans lesquelles des parenthèses sont indispensables au sens des écritures. » ; quatrième p. 9 : « Multiplier deux nombres relatifs », « Diviser deux nombres relatifs », « Simplifier une fraction. », « Calculer le produit de nombres rationnels. », « Définir l'inverse d'un nombre », « Diviser des fractions. » |
| Techniques de simplification (rubrique « Astuces et techniques », cours 12, 15, 16) | **Confirmées par le programme** (3e, « Multiples et diviseurs », automatismes). | Cycle 4, troisième, p. 11 : « Factoriser un nombre entier positif : 60 = 2² × 3 × 5. » ; « Simplifier une fraction dont le numérateur et le dénominateur sont dans une même table de multiplication » ; « Trouver un dénominateur commun à deux fractions pour les additionner, les soustraire ou les comparer. » ; « Appliquer les critères de divisibilité par 2, 3, 5, 9. » ; cinquième p. 7 : « Connaitre les critères de divisibilité par 3 et par 9. » |
| Cours 11 : −(a − b) | **Confirmé, au programme de 3e** (avec une lettre). | Cycle 4, troisième, p. 11 : « Prendre l'opposé d'une expression : savoir que – (5 – 4x) = –5 + 4x. » |

**Écarts entre le plan et les programmes**

1. **Notions du programme absentes du plan** (à décider si l'on veut les couvrir, ou les laisser aux révisions) :
   - **comparer et ranger** des relatifs ; **opposé et valeur absolue** (5e, p. 7) : déjà écartés dans le plan (§3, module A), le programme confirme que ce sont des notions du collège ;
   - **comparer des fractions** (5e et 4e, p. 8-9) : pas de cours dans le plan ; les cours 15 et 16 (même dénominateur) la préparent : l'ajouter comme étape du cours 15 ou comme cours séparé si le porteur du projet le souhaite ;
   - **distributivité simple k(a + b) = ka + kb** (5e p. 7, 4e p. 10) et **double distributivité** (3e, p. 11) : absentes du plan alors qu'elles précèdent les identités remarquables dans le programme ; le cours 22 les suppose. À traiter dans le futur module « Calcul littéral », ou à rappeler dans l'idée de départ du cours 22 (aire du carré en 4 morceaux) ;
   - **fraction d'une quantité / d'une fraction** (4e, p. 9) : contenue dans le cours 17 (« les 2/3 de 3/4 ») ;
   - **inverse d'un nombre** (4e, p. 9) : contenu dans le cours 18 ; **entier + fraction** (17/5 = 3 + 2/5, 5e) : non couvert ;
   - **puissances** hors carrés (4e : produits de puissances ; 3e : exposants négatifs, notation scientifique, p. 10), **racine carrée** et a² = |a| (seconde, p. 7) : hors de ce plan (le module ne vise que les carrés).
2. **Ordre différent** : le programme fait additionner et soustraire des fractions de dénominateurs quelconques en **5e** (p. 8), puis simplifier en **4e** (p. 9), puis rendre irréductible en **3e** ; le plan commence les fractions par « Simplifier » (cours 12). Pas de problème pour une élève de première (tout est déjà vu), et simplifier avant d'additionner sert au contrôle de « Simplifie. » : **ordre du plan conservé**. Le programme place les priorités opératoires en 5e, avant les relatifs de 4e : le plan les place après les relatifs (module B après A), car les niveaux 3 des cours 8 à 11 contiennent des relatifs.
3. **Vocabulaire du programme à reprendre dans les textes des cours** (cycle 4, p. 6) : « quotient », « fraction : quotient de deux entiers (numérateur et dénominateur) », « nombre rationnel » ; « Simplifier l'écriture de sommes comportant des parenthèses » (5e, p. 8) pour les cours 4 et 11.
4. **Identités remarquables : place dans la scolarité.** Pas de décalage vers la première dans les textes lus (voir tableau). La décision « d'abord avec des nombres » reste valable et plus prudente.
5. **Carrés par cœur : 0 à 12** (voir tableau), pas 1 à 15.
6. **Première** : le programme exige le calcul de f'(a) avec les fonctions carré et inverse et le discriminant ; il ne demande aucun calcul de base nouveau. Aucune autre notion de calcul de base manquant n'a été trouvée.

*Documents du dépôt*
- D1 — `docs/superpowers/specs/2026-11-22-plus-ou-moins-v1-design.md` (§1, §5).
- D2 — `docs/validation/06-cours-relatifs.md` (cours 0 à 7).
- D3 — `docs/validation/08-decisions-ecrans.md` (n° 20 à 42), `docs/validation/03-clavier-et-reponses.md`.
- D4 — Skills `plus-ou-moins-creer-un-module-de-cours` et `plus-ou-moins-ecrire-un-cours`.

*Programmes officiels*
- S1 — Programme de mathématiques de seconde générale et technologique (annexe du BO, 2019), **lu**, copie dans `docs/sources/maths_annexe_2egt_bo.pdf` : « poursuivre l'acquisition d'automatismes initiée au collège… activités rituelles, notamment de calcul (mental ou réfléchi, numérique ou littéral) » (p. 3). <https://www.snes.edu/IMG/pdf/maths_annexe_2egt_bo.pdf> ; version 2026 (non lue, accès refusé) : <https://ent2d.ac-bordeaux.fr/disciplines/mathematiques/wp-content/uploads/sites/3/2026/06/1-Programme-denseignement-de-mathematiques-de-la-classe-de-seconde-generale-et-technologique.pdf>.
- S14 — Programme de spécialité de mathématiques de première générale (annexe du BO, 2019), **lu**, copie dans `docs/sources/maths_spe_annexe_1eg_bo.pdf` : second degré (discriminant, forme canonique, p. 7), dérivation (p. 9). <https://www.snes.edu/IMG/pdf/maths_spe_annexe_1eg_bo.pdf> ; version 2026 (non lue) : <https://ent2d.ac-bordeaux.fr/disciplines/mathematiques/wp-content/uploads/sites/3/2026/06/3-Programme-denseignement-de-specialite-de-mathematiques-de-la-classe-de-premiere-de-la-voie-generale.pdf>. Éduscol, ressource « programmes de seconde, première, terminale » : <https://eduscol.education.fr/document/24568/download> (apparue dans les recherches, non ouverte). Vérifié à la lecture : aucun thème de la spécialité de première ne s'appelle « automatismes ».
- S8 — Présentation académique des nouveaux programmes (juin 2026) : « Des contenus de 2nde à automatismes à décaler en 1ère : les identités remarquables ; la résolution des inéquations ». <https://mathematiques.ac-normandie.fr/IMG/pdf/nouveaux_programmes_lyce_es_r26_pre_sentation_ens.pdf> (extrait de recherche, document non ouvert ; **non confirmé** par les programmes lus, voir le tableau ci-dessus).
- S15 — Programme de mathématiques du cycle 4 (annexe 2), **lu**, copie dans `docs/sources/maths_cycle4_annexe2_bo.pdf` : voir ci-dessus.

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

## Décisions

Décisions du porteur du projet, validées le **2026-11-25** :

1. **Découpage : 4 modules** — A Relatifs (cours 0 à 7), B Priorités (8 à 11), C Fractions (12 à 18), D Carrés et identités remarquables (19 à 24). Les modules s'enchaînent dans l'ordre en attendant « choisir ses modules ».
2. **Les 7 cours ajoutés sont gardés** : 9, 11, 15, 21, 22, 23, 24.
3. **Identités remarquables d'abord avec des nombres** (21², 19², 51 × 49) ; les identités avec des lettres iront dans un futur module « Calcul littéral ».
4. **Fractions : réponse irréductible avec le signe devant la barre** ; une réponse juste mais non simplifiée reçoit « Simplifie. » (sans compter faux), sauf dans le cours 12 où elle est fausse.
5. **Module A validé maintenant** ; les modules B, C et D sont validés sur le plan actuel, avec des **documents de classe attendus pour les affiner** (ordre, vocabulaire, astuces du prof).
6. **Premier cours d'un module (8, 12, 19)** : la question intercalée de la série de pratique et un cas de « Comparer deux cas » viennent du **module précédent** (tableau du §4 mis à jour).
7. **Astuces : il en faut beaucoup plus** (critique du porteur du projet). Chaque cours, de 0 à 24, a une rubrique « Astuces et techniques » de 3 ou 4 entrées ; la technique principale va dans la fiche mémo, les autres deviennent des étapes de la leçon ou un écran « Autres façons de faire » ; l'élève choisit sa technique.
8. **Notions du programme absentes** (2026-11-25) : **comparer deux fractions** = une étape du cours 15 (pas de cours en plus) ; **double distributivité** = rappelée dans l'idée de départ du cours 22, traitée dans le futur module « Calcul littéral » ; **entier + fraction** = non ajouté (l'entier écrit en fraction est vu au cours 16).
