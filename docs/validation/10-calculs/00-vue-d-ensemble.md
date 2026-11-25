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

**Ordre (décidé le 2026-11-25, remplace « A, B, C, D d'un bloc ») :** les modules A à D sont des **révisions** (programmes de collège et de seconde) ; ils sont **intercalés** avec les chapitres de l'année :

1. **A. Relatifs** (cours 0 à 7, terminé côté code ; mise en ligne du cours 7 en attente)
2. **Équations et inéquations** (chapitre de l'année, plan à faire)
3. **B. Priorités** (cours 8 à 11)
4. **Suites numériques** (chapitre de l'année, plan à faire)
5. **C. Fractions** (cours 12 à 18)
6. **Discriminant et second degré** (chapitre de l'année, plan à faire)
7. **D. Carrés et identités remarquables** (cours 19 à 24)

Raison : elle s'entraîne sur les bases de calcul tout en avançant sur les chapitres de la classe (contrôles à venir). Les raisons d'origine de l'ordre A, B, C, D restent à vérifier avec ce nouvel ordre : B avant C (les niveaux 3 des fractions mélangent des priorités, 1/2 + 1/3 × 3/4) reste vrai ; D passe **après** le module discriminant, alors que le cours 24 (calcul de Δ) y était le dernier cours : le calcul de Δ et le carré d'un négatif devront être couverts par le module discriminant lui-même (ou le cours 24 déplacé). Les suites avec raison fractionnaire arrivent avant C : rester sur des raisons entières, ou les fractions simples. Équations et inéquations utilisent des lettres : brique « lettres » à prévoir (§5).

**Alternative 1 : 3 modules** (A. Relatifs ; B. Priorités et fractions, cours 8 à 18, 11 cours ; C. Carrés et identités, cours 19 à 24). Un peu moins de modules, mais un module de 11 cours.

**Alternative 2 : un seul module « Calculs »** de 25 cours : rien à changer dans l'appli (un module, un chemin), mais un module long. À réserver si tu préfères ne pas toucher à la structure pour l'instant.

**Ce que cela change dans l'appli** (voir aussi §5) : aujourd'hui le module s'appelle « Calculs » et contient les cours 0 à 7. Avec 4 modules, il serait renommé « Relatifs » (même identifiant, mêmes cours, la progression de l'élève n'est pas touchée) et les nouveaux modules s'ajouteraient. Le doc 06 dit qu'un seul module est disponible pour l'instant et que le choix des modules viendra plus tard : en attendant, les modules s'enchaînent dans l'ordre, un module débloquant le suivant quand il est terminé.

---

## 3. Les cours de chaque module

Légende de chaque fiche : **Règle** (une phrase) · **Idée de départ** (le pourquoi) · **Erreurs attendues** (futures erreurs reconnues) · **Astuces et techniques** (2 à 4 entrées : nom, quand, exemple chiffré, piège évité ; la principale va dans la fiche mémo, les autres deviennent des étapes de la leçon ou l'écran « Autres façons de faire », l'élève choisit sa technique) · **Reprises** · **Niveaux 2 et 3** · **Sources**. Les niveaux suivent « même méthode, plus difficile » ; chaque cours dira ses propres nombres au moment de sa spec. Les numéros S1, S2… renvoient au §6.

