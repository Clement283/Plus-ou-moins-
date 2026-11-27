# Module 3 — Priorités

*Statut : ébauche du 2026-11-27 ; réponses du porteur du projet le même jour : questions 1, 3 et 5 tranchées (voir en bas), questions 2 et 4 en attente. Révision du collège (5e), placée entre Équations et Suites. Bâti sur deux documents trouvés sur Internet par le porteur du projet (cours de 5e de J. Fonteniaud, diabolomaths.fr, et d'Y. Monka, maths-et-tiques.fr : on reprend leur ordre et leurs règles, pas leur texte), le programme et l'ancien plan `docs/validation/10-calculs/B-priorites.md`.*

## Points importants du module
- **À la fin, l'élève sait** : calculer sans calculatrice un enchaînement d'opérations avec des relatifs, des parenthèses et des crochets, en écrivant une ligne par étape ; dire si un calcul est une somme, une différence, un produit ou un quotient ; écrire en un seul calcul une phrase ou une suite d'opérations ; enlever une parenthèse précédée d'un −.
- **Vocabulaire et notations (des deux documents)** : terme, facteur, somme, différence, produit, quotient (dividende, diviseur) ; « calculs entre parenthèses », « parenthèses les plus intérieures » ; crochets [ ] ; on présente A = …, puis = … ligne sous ligne (une seule opération faite par ligne). Récapitulatif des priorités : 1. parenthèses, 2. × et ÷, 3. + et − de gauche à droite. Le signe de la division est ÷ (le document de Monka écrit « : », on garde ÷ comme au module 1).
- **Techniques enseignées** : même priorité → de gauche à droite ; × et ÷ d'abord (souligner les blocs) ; parenthèses d'abord, les plus intérieures en premier ; la dernière opération donne la nature du calcul ; −(a + b) = −a − b et −(a − b) = b − a.
- **Limites volontaires** : nombres **entiers** (relatifs compris) ; résultats entiers, divisions qui tombent juste (les décimaux et fractions des documents viennent au module Fractions) ; pas de lettres sauf à la fin du cours 8 (−(x − 3) = −x + 3, décidé le 2026-11-27) ; pas de puissances (module Carrés) ; pas de distributivité (vue en 5e-4e, reprise au module Carrés).
- **Sert aux modules suivants** : calculer f(a) et uₙ (Suites) ; calculs avec fractions (module Fractions) ; reconnaître un produit (produit nul, tableau de signes du module 2, forme factorisée du second degré) ; −(a − b) est l'erreur de signe n° 1 en dérivation et dans le second degré.

## Règles de rédaction des cours
Celles du skill `plus-ou-moins-ecrire-un-cours` (déroulé guidé, environ 10 blocs de leçon, un geste montré 2 ou 3 fois au plus, pas plus de 2 écrans du même type d'affilée). Propre au module : **tout calcul se fait ligne par ligne à l'écran** (écran « calculer par lignes »), une seule opération par ligne, comme dans les deux documents ; le passage du calcul de tête aux étapes groupées vient avec les niveaux 2 et 3.

## Les cours dans l'ordre
| # | Identifiant | Règle en une phrase | Pourquoi un cours à part | Source |
|---|---|---|---|---|
| 1 | `priorites-gauche-droite` | Que des + et des −, ou que des × et des ÷ : on calcule de gauche à droite. | Les deux documents commencent par là ; erreurs propres (10 − 3 + 2 = 5 ; 12 ÷ 3 × 2 = 2). | cycle 4 p. 7 ; les 2 documents, règle 1 (et 2) |
| 2 | `priorites-fois-avant-plus` | × et ÷ passent avant + et −, puis on finit de gauche à droite. | L'erreur la plus fréquente (3 + 4 × 2 = 14) ; « souligner les blocs ». | cycle 4 p. 7 ; règles 2 / 3-4 |
| 3 | `priorites-parentheses` | On calcule d'abord entre parenthèses, puis on applique les priorités. | Parenthèse de calcul ≠ parenthèse autour d'un négatif (module 1) ; piège 2 × (3 − 5). | cycle 4 p. 7 ; règle « II » / n° 5 |
| 4 | `priorites-parentheses-imbriquees` | Parenthèses dans des parenthèses ou crochets : on commence par les plus intérieures. | Méthode nouvelle (de l'intérieur vers l'extérieur) et notation nouvelle (crochets). | les 2 documents, règle n° 6 et « II » |
| 5 | `priorites-nature-calcul` | La dernière opération faite dit si le calcul est une somme, une différence, un produit ou un quotient. | Lire un calcul sans le faire ; prépare « reconnaître un produit » (module 2, second degré). | cycle 4 p. 7 et p. 9 ; Fonteniaud IV, Monka partie 3 |
| 6 | `priorites-ecrire-un-calcul` | Une phrase ou une suite d'opérations s'écrit en un seul calcul, avec des parenthèses quand une somme est multipliée ou retranchée. | Geste inverse (écrire, pas calculer) ; erreur type : 30 − 2 + 7 pour « 30 moins la somme de 2 et 7 ». | cycle 4 p. 7 et p. 9 ; Fonteniaud V, Monka partie 3 b |
| 7 | `priorites-trait-de-fraction` | Un trait de fraction est une division où le haut et le bas se calculent d'abord, comme entre parenthèses. | Convention d'écriture des documents (Fonteniaud III) ; sert aux fractions et aux quotients de 1re. *À trancher : question 2.* | Fonteniaud III |
| 8 | `priorites-moins-devant-parenthese` | Un − devant une parenthèse change le signe de chaque terme ; un + ne change rien. | Absent des documents de 5e mais au programme de 2nde ; erreur 8 − (3 − 2) = 8 − 3 − 2. | 2nde 2026 p. 5 ; ancien plan, cours 11 |

**Comparer deux cas** : cours 2 (3 + 4 × 2 contre (3 + 4) × 2, si on le garde là ou au cours 3) ; cours 8 (8 − (3 + 2) contre 8 − (3 − 2)) ; ailleurs aucun.

## Ce qui manque dans l'appli
- **Calculer par lignes avec parenthèses** : l'écran existe (`calculer`, module 2) et reconnaît déjà l'erreur « priorité oubliée », mais le moteur ne juge que des calculs **sans parenthèse de calcul** (`flatten` dans `packages/engine/src/math/calcul.ts` refuse « ( » ; pas de crochets). À étendre (moteur, pas de nouvel écran) avant le cours 3 ; ajouter les crochets au clavier pour le cours 4. Erreurs à reconnaître en plus : gauche à droite non respecté, parenthèse ignorée, mauvaise parenthèse en premier, signe perdu.
- **Calcul « à lancer » sans x** : `calculerQuestion` part d'une équation et d'une valeur de x ; il faut une variante qui part d'un calcul seul (A = …).
- **Écrire un calcul** (cours 6) : saisie d'un calcul tapé avec parenthèses, jugé sur sa **structure** (pas seulement sa valeur : 30 − 2 − 7 vaut 30 − (2 + 7)). Petit écran nouveau → maquette.
- **Trait de fraction** (cours 7) : afficher un calcul en fraction dans la leçon et l'exercice ; la saisie ligne par ligne d'une fraction n'existe pas → maquette si on garde le cours.
- **Nature d'un calcul** (cours 5) : question `choix` existante (4 réponses) ; toucher la dernière opération : action `morceau` existante.

## Questions pour toi
1. **Ordre des 2 premiers cours** : *réponse : gauche à droite d'abord, comme les documents.*
2. **Garder le cours 7 (trait de fraction)** ici ou le mettre au module Fractions ? *Recommandation : le mettre au module Fractions, où on aura l'écran des fractions ; ici on garde 7 cours.*
3. **Lettres au cours 8** : *réponse : oui.* D'abord des nombres (8 − (3 − 2)), puis, en fin de cours, des lettres : −(x − 3) = −x + 3, −(2x − 5) = −2x + 5, un seul x, sans réduire deux termes en x (ça reste au module Carrés). Saisie : le clavier avec x de l'écran « À toi de résoudre ».
4. **Décimaux** (les documents en utilisent : 3,5 × 10 ÷ 2, problème de la baguette) ? *Recommandation : entiers seulement, comme les modules 1 et 2 ; les décimaux reviennent en révision plus tard.*
5. **Problème en mots** au cours 6 : *réponse : oui*, une ou deux phrases courtes avec des entiers ; l'élève écrit le calcul puis le calcule.

## Sources
Documents fournis le 2026-11-27 : « Règles de priorités » (J. Fonteniaud, diabolomaths.fr, 5e) ; « Règles de calcul » (Y. Monka, maths-et-tiques.fr). Programme : `docs/sources/maths_cycle4_annexe2_bo.txt` (2026) p. 7 (5e : « Enchainer des opérations », « Traduire […] en une seule expression », « Nommer un calcul, distinguer sommes et produits, termes et facteurs », « Connaitre et utiliser les priorités opératoires ») et p. 9 (4e : « Savoir calculer un enchainement d'opérations avec des nombres relatifs », vocabulaire) ; `maths_2nde_gt_2026.txt` p. 5 (automatismes : « – (a + b) = –a – b, – (a – b) = b – a »). Rien sur les priorités en 1re (`maths_spe_annexe_1eg_bo.txt`). Erreurs classiques : ancien plan `docs/validation/10-calculs/B-priorites.md` (sources S2 à S5 d'Éduscol).
