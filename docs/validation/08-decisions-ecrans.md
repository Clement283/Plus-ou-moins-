# 08 — Décisions sur les écrans

*Statut : validé (2026-11-23). Réponses du porteur du projet aux « Questions pour toi » des maquettes (`docs/design/ecrans/`). En cas de différence, ce document prime sur les documents 01 à 07.*

| # | Question | Décision |
|---|---|---|
| 1 | Un cours à rattraper peut-il être travaillé en entraînement ? | **Oui.** |
| 2 | Un cours verrouillé est-il fermé (leçon non visible) ? | **Oui.** |
| 3 | Entraînement : série fixe de 10 questions, niveaux mélangés ? | **Oui, pas de choix de longueur.** |
| 4 | 1re révision : « dans 48 heures » ou la date ? | **« Première révision dans 48 heures »**, sans la date. |
| 5 | Cours non validé : afficher les chiffres et le critère manquant ? | **Oui.** |
| 6 | Rattrapage : nouveaux calculs à chaque série ? | **Oui.** |
| 7 | Calcul raté qui revient en fin de séance de révision | **C'est exactement le même calcul qu'avant**, posé de la même façon (même type de question). Confirmé. |
| 8 | Le compteur de questions grandit après une erreur ? | **Oui** (ex. « question 9 sur 17 »). |
| 9 | Quand apparaît « Passer » ? | **Quand le même calcul revient pour la 3e fois** (après 2 échecs), pas sur l'écran de retour du 2e échec. |
| 10 | QCM et vrai ou faux : choisir puis Valider, ou réponse dès le toucher ? | **Dès qu'elle touche.** Pas de bouton Valider pour ces deux types. |
| 11 | « Trouver l'erreur » : la ligne de départ peut être touchée ? | **Oui.** |
| 12 | Limite de 12 caractères : dans une fraction, chaque chiffre compte, pas la barre ? | **Oui.** |
| 13 | Toutes les périodes du suivi sur 28 jours ? | **Oui, les 4 dernières semaines** (doc 05, version 6). |
| 14 | Cours à la fois « à rattraper » et ⚠ sur le suivi | **Le ⚠ et « À retravailler » ne concernent que les cours validés.** Un cours pas encore validé affiche seulement « à rattraper ». La règle des 70 % reste sur les **14 derniers jours** (difficulté récente). |
| 15 | Plusieurs élèves : le prénom ouvre une liste en volet en bas d'écran ? | **Oui.** |

Autres décisions du 2026-11-23 :
- Le taux d'erreurs de signe est retiré partout (moteur, doc 05). Le suivi montre les erreurs les plus communes.
- L'appli n'est pas centrée sur le changement de signe : les nombres relatifs sont le premier module. Description de l'appli : « Entraîne-toi, un peu chaque jour ».
- Icône de l'appli : option A, « ± » empilé (`docs/design/icones.html`).
