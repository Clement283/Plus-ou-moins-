# 07 — Décisions en attente pendant la construction

*Statut : à valider*

Pendant la construction, quelques cas que les documents 01 à 06 ne tranchaient pas ont dû être codés d'une certaine façon. Pour chacun : ce qui est codé aujourd'hui, ou ce que je propose. Réponds « OK pour tout », ou donne les numéros à changer.

## A. Réponses tapées (document 03)

| # | Cas | Proposition |
|---|---|---|
| 1 | Elle tape « 3−4 » (un − entre deux nombres) | **écriture invalide**, message « Ta réponse doit être un seul nombre » (aujourd'hui codé : « moins après le nombre », à corriger si tu valides) |
| 2 | « ((−3)) », ou des parenthèses dans une fraction | **écriture invalide** (seul « (−8) » est accepté) |
| 3 | « −07 », « −00 » | **justes**, avec « On écrit simplement −7 » / « On écrit simplement 0 » |
| 4 | Une fraction posée mais vide | **Valider reste grisé** (aucun caractère tapé) |
| 5 | « )−3 » (parenthèse fermée sans avoir été ouverte) | erreur **« parenthèse »** (aujourd'hui codé : « écriture invalide », à corriger si tu valides) |

## B. Cours (document 06)

| # | Cas | Proposition |
|---|---|---|
| 6 | Cours 1, erreur « signe oublié » quand les deux nombres sont **positifs** (4 + 6 → −10) | message : « Les deux nombres sont positifs : le résultat est positif aussi. » (le texte validé ne parle que des négatifs) |
| 7 | Cours 0, piège « parenthèse » aux niveaux 1 et 2 (le doc dit « niveau 3 ») | une parenthèse non fermée autour d'un négatif, ex. « 4 × (−3 » |
| 8 | Cours 0, règle 2 (« pas de parenthèses en tête ») : pas de contre-exemple ✗ possible | afficher « (−3) + 5 : pas faux, mais inutile », en gris |
| 9 | Cours 5, piège « erreur de table » | une table au hasard (sauf 1) ; viser **les tables qu'elle a ratées** sera fait quand l'historique est branché aux écrans |

## C. Révisions et activités (documents 01 et 02)

| # | Cas | Proposition (déjà codée) |
|---|---|---|
| 10 | Formats dans une révision | par cours révisé : 1 chance sur 4 d'avoir un « vrai ou faux » (jamais au Cours 0), 1 chance sur 4 d'avoir un « classer », le reste en QCM |
| 11 | Le piège ciblé en révision | seulement les erreurs propres au cours (les erreurs « autre » ne peuvent pas être ciblées : elles n'ont pas de calcul-piège) |
| 12 | Calcul « du même type » après une erreur | ajouté **une seule fois**, après la 1re erreur sur un calcul ; si elle rate encore, c'est le **même calcul** qui revient à la fin |
| 13 | Bouton « Passer » | apparaît au 2e échec sur **le même calcul** (les échecs sur le calcul « du même type » ne comptent pas) |
| 14 | S'il reste moins de 3 questions | le calcul « du même type » passe avant la répétition exacte de fin |
| 15 | Entraînement | les calculs sont au **niveau actuel** de chaque cours |
| 16 | QCM « paires de signes » quand la bonne réponse est 0 | impossible (0 n'a pas d'opposé) → formule « mélangée » |

## D. Ta page de suivi (document 05)

| # | Cas | Proposition (déjà codée) |
|---|---|---|
| 17 | Un module **terminé** | il disparaît des lignes « État » de l'accueil (qui listent les modules en cours) ; il reste visible dans la liste des modules |
| 18 | « Il y a un mois » pour la tendance des erreurs de signe | le même jour du mois précédent (ramené au dernier jour du mois s'il n'existe pas) ; tendance calculée sur les pourcentages arrondis affichés |
| 19 | Un cours « à rattraper » | affiché « en cours » dans la vue du module |
| 20 | Erreurs les plus communes | en touchant une erreur : ses **10** derniers calculs ratés |
| 21 | « À retravailler » | un cours sous 70 % : comparaison sur le pourcentage **affiché** (arrondi), pour que « 70 % » ne soit jamais marqué ⚠ |
