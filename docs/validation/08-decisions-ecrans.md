# 08 — Décisions sur les écrans

*2026-11-23 : « rattrapage » s'appelle désormais « série de validation » dans l'interface (doc 08).*

*Statut : validé (2026-11-23 ; n° 16 à 19 ajoutés le 2026-11-23 ; n° 20 à 31 puis n° 32 à 42 ajoutés le 2026-11-24 ; n° 43 à 50 ajoutés le 2026-11-25, après la maquette `cours-0-v3.html` ; n° 51 ajouté le 2026-11-25, après la maquette `cours-3-v2.html`). Réponses du porteur du projet aux « Questions pour toi » des maquettes (`docs/design/ecrans/`). En cas de différence, ce document prime sur les documents 01 à 07.*

| # | Question | Décision |
|---|---|---|
| 1 | Un cours à valider peut-il être travaillé en entraînement ? | **Oui.** |
| 2 | Un cours verrouillé est-il fermé (leçon non visible) ? | **Oui.** |
| 3 | Entraînement : série fixe de 10 questions, niveaux mélangés ? | **Oui, pas de choix de longueur.** |
| 4 | 1re révision : « dans 48 heures » ou la date ? | **« Première révision dans 48 heures »**, sans la date. |
| 5 | Cours non validé : afficher les chiffres et le critère manquant ? | **Oui.** |
| 6 | Série de validation : nouveaux calculs à chaque série ? | **Oui.** |
| 7 | Calcul raté qui revient en fin de séance de révision | **C'est exactement le même calcul qu'avant**, posé de la même façon (même type de question). Confirmé. |
| 8 | Le compteur de questions grandit après une erreur ? | **Oui** (ex. « question 9 sur 17 »). |
| 9 | Quand apparaît « Passer » ? | **Quand le même calcul revient pour la 3e fois** (après 2 échecs), pas sur l'écran de retour du 2e échec. |
| 10 | QCM et vrai ou faux : choisir puis Valider, ou réponse dès le toucher ? | **Dès qu'elle touche.** Pas de bouton Valider pour ces deux types. |
| 11 | « Trouver l'erreur » : la ligne de départ peut être touchée ? | **Oui.** |
| 12 | Limite de 12 caractères : dans une fraction, chaque chiffre compte, pas la barre ? | **Oui.** |
| 13 | Toutes les périodes du suivi sur 28 jours ? | **Oui, les 4 dernières semaines** (doc 05, version 6). |
| 14 | Cours à la fois « à valider » et ⚠ sur le suivi | **Le ⚠ et « À retravailler » ne concernent que les cours validés.** Un cours pas encore validé affiche seulement « à valider ». La règle des 70 % reste sur les **14 derniers jours** (difficulté récente). |
| 15 | Plusieurs élèves : le prénom ouvre une liste en volet en bas d'écran ? | **Oui.** |
| 16 | Cours quitté au milieu (croix en haut) | **Il recommence au début.** Une confirmation s'affiche : « Quitter le cours ? Tu le reprendras depuis le début. » [Quitter] [Continuer]. Les réponses déjà données comptent dans le temps du jour, pas dans la note du cours. |
| 17 | « Relire la leçon » (Mes cours, série de validation) | **Lecture sans rien compter** : la leçon complète (explications et questions de leçon, qu'elle peut faire), mais rien n'est enregistré, pas même le temps. |
| 18 | Bouton de déconnexion | **Pas de bouton en V1**, comme sur les maquettes. |
| 19 | Accueil quand tous les cours du module sont validés | **Carte « Module terminé »** à la place de « Prochain cours » : « Module Calculs terminé. Tous les cours sont validés. » avec le bouton « S'entraîner ». Les révisions continuent. |
| 20 | Nouveau Cours 0 (retours du porteur du projet après le premier essai en ligne) | **Réécrit d'après la maquette `docs/design/ecrans/cours-0-v2.html`** (doc 06, Cours 0 version 2). Il sert de modèle aux autres cours ; un skill « écrire un bon cours » en sera tiré après le test réel. *(Remplacé par la version 3, voir n° 43 à 50.)* |
| 21 | Note d'un cours | Les **questions pour deviner** (posées avant l'explication) **ne comptent pas** et ne repassent pas. Les **petites questions** posées après une explication **comptent** dans les 80 %. |
| 22 | Petite question ratée | **Elle repasse 2 écrans plus loin**, choix remélangés, jusqu'à la bonne réponse ; « Passer » à partir du 2e échec. Seule la 1re réponse compte (doc 01 §6). Classer, Quelle règle ?, Réécris gardent le repassage habituel ; le message devient « Tu retrouveras ce calcul à la fin de la leçon. » |
| 23 | Cours quitté au milieu | **Inchangé (n° 16) : on reprend au début**, même avec un cours plus long. |
| 24 | Explications animées | **Elles avancent quand elle touche « Suite »**, jamais toutes seules. Un bouton **« Revoir »** rejoue l'animation de l'étape affichée. Une grande zone de calcul occupe le haut dès le départ : l'écran n'est jamais vide. |
| 25 | Exemples guidés « Réécris » | **Elle tape le calcul en entier** avec le **clavier complet** (chiffres, + − × ÷, parenthèses) : le clavier ne doit jamais dicter la réponse. Principe : **dans le cours qui enseigne une règle, aucune erreur sur cette règle n'est tolérée** ((−3) + 4 est une faute dans le Cours 0). Dans les cours et modules suivants, une parenthèse inutile sera une erreur d'attention moins grave. |
| 26 | Toucher la faute | **Le calcul en haut, écrit normalement ; en bas, le même calcul découpé en cases de même taille** (un nombre = une case, chaque signe et chaque parenthèse = une case), puis « Tout est bien écrit ». Même présentation aux exercices de fin, en révision et en entraînement. |
| 27 | Code couleur, **le même pour tous les cours** | **Surligneur jaune** = « regarde ici », dans les explications. **Vert** = juste, **rouge** = faux, **seulement après une réponse**. **Aucune couleur qui donne un indice** pendant une question (exercices, révisions, entraînement compris). Si un cours doit distinguer les signes (droite graduée) : négatifs en **orange**, positifs en **bleu**, jamais en rouge. Le Cours 0 n'utilise pas de couleur de signe. Remplace « négatifs en rouge, positifs en bleu » du doc 06. |
| 28 | Où sont les réponses à l'écran | **Tout ce qu'on touche est en bas de l'écran**, sous le pouce (choix, cases, clavier, calculs à ranger). Le calcul, la consigne et les explications restent en haut. La manière de répondre (glisser, toucher, taper) est écrite dans la consigne. |
| 29 | Cours raté | L'écran de résultat donne les chiffres (bonnes réponses et %, exercices de fin), **les erreurs par règle** (« Deux signes qui se touchent (règle 1), 3 fois ») et un lien **« Relire la règle N »** qui ouvre l'écran de cette règle (lecture sans rien compter, comme n° 17). **Mes cours et l'accueil gardent la raison** : « Dernier essai : 3 exercices de fin justes sur 5. À revoir : deux signes qui se touchent. » + « Relire la règle 1 ». |
| 30 | Textes | **De vraies phrases** : consignes complètes, explication du pourquoi. Comprendre une consigne fait partie de ce que l'élève travaille. Une idée par écran. |
| 31 | Plus tard (hors V1 actuelle) | **Erreurs d'attention qui reviennent** : dans un cours plus avancé, une erreur d'écriture isolée compte moins ; si elle revient souvent, l'appli réaffiche le cours concerné. À concevoir. |
| 32 | Étapes interactives dans les explications (maquette `cours-1-v2.html`) | **Elles remplacent « Suite », l'action est en bas de l'écran.** Trois gestes : *phrase à trous* (elle remplace une phrase de l'explication, **un seul trou** à la fois, des choix qui se lisent dans la phrase), *toucher la scène* (la droite graduée), *faire le geste* (elle touche l'arrivée, le bond se dessine). **Une erreur = un message court et elle réessaie ; rien n'est noté.** |
| 33 | Rythme de lecture | **Au plus 2 étapes de lecture d'affilée** sans action, y compris dans une explication. **2 phrases visibles** à l'écran ; les précédentes se replient derrière **« Relire le début »**. |
| 34 | Ce qui se touche se voit | Sur une scène touchable : **pastilles rondes visibles qui « respirent »**, **consigne écrite au-dessus** (« Touche la droite à l'endroit où l'on arrive. »), **petite main animée la 1re fois** seulement, **cibles de 44 px au moins** (8 graduations au plus, rien de coupé). La scène est grise pendant la question. |
| 35 | Série de pratique | **4 questions à la suite**, compteur « 2 sur 4 », retour immédiat, **aide décroissante** et **formats variés** (toucher sur la droite avec bonds dessinés, signe du résultat, vrai ou faux, taper le résultat). **Notée comme les petites questions** (dans les 80 %). **À partir du 2e cours d'un module**, une des 4 questions vient d'un cours précédent. |
| 36 | Comparer deux cas | Un écran court : deux calculs presque identiques côte à côte, « Qu'est-ce qui change ? » (question pour comprendre, **ne compte pas**), puis la scène montre les deux. À partir du 2e cours d'un module, l'un des deux vient du cours précédent. |
| 37 | L'aide qui s'efface ; longueur d'un cours | **Exemples guidés à aide décroissante** : le 1er résolu à l'écran (elle valide chaque ligne), le 2e à moitié (deux cases) ; le calcul de départ reste **toujours affiché**. **Un cours fait 12 à 15 écrans.** |
| 38 | Fiche mémo (version A, voir `docs/design/ecrans/nouvelles-fonctions.html`) | **Fiche plein écran** : la règle, 1 ou 2 exemples, l'erreur à éviter, l'astuce. Bouton **« Fiche »** sur la ligne du cours validé dans **Mes cours** et **« Voir la fiche mémo »** sur l'écran **« Cours validé »**. **Disponible hors ligne.** *(Étendu par le n° 46 : aussi avant la validation.)* |
| 39 | Échauffement (version A retravaillée) | **Écran dédié à la 1re ouverture du jour**, contenu centré : **une question sur un cours déjà validé**, à revoir en priorité ; **« Passer »** discret. **Compte dans le temps du jour, pas dans la note.** Une erreur **ajoute le cours aux révisions**. *(Précisé par le n° 50.)* |
| 40 | Demander une explication à Clément (version A, bouton discret) | **Élève :** bouton **« Demander à Clément »** sous le retour d'erreur, **petit mot facultatif**, envoi des **données de la question** (pas d'une photo), **hors ligne puis envoi au retour du réseau**. **Côté suiveur :** badge et demande dans la page de suivi, **réponse en texte**. **Côté élève :** petit **bouton rond (bulle)** dans la barre du haut de l'accueil, **gris** sans nouveauté, **coloré avec un point** si réponse non lue, qui ouvre **« Mes questions »** ; carte **« Clément a répondu à ta question »** seulement si une réponse n'est pas lue. |
| 41 | Bouton « Écouter » | **Haut-parleur dans un coin en haut des écrans de leçon** : lecture à voix haute (**synthèse vocale du téléphone, fr-FR**) du **titre, de la phrase affichée et de la consigne**. **À tester par le porteur du projet.** |
| 42 | Plus tard (hors V1 actuelle) | **Carnet d'erreurs** (version suivante) ; **contrôle blanc / bilan de module** ; **brouillon de calcul** ; **« voir où elle bloque »** (à concevoir). **Pas de « Sûre / pas sûre ».** |
| 43 | Note du Cours 0 (maquette `cours-0-v3.html`) | **14 questions** (au lieu de 15) : les petites questions « À quoi sert le − ? » deviennent des étapes interactives non notées (doc 06, Cours 0 version 3). |
| 44 | Cours 0 : placer le − devant le 3 (règle 3) | **Elle touche l'endroit** où le − doit aller, **pas de glisser** (même geste pour la parenthèse ouvrante, règle 1, et fermante, règle 4). Le glisser-déposer reste réservé à « Classer » en révision et en entraînement. |
| 45 | La série de pratique compte-t-elle dans la note ? | **Oui, au Cours 0 comme au Cours 1** : ses 4 questions sont dans les 80 % (précise le n° 35). |
| 46 | Fiche mémo avant la validation | **Consultable avant la validation**, depuis Mes cours (« Voir la fiche mémo » sur un cours « À valider », « Fiche » ensuite), pas seulement après. Un cours verrouillé n'a pas de fiche (n° 2). Étend le n° 38. |
| 47 | Astuce de la fiche du Cours 0 | « Cherche d'abord les signes qui se touchent, puis demande-toi pour chaque − : il soustrait, ou c'est le signe d'un nombre ? » |
| 48 | Exemple guidé à deux cases (exemple 2) | **Seule la dernière case (le résultat) compte** dans la note ; la case 1 est un entraînement non noté. Cours 1 : 11 questions au total. Cours 0 : même principe (case 2 de l'exemple 2), 14 questions. |
| 49 | Question ratée de la série de pratique | **Elle revient avant les exercices de fin**, comme les autres questions de leçon (n° 22) : correction, suite, puis « Tu retrouveras ce calcul à la fin de la leçon. » Seule la 1re réponse compte. |
| 50 | Erreur à l'échauffement (n° 39) | **Elle apparaît dans « Erreurs les plus communes »** de la page de suivi, mais **ne compte pas dans la note** du cours. |
| 51 | Le niveau rallonge-t-il aussi le calcul ? | **Oui : le niveau peut rallonger le calcul (plus de termes) quand le cours s'y prête, en plus d'agrandir les nombres ; décidé 2026-11-25.** Cours 3 : niveau 1 de 3 à 4 termes (1 à 9), niveau 2 de 4 à 5 termes (1 à 20), niveau 3 de 5 à 6 termes (10 à 99), signes toujours mélangés. Les questions de la leçon et les exercices de fin restent au niveau 1, avec les valeurs exactes de la maquette. Le Cours 7 (multiplier plusieurs nombres) suivra le même principe. |

Autres décisions du 2026-11-23 :
- Entraînement : la phrase sur les cours pas encore disponibles devient « Les cours 5 à 7 apparaîtront ici quand tu auras fini ces cours. ».
- Le mot « rattrapage » disparaît de l'interface : la série de 5 exercices proposée quand un cours n'est pas validé s'appelle « série de validation » (bouton « Faire la série de validation », pastille « Validation, 3 sur 5 »). L'état « à rattraper » devient « à valider » (accueil, Mes cours, entraînement, page de suivi). Les compteurs de la série de validation et des exercices de fin comptent aussi les calculs qui reviennent (« 3 sur 7 »).
- Écran « cours pas encore validé » : sous le critère des exercices de fin, « Ces exercices vérifient que tu sais calculer seule. » (au lieu de « Elle vérifie… »).
- Après une erreur, titres sans maquette : « Tout était juste. », « Voici le bon ordre. », « Voici les bonnes paires. » (validés).
- « Trouver l'erreur » quand tout était juste : seule la ligne touchée passe en rouge ; l'explication dit « Tout était juste. ».
- Vrai ou faux et étiquettes : aucune marque verte ou rouge sur la question corrigée, comme la maquette ; la correction est dans l'explication.
- Connexion : si le serveur répond par une erreur (autre qu'un code inconnu), message distinct « Le serveur ne répond pas. Réessaie dans un moment. » avec « Réessayer ».
- Connexion : « Entrer » reste grisé tant que le champ est vide.
- Case « signe du résultat » des exemples guidés : consigne « Quel est le signe du résultat ? ».
- Page de suivi : pas d'emoji (« Rien à retravailler en ce moment », « Révisions à jour »), comme sur les maquettes.
- Réponse « 3−(4) » : « écriture invalide » avec « Ta réponse doit être un seul nombre. » (même règle que « 3−4 », doc 07 n° 1).
- Leçons : un titre court par écran et des blocs « Fais attention » (comme la maquette du Cours 4) seront proposés dans un document à valider avant d'entrer dans l'appli.
- Calcul pas fini (doc 03 §3) : « Le calcul n'est pas fini : simplifie. » quand le calcul est une division, « Simplifie. » sinon. Validé par le porteur du projet.
- Le taux d'erreurs de signe est retiré partout (moteur, doc 05). Le suivi montre les erreurs les plus communes.
- L'appli n'est pas centrée sur le changement de signe : les nombres relatifs sont le premier module. Description de l'appli : « Entraîne-toi, un peu chaque jour ».
- Icône de l'appli : option A, « ± » empilé (`docs/design/icones.html`).
