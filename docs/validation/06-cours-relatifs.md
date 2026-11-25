# 06 — Module 1 « Calculs » : contenu des cours de l'étape 1

*Statut : Validé (2026-11-22) — version 4 ; Cours 0 version 3 et mises à jour du Cours 1 v2 du 2026-11-25 ; Cours 2 version 2 du 2026-11-25*

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

*Version 3 (2026-11-25), remplace la version 2. Maquette validée : `docs/design/ecrans/cours-0-v3.html` (le porteur du projet a dit « oui à tout » aux choix listés dans le doc 08 n° 43 à 50 ; pour chaque autre point « À décider » de la maquette, la proposition de la maquette est retenue). Ce cours suit la forme du Cours 1 v2 (étapes interactives, comparer deux cas, série de pratique, aide qui s'efface, bouton « Écouter », fiche mémo) et les décisions du doc 08 n° 20 à 50. Il sert de **modèle** pour réécrire les cours 2 à 7.*

**La règle :** *Un calcul s'écrit d'une seule façon correcte : il faut savoir le lire et l'écrire sans ambiguïté.*

**L'idée de départ :** le signe − a **deux rôles**, soustraire (7 − 3) ou dire qu'un nombre est négatif (−3). Les 4 règles servent à toujours savoir quel rôle joue chaque −.

**Les règles d'écriture enseignées** (inchangées depuis la v2)
1. **Deux signes ne se suivent jamais.** Après +, −, × ou ÷, un nombre négatif se met **entre parenthèses** : 4 × (−3), 5 + (−2), 7 − (−1), 8 ÷ (−4).
2. **En tête d'un calcul, pas de parenthèses** pour un négatif : −3 + 5. (−3) + 5 n'est pas faux mais inutile : dans ce cours, une réponse tapée « (−3) + 5 » compte **comme une faute** (doc 08 n° 25).
3. **Le signe − d'un nombre négatif s'écrit avant le nombre** : −3, jamais 3−.
4. **Une parenthèse ouverte se ferme** : (−3), jamais (−3 tout seul.

**Déroulé (18 écrans dans la maquette : 10 de leçon, 1 de pratique, 2 exemples guidés, l'annonce, 1 modèle d'exercice de fin — les 5 exercices de fin sont générés —, le résultat, « Mes cours » et la fiche mémo)**

Types d'écrans utilisés : **explication pas à pas** (scène en haut qui se transforme à chaque « Suite » ; « Revoir cette étape » rejoue l'animation ; points « Étape N sur M » ; seules les **2 dernières phrases** restent affichées, les précédentes sont repliées derrière « Relire le début » / « Replier le début ») ; **étape interactive** (voir ci-dessous) ; **question pour deviner** et **question pour comprendre** (ne comptent pas) ; **petite question** ; **série de pratique** ; **exemple guidé** ; Toucher la faute. Jamais plus de 2 étapes de lecture d'affilée sans une action. Couleurs (doc 08 n° 27) : **aucune couleur de signe** dans ce cours (ni orange ni bleu) ; surligneur jaune « regarde ici » **dans les explications seulement** ; pendant une question, aucune couleur qui donne un indice ; vert / rouge **après** la réponse. **Bouton « Écouter »** (haut-parleur) en haut à droite de chaque écran (doc 08 n° 41) : il lit le titre, la phrase affichée et la consigne ; les calculs sont lus en clair (« quatre fois ouvre la parenthèse moins trois… »).

**Étapes interactives** (dans les explications ; elles remplacent « Suite », l'action est en bas de l'écran ou, pour un calcul touchable, juste sous la consigne ; une erreur = un message court « Pas tout à fait. <message> Essaie encore. » et elle réessaie ; **rien n'est noté**)
- *Phrase à trous* : un seul trou à la fois, qui remplace une phrase de l'explication ; les choix se lisent dans la phrase. Consigne : « Touche le mot qui complète la phrase. » Le trou est un grand emplacement visible, rempli par le mot juste.
- *Toucher un morceau* : le calcul est découpé en morceaux (un nombre = un morceau, chaque signe et chaque parenthèse = un morceau) ; chaque morceau est un bouton à contour en pointillés qui « respire », d'au moins 44 px, avec la consigne en gras au-dessus. La scène est neutre (aucune couleur de signe). Le morceau touché à tort passe en rouge.
- *Toucher un endroit* : des emplacements étroits (44 px de large, pastille qui « respire ») entre les morceaux d'un calcul ; la consigne est en gras au-dessus. Au bon endroit, le signe ou la parenthèse arrive (il **n'y a pas de glisser** : doc 08 n° 44).

*Leçon (10 écrans, pastille « Cours 0 · Leçon · étape N sur 10 »)*

1. **Accroche + deviner.** Titre : « Bien écrire un calcul ». « En maths, un calcul doit se lire **d'une seule façon**. S'il est mal écrit, on peut se tromper même en connaissant la méthode. » « Dans ce cours, tu vas apprendre **4 règles d'écriture**. » Question pour deviner : « Pour commencer, à ton avis : ce calcul est-il bien écrit ? » 4 × −3 [Oui] [Non]. Réponse attendue : Non. Mention : « Question pour découvrir : elle ne compte pas dans la note. » Retour si juste (« Juste ! ») : « Il lui manque quelque chose. Tu vas voir quoi, et surtout pourquoi. » Si faux : titre « Pas tout à fait, et c'est normal. » : « Il est mal écrit. Ce n'est pas grave de ne pas le savoir encore : c'est justement ce que ce cours explique. »
2. **Le signe − a deux rôles** (titre « Le signe − a deux rôles », 4 étapes).
   - Étape 1 : scène 7 − 3, le − surligné en jaune, légende « soustraire ». « Le signe **−** a **deux rôles**. Le premier : **soustraire**. Dans 7 − 3, on enlève 3 à 7. »
   - Étape 2 : deux calculs côte à côte, 7 − 3 (légende « soustraire ») et −3 (légende « signe du nombre »). « Le deuxième : **dire qu'un nombre est négatif**. Dans −3, le signe fait partie du nombre : on lit « moins trois ». »
   - Étape 3 (**interactive : toucher un morceau**) : calcul −6 + 2 − 5 en 6 morceaux. Consigne : « Touche le − qui sert à soustraire. » Attendu : le deuxième − (celui qui est entre 2 et 5). Phrase de suite : « Ce − est entre 2 et 5 : on enlève 5. Le − du début est, lui, le signe de −6. »
   - Étape 4 (**interactive : phrase à trous**) : « Un − placé tout au début d'un calcul est [ ? ]. » Choix : [le signe du nombre] [une soustraction]. Attendu : le signe du nombre. Phrase de suite : « Quand tu lis un calcul, demande-toi toujours **quel rôle joue chaque −**. Les 4 règles de ce cours servent à ça. »
   *(Cet écran remplace l'explication « Le signe − a deux rôles » et les deux petites questions « À quoi sert le − ? » de la v2 : elles ne comptent plus dans la note, doc 08 n° 43.)*
3. **Règle 1 : deux signes collés** (titre « Quand deux signes se touchent », 4 étapes).
   - Étape 1 : scène 4 × −3, le × et le − surlignés en jaune qui tremblent, légende « deux signes collés ». « Voici 4 × −3. Le **×** et le **−** sont **collés** : deux signes se touchent. »
   - Étape 2 (**interactive : toucher un morceau**) : morceaux 4 · × · − · 3. Consigne : « Touche le signe qui se colle au ×. » Attendu : le −. Phrase de suite : « Ce −, est-ce qu'il soustrait ? Ou est-ce le signe de 3 ? **On ne sait plus.** »
   - Étape 3 (**interactive : toucher un endroit**) : mêmes morceaux, trois emplacements (entre 4 et ×, entre × et −, entre − et 3). Consigne : « Touche l'endroit où la parenthèse ouvrante doit aller. » Attendu : entre × et −. Au bon endroit, les deux parenthèses arrivent autour de −3 (surlignées), légende « −3 est un seul nombre ». Phrase de suite : « La parenthèse se ferme après le 3. Elles entourent −3 : c'est **un seul nombre**, le − ne soustrait plus rien. »
   - Étape 4 : encadré **Règle 1 : Deux signes ne se suivent jamais.** Après +, −, × ou ÷, un nombre négatif se met entre parenthèses.
4. **Règle 1 : à toi** (titre « La règle 1, à toi »). En haut : « La règle marche aussi après un − et un ÷. Le nombre ne change pas, le résultat non plus. » Deux paires « mal écrit → bien écrit », parenthèses surlignées : 7 − −1 → 7 − (−1) ; 8 ÷ −4 → 8 ÷ (−4). Petite question : « Comment écrire correctement ce calcul ? » 5 + −2 [(5 + −2)] [5 + (−2)] [5 (+ −2)]. Attendu : 5 + (−2). **Compte dans la note.**
5. **Règle 2 : en tête** (titre « Et au début du calcul ? »). Question pour deviner : « Ce calcul commence par un nombre négatif. Faut-il des parenthèses autour de −3 ? » −3 + 5 [Oui] [Non]. Attendu : Non. Mention : « Question pour découvrir : elle ne compte pas dans la note. » Retour si juste : « Devant −3, il n'y a aucun signe. Rien ne se touche, donc pas besoin de parenthèses. » Si faux : titre « Pas besoin. » : « Regarde devant −3 : il n'y a aucun signe. Rien ne se touche, donc pas besoin de parenthèses. » Puis encadré **Règle 2 : En tête d'un calcul, pas de parenthèses** pour un nombre négatif., et « −3 + 5 ✓   (−3) + 5 » avec la pastille grise « pas faux, mais inutile » (pas de symbole « ~ »).
6. **Règle 3 : le − avant le nombre** (titre « Le moins se met avant le nombre », 4 étapes).
   - Étape 1 : scène 3− + 4, le − surligné qui tremble, légende « le − est après le 3 ». « Dans 3− + 4, le − est écrit **après** le 3, et juste après lui, il y a un +. »
   - Étape 2 (**interactive : toucher un morceau**) : morceaux 3 · − · + · 4. Consigne : « Touche le − qui est mal placé. » Attendu : le −. Phrase de suite : « On croit qu'on soustrait quelque chose au 3. Mais juste après, il y a un + : **il n'y a rien à soustraire**. »
   - Étape 3 (**interactive : toucher un endroit**) : le calcul 3 + 4 en haut, un − « à placer » (surligné, légende « ce signe est à placer ») au-dessus ; trois emplacements (avant le 3, entre 3 et +, entre + et 4). Consigne : « Le − quitte sa place. Touche l'endroit où il doit aller. » Attendu : avant le 3. Le − arrive alors devant le 3 (il glisse tout seul), calcul −3 + 4, légende « le − passe devant ». Phrase de suite : « Le signe d'un nombre négatif s'écrit **devant** le nombre : −3 + 4. »
   - Étape 4 : encadré **Règle 3 : Le signe − d'un nombre négatif s'écrit toujours avant le nombre :** −3, jamais 3−.
7. **Règle 4 : une parenthèse se ferme** (titre « Une parenthèse ouverte se ferme », 4 étapes).
   - Étape 1 : scène 4 × (−3, la « ( » surlignée qui tremble, légende « elle s'ouvre ici ». « Dans 4 × (−3, une parenthèse **s'ouvre**. Rien ne la **ferme**. »
   - Étape 2 (**interactive : phrase à trous**) : « Sans parenthèse fermante, on ne sait pas où le nombre [ ? ]. » Choix : [s'arrête] [commence]. Attendu : s'arrête. Phrase de suite : « Les parenthèses vont toujours **par deux**, comme des guillemets. »
   - Étape 3 (**interactive : toucher un endroit**) : morceaux 4 · × · ( · − · 3, cinq emplacements (entre chaque morceau, et après le 3 ; pas avant le 4). Consigne : « Touche l'endroit où la parenthèse fermante doit aller. » Attendu : après le 3. La « ) » arrive (surlignée), légende « une qui ouvre, une qui ferme ». Phrase de suite : « Maintenant, on voit où le nombre s'arrête : **−3** est bien entouré. »
   - Étape 4 : encadré **Règle 4 : Une parenthèse ouverte doit toujours être fermée.**
8. **Règles 3 et 4 : à toi** (titre « Règles 3 et 4, à toi »). Deux petites questions à la suite sur le même écran, **comptées** : « Lequel est bien écrit ? » [7−] [−7] → −7 ; « Que manque-t-il à ce calcul ? » 4 × (−3 [(] [)] [−] → ). La question « Avant ou après le nombre ? » de la v2 disparaît : « Lequel est bien écrit ? » la couvre.
9. **Comparer deux cas** (titre « Comparer deux cas »). « Voici deux écritures du même calcul. Regarde-les bien. » Côte à côte : « Calcul A » 4 × (−3) · « Calcul B » 4 × −3. Question : « Qu'est-ce qui change entre A et B ? » [Le résultat] [La façon de l'écrire] [Le nombre 3]. Attendu : la façon de l'écrire. Mention : « Question pour comprendre : elle ne compte pas dans la note. » Après la réponse : les parenthèses de A et les deux signes collés de B sont surlignés, le retour (voir tableau), puis : « Dans B, le × et le − se touchent : on ne sait plus si le − soustrait. Dans A, −3 est **un seul nombre**, entouré de parenthèses. Le calcul A se lit d'**une seule façon** : c'est le bien écrit. » Premier cours du module : les deux cas viennent de ce cours.
10. **Récapitulatif** (titre « Les 4 règles à retenir »). 1. « Deux signes ne se suivent jamais. » 4 × (−3) ✓ · 4 × −3 ✗ ; 2. « En tête, pas de parenthèses. » −3 + 5 ✓ · (−3) + 5 « inutile » ; 3. « Le − se met avant le nombre. » −3 ✓ · 3− ✗ ; 4. « Une parenthèse ouverte se ferme. » (−3) ✓ · (−3 ✗. « Maintenant, à toi de les utiliser. » Bouton « Suivant ».

*Pratique*

11. **Série de 4 questions** (pastille « Cours 0 · Pratique », compteur « Question N sur 4 » et 4 points, retour immédiat, pas de nouvel essai : on montre la correction et on passe à la suivante ; **aide décroissante, formats variés** ; pendant une question aucune couleur). **Notée** (doc 08 n° 45) ; une question ratée **repasse avant les exercices de fin** (n° 49). Bouton « Question suivante » ; après la 4e, un encadré « N sur 4 » et « Maintenant, deux exemples pour t'aider à réécrire un calcul en entier. », puis « Continuer ». Pas de question venue d'un cours précédent : c'est le premier cours du module.
   - **Question 1 (toucher l'endroit mal écrit, règle rappelée).** Consigne : « Rappel de la règle 1 : **deux signes ne se suivent jamais**. Touche l'endroit mal écrit de ce calcul. » Calcul 5 + −2 en 4 morceaux touchables. Attendu : le + **ou** le −. Juste : « Le + et le − se touchent. On écrit 5 + (−2). » Faux (un nombre) : « Les nombres sont bien écrits. Cherche les deux signes qui se touchent : + et −. »
   - **Question 2 (choisir la règle, plus de rappel).** Consigne : « Ce calcul est mal écrit. **Touche la règle** qui n'est pas respectée. » Calcul 4 × (−3. [Deux signes se touchent] [Le moins est après le nombre] [Une parenthèse n'est pas fermée]. Attendu : la 3e. Juste : « La parenthèse ouverte ne se ferme pas : 4 × (−3). » Faux (1re) : « Il n'y a pas de signes collés ici : le × est suivi d'une parenthèse. Le problème est ailleurs. » Faux (2e) : « Le − de −3 est bien devant le 3. Le problème : la parenthèse reste ouverte. »
   - **Question 3 (vrai ou faux).** Consigne : « Touche Vrai ou Faux. » Calcul −6 − (−2) × 4, « Ce calcul est bien écrit. » [Vrai] [Faux]. Attendu : Vrai. Juste : « Vrai : −6 est en tête sans parenthèses, et (−2) est entre parenthèses. Rien ne se touche. » Faux : « Cherche une faute : deux signes collés ? Non, −2 est entre parenthèses. Un − après un nombre ? Non. Une parenthèse ouverte ? Elle est fermée. Le calcul est bien écrit. »
   - **Question 4 (réécrire, sans aide).** Consigne : « Ce calcul est mal écrit. **Réécris-le** en entier. » Calcul 9 + −4 ; « Tape le calcul entier avec les touches du clavier. » (clavier complet). Attendu : 9 + (−4). Messages : voir tableau.

*Exemples guidés (l'aide s'efface ; le calcul de départ reste toujours affiché)*

12. **Exemple 1 sur 2 : presque résolu, une case à taper.** « Voici la correction. Lis chaque ligne, puis touche « Je comprends ». » Calcul 6 × −2. Les lignes apparaissent une à une, la ligne en cours est surlignée et expliquée dans un encadré :
   - Ligne 1 : « Signes collés : × et − » (surlignés). Encadré « Ligne 1 » : « Le × et le − se touchent : c'est la règle 1 qui n'est pas respectée. » [Je comprends]
   - Ligne 2 : « On met −2 entre parenthèses : 6 × (−2) » (parenthèses surlignées). Encadré « Ligne 2 » : « −2 est un seul nombre : on l'entoure de parenthèses. Le nombre ne change pas, le résultat non plus. » [Je comprends]
   - Dernière ligne : « Le calcul bien écrit : ▢ » (une case à taper). Encadré « Dernière ligne » : « Écris le calcul en entier, bien écrit. Tu peux t'aider de la ligne du dessus. » « Tape ce qui manque dans la case, avec les touches du clavier. » Attendu : 6 × (−2). Juste : « Le × et le − ne se touchent plus. » Une erreur montre le message « Pas tout à fait. <message> Essaie encore. », elle réessaie ; seule sa 1re réponse compte.
13. **Exemple 2 sur 2 : à moitié, deux cases à taper.** « Cette fois, deux cases sont à toi. Le calcul de départ reste affiché. » Calcul 3− + 4. Case 1 : « Le − passe devant le 3 : ▢ + 4 ». Attendu : −3. Case 2 : « Le calcul bien écrit : ▢ ». Attendu : −3 + 4. Les cases s'enchaînent dans l'ordre (« Case suivante ») ; une erreur montre le message et la bonne réponse (« Pas tout à fait. <message> La bonne réponse : −3. »). **Seule la case 2 (le calcul entier) compte dans la note ; la case 1 est un entraînement non noté** (doc 08 n° 48).

*Fin*

14. **Annonce** : « Place aux 5 exercices de fin. Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle. Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours. Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon. » Bouton « Commencer les exercices ».
15. **5 exercices de fin « Toucher la faute »** (générés, 1 fois sur 5 tout est bien écrit ; la maquette montre un modèle). « Ce calcul est-il bien écrit ? » Le calcul en haut, écrit normalement (ex. 5 + −2 × 3). « S'il est mal écrit, **touche l'endroit de la faute** dans les cases en bas. Chaque symbole du calcul a sa case. » En bas : le même calcul découpé en cases de même taille, sur une seule ligne (un nombre = une case, chaque signe et chaque parenthèse = une case), puis « Tout est bien écrit ». Aucune couleur avant la réponse. Après la réponse : la bonne case en vert, la case touchée à tort en rouge, l'explication, puis « La résolution » (calcul faux → calcul corrigé). Pour 5 + −2 × 3, les deux signes collés (+ et −) sont chacun une bonne réponse. Juste : « Deux signes se touchent : + et −2. On écrit 5 + (−2) × 3. » Faux : « La faute est ici : le + touche le − de −2 (règle 1). On écrit 5 + (−2) × 3. » Ce format n'est jamais appris dans la leçon : c'est celui du contrôle.
16. **Résultat** (validé ou non, doc 08 n° 29). Ex. cours raté : « Le cours 0 n'est pas encore validé », les deux conditions avec ✗ / ✓ (« N bonnes réponses sur 14, soit X %. Il en faut au moins 80 %. » et « N exercices de fin justes sur 5. Il en faut au moins 4. »), « Tes erreurs : » « Deux signes qui se touchent (règle 1), 3 fois » · « Parenthèse non fermée (règle 4), 1 fois », lien « Relire la règle 1 », « Prochaine étape : la série de validation. 5 exercices, 4 justes pour valider le cours. » Bouton « Faire la série de validation ». *(Les chiffres de la maquette, « 10 sur 14 », sont inventés.)*
17. **Mes cours** garde la raison de l'échec : « À valider », « Dernier essai : 3 exercices de fin justes sur 5. À revoir : **deux signes qui se touchent**. », boutons « Faire la série de validation », **« Voir la fiche mémo »** (consultable **avant** la validation, doc 08 n° 46), liens « Relire la règle 1 » · « Relire la leçon ».
18. **Fiche mémo** (écran plein, voir plus bas).

**Note du cours** (doc 08 n° 21, 43, 45 et 48) : comptent la petite question de l'écran 4, les 2 petites questions de l'écran 8, les **4 questions de la série de pratique** (écran 11), les **2 exemples guidés** (écrans 12 et 13 : pour l'exemple 2, seule la case 2 compte) et les **5 exercices de fin**, soit **14 questions**. Ne comptent pas : les questions pour deviner (écrans 1 et 5), la question pour comprendre (écran 9), **toutes les étapes interactives des explications** (écrans 2, 3, 6 et 7, notées nulle part, qu'elle se trompe ou non) et la case 1 de l'exemple 2. Validation : **80 % sur les 14 et au moins 4 exercices de fin sur 5**. Une petite question ou une question de la série ratée repasse avant les exercices de fin (doc 08 n° 22 et 49) ; seule la 1re réponse compte. Il n'y a pas de cours précédent : aucune question de la série ne vient d'un autre cours.

**Retours d'erreur précis**

Étapes interactives (message court puis « Essaie encore. », rien n'est noté) :
| Écran | Réponse | Message |
|---|---|---|
| 2, étape 3 | toucher le − du début | « Ce − est tout au début : il n'y a rien à soustraire. C'est le signe de −6. » |
| 2, étape 3 | toucher un autre morceau (6, +, 2 ou 5) | « Ce n'est pas un −. Cherche les deux traits − du calcul. » |
| 2, étape 4 | une soustraction | « Au début, il n'y a rien avant le − : on ne peut rien soustraire. » |
| 3, étape 2 | toucher le × | « C'est le × lui-même. Cherche le signe qui le touche, juste à sa droite. » |
| 3, étape 2 | toucher le 4 | « 4 est un nombre, pas un signe. Cherche le signe collé au ×. » |
| 3, étape 2 | toucher le 3 | « 3 est un nombre, pas un signe. Cherche le signe collé au ×. » |
| 3, étape 3 | endroit entre 4 et × | « Là, la parenthèse entourerait le × aussi. Mais le × est une opération : il reste dehors. » |
| 3, étape 3 | endroit entre − et 3 | « Là, elle couperait −3 en deux. Le − fait partie du nombre : il doit être dedans. » |
| 6, étape 2 | toucher le 3 | « Le 3 est un nombre, il est bien écrit. Cherche le signe − mal placé. » |
| 6, étape 2 | toucher le + | « Le + est bien placé : il additionne 4. Cherche le −. » |
| 6, étape 2 | toucher le 4 | « Le 4 est bien écrit. Cherche le −. » |
| 6, étape 3 | endroit entre 3 et + | « Là, le − serait encore après le 3 : c'est la même faute. Le signe d'un nombre négatif se met avant le nombre. » |
| 6, étape 3 | endroit entre + et 4 | « Là, il se collerait au + : deux signes se touchent (règle 1). Et il rendrait le 4 négatif, pas le 3. » |
| 7, étape 2 | commence | « Le nombre commence bien après la parenthèse ouverte. C'est la fin qu'on ne voit pas. » |
| 7, étape 3 | endroit entre − et 3 | « Là, elle couperait −3 en deux. Le nombre n'est fini qu'après le 3. » |
| 7, étape 3 | endroit entre ( et − | « Là, elle se fermerait avant le nombre. Une parenthèse se ferme après ce qu'elle entoure. » |
| 7, étape 3 | endroit avant la ( (entre 4 et ×, ou entre × et () | « Là, elle se fermerait avant d'avoir été ouverte. Elle doit venir après l'ouverture. » |

Questions pour deviner et pour comprendre (ne comptent pas ; titre « Pas tout à fait, et c'est normal. » puis un message qui ne répète pas le titre) :
| Écran | Réponse | Message |
|---|---|---|
| 1 | Non (juste) | « Il lui manque quelque chose. Tu vas voir quoi, et surtout pourquoi. » |
| 1 | Oui | « Il est mal écrit. Ce n'est pas grave de ne pas le savoir encore : c'est justement ce que ce cours explique. » |
| 5 | Non (juste) | « Devant −3, il n'y a aucun signe. Rien ne se touche, donc pas besoin de parenthèses. » |
| 5 | Oui (titre « Pas besoin. ») | « Regarde devant −3 : il n'y a aucun signe. Rien ne se touche, donc pas besoin de parenthèses. » |
| 9 | Le résultat | « Le résultat est le même : 4 fois −3 donne −12 dans les deux cas. Ce n'est pas le calcul qui change. » |
| 9 | La façon de l'écrire (juste) | « Le calcul et le résultat sont les mêmes. Seule l'écriture change : A a des parenthèses, B n'en a pas. » |
| 9 | Le nombre 3 | « Le nombre est −3 dans les deux calculs. Seule la façon de l'écrire change. » |

Questions qui comptent :
| Écran | Réponse | Message |
|---|---|---|
| 4 | (5 + −2) | « Les parenthèses doivent entourer le nombre négatif, pas tout le calcul. Ici + et − se touchent encore. » |
| 4 | 5 + (−2) (juste) | « Les parenthèses entourent le nombre négatif −2. Le + et le − ne se touchent plus. » |
| 4 | 5 (+ −2) | « Le + est une opération : il reste en dehors. Seul le nombre négatif −2 va entre parenthèses. » |
| 8, Q1 | 7− | « Le signe se met devant : −7. Écrit après, on croirait une soustraction. » |
| 8, Q1 | −7 (juste) | « Le signe est devant le nombre : −7, « moins sept ». » |
| 8, Q2 | ( | « Une parenthèse est déjà ouverte. Il manque celle qui la ferme : « ) ». » |
| 8, Q2 | − | « Le − est déjà là, devant le 3. Il manque la parenthèse qui ferme : « ) ». » |
| 8, Q2 | ) (juste) | « La parenthèse ouverte est maintenant fermée : 4 × (−3). » |
| 11, Q1 | un nombre | « Les nombres sont bien écrits. Cherche les deux signes qui se touchent : + et −. » |
| 11, Q1 | + ou − (juste) | « Le + et le − se touchent. On écrit 5 + (−2). » |
| 11, Q2 | Deux signes se touchent | « Il n'y a pas de signes collés ici : le × est suivi d'une parenthèse. Le problème est ailleurs. » |
| 11, Q2 | Le moins est après le nombre | « Le − de −3 est bien devant le 3. Le problème : la parenthèse reste ouverte. » |
| 11, Q2 | Une parenthèse n'est pas fermée (juste) | « La parenthèse ouverte ne se ferme pas : 4 × (−3). » |
| 11, Q3 | Faux | « Cherche une faute : deux signes collés ? Non, −2 est entre parenthèses. Un − après un nombre ? Non. Une parenthèse ouverte ? Elle est fermée. Le calcul est bien écrit. » |
| 11, Q3 | Vrai (juste) | « Vrai : −6 est en tête sans parenthèses, et (−2) est entre parenthèses. Rien ne se touche. » |
| 11, Q4 | 9 + (−4) (juste) | « Le + et le − ne se touchent plus : 9 + (−4). » |
| 11, Q4 | 9 + −4 | « Le + et le − se touchent encore. Mets −4 entre parenthèses : 9 + (−4). » |
| 11, Q4 | 9 + (−4 | « La parenthèse ouverte doit se fermer : 9 + (−4). » |
| 11, Q4 | (9 + −4) | « Les parenthèses doivent entourer le nombre négatif, pas tout le calcul : 9 + (−4). » |
| 11, Q4 | 9 + (4−) ou 9 + 4− | « Le signe − se met avant le 4 : 9 + (−4). » |
| 11, Q4 | 9 + (−n), n ≠ 4 | « L'écriture est bonne, mais le nombre a changé. Garde −4. » |
| 11, Q4 | autre | « Garde le même calcul, et mets le nombre négatif entre parenthèses : 9 + (−4). » |
| 12, dernière ligne | 6 × (−2) (juste) | « Le × et le − ne se touchent plus. » |
| 12, dernière ligne | 6 × −2 | « Le × et le − se touchent encore. Mets −2 entre parenthèses. » |
| 12, dernière ligne | 6 × (−2 | « La parenthèse ouverte doit se fermer. » |
| 12, dernière ligne | autre | « Recopie la ligne du dessus : 6 × (−2). » |
| 13, case 1 (non notée) | −3 (juste) | « Le − est devant le 3, comme la règle 3 le demande. » |
| 13, case 1 | 3− | « Le − est toujours après le 3. Il doit aller devant. » |
| 13, case 1 | (−3) | « En tête du calcul, on n'écrit pas de parenthèses : −3. » |
| 13, case 1 | 3 | « Le 3 est négatif : garde son signe −, devant le nombre. » |
| 13, case 1 | autre | « Écris le nombre 3 avec son signe − devant. » |
| 13, case 2 | −3 + 4 (juste) | « Le − est devant le 3, et pas de parenthèses en tête. » |
| 13, case 2 | (−3) + 4 | « Pas tout à fait. En tête du calcul, on n'écrit pas de parenthèses : −3 + 4. » |
| 13, case 2 | 3− + 4 | « Le − est toujours après le 3. Il doit aller devant. » |
| 13, case 2 | 3 + 4 ou +3 + 4 | « Le 3 est négatif : garde son signe −, devant le nombre. » |
| 13, case 2 | autre | « Garde les mêmes nombres. Le signe − va devant le 3. » |
| 15 | faute non repérée | l'explication de la faute (tableau des erreurs reconnues) + le calcul corrigé |

*Notes :* l'« Étape par étape » en 3 lignes de la v2 (après une erreur à « Réécris ») disparaît : l'aide qui s'efface des exemples guidés la remplace. Les messages de l'écran 11, Q4 suivent le même modèle pour les calculs à réécrire générés en révision et en entraînement (nombres tirés). Après une erreur à un exercice de fin, on montre aussi « La résolution ».

En révision et en entraînement (messages conservés de la v2) :
| Format | Réponse | Message |
|---|---|---|
| Quelle règle ? (7 − −1 = 8) | Le moins est après le nombre | « Le − de −1 est bien devant le 1. Le problème : deux − se touchent. » |
| Quelle règle ? (7 − −1 = 8) | Une parenthèse n'est pas fermée | « Il n'y a aucune parenthèse ici. Le problème : deux − se touchent. » |
| Réécris (calcul généré) | mêmes cas que l'écran 11, Q4 | voir ci-dessus, avec le calcul tiré (ex. 6 × −2 : « Le × et le − se touchent encore. Mets −2 entre parenthèses. ») |
| Réécris (calcul avec 3− en tête) | (−3) + 4 | « Pas tout à fait. En tête du calcul, on n'écrit pas de parenthèses : −3 + 4. » |

**Fiche mémo** (écran plein, sans scène, doc 08 n° 38 et 46 ; **consultable avant la validation**, depuis Mes cours ; textes validés le 2026-11-25)
- **La règle :** **Un calcul s'écrit d'une seule façon.** On doit toujours savoir quel rôle joue chaque − : soustraire, ou signe d'un nombre. Quatre puces : « Deux signes ne se suivent jamais. » · « En tête, pas de parenthèses. » · « Le − se met avant le nombre. » · « Une parenthèse ouverte se ferme. »
- **Exemples bien écrits :** 4 × (−3) · −3 + 5.
- **L'erreur à éviter :** 4 × −3 ✗. « Le × et le − se touchent. On écrit 4 × (−3). »
- **L'astuce :** « Cherche d'abord les signes qui se touchent, puis demande-toi pour chaque − : il soustrait, ou c'est le signe d'un nombre ? » (doc 08 n° 47)

**En révision et en entraînement** (formats du cours) : **Classer** bien écrit / mal écrit (en glisser-déposer, ou en touchant un calcul puis la case ; il disparaît de la leçon mais reste ici), **Quelle règle ?** (calcul généré avec une faute, 3 choix ; après la réponse, la correction apparaît), **Lequel est bien écrit ?** (4 écritures du même calcul, une seule correcte), **Réécris** (calcul généré avec une faute, elle tape le calcul entier) et **Toucher la faute** (même présentation qu'aux exercices de fin).

**Générateur** (inchangé depuis la v2)
| Niveau | Calculs affichés |
|---|---|
| 1 | une seule opération, de 1 à 9 : 4 × (−3) |
| 2 | deux opérations : 5 + (−2) × 3 |
| 3 | trois opérations ou plus, avec parenthèses : −6 − (−2) × (4 + (−1)) |

Les écritures fausses sont fabriquées en appliquant l'une des fautes ci-dessous à un calcul bien écrit.

**Erreurs reconnues** (inchangées depuis la v2, sauf `partIndex`)
| Identifiant | La faute non repérée | Explication affichée | Règle | partIndex | Calcul-piège |
|---|---|---|---|---|---|
| `signes-colles` | deux signes qui se suivent (4 × −3) | « Deux signes ne se suivent jamais : 4 × (−3). » | 1 | à fixer au codage | un négatif après × ou ÷ |
| `parentheses-en-tete` | parenthèses autour d'un négatif en tête, dans une réponse tapée | « En tête du calcul, on n'écrit pas de parenthèses : −3 + 4. » | 2 | à fixer au codage | (Réécris uniquement) un négatif en tête |
| `moins-apres` | le − après le nombre (3−) | « Le signe moins s'écrit avant le nombre : −3. » | 3 | à fixer au codage | un négatif en tête |
| `parenthese` | parenthèse non fermée ou en trop | « Une parenthèse ouverte doit être fermée. » | 4 | à fixer au codage | niveau 3, avec parenthèses |

(Le `partIndex` est l'indice de la partie du cours à rouvrir par « Relire la règle N » ; il est fixé au codage : règle 1 → écran 3, règle 2 → écran 5, règle 3 → écran 6, règle 4 → écran 7.)

*Note :* dans « Toucher la faute », « Classer » et « Lequel est bien écrit ? », (−3) + 5 n'est jamais affiché comme une faute : on ne montre que de vraies fautes. La faute `parentheses-en-tete` n'existe que pour une réponse tapée dans ce cours.

**Résolution type** (pour Toucher la faute) : le calcul lui-même, découpé en cases (un nombre = une case, chaque signe et chaque parenthèse = une case).

**Exemples (Toucher la faute)**
| Calcul affiché | Bonne réponse | Elle touche | Erreur enregistrée |
|---|---|---|---|
| 4 × −3 | la case « × » ou la case « − » | « − » | — |
| 4 × (−3) | « Tout est bien écrit » | « × » | `relecture` |
| 5 + (−2) × 3− | la case « − » après le 3 | « Tout est bien écrit » | `moins-apres` |
| −6 − (−2 × 4 | la case « ( » non fermée | « ( » | — |

**Choix de la maquette retenus (« À décider » validés)** : les deux petites questions « À quoi sert le − ? » remplacées par des étapes interactives non notées ; le calcul −6 + 2 − 5 (deux rôles) à l'étape 3 de l'écran 2 ; on touche l'endroit de la parenthèse ouvrante (la fermante arrive toute seule, la règle 4 insiste sur les deux) et on touche l'endroit du − (pas de glisser) ; fusion de « Règle 1 animée » et « Règle 1 : exemples » (écrans 3 et 4) ; emplacements avant le nombre aussi proposés à l'écran 7 ; les deux petites questions des règles 3 et 4 regroupées à l'écran 8 (la note passe de 15 à 14 questions) ; « Comparer deux cas » avec les deux cas venus de ce cours ; B affiché avec ses signes collés surlignés après la réponse ; série de pratique de 4 questions qui remplace Classer et Quelle règle ? dans la leçon (elles restent en révision et entraînement) ; les 4 questions comptent dans la note ; pas de question venue d'un cours précédent ; dernière case de l'exemple 1 conservée (elle recopie le calcul bien écrit) ; « (−3) + 4 » refusé dans l'exemple 2 ; les deux signes collés comptent chacun comme bonne réponse à Toucher la faute ; fiche mémo lue par « Écouter » comme tout écran.

---

## Cours 1 — Additionner deux nombres de même signe

*Version 2 (2026-11-24), remplace la version 1. Maquette validée : `docs/design/ecrans/cours-1-v2.html` (version 4 de la maquette ; le porteur du projet a dit « ça me convient parfaitement » : pour chaque point « À décider », la proposition de la maquette est retenue). Ce cours suit le Cours 0 v3 et les décisions du doc 08 n° 20 à 50 (n° 45, 48, 49 et 46 : série notée, case résultat seule à l'exemple 2, question ratée de la série qui repasse, fiche mémo avant validation).*

**La règle :** *Même signe : j'additionne les nombres sans leur signe, et je garde le signe.*

**L'idée de départ :** deux dettes qui s'ajoutent font une dette plus grande. Sur la droite graduée, deux bonds dans le **même sens** vont **plus loin ensemble** : on additionne les longueurs, et on arrive du côté où vont les bonds, donc on garde le signe.

**Les règles enseignées** (la règle du doc 06 v1 est coupée en deux, chacune correspond à une erreur reconnue)
1. **J'additionne les nombres sans leur signe.** −3 + (−5) : 3 + 5 = 8. *(erreur reconnue `soustraction-au-lieu-addition`)*
2. **Je garde le signe des deux nombres.** −3 + (−5) = −8 ; 4 + 6 = 10. *(erreur reconnue `signe-oublie`)*

**Déroulé (15 écrans dans la maquette : 7 de leçon, 1 de pratique, 2 exemples guidés, l'annonce, 2 modèles d'exercice de fin — les 5 exercices de fin sont générés —, le résultat et « Mes cours »)**

Types d'écrans utilisés : **explication pas à pas** (scène en haut, la droite graduée, qui se transforme à chaque « Suite » ; « Revoir cette étape » rejoue l'animation ; points « Étape N sur M » ; seules les **2 dernières phrases** restent affichées, les précédentes sont repliées derrière « Relire le début » / « Replier le début ») ; **étape interactive** (voir ci-dessous) ; **question pour deviner** (ne compte pas) ; **série de pratique** ; **exemple guidé**. Jamais plus de 2 étapes de lecture d'affilée sans une action. Couleurs (doc 08 n° 27) : négatifs **orange**, positifs **bleu**, surligneur jaune « regarde ici », **dans les explications seulement** ; pendant une question, la droite est **grise** (aucune couleur qui donne un indice) ; vert / rouge **après** la réponse.

**Étapes interactives** (dans les explications ; elles remplacent « Suite », l'action est en bas de l'écran ; une erreur = un message court « Pas tout à fait. <message> Essaie encore. » et elle réessaie ; **rien n'est noté**)
- *Phrase à trous* : un seul trou à la fois, qui remplace une phrase de l'explication ; les choix se lisent dans la phrase. Consigne : « Touche le mot qui complète la phrase. » Le trou est un grand emplacement visible, rempli par le mot juste.
- *Toucher la droite* : pastilles rondes visibles sur chaque graduation qui « respirent », consigne en gras au-dessus de la droite « Touche la droite à l'endroit où l'on arrive. », petite main animée la **première fois seulement**, cibles de 44 px de large au moins, 8 graduations au plus (la droite tient dans l'écran, sans défiler ni être coupée). La droite est grise ; au bon toucher, le bond se dessine en couleur.

*Leçon (7 écrans, pastille « Cours 1 · Leçon · étape N sur 7 »)*

1. **Accroche + deviner.** Titre : « Additionner deux nombres de même signe ». « Quand tu additionnes deux nombres **négatifs**, ou deux nombres **positifs**, on dit qu'ils ont le **même signe**. » « Dans ce cours, tu vas apprendre à les additionner sans te tromper de signe, avec une image : **la droite graduée**. » Question pour deviner : « Pour commencer, à ton avis : tu dois 3 € à une amie, puis encore 5 €. Combien dois-tu en tout ? » [2 €] [8 €] [15 €]. Réponse attendue : 8 €. Mention : « Question pour découvrir : elle ne compte pas dans la note. » Retour si juste (« Juste ! ») : « Deux dettes qui s'ajoutent font une dette plus grande. Le cours va t'expliquer comment l'écrire avec des nombres négatifs. » Si faux : titre « Pas tout à fait, et c'est normal. » (voir tableau).
2. **La droite graduée et les bonds** (titre « La droite graduée et les bonds », 5 étapes).
   - Étape 1 : droite de −5 à 5, 0 surligné en jaune. Légende « Une droite où les nombres sont rangés dans l'ordre ». « Pour additionner des relatifs, on les dessine sur une **droite graduée**. Au milieu, **0** : notre point de **départ**. »
   - Étape 2 : même droite, négatifs orange à gauche, positifs bleu à droite. Légende « négatifs à gauche · positifs à droite ». « À droite de 0, les **positifs**, en bleu. À gauche, les **négatifs**, en orange. Mêmes couleurs dans tout le module. »
   - Étape 3 (**interactive : toucher la droite**) : droite de −3 à 4, grise. « **Ajouter un nombre positif**, c'est faire un bond vers la **droite**. On part de 0 et on ajoute 3. » Elle touche l'arrivée (3). Le bond de 3 se dessine, le calcul « 0 + 3 » apparaît. Phrase de suite : « Le bond de 3 vers la droite arrive en **3**. »
   - Étape 4 (**interactive : toucher la droite**) : droite de −4 à 3, grise. « **Ajouter un nombre négatif**, c'est faire un bond vers la **gauche**. On repart de 0 et on ajoute −3. » Elle touche l'arrivée (−3). Le bond se dessine, le calcul « 0 + (−3) » apparaît.
   - Étape 5 (**interactive : phrase à trous**) : « Le bond de −3 va vers la [ ? ]. » Choix : [droite] [gauche]. Attendu : gauche. Phrase de suite : « Il fait 3 graduations : autant que le nombre sans son signe. »
3. **Deux dettes qui s'ajoutent** (3 étapes). Droite de −10 à 2.
   - Étape 1 : un bond de 3 graduations vers la gauche, légende « Une dette, c'est un nombre négatif », calcul −3, repères « départ » / « arrivée ». « Une **dette** se note avec un nombre **négatif**. Tu dois **3 €** : un bond de 3 graduations vers la gauche, tu es à −3. »
   - Étape 2 : un deuxième bond de 5 graduations, calcul −3 + (−5). « Tu dois encore **5 €** : un deuxième bond de 5 graduations, vers la gauche aussi, **dans le même sens**. »
   - Étape 3 (**interactive : phrase à trous**) : droite grise, calcul « −3 + (−5) = ? ». « Les deux bonds vont vers la [ ? ]. » Choix : [gauche] [droite]. Attendu : gauche. Après la réussite : la droite reprend ses couleurs, l'arrivée −8 est marquée, calcul −3 + (−5) = −8. « Tu arrives à −8 : **8 € en tout**. Deux bonds de même sens vont **plus loin ensemble**. »
4. **Comparer deux cas.** Titre « Comparer deux cas ». « Voici deux calculs presque identiques. Regarde-les bien. » Côte à côte : « Calcul A » −3 + (−5) · « Calcul B » −3 + 5. Petit texte : « Le calcul B est un aperçu : au prochain cours, tu apprendras à le calculer. Ici, tu observes seulement ce qui change. » Question : « Qu'est-ce qui change entre A et B ? » [Le premier nombre] [La longueur du deuxième bond] [Le signe du deuxième nombre]. Attendu : le signe du deuxième nombre. Mention : « Question pour comprendre : elle ne compte pas dans la note. » (validé le 2026-11-25) Après la réponse, la droite (−9 à 3) montre les deux trajets (A arrive en −8 : −3 + (−5) = −8 ; B arrive en 2 : −3 + 5 = 2), le retour (voir tableau), puis : « Dans A, les deux bonds vont vers la **gauche** : ils s'ajoutent. Dans B, le deuxième bond repart vers la **droite** : on revient vers 0. Ce cours ne traite que le cas A, le même signe. »
5. **Règle 1 : j'additionne** (titre « J'additionne les longueurs des bonds », 3 étapes). Droite de −10 à 2.
   - Étape 1 : les deux bonds −3 puis −5, calcul −3 + (−5). « Reprenons −3 + (−5) : même signe, donc les deux bonds vont dans le même sens, **bout à bout**. »
   - Étape 2 (**interactive : phrase à trous**) : les bonds sont étiquetés par leur longueur (3 et 5) ; droite grise pendant la question, calcul « 3 + 5 = ? ». « Les longueurs des bonds sont les nombres **sans leur signe** : 3 et 5. » La phrase à trous remplace une phrase : « Le trajet total fait 3 + 5 = [ ? ] graduations. » Choix : [2] [8] [15]. Attendu : 8. Après la réussite : couleurs et surligneur jaune reviennent, « 3 + 5 = 8 » surligné.
   - Étape 3 : encadré **Règle 1 : Deux nombres de même signe : j'additionne les nombres sans leur signe.**
6. **Règle 2 : je garde le signe** (titre « Je garde le signe », 4 étapes). Droite de −10 à 2.
   - Étape 1 : trajet de 8 graduations, −8 surligné, calcul −3 + (−5) = ?. « Le trajet fait 8 graduations : on arrive à **8** ou à **−8** ? Les deux bonds vont vers la **gauche** : côté **négatif**. »
   - Étape 2 (**interactive : phrase à trous**) : droite grise, calcul « −3 + (−5) = ? ». Phrase : « Du côté négatif : −3 + (−5) = [ ? ] » Choix : [8] [−8] [−2]. Attendu : −8. Après la réussite : couleurs, arrivée −8. « On garde le signe − des deux nombres. »
   - Étape 3 : droite de −2 à 11, bonds 0 → 4 → 10 vers la droite, calcul 4 + 6 = 10. « Même chose avec 4 + 6 : bonds vers la **droite**, côté **positif**. On garde le signe + : 10. »
   - Étape 4 : encadré **Règle 2 : Je garde le signe des deux nombres.**
7. **Récapitulatif** (titre « Les 2 règles à retenir »). Règle 1 « J'additionne les nombres sans leur signe. » exemple juste « −3 + (−5) : 3 + 5 = 8 », faux « 5 − 3 = 2 » ; Règle 2 « Je garde le signe des deux nombres. » juste « −3 + (−5) = −8 », faux « −3 + (−5) = 8 ». Encadré « En une phrase » : « Même signe : j'additionne les nombres sans leur signe, et je garde le signe. » « Maintenant, tu t'entraînes avec quatre questions. » Bouton « Suivant ».

*Pratique*

8. **Série de 4 questions** (pastille « Cours 1 · Pratique », compteur « Question N sur 4 » et 4 points, retour immédiat, pas de nouvel essai : on montre la correction et on passe à la suivante ; **notée** (doc 08 n° 45) ; **une question ratée repasse avant les exercices de fin** (n° 49 : correction, suite, « Tu retrouveras ce calcul à la fin de la leçon. »), seule la 1re réponse compte ; **aide décroissante, formats variés** ; pendant une question aucune couleur de signe). Bouton « Question suivante » ; après la 4e, un encadré « N sur 4 » et « Maintenant, deux exemples pour t'aider à les résoudre en entier. », puis « Continuer ».
   - **Question 1 (toucher l'arrivée, bonds dessinés).** Calcul −2 + (−5). Droite de −7 à 0, grise, bonds 0 → −2 → −7 dessinés sans étiquette, départ en 0, pastilles et consigne « Touche la droite à l'endroit où l'on arrive. » Attendu : −7. Juste : « Les deux bonds vont vers la gauche, bout à bout : 2 + 5 = 7, on arrive à −7. » Faux : « Le deuxième bond part de −2 et fait 5 graduations vers la gauche : −3, −4, −5, −6, −7. On arrive à −7. »
   - **Question 2 (le signe).** « Touche le signe du résultat. Tu n'as pas besoin de calculer. » Calcul −4 + (−3), « Quel est le signe du résultat ? » [+] [−]. Attendu : −. Juste : « Les deux nombres sont négatifs : on garde le signe −. Le résultat est négatif. » Faux (+) : message `signe-oublie`.
   - **Question 3 (vrai ou faux).** « Touche Vrai ou Faux. » Calcul −4 + (−3) = 7. [Vrai] [Faux]. Attendu : Faux. Juste : « Faux : 4 + 3 = 7, mais on garde le signe −. Le bon résultat est −7. » Faux (Vrai) : « On a bien additionné 4 et 3, mais les deux nombres sont négatifs : le résultat est négatif aussi. −4 + (−3) = −7. »
   - **Question 4 (taper, sans aide).** « Calcule. **Tape le résultat.** » Calcul −8 + (−9) ; « Tape le résultat avec les touches du clavier. » (clavier complet). Attendu : −17. Juste : « 8 + 9 = 17, et on garde le signe − : −17. »

*Exemples guidés (l'aide s'efface ; le calcul de départ reste toujours affiché)*

9. **Exemple 1 sur 2 : tout est résolu à l'écran, elle valide.** « Voici la résolution complète. Lis chaque ligne, puis touche « Je comprends ». » Calcul −4 + (−9). Les lignes apparaissent une à une, la ligne en cours est surlignée et expliquée dans un encadré :
   - Ligne 1 : = −(4 + 9). « Les deux nombres sont négatifs : j'additionne 4 et 9 sans leur signe, et je garde le signe − devant la parenthèse. » [Je comprends]
   - Ligne 2 : = −(13). « 4 + 9 = 13. Le signe − est toujours devant : c'est le signe des deux nombres. » [Je comprends]
   - Dernière ligne : = ▢ (une case à taper). « Dernière ligne » : « Écris le résultat, avec son signe. Tu peux t'aider de la ligne du dessus. » « Tape ce qui manque dans la case, avec les touches du clavier. » Attendu : −13. Juste : « On garde le signe − : −13. »
10. **Exemple 2 sur 2 : à moitié, deux cases à taper.** « Cette fois, deux cases sont à toi. Les deux nombres sont négatifs : je garde le signe, et j'additionne. » Calcul −6 + (−1). Case 1 : −6 + (−1) = −(6 + ▢). Attendu : 1. Case 2 : −6 + (−1) = −(6 + 1) = ▢. Attendu : −7. Les cases s'enchaînent dans l'ordre (« Case suivante ») ; une erreur montre le message et la bonne réponse. **Seule la case 2 (le résultat) compte dans la note ; la case 1 est un entraînement non noté** (doc 08 n° 48).

*Fin*

11. **Annonce** : « Place aux 5 exercices de fin. Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle. Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours. Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon. » Bouton « Commencer les exercices ».
12. **5 exercices de fin (modèle : deux négatifs, 7 fois sur 10).** « Calcule. **Tape le résultat.** » Le calcul est écrit en haut comme sur une copie, clavier complet, aucune couleur avant la réponse, pas de droite. Ex. −8 + (−7). Juste : « 8 + 7 = 15, et on garde le signe − : −15. » Après une erreur : le message du tableau, puis la résolution type : −8 + (−7) · = −(8 + 7) · = −15.
13. **Modèle avec deux positifs (3 fois sur 10).** Ex. 7 + 6. Juste : « 7 + 6 = 13, et le résultat reste positif. » Résolution type : 7 + 6 · = +(7 + 6) · = 13.
14. **Résultat** (validé ou non, doc 08 n° 29). Ex. cours raté : « Le cours 1 n'est pas encore validé », les deux conditions avec ✗ / ✓ (« N bonnes réponses sur 11, soit X %. Il en faut au moins 80 %. » et « N exercices de fin justes sur 5. Il en faut au moins 4. »), « Tes erreurs : » « J'oublie le signe du résultat (règle 2), 3 fois » · « Je soustrais au lieu d'additionner (règle 1), 1 fois », liens « Relire la règle 2 » · « Relire la règle 1 », « Prochaine étape : la série de validation. 5 exercices, 4 justes pour valider le cours. » Bouton « Faire la série de validation ». *(Les chiffres de la maquette, « 9 sur 13 », sont inventés ; au codage ils suivent la note ci-dessous : 11 questions.)*
15. **Mes cours** garde la raison de l'échec : « À valider », « Dernier essai : 3 exercices de fin justes sur 5. À revoir : le signe du résultat. », boutons « Faire la série de validation », « Relire la règle 2 », « Relire la leçon ».

**Note du cours** (doc 08 n° 21 et 32 à 37) : comptent les **4 questions de la série de pratique** (écran 8), les **2 exemples guidés** (écrans 9 et 10 : une seule case chacun, la dernière ; pour l'exemple 2, seule la case 2, le résultat, compte) et les **5 exercices de fin**, soit **11 questions**. Ne comptent pas : la question pour deviner (écran 1), la question pour comprendre (écran 4), **toutes les étapes interactives des explications** (écrans 2, 3, 5 et 6, notées nulle part, qu'elle se trompe ou non) et la case 1 de l'exemple 2. Une question de la série ratée repasse avant les exercices de fin (doc 08 n° 49). Validation : **80 % sur les 11 et au moins 4 exercices de fin sur 5**. Il n'y a pas de petite question isolée dans ce cours : elles sont remplacées par la série de pratique. Il n'y a pas de cours précédent sur ce thème : les 4 questions de la série sont sur ce cours.

**Retours d'erreur précis**

Étapes interactives (message court puis « Essaie encore. », rien n'est noté) :
| Écran | Réponse | Message |
|---|---|---|
| 2, étape 3 | toucher 0 | « Tu es resté au départ : le bond fait 3 graduations. » |
| 2, étape 3 | toucher une graduation négative | « Ajouter un nombre positif, c'est avancer vers la droite. Tu es parti vers la gauche. » |
| 2, étape 3 | toucher plus loin que 3 | « Une graduation de trop : le bond fait exactement 3 graduations. » |
| 2, étape 3 | toucher 1 ou 2 | « Il manque des graduations : le bond en fait 3. Compte-les une par une à partir de 0. » |
| 2, étape 4 | toucher 0 | « Tu es resté au départ : le bond fait 3 graduations. » |
| 2, étape 4 | toucher une graduation positive | « Ajouter un nombre négatif, c'est reculer vers la gauche. Tu es parti vers la droite. » |
| 2, étape 4 | toucher plus loin que −3 | « Une graduation de trop : le bond fait exactement 3 graduations. » |
| 2, étape 4 | toucher −1 ou −2 | « Il manque des graduations : le bond en fait 3. Compte-les une par une à partir de 0. » |
| 2, étape 5 | droite | « Ajouter un nombre négatif, c'est reculer : vers la gauche. » |
| 3, étape 3 | droite | « Regarde la droite : les deux bonds reculent, comme une dette qui grandit. » |
| 5, étape 2 | 2 | « Soustraire, ce serait pour des bonds de sens contraires. Ici les deux bonds vont dans le même sens : ils s'ajoutent. » |
| 5, étape 2 | 15 | « On additionne les longueurs, on ne les multiplie pas : 3 + 5. » |
| 6, étape 2 | 8 | « Le trajet fait bien 8 graduations, mais on arrive à gauche de 0 : il faut garder le signe. » |
| 6, étape 2 | −2 | « −2 viendrait de 5 − 3. Ici les bonds s'ajoutent : 3 + 5 = 8, avec le signe −. » |

Questions pour deviner et pour comprendre (ne comptent pas ; titre « Pas tout à fait, et c'est normal. » puis un message qui ne répète pas le titre) :
| Écran | Réponse | Message |
|---|---|---|
| 1 | 2 € | « Tu dois déjà 3 €, puis tu dois encore 5 € de plus : ta dette grandit, elle ne diminue pas. Tu dois 8 €. » |
| 1 | 15 € | « On additionne les deux dettes : 3 + 5 = 8, pas 3 × 5. Tu dois 8 €. » |
| 4 | Le premier nombre | « Le premier nombre est −3 dans les deux calculs : il ne change pas. » |
| 4 | La longueur du deuxième bond | « Le deuxième bond fait 5 graduations dans les deux calculs : ce n'est pas sa longueur qui change, c'est son sens. » |
| 4 | Le signe du deuxième nombre (juste) | « Le deuxième nombre est négatif dans le calcul A, positif dans le calcul B : un signe change, donc le sens du bond change. » |

Questions qui comptent :
| Écran | Réponse | Message |
|---|---|---|
| 8, Q1 | toute autre graduation que −7 | « Le deuxième bond part de −2 et fait 5 graduations vers la gauche : −3, −4, −5, −6, −7. On arrive à −7. » |
| 8, Q2 | + | « Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! » |
| 8, Q3 | Vrai | « On a bien additionné 4 et 3, mais les deux nombres sont négatifs : le résultat est négatif aussi. −4 + (−3) = −7. » |
| 8, Q4 | 17 | « Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! » |
| 8, Q4 | −1 ou 1 | « Même signe : on **additionne** les nombres, on ne les soustrait pas. 8 + 9 = 17, donc −17. » |
| 8, Q4 | autre | « Additionne 8 et 9 sans les signes, puis garde le signe −. Le résultat est −17. » |
| 9, dernière ligne | 13 | « Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! » |
| 9, dernière ligne | autre | « Le résultat de la ligne du dessus est −(13), c'est-à-dire −13. » |
| 10, case 1 (non notée) | −1 | « On écrit le nombre sans son signe : 1. Le signe − est déjà devant la parenthèse. » |
| 10, case 1 | autre | « Dans −(6 + ▢), on remet le deuxième nombre du calcul sans son signe : 1. » |
| 10, case 2 | 7 | « Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! » |
| 10, case 2 | −5 ou 5 | « Même signe : on **additionne** les nombres, on ne les soustrait pas. 6 + 1 = 7, donc −7. » |
| 10, case 2 | autre | « Additionne 6 et 1, puis garde le signe − devant le résultat. » |
| 12, −8 + (−7) | 15 | « Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! » |
| 12, −8 + (−7) | −1 ou 1 | « Même signe : on **additionne** les nombres, on ne les soustrait pas. 8 + 7 = 15, donc −15. » |
| 12, −8 + (−7) | autre | « Additionne 8 et 7 sans les signes, puis garde le signe −. » |
| 13, 7 + 6 | −13 | « Les deux nombres sont positifs : le résultat est positif aussi. » |
| 13, 7 + 6 | −1 ou 1 | « Même signe : on **additionne** les nombres, on ne les soustrait pas. 7 + 6 = 13, donc 13. » |
| 13, 7 + 6 | autre | « Additionne 7 et 6 : le résultat reste positif. » |

*Notes :* la détection de `soustraction-au-lieu-addition` est celle de la v1 (la réponse vaut ±(grand − petit)) ; les cas ±1 ci-dessus en sont des exemples. Pour les exercices de fin générés, les messages suivent le même modèle avec les nombres tirés, et le message d'une erreur de signe suit le **signe des nombres** (négatifs : « Je garde le signe − ! » ; positifs : « Les deux nombres sont positifs : le résultat est positif aussi. », doc 07 n° 6A). Après une erreur à un exercice de fin, on montre aussi la résolution type.

**Fiche mémo** (écran plein, doc 08 n° 38 ; **consultable avant la validation**, depuis Mes cours, n° 46 ; texte validé le 2026-11-25)
- **La règle :** Même signe : j'additionne les nombres sans leur signe, et je garde le signe.
- **Exemples :** −3 + (−5) : 3 + 5 = 8, je garde le − : **−8**. · 4 + 6 : 4 + 6 = 10, je garde le + : **10**.
- **Erreur à éviter :** oublier le signe (−3 + (−5) = 8) ou soustraire au lieu d'additionner (−3 + (−5) = −2).
- **Astuce :** deux bonds dans le même sens vont plus loin ensemble : on additionne les longueurs, et on arrive du côté où vont les bonds.

**En révision et en entraînement** (formats validés le 2026-11-25) : taper le résultat d'un calcul de même signe ; toucher l'arrivée sur la droite (bonds dessinés, droite grise, 8 graduations au plus) ; « Quel est le signe du résultat ? » ; vrai ou faux sur un résultat ; **Trouver l'erreur** sur la résolution type. Un calcul de même signe revient aussi en question « intercalée » dans les cours suivants.

**Générateur** (inchangé depuis la v1 ; la maquette n'y touche pas)
| Niveau | Forme | Nombres |
|---|---|---|
| 1 | a + b, de même signe (négatifs 7 fois sur 10) | de 1 à 9 |
| 2 | même chose | de 10 à 99 |
| 3 | même chose | de 100 à 999 |

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : −3 + (−5) · = −(3 + 5) · = −8. Pour deux positifs : 4 + 6 · = +(4 + 6) · = 10.

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Règle | partIndex | Calcul-piège |
|---|---|---|---|---|---|
| `signe-oublie` 🔴 | la réponse est l'opposé de la bonne réponse | « Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! » (positifs : « Les deux nombres sont positifs : le résultat est positif aussi. ») | 2 | à fixer | deux négatifs |
| `soustraction-au-lieu-addition` | la réponse vaut ±(grand − petit) | « Même signe : on **additionne** les nombres, on ne les soustrait pas. 3 + 5 = 8, donc −8. » | 1 | à fixer | deux nombres d'écart important, ex. −2 + (−9) |

(Le `partIndex` est l'indice de la partie du cours à rouvrir par « Relire la règle N » ; il est fixé au codage.)

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

**Choix de la maquette retenus (« À décider » validés)** : dette comme accroche (écran 1) ; accroche et question pour deviner ajoutées ; étapes interactives sans note, message court puis nouvel essai ; pastilles qui respirent et main la 1re fois ; fusion des deux écrans de la droite ; dette conservée comme idée de départ ; cas B (−3 + 5) en simple aperçu du Cours 2 ; écran « Comparer » avant la règle 1 ; règle coupée en deux (règles 1 et 2) ; cas positif 4 + 6 en une seule étape de lecture (sans action) ; les 4 questions de la série comptent dans la note (n° 45) ; pas de nouvel essai en pratique (correction puis suite ; une question ratée de la série repasse avant les exercices de fin, n° 49) ; case finale de l'exemple 1 conservée ; exemple 2 : seule la case résultat compte (n° 48) ; pas d'exemple guidé positif (cas positif dans les exercices de fin) ; résolution type de 3 lignes affichée après une erreur à un exercice de fin.

---

## Cours 2 — Additionner deux nombres de signes contraires

*Version 2 (2026-11-25), remplace la version 1. Maquette : `docs/design/ecrans/cours-2-v2.html`, **validée par le porteur du projet avec deux fusions** : l'écran « Revenir à 0 » est supprimé (son contenu, −6 + 6 = 0, devient une étape de l'écran « Règle 2 ») et l'écran récapitulatif « Les 2 règles » est fusionné dans « Autres façons de faire » (les règles en haut, puis les techniques). La maquette a donc 17 écrans (8 de leçon, 1 de pratique, 2 exemples guidés, l'annonce, 2 modèles d'exercice de fin, le résultat, « Mes cours » et la fiche ; elle en avait 19 avant les deux fusions). Pour chaque point « À décider » de la maquette, la proposition est retenue. Ce cours suit le Cours 0 v3, le Cours 1 v2 et les décisions du doc 08 n° 20 à 50 (n° 45, 48, 49 et 46 : série notée, case résultat seule à l'exemple 2, question ratée de la série qui repasse, fiche mémo avant validation).*

**La règle :** *Signes contraires : je soustrais le plus petit (sans signe) du plus grand (sans signe), et je prends le signe du plus grand.*

**L'idée de départ :** une dette de 7 € est un bond de 7 graduations vers la gauche ; rendre 2 € est un bond de 2 vers la droite, **dans le sens contraire**, qui n'en défait qu'une partie. Le **plus long bond décide** du côté où l'on arrive : on soustrait les longueurs, et on prend le signe du plus long.

**Les règles enseignées** (la règle du doc 06 v1 est coupée en deux, chacune correspond à une erreur reconnue)
1. **Je soustrais les nombres sans leur signe.** −7 + 2 : 7 − 2 = 5. *(erreur reconnue `addition-au-lieu-soustraction`)*
2. **Le plus grand (sans signe) décide du signe.** −7 + 2 = −5 (7 est le plus grand, il est négatif) ; 3 + (−8) = −5. *(erreur reconnue `signe-du-mauvais-nombre`)* Le cas des deux opposés (−6 + 6 = 0) n'est pas une règle numérotée : c'est une étape de l'écran de la règle 2, et une ligne du rappel des règles.

**Astuces et techniques du plan** (doc 10, « Cours 2 ») : n° 1 « Le plus grand sans le signe gagne » = règle 2 et fiche mémo (la principale) ; n° 2 « Décomposer jusqu'à 0 » = le cas des deux opposés, étape de la règle 2 (**la décomposition de −7 + 9 = −7 + 7 + 2 de la maquette précédente n'y est plus** : le porteur du projet a retenu seulement −6 + 6 = 0) ; n° 3 « Commencer par le positif » et n° 4 « Le signe du résultat se devine » = écran « Autres façons de faire », une carte chacune, essai libre non noté.

**Déroulé (11 écrans pour apprendre : 8 de leçon, 1 de pratique, 2 exemples guidés — puis l'annonce, 2 modèles d'exercice de fin — les 5 exercices de fin sont générés —, le résultat, « Mes cours » et la fiche)**

Types d'écrans : **explication pas à pas** (scène en haut, la droite graduée, qui se transforme à chaque « Suite » ; « Revoir cette étape » ; points « Étape N sur M » ; seules les **2 dernières phrases** restent affichées, les précédentes sont repliées derrière « Relire le début ») ; **étape interactive** (comme au Cours 1 : phrase à trous ou toucher la droite, message court puis « Essaie encore. », rien n'est noté) ; **question pour deviner / pour comprendre** (ne compte pas) ; **petites questions** (comptent, repassent) ; **« Autres façons de faire »** (nouvelle brique, voir plus bas) ; **série de pratique** ; **exemple guidé**. Jamais plus de 2 étapes de lecture d'affilée sans action. Couleurs (doc 08 n° 27) : négatifs **orange**, positifs **bleu**, surligneur jaune, **dans les explications seulement** ; droite **grise** pendant une question ; vert / rouge **après** la réponse. Deux bonds qui se superposent (le petit sous le grand, comme −7 puis +2) ont des **hauteurs d'arc différentes** : un arc qui en contient un autre est plus haut.

*Leçon (8 écrans, pastille « Cours 2 · Leçon · étape N sur 8 »)*

1. **Accroche + deviner.** Titre : « Additionner deux nombres de signes contraires ». « Quand tu additionnes un nombre **négatif** et un nombre **positif**, on dit qu'ils ont des **signes contraires**. » « Dans ce cours, tu vas apprendre à trouver le résultat, et surtout **son signe**, avec une image : **la droite graduée**. » Question pour deviner : « Pour commencer, à ton avis : tu dois 7 € à une amie, puis tu lui rends 2 €. Combien dois-tu encore ? » [5 €] [9 €] [2 €]. Attendu : 5 €. Mention : « Question pour découvrir : elle ne compte pas dans la note. » Retour si juste : « En rendant 2 €, ta dette diminue : il te reste 5 € à rendre. Le cours va t'expliquer comment l'écrire avec des nombres relatifs, et surtout comment trouver le signe. » Si faux : titre « Pas tout à fait, et c'est normal. » (voir tableau).
2. **Un bond qui en défait un autre** (titre « Un bond qui en défait un autre », 3 étapes). Droite de −7 à 0 (8 graduations, la limite pour qu'elle reste touchable).
   - Étape 1 : un bond de 7 graduations vers la gauche, légende « Une dette, c'est un nombre négatif », repères « départ » / « arrivée », calcul −7. « Tu dois **7 €** : un bond de 7 graduations vers la **gauche**. Tu es à −7. »
   - Étape 2 (**interactive : toucher la droite**) : droite grise, calcul −7 + 2, consigne « Touche la droite à l'endroit où l'on arrive. » Attendu : −5. Au bon toucher, le bond de +2 se dessine : « Tu **rends 2 €** : c'est un bond de 2 graduations vers la **droite**, dans le sens **contraire** du premier. Tu arrives en −5 : tu dois encore **5 €**. »
   - Étape 3 (**interactive : phrase à trous**) : « Le bond de +2 est plus [ ? ] que le bond de −7. » Choix : [court] [long]. Attendu : court. Phrase de suite : « Le bond de +2 est plus **court** que le bond de −7. Il ne défait qu'une partie de la dette : on reste du côté **négatif**. Le bond le **plus long décide**. »
3. **Comparer deux cas.** Titre « Comparer deux cas ». « Voici deux calculs presque identiques. Regarde-les bien. » Côte à côte : « Calcul A » −7 + 2 · « Calcul B » −7 + (−2). Petit texte : « Le calcul B vient du cours précédent : tu sais déjà le faire. Ici, tu observes seulement ce qui change. » Question : « Qu'est-ce qui change entre A et B ? » [Le premier nombre] [La longueur du deuxième bond] [Le signe du deuxième nombre]. Attendu : le signe du deuxième nombre. Mention : « Question pour comprendre : elle ne compte pas dans la note. » Après la réponse, la droite (−10 à 1) montre les deux trajets (A arrive en −5 : −7 + 2 = −5 ; B arrive en −9 : −7 + (−2) = −9), le retour, puis : « Dans B, le deuxième bond continue vers la **gauche** : les bonds s'ajoutent (Cours 1). Dans A, il repart vers la **droite** : il **défait** une partie du premier. Ce cours traite le cas A. »
4. **Règle 1 : je soustrais** (titre « Je soustrais les longueurs des bonds », 3 étapes). Droite de −10 à 1.
   - Étape 1 : les bonds −7 puis +2, calcul −7 + 2. « Reprenons −7 + 2. Les signes sont contraires : les deux bonds vont en **sens contraires**. Le petit bond **défait** une partie du grand. »
   - Étape 2 (**interactive : phrase à trous**) : bonds étiquetés 7 et 2, droite grise, calcul 7 − 2. « Les longueurs des bonds sont les nombres **sans leur signe** : 7 et 2. Le grand bond perd 2 graduations : il en reste 7 − 2 = [ ? ]. » Choix : [5] [9] [14]. Attendu : 5. Après la réussite : « … il en reste 7 − 2 = **5**. »
   - Étape 3 : encadré **Règle 1 : Deux nombres de signes contraires : je soustrais les nombres sans leur signe.**
5. **Petites questions de la règle 1** (2 questions sur le même écran, **comptent**, repassent 2 écrans plus loin ; calcul écrit sans couleur).
   - Q1 : calcul −8 + 3 · « Les signes sont contraires. Que fait-on avec 8 et 3, sans leur signe ? » [Je les additionne] [Je les soustrais] [Je les multiplie]. Attendu : je les soustrais.
   - Q2 : calcul 9 + (−4) · « Quel nombre obtient-on en soustrayant les nombres sans leur signe ? » [5] [13] [36]. Attendu : 5.
6. **Règle 2 : le plus grand décide** (titre « Le plus grand décide du signe », **6 étapes**). Droite de −10 à 1.
   - Étape 1 : bonds étiquetés 7 et 2, −5 surligné, calcul −7 + 2 = ?. « Il reste **5** graduations. Reste une question : on arrive du côté **négatif** ou du côté **positif** ? »
   - Étape 2 (**interactive : phrase à trous**) : droite grise. « Le grand bond est celui de −7 : on reste du côté [ ? ]. » Choix : [positif] [négatif]. Attendu : négatif. Phrase de suite : « Le grand bond est celui de −7 : on reste du côté **négatif**. C'est le nombre sans signe **le plus grand** qui décide du signe. »
   - Étape 3 (**interactive : phrase à trous**) : « Du côté négatif : −7 + 2 = [ ? ] » Choix : [−5] [5] [−9]. Attendu : −5. Phrase de suite : « Du côté négatif : −7 + 2 = **−5**. Il reste 5 graduations, du côté négatif. »
   - Étape 4 : droite de −3 à 5, bonds −2 puis +6, calcul −2 + 6 = 4. « Et si le bond **positif** est le plus long ? Avec −2 + 6, il dépasse 0 : on arrive du côté **positif**, en 4. »
   - Étape 5 (**interactive : toucher la droite**, *nouvelle : vient de l'ancien écran « Revenir à 0 »*) : droite de −6 à 1 (8 graduations), grise, calcul −6 + 6, consigne « Touche la droite à l'endroit où l'on arrive. » Attendu : 0. Au bon toucher, le bond de +6 se dessine : « Cas particulier : −6 + 6. On recule de 6, puis on **avance de 6** : on revient au départ. Deux nombres **opposés** s'annulent : −6 + 6 = **0**. »
   - Étape 6 : encadré **Règle 2 : Le nombre sans signe le plus grand décide : le résultat a son signe.**
7. **Petites questions de la règle 2** (2 questions sur le même écran, comptent, repassent).
   - Q1 : calcul 3 + (−8) · « Quel est le signe du résultat ? Tu n'as pas besoin de calculer. » [positif] [négatif]. Attendu : négatif (le calcul-piège : le 1er nombre est positif, le plus grand est négatif).
   - Q2 : calcul −5 + 8 · « Quel est le résultat ? » [3] [−3] [−13]. Attendu : 3.
8. **Autres façons de faire** (nouvelle brique, titre « Autres façons de faire »). **En haut, le rappel des règles** (fusion de l'ancien récapitulatif) : « Les 2 règles à retenir », avec pour chaque règle un exemple juste ✓ et un faux ✗ : « 1. Je soustrais les nombres sans leur signe. » (−7 + 2 : 7 − 2 = 5 ✓ · 7 + 2 = 9 ✗) · « 2. Le plus grand (sans signe) décide du signe. » (3 + (−8) = −5 ✓ · 3 + (−8) = 5 ✗) · « Deux nombres opposés donnent 0. » (−6 + 6 = 0 ✓ · −6 + 6 = −12 ✗), puis l'encadré « En une phrase » : « Signes contraires : je soustrais le plus petit du plus grand (sans signe), et je prends le signe du plus grand. » **Dessous**, « La règle marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**. » et deux cartes (nom, quand, exemple chiffré, explication) :
   - **1. Commencer par le positif** — « Quand le calcul commence par un négatif. » −7 + 2 = 2 + (−7) = 2 − 7 = −5. « On change l'ordre des deux nombres : une addition se calcule dans n'importe quel ordre. Puis on lit « 2 moins 7 » : on part de 2 et on recule de 7. »
   - **2. Deviner le signe** — « Pour vérifier un résultat, ou avant de calculer. » −7 + 2 : −7 est plus loin de 0 que 2. « Le résultat a le signe du nombre le plus loin de 0 : ici négatif, donc −5. Si ton résultat a un autre signe, tu t'es trompée quelque part. »
   Le choix se fait avec **les boutons du bas** (« Essayer : commencer par le positif », « Essayer : deviner le signe »), pas en touchant les cartes ; « Tu peux aussi continuer sans essayer : aucune n'est obligatoire. » **Essai libre, non noté** (« Essai libre : il ne compte pas dans la note. ») : technique 1 : « Essaie avec −8 + 5 : écris 5 + (−8), puis calcule. **Tape le résultat.** » (−8 + 5 = 5 + (−8) = 5 − 8, clavier complet, attendu −3) ; technique 2 : « Essaie avec −3 + 9, sans calculer. **Touche le signe du résultat.** » ([positif] [négatif], attendu positif). Après l'essai : « Essayer l'autre façon » ou « Continuer ». Phrase de fin d'écran : « Maintenant, tu t'entraînes avec quatre questions. »

*Pratique*

9. **Série de 4 questions** (pastille « Cours 2 · Pratique », compteur « Question N sur 4 », retour immédiat, pas de nouvel essai ; **notée** ; une question ratée repasse avant les exercices de fin ; aide décroissante, formats variés ; aucune couleur de signe pendant la question). Après la 4e : encadré « N sur 4 » et « Maintenant, deux exemples pour t'aider à les résoudre en entier. »
   - **Q1 (toucher l'arrivée, bonds dessinés).** Calcul −6 + 2. Droite de −7 à 0, grise, bonds 0 → −6 → −4, consigne « Touche la droite à l'endroit où l'on arrive. » Attendu : −4.
   - **Q2 (le signe).** « Touche le signe du résultat. Tu n'as pas besoin de calculer. » Calcul 3 + (−8), « Quel est le signe du résultat ? » [+] [−]. Attendu : −.
   - **Q3 (une question du Cours 1, choix de résultat).** « Regarde d'abord les signes des deux nombres, puis touche le résultat. » Calcul −4 + (−3) ; [−7] [−1] [7]. Attendu : −7. *(Entraînement intercalé : elle doit d'abord reconnaître quelle règle s'applique. La maquette remplace le « vrai ou faux » du Cours 1 par ce choix de résultat : les 4 formats restent différents.)*
   - **Q4 (taper, sans aide).** « Calcule. **Tape le résultat.** » Calcul 4 + (−11). Attendu : −7.

*Exemples guidés (l'aide s'efface ; le calcul de départ reste affiché)*

10. **Exemple 1 sur 2 : tout est résolu à l'écran.** « Voici la résolution complète. Lis chaque ligne, puis touche « Je comprends ». » Calcul −8 + 3.
    - Ligne 1 : = −(8 − 3). « Les signes sont contraires : je soustrais 8 − 3. Le plus grand nombre sans signe est 8, et il est négatif : je mets le signe − devant la parenthèse. » [Je comprends]
    - Ligne 2 : = −(5). « 8 − 3 = 5. Le signe − est toujours devant : c'est le signe du plus grand nombre. » [Je comprends]
    - Dernière ligne : = ▢ (une case à taper, **notée**). « Dernière ligne. Écris le résultat, avec son signe. Tu peux t'aider de la ligne du dessus. » « Tape ce qui manque dans la case, avec les touches du clavier. » Attendu : −5.
11. **Exemple 2 sur 2 : à moitié, deux cases à taper.** « Cette fois, deux cases sont à toi. Signes contraires : je soustrais, et je prends le signe du plus grand. » Calcul 3 + (−7) *(remplace le 9 + (−4) du doc 06 v1 : il met le piège du signe du plus grand dans l'exemple ; 9 + (−4) reste un exemple de calcul)*. Case 1 : 3 + (−7) = −(▢ − 3). Attendu : 7. Case 2 : 3 + (−7) = −(7 − 3) = ▢. Attendu : −4. Les cases s'enchaînent dans l'ordre ; **seule la case 2 compte dans la note ; la case 1 est un entraînement non noté** (doc 08 n° 48).

*Fin*

12. **Annonce** (comme les Cours 0 et 1) : « Place aux 5 exercices de fin. Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle. Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours. Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon. » Bouton « Commencer les exercices ».
13. **5 exercices de fin, négatif en premier.** « Calcule. **Tape le résultat.** » Le calcul est écrit en haut, clavier complet, aucune couleur avant la réponse, pas de droite. Ex. −47 + 29. Juste : « Signes contraires : 47 − 29 = 18. Le plus grand, 47, est négatif : −18. » Après une erreur : le message du tableau, puis la résolution type : −47 + 29 · = −(47 − 29) · = −18.
14. **Positif en premier.** Ex. 63 + (−18). Juste : « Signes contraires : 63 − 18 = 45. Le plus grand, 63, est positif : 45. » Résolution type : 63 + (−18) · = +(63 − 18) · = 45. Un tirage sur dix est un calcul à deux opposés (−6 + 6) : juste : « Deux nombres opposés s'annulent : −6 + 6 = 0. »
15. **Résultat** (validé ou non, doc 08 n° 29). Ex. cours raté : « Le cours 2 n'est pas encore validé », les deux conditions avec ✗ / ✓ (« N bonnes réponses sur 15, soit X %. Il en faut au moins 80 %. » et « N exercices de fin justes sur 5. Il en faut au moins 4. »), « Tes erreurs : » « Je prends le signe du mauvais nombre (règle 2), 3 fois » · « J'additionne au lieu de soustraire (règle 1), 1 fois », liens « Relire la règle 2 » · « Relire la règle 1 », « Prochaine étape : la série de validation. 5 exercices, 4 justes pour valider le cours. » Bouton « Faire la série de validation ». *(Les chiffres de la maquette sont inventés ; au codage ils suivent la note ci-dessous.)*
16. **Mes cours** garde la raison de l'échec : « À valider », « Dernier essai : 3 exercices de fin justes sur 5. À revoir : le signe du plus grand nombre. », boutons « Faire la série de validation », « Voir la fiche mémo », « Relire la règle 2 », « Relire la leçon ».

**Note du cours** (doc 08 n° 21 et 32 à 37) : comptent les **4 petites questions** (écrans 5 et 7), les **4 questions de la série de pratique** (écran 9), les **2 exemples guidés** (écrans 10 et 11 : une seule case chacun, la dernière) et les **5 exercices de fin**, soit **15 questions**. Ne comptent pas : la question pour deviner (écran 1), la question pour comprendre (écran 3), **toutes les étapes interactives des explications** (écrans 2, 4 et 6), **l'essai libre de « Autres façons de faire »** (écran 8) et la case 1 de l'exemple 2. Une petite question ratée repasse 2 écrans plus loin ; une question de la série ratée repasse avant les exercices de fin (doc 08 n° 49). Validation : **80 % sur les 15 et au moins 4 exercices de fin sur 5**. Une des 4 questions de la série (Q3) vient du Cours 1 (plan du module, tableau des reprises) ; aucun calcul du Cours 1 dans les exercices de fin.

**Retours d'erreur précis**

Étapes interactives (message court puis « Essaie encore. », rien n'est noté) :
| Écran | Réponse | Message |
|---|---|---|
| 2, étape 2 | toucher −7 | « Tu es resté au départ du bond : il fait 2 graduations vers la droite. » |
| 2, étape 2 | toucher −6 | « Il manque des graduations : le bond en fait 2. Compte-les une par une à partir de −7. » |
| 2, étape 2 | toucher plus loin que −5 | « Une graduation de trop : le bond fait exactement 2 graduations. » |
| 2, étape 3 | long | « Compare les deux arcs sur la droite : 2 graduations contre 7. » |
| 4, étape 2 | 9 | « 9, c'est 7 + 2 : on additionnerait des bonds de même sens. Ici le petit bond défait une partie du grand : on soustrait. » |
| 4, étape 2 | 14 | « On soustrait les longueurs, on ne les multiplie pas : 7 − 2. » |
| 6, étape 2 | positif | « Le bond de −7 est plus long que celui de +2 : c'est lui qui décide du côté. −7 est négatif. » |
| 6, étape 3 | 5 | « Il reste bien 5 graduations, mais on arrive à gauche de 0 : il faut garder le signe −, celui du plus grand nombre (7). » |
| 6, étape 3 | −9 | « −9 viendrait de 7 + 2. Ici les bonds sont de sens contraires : 7 − 2 = 5, avec le signe −. » |
| 6, étape 5 | toucher −6 | « Tu es resté au départ du bond : il fait 6 graduations vers la droite. » |
| 6, étape 5 | toucher −5 à −1 | « Il manque des graduations : le bond en fait 6. Compte-les une par une à partir de −6. » |
| 6, étape 5 | toucher 1 | « Une graduation de trop : le bond fait exactement 6 graduations. » |

Questions pour deviner et pour comprendre (ne comptent pas ; titre « Pas tout à fait, et c'est normal. » puis un message qui ne répète pas le titre) :
| Écran | Réponse | Message |
|---|---|---|
| 1 | 9 € | « Rendre de l'argent fait baisser ta dette, elle ne grandit pas. Tu dois 7 € moins les 2 € rendus : 5 €. » |
| 1 | 2 € | « 2 €, c'est ce que tu as rendu. Il reste à rendre ce que tu dois moins ce que tu as déjà rendu : 7 − 2 = 5 €. » |
| 3 | Le premier nombre | « Le premier nombre est −7 dans les deux calculs : il ne change pas. » |
| 3 | La longueur du deuxième bond | « Le deuxième bond fait 2 graduations dans les deux calculs : ce n'est pas sa longueur qui change, c'est son sens. » |
| 3 | Le signe du deuxième nombre (juste) | « Le deuxième nombre est positif dans le calcul A, négatif dans le calcul B : le signe change, donc le sens du bond change. » |

Questions qui comptent (le signe du mauvais nombre : « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est N, et il est négatif / positif. » ; l'addition : « Signes contraires : on **soustrait**. G − P = D. ») :
| Écran | Réponse | Message |
|---|---|---|
| 5, Q1 | Je les additionne | « Signes contraires : on **soustrait**. 8 − 3 = 5. » |
| 5, Q1 | Je les multiplie | « On ne multiplie pas : pour deux signes contraires, on soustrait les nombres sans leur signe. 8 − 3 = 5. » |
| 5, Q2 | 13 | « Signes contraires : on **soustrait**. 9 − 4 = 5. » |
| 5, Q2 | 36 | « On ne multiplie pas : 9 − 4 = 5. » |
| 7, Q1 | positif | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 8, et il est négatif. » |
| 7, Q2 | −3 | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 8, et il est positif. » |
| 7, Q2 | −13 | « Signes contraires : on **soustrait**. 8 − 5 = 3. » |
| 9, Q1 | −6 | « Tu es resté au départ du deuxième bond : il fait 2 graduations vers la droite. » |
| 9, Q1 | −5 | « Il manque une graduation : le deuxième bond en fait 2. » |
| 9, Q1 | autre | « Le deuxième bond part de −6 et fait 2 graduations vers la droite : −5, −4. On arrive à −4. » |
| 9, Q2 | + | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 8, et il est négatif. » |
| 9, Q3 | −1 | « Les deux nombres sont négatifs : même signe. On additionne (4 + 3 = 7), on ne soustrait pas. Soustraire, c'est pour des signes contraires. » |
| 9, Q3 | 7 | « Les deux nombres sont négatifs : le résultat est négatif aussi. On garde le signe − ! » |
| 9, Q4 | 7 | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 11, et il est négatif. » |
| 9, Q4 | 15 ou −15 | « Signes contraires : on **soustrait**. 11 − 4 = 7. » |
| 9, Q4 | autre | « Soustrais 4 de 11 (sans les signes), puis prends le signe du plus grand, 11 : −7. » |
| 10, dernière ligne | 5 | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). » |
| 10, dernière ligne | autre | « Le résultat de la ligne du dessus est −(5), c'est-à-dire −5. » |
| 11, case 1 (non notée) | 3 | « Dans −(▢ − 3), on écrit d'abord le plus grand des deux nombres sans signe : 7. On lui retire le plus petit, 3. » |
| 11, case 1 | −7 | « On écrit le nombre sans son signe : 7. Le signe − est déjà devant la parenthèse. » |
| 11, case 1 | autre | « Dans −(▢ − 3), on met le plus grand des deux nombres, sans son signe : 7. » |
| 11, case 2 | 4 | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 7, et il est négatif. » |
| 11, case 2 | 10 ou −10 | « Signes contraires : on **soustrait**. 7 − 3 = 4. » |
| 11, case 2 | autre | « Soustrais 3 de 7, puis garde le signe − devant le résultat. » |
| 13, −47 + 29 | 18 | « … Ici, c'est 47, et il est négatif. » |
| 13, −47 + 29 | 76 ou −76 | « Signes contraires : on **soustrait**. 47 − 29 = 18. » |
| 13, −47 + 29 | autre | « Soustrais 29 de 47 (sans les signes), puis prends le signe du plus grand, 47 : −18. » |
| 14, 63 + (−18) | −45 | « … Ici, c'est 63, et il est positif. » |
| 14, 63 + (−18) | 81 ou −81 | « Signes contraires : on **soustrait**. 63 − 18 = 45. » |
| 14, −6 + 6 | 12 ou −12 | « Signes contraires : on **soustrait**. 6 − 6 = 0. » |
| 14, −6 + 6 | autre | « Deux nombres opposés s'annulent : le résultat est 0. » |

Essais libres de « Autres façons de faire » (écran 8, rien n'est noté) : technique 1, −8 + 5 : −3 juste (« On part de 5 et on recule de 8 : on dépasse 0 et on arrive à −3. ») ; 3 : « … Ici, c'est 8, et il est négatif. » ; 13 ou −13 : « Signes contraires : on **soustrait**. 8 − 5 = 3. » ; autre : « Depuis 5, on recule de 8 : 5 − 8 = −3. » Technique 2, −3 + 9 : positif juste (« 9 est plus loin de 0 que 3 et il est positif : le résultat est positif (−3 + 9 = 6). ») ; négatif : « Le nombre le plus loin de 0 est 9, et il est positif : le résultat est positif. −3 + 9 = 6. »

*Notes :* la détection de `addition-au-lieu-soustraction` est celle de la v1 (la réponse vaut ±(a + b sans les signes)) ; `signe-du-mauvais-nombre` ne s'applique pas aux deux opposés (réponse 0). Les messages des exercices de fin générés suivent le même modèle avec les nombres tirés. Après une erreur à un exercice de fin, on montre aussi la résolution type.

**Fiche mémo** (écran plein, doc 08 n° 38 ; consultable avant la validation, n° 46)
- **La règle :** Signes contraires : je soustrais le plus petit (sans signe) du plus grand (sans signe), et je prends le signe du plus grand.
- **Exemples :** −7 + 2 = **−5** · 3 + (−8) = **−5** ; −6 + 6 = **0**.
- **Erreur à éviter :** 3 + (−8) = 5. Je ne prends pas le signe du premier nombre : je prends celui du **plus grand**. Ici 8 est négatif : −5.
- **Astuce (technique n° 1 du plan) :** Le plus grand sans le signe gagne. −7 + 2 : 7 > 2, donc le résultat est négatif. 7 − 2 = 5. Résultat : −5.

**Générateur** (inchangé depuis la v1)
| Niveau | Forme | Nombres |
|---|---|---|
| 1 | a + b, de signes contraires, dans un ordre au hasard ; 1 fois sur 10, deux opposés | de 1 à 9 |
| 2 | même chose | de 10 à 99 |
| 3 | même chose | de 100 à 999 |

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : −3 + 5 · = +(5 − 3) · = 2. Pour deux opposés : −6 + 6 · = 0.

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Règle | partIndex | Calcul-piège |
|---|---|---|---|---|---|
| `signe-du-mauvais-nombre` 🔴 | la réponse est l'opposé de la bonne réponse (bonne réponse ≠ 0) | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est N, et il est négatif / positif. » | 2 | 6 | le plus grand (sans signe) est négatif, ex. 3 + (−8) |
| `addition-au-lieu-soustraction` | la réponse vaut ±(a + b sans les signes) | « Signes contraires : on **soustrait**. 5 − 3 = 2. » | 1 | 3 | le négatif en premier, ex. −7 + 4 |

(Le `partIndex` est l'indice de la partie du cours à rouvrir par « Relire la règle N » : 3 = écran « Règle 1 », 6 = écran « Règle 2 ».)

**Nouvelle brique : « Autres façons de faire »** (partie `autres`, réutilisable dans les Cours 3 à 7 et les modules suivants) : titre, rappel des règles facultatif (`recap` : une ligne par règle avec un exemple juste et un faux, puis « En une phrase »), phrase d'introduction, 2 ou 3 techniques (nom, quand, exemple chiffré, explication, essai libre : taper un résultat ou toucher un choix, avec un message par réponse prévue et un message général), phrase de fin facultative. L'écran compte comme un écran de leçon ; il n'est jamais noté.

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

**Choix de la maquette retenus (« À décider » validés)** : dette comme accroche ; idée de départ « le plus long bond décide », en commençant par une dette plus grande que le gain ; droite de −7 à 0 pour rester touchable ; cas B de « Comparer » pris dans le Cours 1 (−7 + (−2)), montré sans le faire calculer ; règle coupée en deux ; deux petites questions par règle ; le cas des deux opposés comme étape de la règle 2 (fusion de l'écran « Revenir à 0 ») ; rappel des règles fusionné dans « Autres façons de faire » ; cartes lues à l'écran, choix par les boutons du bas, essai libre non noté ; série de 4 avec une question du Cours 1 en choix de résultat ; exemple 2 sur 3 + (−7) ; fiche consultable avant la validation.

**Pas encore décidé (à voir avec le porteur du projet)** : formats de révision et d'entraînement propres au Cours 2 (le Cours 1 a « toucher l'arrivée », « le signe », « vrai ou faux », « trouver l'erreur ») ; la décomposition −7 + 9 = −7 + 7 + 2 (technique n° 2 du plan) n'est plus dans la leçon : à remettre dans « Autres façons de faire » (3e carte) si on veut la garder.

---

## Cours 3 — Additionner plusieurs nombres relatifs

*Version 2 (2026-11-25), remplace la version 1. Maquette : `docs/design/ecrans/cours-3-v2.html`, **validée par le porteur du projet telle quelle, avec les 5 recommandations de son panneau « À décider »** (notation de l'étape intermédiaire `(−8) + (−2)` et `5 + (−8) = −3` plutôt que `−8 − 2` et `5 − 8` : la soustraction d'un relatif est le Cours 4 ; règle du doc 06 coupée en deux ; deux petites questions seulement, une par règle ; récapitulatif fusionné en tête de « Autres façons de faire » ; message d'erreur `tout-additionne` reformulé sans le mot « retranchent »). La maquette a 17 écrans (8 de leçon, 1 de pratique, 2 exemples guidés, l'annonce, 2 modèles d'exercice de fin, le résultat, « Mes cours » et la fiche). Ce cours suit le Cours 0 v3, les Cours 1 et 2 v2 et les décisions du doc 08 n° 20 à 51 (n° 45, 48, 49 et 46 : série notée, case résultat seule à l'exemple 2, question ratée de la série qui repasse, fiche mémo avant validation ; **n° 51 : le niveau rallonge le calcul**).*

**La règle :** *Je regroupe les positifs ensemble et les négatifs ensemble, je calcule chaque groupe, puis j'additionne les deux totaux.*

**L'idée de départ :** une addition se fait dans n'importe quel ordre (commutativité et associativité), **à condition que chaque nombre garde son signe** en changeant de place. On peut donc ranger les bonds : tous les bonds vers la droite d'un côté, tous les bonds vers la gauche de l'autre. Le piège du cours : perdre un signe, ou un nombre, en route.

**Les règles enseignées** (la règle du doc 06 v1 est coupée en deux, chacune correspond à des erreurs reconnues)
1. **Je regroupe les positifs ensemble et les négatifs ensemble. Chaque nombre garde son signe, et je les utilise tous.** −2 + 5 + (−4) = 5 + (−2) + (−4). *(erreurs reconnues `terme-oublie` et `tout-additionne`)*
2. **Je calcule chaque groupe, puis j'additionne les deux totaux.** Dans un groupe, tous les nombres ont le même signe (Cours 1) ; les deux totaux sont de signes contraires (Cours 2). *(erreur reconnue `signe-inverse`)* La règle 2 n'apprend aucun nouveau geste : elle réutilise les Cours 1 et 2.

**Astuces et techniques du plan** (doc 10, « Cours 3 ») : n° 1 « Regrouper les positifs, puis les négatifs » = règle 1 et fiche mémo (la principale) ; n° 2 « De gauche à droite, pas à pas » = étape de la leçon (elle sert à comprendre et à choisir : même arrivée par une autre route) ; n° 3 « Chercher les opposés et les nombres ronds » et n° 4 « Cocher chaque nombre utilisé » = écran « Autres façons de faire », une carte chacune, essai libre non noté.

**Notation de l'étape intermédiaire** (point 1 validé). Le groupe des négatifs s'écrit `(−8) + (−2)`, jamais `(−8 − 2)`, et le calcul pas à pas s'écrit `5 + (−8) = −3`, jamais `5 − 8` : « −8 − 2 » est une soustraction écrite sans parenthèses, c'est le Cours 4. Les négatifs qui ne sont pas en tête sont toujours entre parenthèses (règle 2 du Cours 0) ; un premier terme négatif s'écrit sans parenthèses.

**Déroulé (11 écrans pour apprendre : 8 de leçon, 1 de pratique, 2 exemples guidés — puis l'annonce, 2 modèles d'exercice de fin — les 5 exercices de fin sont générés —, le résultat, « Mes cours » et la fiche)**

Types d'écrans : ceux du Cours 2 (explication pas à pas avec scène, étapes interactives non notées, questions pour deviner et pour comprendre, petites questions, « Autres façons de faire », série de pratique, exemples guidés). Jamais plus de 2 étapes de lecture d'affilée sans action. Couleurs (doc 08 n° 27) : négatifs **orange**, positifs **bleu**, surligneur jaune, **dans les explications seulement** ; droite et calculs **gris** pendant une question ; vert / rouge **après** la réponse. **Longs calculs** : une somme de 5 ou 6 termes doit tenir dans la largeur du téléphone (voir « Affichage des longs calculs » plus bas).

*Leçon (8 écrans, pastille « Cours 3 · Leçon · étape N sur 8 »)*

1. **Accroche + deviner.** Titre : « Additionner plusieurs nombres relatifs ». « Jusqu'ici, tu as additionné **deux** nombres. Maintenant, la somme en a **plusieurs**, avec des signes mélangés. » « Le piège : en changeant un nombre de place, on peut **perdre son signe**. Tu vas apprendre une méthode pour n'en perdre aucun. » Question pour deviner : « Pour commencer, à ton avis : tu as 5 € et 3 € en poche. Tu dois 8 € à un ami et 2 € à un autre. Où en es-tu en tout ? » [Il me manque 2 €] [Il me reste 2 €] [Il me manque 18 €]. Attendu : il me manque 2 €. Mention : « Question pour découvrir : elle ne compte pas dans la note. » Retour si juste : « Tu as 5 + 3 = 8 € et tu dois 8 + 2 = 10 € : il te manque 2 €. Le cours va t'expliquer comment l'écrire avec des nombres relatifs, sans perdre un signe en route. » Si faux : titre « Pas tout à fait, et c'est normal. » (voir tableau).
2. **L'ordre des bonds ne change rien** (titre « L'ordre des bonds ne change rien », 3 étapes). Droite de −4 à 9 (non touchable : plus de 8 graduations permis).
   - Étape 1 : les quatre bonds de 5 + (−8) + 3 + (−2) dans l'ordre (+5, −8, +3, −2), arrivée −2. « Voici la somme en **quatre bonds** : +5, −8, +3, −2. On les fait l'un après l'autre, dans l'ordre. On arrive en −2. »
   - Étape 2 : les mêmes bonds dans un autre ordre (+5, +3, −8, −2), calcul 5 + 3 + (−8) + (−2) = ?. « Refaisons les **mêmes** bonds dans un autre ordre : d'abord les deux bonds vers la droite, +5 et +3, puis les deux bonds vers la gauche, −8 et −2. »
   - Étape 3 (**interactive : phrase à trous**, droite grise) : « En changeant l'ordre des bonds, on arrive [ ? ]. » Choix : [au même endroit] [à un autre endroit]. Attendu : au même endroit. Phrase de suite : « En changeant l'ordre des bonds, on arrive **au même endroit**. On arrive en −2, comme avant : **l'ordre ne change pas le résultat**, tant que chaque nombre **garde son signe** en changeant de place. »
3. **Comparer deux cas.** Titre « Comparer deux cas ». « Voici deux calculs presque identiques. Regarde-les bien. » Côte à côte : « Calcul A » −2 + 5 + (−4) · « Calcul B » −2 + 5. Petit texte : « Le calcul B vient du cours précédent : tu sais déjà le faire. Ici, tu observes seulement ce qui change. » Question : « Qu'est-ce qui change entre A et B ? » [Le premier nombre] [Il y a un bond de plus] [Le signe du deuxième nombre]. Attendu : il y a un bond de plus. Mention : « Question pour comprendre : elle ne compte pas dans la note. » Après la réponse, la droite (−4 à 4) montre les deux trajets (A arrive en −1, B arrive en 3), puis : « A arrive en −1 : −2 + 5 + (−4) = −1. » « B arrive en 3 : −2 + 5 = 3. » « Dans B, deux nombres : tu sais faire (Cours 2). Dans A, un troisième bond arrive **après**. Avec plusieurs nombres, il faut une méthode pour ne perdre **aucun bond** et **aucun signe**. »
4. **Règle 1 : je regroupe** (titre « Je regroupe les positifs et les négatifs », 4 étapes).
   - Étape 1 : calcul 5 + (−8) + 3 + (−2). « Dans cette somme, les signes sont **mélangés**. Pour ne rien perdre, on **trie** : les positifs d'un côté, les négatifs de l'autre. »
   - Étape 2 (**interactive : phrase à trous**, calcul gris pendant la question, négatifs surlignés après) : « Les nombres négatifs de cette somme sont [ ? ]. » Choix : [−8 et −2] [5 et 3] [−8 et 3]. Attendu : −8 et −2. Phrase de suite : « Les nombres négatifs de cette somme sont **−8 et −2**. Les **positifs** sont donc 5 et 3. »
   - Étape 3 : le calcul, puis sa réécriture surlignée = 5 + 3 + (−8) + (−2). « On réécrit la somme : d'abord 5 et 3, puis (−8) et (−2). **Chaque nombre garde son signe**, et on les utilise **tous** : quatre nombres au départ, quatre à l'arrivée. »
   - Étape 4 : encadré **Règle 1 : Je regroupe les positifs ensemble et les négatifs ensemble. Chaque nombre garde son signe, et je les utilise tous.**
5. **Règle 2 : je calcule chaque groupe** (titre « Je calcule chaque groupe », 4 étapes).
   - Étape 1 : « Dans chaque groupe, tous les nombres ont **le même signe** : tu sais déjà les additionner (Cours 1). Les positifs : 5 + 3 = **8**. »
   - Étape 2 (**interactive : phrase à trous**) : « Les négatifs : (−8) + (−2) = [ ? ]. » Choix : [−10] [10] [−6]. Attendu : −10. Phrase de suite : « Les négatifs : (−8) + (−2) = **−10**. Il reste deux totaux : **8** d'un côté, **−10** de l'autre. »
   - Étape 3 (**interactive : phrase à trous**, droite de −4 à 9, grise) : « 8 + (−10) : le plus grand des deux, sans signe, est 10, donc le résultat est [ ? ]. » Choix : [négatif] [positif]. Attendu : négatif. Phrase de suite : « … le résultat est **négatif**. 10 − 8 = 2, avec le signe − : on arrive à **−2**. »
   - Étape 4 : encadré **Règle 2 : Je calcule chaque groupe, puis j'additionne les deux totaux.**
6. **Petites questions des règles 1 et 2** (2 questions sur le même écran, **comptent**, repassent ; calcul écrit sans couleur).
   - Q1 : calcul −2 + 5 + (−4) · « Quelle réécriture garde tous les nombres, chacun avec son signe ? » [5 + (−2) + (−4)] [5 + 2 + 4] [5 + (−4)]. Attendu : 5 + (−2) + (−4).
   - Q2 : calcul 7 + (−1) + (−8) · « Quel est le résultat ? » [−2] [2] [−16]. Attendu : −2.
7. **De gauche à droite, un calcul à la fois** (titre « De gauche à droite, un calcul à la fois », 4 étapes ; technique n° 2 du plan). Droite de −4 à 9.
   - Étape 1 : « Il y a une autre route : faire **un seul calcul à la fois**, de gauche à droite. On commence par les deux premiers nombres : 5 + (−8). »
   - Étape 2 (**interactive : phrase à trous**) : « 5 + (−8) = [ ? ]. » Choix : [−3] [3] [−13]. Attendu : −3. Phrase de suite : « 5 + (−8) = **−3**. On est en −3. Le calcul suivant : −3 + 3. »
   - Étape 3 (**interactive : phrase à trous**) : « −3 + 3 = [ ? ]. » Choix : [0] [6] [−6]. Attendu : 0. Phrase de suite : « −3 + 3 = **0**. On revient en 0 : deux nombres **opposés** s'annulent. »
   - Étape 4 : « Il reste 0 + (−2) = **−2**. C'est le même résultat qu'avec les groupes : **les deux routes arrivent au même endroit**. Regrouper est pratique quand il y a beaucoup de nombres. Avancer à gauche, c'est un seul calcul à la fois. **Choisis celle qui te rassure.** » (La maquette écrit 5 + (−8) = −3 et non « 5 − 8 = −3 » : voir « Notation ».)
8. **Autres façons de faire** (brique `autres` du Cours 2, titre « Autres façons de faire »). **En haut, le rappel des règles** : « Les 2 règles à retenir », chacune avec un exemple juste ✓ et un faux ✗ : « 1. Je regroupe les positifs ensemble et les négatifs ensemble. » (−2 + 5 + (−4) = 5 + (−2) + (−4) ✓ · −2 + 5 + (−4) = 5 + 2 + 4 ✗) · « 2. Je calcule chaque groupe, puis j'additionne les deux totaux. » (5 + (−6) = −1 ✓ · 5 + (−6) = 1 ✗), puis l'encadré « En une phrase » : « Je regroupe les positifs et les négatifs, je calcule chaque groupe, puis j'additionne les deux totaux. » **Dessous**, « La méthode marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**. » et deux cartes :
   - **1. Chercher les opposés et les nombres ronds** — « Dès qu'un nombre et son opposé sont dans la somme. » 7 + (−4) + (−7) + 10 : 7 et (−7) s'annulent ; (−4) + 10 = 6. « Deux nombres opposés font 0 : on les barre. Il ne reste que (−4) + 10 = 6. On peut aussi chercher des nombres qui font un nombre rond ensemble (6 et 4, 15 et 5…) : une addition se fait dans n'importe quel ordre. »
   - **2. Cocher chaque nombre utilisé** — « Dans les longues sommes. » 3 + (−5) + 8 + (−1) : 3 ✓ (−5) ✓ 8 ✓ (−1) ✓ : quatre nombres, quatre coches. « Chaque fois que tu places un nombre dans un groupe, tu le coches (sur ta feuille, tu peux le barrer). À la fin, tous les nombres sont cochés : tu n'en as oublié aucun. »
   Le choix se fait avec **les boutons du bas** (« Essayer : chercher les opposés et les nombres ronds », « Essayer : cocher chaque nombre utilisé »), « Tu peux aussi continuer sans essayer : aucune n'est obligatoire. » **Essai libre, non noté** : technique 1 : « Essaie avec 9 + (−3) + (−9) + 4 : repère les deux opposés, puis calcule. **Tape le résultat.** » (attendu 1, clavier complet) ; technique 2 : « Essaie avec 8 + (−3) + 2 + (−6). Quelqu'un a regroupé : 8 + 2 + (−3). **Touche le nombre oublié.** » ([−3] [2] [−6], attendu −6). Après l'essai : « Essayer l'autre façon » ou « Continuer ». Phrase de fin d'écran : « Ensuite, tu t'entraînes avec quatre questions. »

*Pratique*

9. **Série de 4 questions** (pastille « Cours 3 · Pratique », compteur « Question N sur 4 », retour immédiat, pas de nouvel essai ; **notée** ; une question ratée repasse avant les exercices de fin ; aide décroissante, formats variés ; aucune couleur de signe pendant la question). Après la 4e : encadré « N sur 4 » et « Maintenant, deux exemples pour t'aider à les résoudre en entier. »
   - **Q1 (toucher l'arrivée, bonds dessinés).** Calcul 4 + (−6) + 3. Droite de −2 à 4 (7 graduations d'écart), grise, bonds 0 → 4 → −2 → 1, consigne « Touche la droite à l'endroit où l'on arrive. » Attendu : 1.
   - **Q2 (le signe).** « Touche le signe du résultat. Tu n'as pas besoin de calculer. » Calcul 3 + (−9) + 4, « Quel est le signe du résultat ? » [+] [−]. Attendu : −.
   - **Q3 (une question du Cours 2, choix de résultat).** « Regarde d'abord les signes des deux nombres, puis touche le résultat. » Calcul −3 + 5 ; [2] [−2] [8]. Attendu : 2. *(Entraînement intercalé : elle doit d'abord reconnaître quelle règle s'applique.)*
   - **Q4 (taper, sans aide).** « Calcule. **Tape le résultat.** » Calcul 5 + (−9) + 2 + (−4). Attendu : −6.

*Exemples guidés (l'aide s'efface ; le calcul de départ reste affiché)*

10. **Exemple 1 sur 2 : tout est résolu à l'écran.** « Voici la résolution complète. Lis chaque ligne, puis touche « Je comprends ». » Calcul 3 + (−7) + 6 + (−1).
    - Ligne 1 : = 3 + 6 + (−7) + (−1). « Je regroupe : les positifs, 3 et 6, d'abord ; les négatifs, (−7) et (−1), ensuite. Chaque nombre garde son signe : il y en a toujours quatre. » [Je comprends]
    - Ligne 2 : = 9 + (−8). « Positifs : 3 + 6 = 9. Négatifs : (−7) + (−1), même signe : 7 + 1 = 8, et je garde le signe − : −8. » [Je comprends]
    - Dernière ligne : = ▢ (une case à taper, **notée**). « Dernière ligne. Écris le résultat, avec son signe. Tu peux t'aider de la ligne du dessus. » « Tape ce qui manque dans la case, avec les touches du clavier. » Attendu : 1. *(Le résultat est positif alors que la leçon finissait en négatif : c'est ici que le piège `signe-inverse` guette, car le plus grand total est celui des positifs.)*
11. **Exemple 2 sur 2 : à moitié, deux cases à taper.** « Cette fois, deux cases sont à toi. Les nombres sont déjà regroupés : calcule chaque groupe, puis additionne les deux totaux. » Calcul −5 + 3 + (−4) + 2, regroupé : = 3 + 2 + (−5) + (−4). Case 1 : = ▢ + (−9). Attendu : 5. Case 2 : = 5 + (−9) = ▢. Attendu : −4. Les cases s'enchaînent dans l'ordre ; **seule la case 2 compte dans la note ; la case 1 est un entraînement non noté** (doc 08 n° 48).

*Fin*

12. **Annonce** (comme les Cours 0 à 2) : « Place aux 5 exercices de fin. Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle. Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours. Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon. » Bouton « Commencer les exercices ».
13. **5 exercices de fin, générés au niveau 1** (3 ou 4 termes de 1 à 9, voir « Générateur »). « Calcule. **Tape le résultat.** » Le calcul est écrit en haut, clavier complet, aucune couleur avant la réponse, pas de droite. Ex. −15 + 8 + (−3) + 11. Juste : « Positifs : 8 + 11 = 19. Négatifs : (−15) + (−3) = −18. Puis 19 + (−18) : 19 − 18 = 1, le plus grand, 19, est positif : 1. » Après une erreur : le message du tableau, puis la résolution type : −15 + 8 + (−3) + 11 · = 8 + 11 + (−15) + (−3) · = 19 + (−18) · = 1.
14. **Exercice à trois nombres.** Ex. 7 + (−1) + (−8) : les deux négatifs sont regroupés, puis le total, négatif, gagne. Un tirage sur dix peut donner deux totaux opposés (résultat 0). Juste : « Positif : 7. Négatifs : (−1) + (−8) = −9. Puis 7 + (−9) : 9 − 7 = 2, le plus grand, 9, est négatif : −2. »
15. **Résultat** (validé ou non, doc 08 n° 29). Ex. cours raté : « Le cours 3 n'est pas encore validé », les deux conditions avec ✗ / ✓ (« N bonnes réponses sur 13, soit X %. Il en faut au moins 80 %. » et « N exercices de fin justes sur 5. Il en faut au moins 4. »), « Tes erreurs : » « Je me trompe de signe à la fin (règle 2), 2 fois » · « J'oublie un nombre en regroupant (règle 1), 1 fois », liens « Relire la règle 2 » · « Relire la règle 1 », « Prochaine étape : la série de validation. 5 exercices, 4 justes pour valider le cours. » Bouton « Faire la série de validation ». *(Les chiffres de la maquette sont inventés ; au codage ils suivent la note ci-dessous. Les trois erreurs reconnues se rangent sous les deux règles : le signe final inversé renvoie à la règle 2, « j'oublie un nombre » et « je mélange positifs et négatifs » à la règle 1.)*
16. **Mes cours** garde la raison de l'échec : « À valider », « Dernier essai : 3 exercices de fin justes sur 5. À revoir : le signe du résultat à la fin. », boutons « Faire la série de validation », « Voir la fiche mémo », « Relire la règle 2 », « Relire la leçon ».

**Note du cours** (doc 08 n° 21 et 32 à 37) : comptent les **2 petites questions** (écran 6), les **4 questions de la série de pratique** (écran 9), les **2 exemples guidés** (écrans 10 et 11 : une seule case chacun, la dernière) et les **5 exercices de fin**, soit **13 questions** (point 3 validé : deux petites questions seulement, la leçon est déjà de 8 écrans et la série et les exemples revoient chaque règle ensuite). Ne comptent pas : la question pour deviner (écran 1), la question pour comprendre (écran 3), **toutes les étapes interactives des explications** (écrans 2, 4, 5 et 7), **l'essai libre de « Autres façons de faire »** (écran 8) et la case 1 de l'exemple 2. Une petite question ratée repasse 2 écrans plus loin ; une question de la série ratée repasse avant les exercices de fin (doc 08 n° 49). Validation : **80 % sur les 13 et au moins 4 exercices de fin sur 5**. Une des 4 questions de la série (Q3) vient du Cours 2 (plan du module, tableau des reprises) ; aucun calcul du Cours 2 seul dans les exercices de fin.

**Retours d'erreur précis**

Étapes interactives (message court puis « Essaie encore. », rien n'est noté) :
| Écran | Réponse | Message |
|---|---|---|
| 2, étape 3 | à un autre endroit | « Regarde où arrive le dernier bond : c'est le même point que sur le dessin d'avant, −2. Les bonds sont les mêmes, seul l'ordre change. » |
| 4, étape 2 | 5 et 3 | « 5 et 3 sont positifs : ils n'ont pas de signe −. Cherche les nombres écrits avec un −. » |
| 4, étape 2 | −8 et 3 | « 3 est positif : il n'a pas de signe −. Il y a deux nombres écrits avec un −. » |
| 5, étape 2 | 10 | « Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! » |
| 5, étape 2 | −6 | « Même signe : on **additionne** les nombres, on ne les soustrait pas. 8 + 2 = 10, donc −10. » |
| 5, étape 3 | positif | « Le plus grand des deux nombres sans signe est 10, et il est négatif : le résultat prend son signe. C'est la règle du Cours 2. » |
| 7, étape 2 | 3 | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 8, et il est négatif. » |
| 7, étape 2 | −13 | « Signes contraires : on **soustrait**. 8 − 5 = 3, avec le signe − : −3. » |
| 7, étape 3 | 6 | « 6, c'est 3 + 3 sans le signe. Ici les signes sont contraires : on soustrait, 3 − 3 = 0. » |
| 7, étape 3 | −6 | « Deux nombres **opposés** s'annulent : −3 et 3 se compensent. Le résultat est 0. » |

Questions pour deviner et pour comprendre (ne comptent pas ; titre « Pas tout à fait, et c'est normal. » puis un message qui ne répète pas le titre) :
| Écran | Réponse | Message |
|---|---|---|
| 1 | Il me reste 2 € | « En tout, tu as 8 € mais tu dois 10 € : tu dois plus que tu n'as. Il te manque donc 2 €. » |
| 1 | Il me manque 18 € | « 18, c'est tout mélangé : ce que tu as et ce que tu dois ne s'additionnent pas ensemble. Compte d'abord ce que tu as (8 €), puis ce que tu dois (10 €), puis compare. » |
| 3 | Le premier nombre | « Les deux calculs commencent par −2 : le premier nombre ne change pas. » |
| 3 | Le signe du deuxième nombre | « Le deuxième nombre est 5 dans les deux calculs : son signe ne change pas. » |
| 3 | Il y a un bond de plus (juste) | « Le calcul A a un troisième nombre, (−4) : il y a un bond de plus à faire après les deux premiers. » |

Les trois messages des erreurs reconnues (point 5 validé pour `tout-additionne`). **P** = total des positifs, **N** = total des négatifs sans son signe :
- `signe-inverse` : « Regarde qui gagne : le total des positifs (P) ou celui des négatifs (N) ? Le résultat prend le signe du plus grand. »
- `tout-additionne` : « Un positif et un négatif ne s'ajoutent pas comme deux nombres de même signe. Regroupe d'abord les positifs et les négatifs, puis soustrais les deux totaux (sans leur signe). » *(v1 : « Les négatifs ne s'ajoutent pas aux positifs : ils se **retranchent**. » : « retranchent » est le vocabulaire du Cours 4.)*
- `terme-oublie` : « Il manque un nombre : coche chaque nombre quand tu l'as utilisé. »

Questions qui comptent :
| Écran | Réponse | Message |
|---|---|---|
| 6, Q1 | 5 + 2 + 4 | « Ici les signes ont disparu : 2 et 4 sont devenus positifs. Chaque nombre garde son signe quand il change de place. » |
| 6, Q1 | 5 + (−4) | « Il manque un nombre : −2 a disparu. Il y avait trois nombres au départ, il n'y en a plus que deux. Il manque un nombre : coche chaque nombre quand tu l'as utilisé. » |
| 6, Q2 | 2 | `signe-inverse` avec P = 7 et N = 9 |
| 6, Q2 | −16 | `tout-additionne` |
| 9, Q1 | 0 | « Tu es resté au départ : il y a trois bonds à suivre, le premier fait 4 graduations vers la droite. » |
| 9, Q1 | −2 | « Tu t'es arrêtée après deux bonds, en −2 : il reste le troisième bond, +3, vers la droite. » |
| 9, Q1 | 4 | « 4, c'est l'arrivée du premier bond seulement. Il reste deux bonds à faire. » |
| 9, Q1 | autre | « Le troisième bond part de −2 et fait 3 graduations vers la droite : −1, 0, 1. On arrive à 1. » |
| 9, Q2 | + | `signe-inverse` avec P = 7 et N = 9 |
| 9, Q3 | −2 | « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 5, et il est positif. » |
| 9, Q3 | 8 | « Les signes sont contraires : on **soustrait** les nombres sans leur signe, on ne les additionne pas. 5 − 3 = 2. » |
| 9, Q4 | 6 | `signe-inverse` avec P = 7 et N = 13 |
| 9, Q4 | 20 ou −20 | `tout-additionne` |
| 9, Q4 | −11, 3, −8 ou −2 | `terme-oublie` |
| 9, Q4 | autre | « Regroupe les positifs (7) et les négatifs (−13), puis additionne les deux totaux : −6. » |
| 10, dernière ligne | −1 | `signe-inverse` avec P = 9 et N = 8 |
| 10, dernière ligne | 17 ou −17 | `tout-additionne` |
| 10, dernière ligne | autre | « Le résultat de la ligne du dessus est 9 + (−8) : 9 − 8 = 1, avec le signe du plus grand, 9. » |
| 11, case 1 (non notée) | −5 | « Le total des positifs est positif : on écrit 5, sans signe −. » |
| 11, case 1 | autre | « Le groupe des positifs est 3 et 2 : on les additionne, 3 + 2 = 5. » |
| 11, case 2 | 4 | `signe-inverse` avec P = 5 et N = 9 |
| 11, case 2 | 14 ou −14 | `tout-additionne` |
| 11, case 2 | autre | « Soustrais 5 de 9 (sans les signes), puis prends le signe du plus grand, 9 : −4. » |
| 13, tout calcul | l'opposé du résultat | `signe-inverse` avec les totaux du calcul |
| 13, tout calcul | ± la somme de tous les nombres sans signe | `tout-additionne` |
| 13, tout calcul | le résultat sans un des nombres | `terme-oublie` |
| 13, tout calcul | autre | « Regroupe les positifs (P) et les négatifs (−N), puis additionne les deux totaux : résultat. » |

Réponses justes (même modèle à la série, aux exemples et aux exercices de fin) : « Positifs : 8 + 11 = 19. Négatifs : (−15) + (−3) = −18. Puis 19 + (−18) : 19 − 18 = 1, le plus grand, 19, est positif : 1. » Un groupe d'un seul nombre s'écrit au singulier sans signe « = » (« Positif : 7. », « Négatif : −9. ») ; les deux totaux opposés : « … Puis 5 + (−5) : deux nombres opposés s'annulent : 0. » *(Dans la maquette, la bonne réponse de la petite question 2 de l'écran 6 écrit « Positifs : 7. » avec un pluriel : le texte validé est gardé tel quel pour cette question de leçon.)*

Essais libres de « Autres façons de faire » (écran 8, rien n'est noté) : technique 1, 9 + (−3) + (−9) + 4 : 1 juste (« 9 et (−9) s'annulent. Il reste (−3) + 4 : 4 − 3 = 1, le plus grand, 4, est positif : 1. ») ; −1 : « Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 4, et il est positif. » ; autre : « 9 et (−9) s'annulent. Il reste (−3) + 4 : 4 − 3 = 1. » Technique 2, 8 + (−3) + 2 + (−6) : −6 juste (« Quatre nombres au départ, trois à l'arrivée : (−6) n'a pas été coché. ») ; autre : « Ce nombre est bien dans le regroupement. En cochant chaque nombre, on voit que c'est (−6) qui manque. »

*Notes :* l'ordre de détection est `signe-inverse`, puis `tout-additionne`, puis `terme-oublie`. Les messages des exercices de fin générés suivent le même modèle avec les nombres tirés. Après une erreur à un exercice de fin, on montre aussi la résolution type.

**Fiche mémo** (écran plein, doc 08 n° 38 ; consultable avant la validation, n° 46)
- **La règle :** Je regroupe les positifs ensemble et les négatifs ensemble, je calcule chaque groupe, puis j'additionne les deux totaux.
- **Exemple :** 5 + (−8) + 3 + (−2) = 5 + 3 + (−8) + (−2) = 8 + (−10) = **−2**.
- **Erreur à éviter :** 5 + (−8) + 3 + (−2) = 5 + 3 + 8 + 2. Quand un nombre change de place, il **garde son signe**. Et je compte les nombres au départ et à l'arrivée : je n'en oublie aucun.
- **Astuce (technique n° 1 du plan) :** Regrouper les positifs, puis les négatifs. On peut réécrire l'addition dans l'ordre qu'on veut (par exemple d'abord les négatifs, puis les positifs) : chaque nombre garde son signe.

**Générateur** (**le niveau rallonge le calcul en plus d'agrandir les nombres**, doc 08 n° 51 ; remplace la v1, où seuls les nombres grandissaient)
| Niveau | Forme | Nombres |
|---|---|---|
| 1 | 3 ou 4 termes, au moins un positif et un négatif | de 1 à 9 |
| 2 | 4 ou 5 termes, au moins un positif et un négatif | de 1 à 20 |
| 3 | 5 ou 6 termes, au moins un positif et un négatif | de 10 à 99 |

Les signes sont toujours mélangés (au moins un terme positif et un négatif). Le premier terme peut être négatif et s'écrit alors sans parenthèses (Cours 0, règle 2) ; les autres termes négatifs sont entre parenthèses. **Les questions de la leçon et les exercices de fin du cours restent au niveau 1, avec les valeurs exactes de la maquette quand elle en donne** ; les niveaux 2 et 3 servent aux révisions, à l'entraînement et à la série de validation. Le cours 7 (multiplier plusieurs nombres) suivra le même principe.

**Affichage des longs calculs** (conséquence du niveau 3 : 6 termes de deux chiffres, jusqu'à 34 signes). Un calcul de question de plus de 22 signes est réduit à 85 % et de plus de 30 signes à 72 % ; il peut passer à la ligne après un signe plutôt que de déborder ; dans une scène de leçon, la police diminue par paliers (plus de 12, 18 et 24 signes). La lecture à voix haute lit la somme entière (« moins quarante-sept plus vingt-neuf plus… »).

**Résolution type** (une ligne par étape, appliquée à chaque calcul tiré) : −2 + 5 + (−4) · = 5 + (−2) + (−4) · = 5 + (−6) · = −1. Une ligne qui répète la précédente est omise (calcul déjà regroupé). À 6 termes : −47 + 29 + (−83) + 15 + (−62) + 38 · = 29 + 15 + 38 + (−47) + (−83) + (−62) · = 82 + (−192) · = −110.

**Erreurs reconnues**
| Identifiant | Détection | Explication affichée | Règle | partIndex | Calcul-piège |
|---|---|---|---|---|---|
| `signe-inverse` 🔴 | la réponse est l'opposé de la bonne réponse (bonne réponse ≠ 0) | « Regarde qui gagne : le total des positifs (P) ou celui des négatifs (N) ? Le résultat prend le signe du plus grand. » | 2 | 4 | totaux des positifs et des négatifs proches |
| `tout-additionne` | la réponse vaut ±(la somme de tous les nombres sans leur signe) | « Un positif et un négatif ne s'ajoutent pas comme deux nombres de même signe. Regroupe d'abord les positifs et les négatifs, puis soustrais les deux totaux (sans leur signe). » | 1 | 3 | au moins deux négatifs |
| `terme-oublie` | la réponse est le résultat du calcul avec un nombre en moins | « Il manque un nombre : coche chaque nombre quand tu l'as utilisé. » | 1 | 3 | un terme de la plus petite taille du niveau (1 ou −1 aux niveaux 1 et 2, 10 ou −10 au niveau 3) |

(Le `partIndex` est l'indice de la partie du cours à rouvrir par « Relire la règle N » : 3 = écran « Règle 1 », 4 = écran « Règle 2 ».)

**Exemples de calculs**
| Niveau | Calcul | Réponse |
|---|---|---|
| 1 | 3 + (−3) + 3 | 3 |
| 1 | −2 + 5 + (−4) | −1 |
| 1 | 7 + (−1) + (−8) | −2 |
| 1 | 6 + (−2) + 4 + (−9) | −1 |
| 2 | 12 + (−7) + 5 + (−9) + 4 | 5 |
| 2 | −15 + 8 + (−3) + 11 | 1 |
| 2 | 6 + (−20) + 9 + (−4) + (−2) | −11 |
| 3 | 48 + (−27) + 15 + (−32) + 61 | 65 |
| 3 | −52 + 34 + (−95) + 18 + 77 | −18 |
| 3 | −47 + 29 + (−83) + 15 + (−62) + 38 | −110 |
| 3 | 30 + (−76) + 41 + (−99) + 25 + 18 | −61 |

**Réponse donnée → erreur reconnue** (calcul −2 + 5 + (−4) = −1) : 1 → `signe-inverse` · 11 → `tout-additionne` · −11 → `tout-additionne` · −6 → `terme-oublie` (le 5 oublié) · 3 → `terme-oublie` (le −4 oublié) · 4 → autre

**Choix de la maquette retenus (« À décider » validés)** : (1) notation `(−8) + (−2)` et `5 + (−8) = −3`, sans soustraction d'un relatif ; (2) règle coupée en deux, « je regroupe » (erreurs `terme-oublie`, `tout-additionne`) et « je calcule chaque groupe, puis les deux totaux » (erreur `signe-inverse`) ; (3) deux petites questions, une par règle, note de 13 questions ; (4) récapitulatif fusionné en tête de « Autres façons de faire », écran long qui se fait défiler ; (5) message de `tout-additionne` reformulé sans « retranchent ». Aussi retenus : l'argent (ce que j'ai, ce que je dois) comme accroche ; « l'ordre des bonds ne change rien » comme idée de départ ; B du « Comparer » pris dans le Cours 2 (−2 + 5) ; l'essai libre non noté de chaque carte ; série de 4 avec une question du Cours 2 en choix de résultat ; exemple 2 sur −5 + 3 + (−4) + 2 ; fiche consultable avant la validation.

**Pas encore décidé (à voir avec le porteur du projet)** : formats de révision et d'entraînement propres au Cours 3 (aujourd'hui les formats génériques : saisie, QCM, vrai ou faux, trou, étiquettes à ordonner, trouver l'erreur ; la droite à toucher n'existe que pour deux termes) ; qu'une réponse d'exercice de fin de plus de 4 termes puisse être corrigée ligne par ligne (« Trouver l'erreur » existe déjà, en révision).

---

## Cours 4 — Soustraire, c'est ajouter l'opposé (version 2, fiche courte)

*Mode autonome (2026-11-25). Référence des textes, des écrans et des messages : la maquette validée `docs/design/ecrans/cours-4-v2.html` (avec les 5 recommandations de son panneau « À décider »). Code : `packages/engine/src/courses/calculs/c04-soustraire.ts` ; textes vérifiés mot pour mot par `test/courses/c04-texts.test.ts`.*

**La règle** (coupée en deux, chacune avec son erreur reconnue) : 1. *Soustraire un nombre, c'est ajouter son opposé : je remplace le − par un +, et je change le signe du nombre qui suit* (`oppose-oublie`) ; 2. *Puis j'additionne : même signe, j'additionne ; signes contraires, je soustrais et je prends le signe du plus grand* (`signe-inverse`).

**Écrans** (7 écrans de leçon, 10 pour apprendre avec la série et les 2 exemples) :
1. Accroche « Soustraire un nombre relatif » + question pour deviner (solde de 5 €, dette de 3 € effacée : 8 € ; ne compte pas).
2. Retrancher une dette : 2 lectures sur la droite (bond de 5 à 8), puis phrase à trous « on va vers la [droite | gauche] ».
3. Comparer 5 − (−3) (A) et 5 + (−3) (B, Cours 2) : « le signe devant la parenthèse » ; une droite, A en 8, B en 2 (ne compte pas).
4. Règle 1 « J'ajoute l'opposé » : deux signes −, l'opposé sur la droite, trous « 5 − (−3) = 5 + [3 | (−3)] » et « 3 − 7 = 3 + [(−7) | 7] », encadré.
5. Règle 2 « Puis j'additionne » : 3 + (−7) [négatif | positif] sur la droite grise, « −4 − 6 = −4 + (−6) = [−10 | 2 | 10] », encadré.
6. Deux petites questions sur un écran (comptées) : réécriture de 6 − (−4) ; résultat de −4 − 6.
7. Autres façons de faire (rappel des 2 règles en tête) : « Petit moins grand : on retourne » (essai 4 − 9) et « Vérifier par l'opération inverse » (essai 2 + (−4)).
8. Série de pratique : droite 2 − (−3) → signe de 3 − 8 → 6 + (−2) + 4 (Cours 3) → taper −3 − (−8).
9. Exemple 1 : −6 − (−10), la ligne = −6 + 10 expliquée (« Je comprends »), puis la case du résultat (comptée).
10. Exemple 2 : 3 − 11, case = 3 + (▢) (non notée), puis case du résultat (comptée). Puis l'annonce des 5 exercices de fin.

**Note du cours :** 13 questions (2 petites + 4 de la série + 2 cases d'exemples + 5 exercices de fin).

**Générateur :** niveau 1 : a − b, nombres de 1 à 9, a et b de signe quelconque (b négatif 1 fois sur 2) ; niveau 2 : de 10 à 99 ; niveau 3 : de 100 à 999, et une fois sur deux deux soustractions à la suite (248 − (−175) − 90 = 248 + 175 + (−90) = 333). Exercices de fin au niveau 1, uniquement des soustractions. Résolution type en 3 lignes : calcul · addition · résultat.

**Choix faits sans document :** l'opposé oublié s'écrit 5 + (−3) dans « Trouver l'erreur » (comme la fiche mémo), et au niveau 3 il est reconnu même si un seul des deux nombres a gardé son signe ; le message `signe-inverse` d'un calcul à deux soustractions dit « regroupe les positifs et les négatifs (Cours 3) » ; la correction juste d'un calcul à trois termes reprend celle du Cours 3 (positifs, négatifs, puis les deux totaux) ; « Comparer deux cas » montre les deux trajets sur une seule droite (de 1 à 8) avec les lignes « A arrive en 8 », « B arrive en 2 » ; formats de révision du Cours 1 (saisie, droite, signe, vrai ou faux, erreur), la droite à toucher sait maintenant dessiner a − b (bond a, puis bond −b).

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
