# Test élèves IA — « Tester si un nombre est solution » (2026-11-27)

*Premier essai de la méthode, fait à la main (version texte écrite à la main, corrections par le moteur). Graine des exercices de fin : 7. Graine du tirage des connaissances : 7.*

## Résumé
- **Élève fort** : tout juste (14/14). Trouve le cours plutôt **léger** et répétitif (beaucoup de petites questions évidentes).
- **Élève moyen** : 13/14, bloque sur **9 − (−28)** (soustraire un négatif). Le message d'erreur l'aide « un peu » : il corrige au feeling, sans comprendre.
- **Élève faible** : 6 erreurs (2x = 23, 5 − 3 au lieu de 5 − (−3), priorités, 1 − 15 = 14, 2 − 4 = 2, 9 − 28). Les messages sur les signes **ne l'aident pas**. Trouve le cours **lourd** et la fin trop raide.
- **Dosage** : 14 écrans et 14 questions, contre une moyenne de 18 écrans et 17 questions sur tous les cours (les cours d'Équations font tous 14 écrans, ceux des Relatifs 21 à 25). Notions nouvelles selon le prof : 7, dont 3 rappels. Verdict : **juste assez sur le fond, mais il manque un rappel sur les signes que les exercices exigent**.
- **Le point le plus important** : le cours demande de calculer 5 − (−3), 9 − (−28), 1 − 15 sans jamais le montrer, et le message d'erreur affiché donne la règle des signes **de la multiplication** pour une soustraction.

## Problèmes, du plus grave au moins grave

**1. Soustraire un négatif, ou passer sous zéro : demandé mais jamais montré** — *trou dans l'explication* — moyen, faible
- Écran 4 (« 5 − (−3) »), exercices de fin Q13 (« 9 − (−28) »), Q10-Q11 (« 1 − 15 », « 2 − 4 »).
- Pourquoi : les exemples du cours n'ont que des soustractions de positifs. L'élève qui a oublié le cours « Soustraire, c'est ajouter l'opposé » est bloqué. Le moyen : « Je ne sais pas comment on calcule 5 − (−3), personne ne l'a dit. »
- Proposition : dans l'écran 5 ou l'exemple guidé, une ligne de rappel : « Rappel : soustraire un négatif, c'est ajouter son opposé : 9 − (−28) = 9 + 28. » Ou choisir pour l'exemple guidé un cas avec « − (−…) ».

**2. Message « Erreur de signe » qui donne la règle de la multiplication pour une soustraction** — *message d'erreur inutile* — moyen, faible
- Message réel (correction ligne par ligne, « Calculer par lignes ») pour « 1 − 15 = 14 », « 2 − 4 = 2 », « 9 − (−28) = 9 − 28 » : « Reprends la règle des signes : même signe, résultat positif ; signes différents, résultat négatif. »
- Pourquoi : c'est la règle de × et ÷. Le faible : « je connais ça pour fois, mais là c'est un moins avec un plus, je ne vois pas le lien ». Il tombe juste « par chance ».
- Proposition : un message selon l'opération de la ligne. Soustraction qui passe sous zéro : « 1 − 15 : on enlève 15 à 1, on passe sous zéro : −14. » Soustraire un négatif : « Soustraire −28, c'est ajouter 28 : 9 + 28. » **Attention** : ce message vient du moteur (`judgeTypedCalcLine`), commun à tous les cours qui utilisent « Calculer par lignes ».

**3. « Membre » jamais défini** — *mot difficile* — fort, moyen, faible, prof
- Écran 5 : « On calcule **le membre de gauche d'abord** ». Le mot n'apparaît qu'ici, alors que l'écran 2 parlait de « côtés ».
- Proposition (prof) : avant l'écran 5, « Une équation a deux côtés, séparés par = : le **membre de gauche** et le **membre de droite**. »

**4. Qui calcule le membre de droite ?** — *incohérence* — fort, moyen, prof
- Écran 8 et exercices de fin : « Calcule le membre de gauche, ligne par ligne », puis l'appli donne les deux valeurs. Or la Règle 2 dit « Je calcule le membre de gauche, puis le membre de droite ».
- Proposition : « Ici, le membre de droite est déjà un nombre : l'appli te le donne. » (ou faire calculer les deux).

**5. « Trois fois moins deux » se lit mal** — *phrase difficile* — fort, moyen, prof
- Écran 5 : « Trois fois moins deux donne un résultat négatif. » Lu « 3 fois moins 2 ».
- Proposition : « 3 × (−2) donne un résultat négatif. » (même chose dans le trou : « 3 × (−2) donne un résultat [ ? ]. »)

**6. « Solution » utilisé avant d'être défini** — *mot difficile* — fort, faible, prof
- Écran 1 : « le nombre 3 est-il une solution de cette équation ? » ; défini seulement avec la Règle 3.
- Proposition : à l'écran 1, relier l'intro au mot : « Une équation pose une question : quel nombre rend les deux côtés égaux ? Ce nombre s'appelle une **solution**. »

**7. « On enlève chaque x »** — *mot juste* — prof
- Écran 3. « Enlever » fait penser à une opération sur l'équation, ce qui prépare mal la suite du module.
- Proposition : « On remplace chaque **x** par le nombre. »

**8. La fin est raide pour le faible** — *dosage* — faible, moyen
- Un seul exemple guidé, puis 5 exercices sans aide. « Les cas avec un négatif (Q13) sont trop durs par rapport à ce qu'on a vu » (moyen).
- Proposition : réglé en grande partie par le point 1 ; sinon, un exercice de fin sans négatif à soustraire en premier.

**9. Écran 9 : trop de chiffres et de mots d'appli** — *phrase difficile* — fort, moyen, faible
- « au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours » ; « série de validation ».
- Proposition : à voir pour tous les cours (texte commun) : garder « 4 sur 5 » et dire en une phrase ce qu'est la série de validation.

**10. « 3 × (−2) + 4 = −2 » ambigu** — *phrase difficile* — fort
- Fin de l'écran 3 : le « = −2 » est-il le résultat ou le membre de droite ? Compris seulement à l'écran 7.
- Proposition : afficher « gauche : 3 × (−2) + 4 / droite : −2 ».

## Avis du prof
- **Fiche** : fidèle (7 étapes, 3 règles, nombres, balance). Le vocabulaire annoncé (inconnue, membre, solution) n'est jamais défini ; « inconnue » n'apparaît jamais ; « 2x veut dire 2 × x » n'est dit qu'en passant, sur 3x, après le piège de l'écran 1.
- **Mots** : « on enlève chaque x » (faux), « le nombre collé à x » (langage d'élève : « le nombre devant x »), « trois fois moins deux » (ambigu), « la droite, x, vaut aussi −2 » (mélange le membre et sa valeur).
- **Logique** : bon ordre général. Sauts : « membre » avant sa définition ; écran 8 en contradiction avec la Règle 2.
- **Dosage** : 7 notions nouvelles, dont 3 rappels (2x = 2 × x, parenthèses, priorités) : à la limite haute mais cohérent.
- **Ses 3 corrections** : (a) « On remplace chaque x par le nombre » ; (b) « Dans 3x, le 3 est devant x : 3x veut dire 3 × x. Quand on remplace x par −2, on écrit 3 × (−2). » ; (c) « 3 × (−2) » au lieu de « Trois fois moins deux », plus la définition des membres.

## Annexe

**Parcours en bref**
- Fort : tout compris. Écran 2 « un peu enfantin », écrans 4 et 6 « trop faciles », écran 8 « pas clair sur ce que je dois faire », écran 9 « envie de passer ».
- Moyen : lit en diagonale et ne retient que le gras et les règles. Écran 5 « membre » inconnu, écran 8 « qui calcule la droite ? », écran 9 sauté, écran 13 bloqué sur 9 − (−28).
- Faible : écran 1 répond « 23 », écran 3 « pourquoi les parenthèses ? », écran 4 « deux signes qui se touchent, ça fait bizarre », écran 6 « je lis de gauche à droite », exercices de fin : erreurs de signes partout.

**Ce que les élèves disent avoir appris** : remplacer x par le nombre ; 3x = 3 × x ; calculer chaque côté à part ; égal = solution. Le faible : « Pas retenu : pourquoi les parenthèses, ni comment calculer moins moins. »

**Points des cours précédents oubliés** (sur 12 points du module Relatifs)
- Fort (oublie 1) : regrouper les positifs puis les négatifs.
- Moyen (oublie 6) : parenthèses autour des négatifs ; les deux rôles du « − » ; l'opposé ; regrouper ; **soustraire = ajouter l'opposé** ; compter les « − ».
- Faible (retient 3 : additionner deux nombres de même signe ; multiplier deux relatifs ; bien écrire un calcul).

**Limites de cet essai** (à corriger dans le script)
- Dans la version texte, la bonne réponse des questions à choix était **toujours la n° 1** (ordre du code). Les élèves l'ont peut-être remarqué : les « questions trop faciles » sont donc à confirmer. Le script devra mélanger les choix comme l'appli.
- La version texte a été écrite à la main : le script la produira à partir du code.

## Coût réel
- 4 sous-agents (Sonnet) : environ 80 000 tokens chacun, puis 2 relances pour les corrections (environ 81 000 chacune), soit **environ 490 000 tokens** et une dizaine d'actions.
- Presque tout ce volume est le **contexte de départ fixe** de chaque sous-agent (environ 75 000 tokens d'instructions, relus depuis le cache) ; le cours lui-même ne pèse que 4 000 à 5 000 tokens. Un module entier ne coûterait donc pas 11 fois plus : environ 5 000 tokens de plus par cours ajouté.
