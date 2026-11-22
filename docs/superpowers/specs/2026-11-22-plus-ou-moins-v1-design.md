# Plus ou moins — V1 : document de conception

*Date : 2026-11-22 — Statut : validé par le porteur du projet*

## 1. Intention et pourquoi

Application web mobile d'entraînement aux mathématiques, pensée d'abord pour une élève de première spécialité maths, **dyslexique**. Elle maîtrise les méthodes du programme (son dernier contrôle portait sur le second degré, toutes les méthodes étaient justes) mais **perd des points sur le calcul de base** : erreurs de signes (3 + (−3), 3 × (−3)), additions, soustractions, multiplications, divisions, fractions. La règle n'est pas encore automatique.

Ce dont elle a besoin : **beaucoup de pratique, courte et régulière** (10–15 min par jour), avec une **répétition espacée** à la Babbel / Duolingo : ce qu'elle rate revient vite (lendemain, surlendemain), ce qu'elle réussit revient de plus en plus rarement. Son frère, qui lui donne des cours, veut **suivre ses résultats** pour savoir quoi retravailler.

L'appli doit être simple, intuitive, adaptée aux jeunes, et peut s'étendre rapidement à d'autres personnes de l'entourage et à d'autres chapitres du programme de première.

**Critère de réussite :** ses erreurs de signes et de calcul de base diminuent au fil des semaines, visible sur la page de suivi, et elle atteint régulièrement son objectif de 15 minutes par jour.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs V1**
- Module 1 « Calculs » complet : relatifs, priorités, fractions, carrés (voir §5).
- Parcours de cours (mini-leçon → exemples à compléter → exercices), entraînement en QCM, révisions quotidiennes en répétition espacée.
- Explication immédiate de l'erreur, sans appel serveur.
- Fonctionnement partiel hors ligne, synchronisation au retour du réseau.
- Page de suivi pour le « suiveur » (le frère).
- Multi-utilisateurs dès le départ (plusieurs élèves, plusieurs suiveurs).

**Non-objectifs V1** (prévus plus tard, l'architecture doit les permettre)
- Autres modules (second degré, etc.) : on ne les anticipe pas en contenu, seulement en structure.
- Version ordinateur dédiée (la page web marchera sur ordinateur, mais n'est pas optimisée pour).
- Page d'admin / éditeur de contenu.
- Notifications (« elle n'a pas fait ses 15 minutes »).
- Écriture au doigt avec reconnaissance d'écriture (trop complexe) : on répond toujours en tapant sur le clavier maths dédié.
- Inscription publique.
- Maquettes / identité visuelle détaillée : le design visuel sera traité dans une étape séparée, après validation des fonctionnalités et de l'architecture.

**Anti-objectifs** (ce qui ferait échouer le projet même s'il « marche »)
- Perdre l'historique de progression de l'élève.
- Un QCM qu'on peut résoudre par élimination sans comprendre.
- Lui présenter un calcul dont la méthode ne lui a jamais été expliquée.
- Un parcours compliqué (plusieurs chemins, niveaux à choisir à gauche et à droite).
- Des exercices « adaptés » qui ne ressemblent pas à un contrôle (signes agrandis, calculs colorés…) : en contrôle il n'y aura aucune adaptation, l'entraînement doit donc se faire dans les conditions réelles.
- Des consignes inutilement longues.
- Un « faux » sec sans explication.

## 3. Contraintes

- **Mobile d'abord**, iPhone (Safari) et Android (Chrome). Pas de stores : une page web installable sur l'écran d'accueil (PWA).
- **Hébergement Cloudflare** (le porteur du projet le connaît déjà) ; rester dans l'offre gratuite si possible.
- **Dyslexie — prise en compte, pas compensée.** Les **exercices, l'entraînement et les révisions** sont présentés **comme sur une copie de contrôle** : écriture mathématique normale, signes de taille normale, pas de couleurs ni d'aides visuelles sur les calculs. La dyslexie est prise en compte **dans les mini-leçons, les exemples guidés et les explications d'erreur** : couleurs, repères visuels, schémas, découpage en petites étapes. Elle peut aussi guider le choix des exercices (ce qui est plus difficile pour elle revient plus souvent).
- Safari iOS peut effacer le stockage d'un site non utilisé depuis 7 jours s'il n'est pas installé sur l'écran d'accueil → le serveur est la source de vérité, le stockage local n'est qu'un cache + une file d'attente.
- Données de mineurs : ne stocker que le strict nécessaire (prénom ou pseudo, pas d'email obligatoire pour l'élève).
- Le contenu (leçons, exemples) est écrit par Claude et relu par le porteur du projet ; il vit dans le code.

## 4. Modèle pédagogique

### 4.1 Structure

```
Module (V1 : « Calculs »)
 └─ Cours 1, 2, 3… — un chemin unique, dans l'ordre
     ├─ Mini-leçon, en plusieurs parties variées :
     │    explication de la règle (visuelle), étiquettes à remettre
     │    dans l'ordre, réponse à écrire, exemples à compléter…
     ├─ Exemples à compléter : guidés, elle remplit les trous
     └─ Exercices : réponse tapée exacte
     Chaque cours a des niveaux 1, 2, 3 (difficulté croissante)
```

**Règle de découpage (décidée) :**
- **Nouvelle méthode = nouveau cours.** Un cours = une seule règle, très court, faisable à n'importe quel moment en quelques minutes.
- **Même méthode, plus difficile = niveau.** Niveau 1 : petits nombres, une opération. Niveau 2 : plus de termes / plus grands nombres. Niveau 3 : grands nombres, pièges combinés. Jamais de nouvelle méthode entre deux niveaux.

Exemple (cours « additionner plusieurs relatifs ») — N1 : 3 + (−3) + 3 ; N2 : 12 + (−7) + 5 + (−9) + 4 ; N3 : 248 + (−27) + 15 + (−132).

### 4.2 Les trois modes

| Mode | Rythme | Forme de réponse |
|---|---|---|
| **Cours** | lent, détaillé, elle fait elle-même | réponse tapée exacte, clavier dédié |
| **Entraînement** | libre, quand elle veut, sur les cours déjà faits (« tout mélangé » ou un cours choisi), par séries de 10 ; ne change pas le calendrier des révisions | tous les types, pour la variété |
| **Révisions quotidiennes** | très rapide : a-t-elle compris ou pas | réponse finale seulement (QCM) |

- Entraînement et révisions ne portent que sur des cours **déjà faits**.
- **Types de questions variés** (validé), pour ne pas toujours refaire la même chose et rendre l'appli plus ludique. L'architecture traite le type de question comme un bloc interchangeable : en ajouter un ne demande pas de tout refaire. V1 :
  - **réponse écrite** (tapée avec le clavier dédié) ;
  - **QCM** ;
  - **étiquettes à remettre dans l'ordre** (à la Babbel) — ex. ordonner les étapes de 3 − 2 × (−4), reconstruire l'écriture équivalente de 3 − (−8) ; plus tard, reconstruire une formule comme Δ = b² − 4ac ;
  - **compléter le trou**, **trouver l'erreur**, **relier les paires**, **classer**, **vrai ou faux** (ajoutés après relecture ; valables pour tous les modules).
- Où on les utilise (détail : `docs/validation/03-clavier-et-reponses.md` §5) : **leçons** et **entraînement** : variété ; **exercices de fin de cours** : réponse écrite et trou à compléter ; **révisions** : formats rapides (QCM, vrai ou faux, classer).
- **Une séance de révision mélange tous les cours dus** (3 questions par cours, entremêlées).
- **QCM** : au début (niveau 1 / premières fois), les distracteurs sont surtout les **erreurs typiques** (pour (−3) × (−3) : 9, −9, 6, 0). Ensuite, **mélange** d'erreurs typiques et de valeurs plausibles « non typiques », pour qu'on ne puisse pas se dire « c'est 9 ou −9 ». La réponse choisie renseigne quelle erreur elle fait.

### 4.3 Progression

- **Chemin unique** de cours. Le cours suivant se débloque quand le **niveau 1** du cours courant est maîtrisé (critère détaillé et validé dans `docs/validation/01-repetition-espacee.md`).
- **Les niveaux montent automatiquement via la répétition espacée** (décidé, option « C » ; échelle de temps détaillée dans `docs/validation/01-repetition-espacee.md`) : réussite en révision → l'item revient **plus tard et plus dur** (N1 → N2 → N3) ; erreur → il revient **plus tôt et plus simple**. Elle ne choisit jamais de niveau, ne refait jamais de cours.
- Chaque cours affiche **1, 2 ou 3 étoiles** selon le niveau atteint (repère de progression pour elle).
- Le suivi se fait **par type d'erreur / par cours**, pas globalement : si elle rate souvent « moins par moins », c'est ce cas précis qui revient.

### 4.4 Objectif du jour et dosage des révisions (validé)

Il n'y a pas de « session » au sens d'un bloc fixe : **un cours n'est pas une session.**

- **Objectif du jour : 15 minutes de maths** (objectif de temps, pas un nombre de cours). Une jauge se remplit au fil des minutes ; elle peut s'arrêter avant ou continuer après autant qu'elle veut.
- **Répartition de référence : ~5 min de révisions + ~10 min de nouveau cours.**
- **Révisions mises en avant** sur l'écran d'accueil quand il y en a de dues, mais **pas obligatoires** : elle peut aller directement au prochain cours.
- **Cours** : durée variable selon le cours (pas de durée imposée) ; elle peut en enchaîner autant qu'elle veut dans la journée.
- **Entraînement** (QCM sur les cours déjà faits) : libre, à tout moment.

**Dosage des révisions** (règle validée) :
- La quantité de révisions proposée un jour est **proportionnelle à ce qu'elle a appris** : si elle fait 15 min par jour, environ **5 min de révisions** le lendemain ; si elle a fait 1 ou 2 heures de cours, les révisions associées augmentent en proportion.
- Les révisions ne doivent **jamais s'accumuler** au point de devenir une corvée (pas de « 45 minutes pour finir mes révisions » pour un rythme normal). Le lot du jour est donc **plafonné** selon cette règle ; les révisions en trop sont **reportées** (jamais perdues), en faisant passer d'abord les plus urgentes et celles qu'elle rate le plus.
- Si elle veut réviser au-delà du lot du jour, elle peut (« tant mieux pour elle »).

### 4.5 Retour sur erreur

À chaque erreur, immédiatement et localement :
1. la bonne réponse ;
2. **pourquoi** : la règle concernée, en version visuelle et courte (« − × − = + »), adaptée à l'erreur détectée quand elle est reconnue (signe inversé, mauvaise opération, oubli de priorité…) ;
3. un calcul du même type revient un peu plus loin dans le cours ou les révisions en cours, pour repartir sur une réussite.

## 5. Contenu du module 1 « Calculs » (liste provisoire)

Liste validée dans son principe ; le découpage exact (sans doute 20–25 cours) sera fixé à l'écriture des cours, en appliquant la règle « nouvelle méthode = nouveau cours ».

**Relatifs**
1. Additionner deux nombres de même signe : (−3) + (−5)
2. Additionner deux nombres de signes contraires : (−3) + 5
3. Additionner plusieurs relatifs (regrouper les + et les −)
4. Soustraire = ajouter l'opposé : 5 − (−3) = 5 + 3
5. Multiplier deux relatifs (règle des signes)
6. Diviser deux relatifs
7. Multiplier plusieurs relatifs (compter les −)

**Priorités**

8. × et ÷ avant + et −
9. Les parenthèses d'abord

**Fractions**

10. Simplifier une fraction
11. Le signe d'une fraction : −2/3 = 2/(−3) ; (−2)/(−3) = 2/3
12. Additionner / soustraire, même dénominateur
13. Additionner / soustraire, dénominateurs différents
14. Multiplier des fractions
15. Diviser par une fraction (multiplier par l'inverse)

**Carrés** (dans le module 1, découpage à confirmer à l'écriture)

16. Le carré d'un nombre négatif : (−3)² = 9
17. (−3)² ou −3² = −9 (piège de b² dans Δ = b² − 4ac)

Pour chaque cours, un document de contenu séparé (relu par le porteur du projet) précisera : texte de la mini-leçon, exemples à compléter, générateurs par niveau, erreurs typiques et explications associées.

## 6. Utilisateurs et rôles

- **Élève** : fait les cours, l'entraînement, les révisions.
- **Suiveur** : voit les résultats d'un ou plusieurs élèves (lecture seule).
- Un suiveur peut suivre plusieurs élèves ; un élève peut avoir plusieurs suiveurs.
- **Pas d'inscription publique** : le porteur du projet crée les comptes. En V1, un outil d'admin minimal suffit (ex. script / commande, pas d'interface).
- **Connexion par code personnel** (pas de mot de passe compliqué), une seule fois par appareil ; la session reste ouverte.

## 7. Page de suivi (suiveur)

- **Régularité** : objectif de 15 min atteint aujourd'hui ? temps passé par jour (révisions / cours / entraînement), série de jours, calendrier des jours faits / manqués.
- **Points faibles** : taux de réussite par cours / type de calcul.
- **Évolution** : les erreurs de signes diminuent-elles au fil des semaines ?
- **Détail des erreurs** : derniers calculs ratés avec la réponse donnée (pour voir *comment* elle se trompe).
- **Niveau atteint** par cours (étoiles).
- Lecture seule, sur mobile (Android du suiveur).

## 8. Approches envisagées

**Où stocker la progression ?**
- A. Tout sur le téléphone — simple, mais risque de perte (Safari iOS, changement de téléphone), pas de suivi possible. Écarté.
- B. Tout sur Cloudflare — rien ne se perd, mais pas de hors-ligne.
- C. Hybride complet avec synchronisation bidirectionnelle — trop complexe.
- **Retenu (choix du porteur du projet) : hybride simplifié.** Cloudflare est la source de vérité. Le téléphone a de quoi travailler les prochains jours hors ligne (révisions à venir + cours suivants) ; les réponses faites hors ligne sont mises en file d'attente et envoyées au retour du réseau ; en ligne, envoi immédiat. Simple parce que les réponses forment un **journal en ajout seul** (aucune modification après coup → pas de conflit).

**Où vit le « cerveau » (génération, correction, détection d'erreurs, répétition espacée) ?**
- **A. Sur le téléphone, en code partagé — retenu.** Correction et explication instantanées sans appel serveur (exigence du porteur du projet : « il ne faut pas qu'à chaque erreur il y ait un appel serveur »). Le hors-ligne en découle naturellement.
- B. Sur le serveur — chaque réponse attend le réseau, hors-ligne obligerait à dupliquer le cerveau. Écarté.
- Framework à rendu serveur (SvelteKit, Remix) — va contre le hors-ligne. Écarté.

**Forme des réponses :** réponse tapée exacte en cours ; QCM en entraînement et révisions (décidé).

**Niveaux :** module refait 3 fois (trop long), chemin entrecroisé (45 étapes), ou **niveaux qui montent dans les révisions — retenu**, combiné avec la règle « nouvelle méthode = nouveau cours ».

## 9. Architecture (décidée dans ses grandes lignes)

- **Front** : PWA en TypeScript + React (choix de Claude), servie par **Cloudflare Pages**. Service worker pour l'installation et le hors-ligne.
- **Cerveau partagé** : bibliothèque TypeScript indépendante de l'interface, utilisée par le front (révisions, cours, correction) et par le serveur (calcul des statistiques de suivi). Contient :
  - les **modules** ; chaque type d'exercice est un module/bloc avec : générateur paramétré par niveau, correction, erreurs typiques, explications, éventuellement étapes ;
  - le **planificateur de répétition espacée** (quand revient un item, à quel niveau).
  - Ajouter un module (ex. second degré) = ajouter un bloc, sans toucher au reste.
- **Serveur** : Cloudflare Workers + base **D1** (SQLite). Stocke les comptes, liens élève↔suiveur, et le **journal des réponses** (date, cours, niveau, exercice, réponse donnée, juste/faux, type d'erreur détecté, mode). L'état de progression se recalcule à partir du journal.
- **Hors ligne** : stockage local (IndexedDB) = cache de l'état + file d'attente des réponses non envoyées ; envoi au retour du réseau, sans doublon (identifiant unique par réponse).
- **Contenu** (leçons, exemples, textes d'explication) : fichiers dans le projet, relus par le porteur du projet.

## 10. Livraison par étapes et écrans (décidé)

- **Par étapes.** Étape 1 : une version complète de bout en bout (moteur, répétition espacée, hors-ligne + synchro, comptes, page de suivi) avec **uniquement les cours « Relatifs »** (cours 1–7), son problème principal, pour qu'elle commence à s'entraîner au plus tôt. Étapes suivantes : Priorités, puis Fractions, puis Carrés, par lots ; chaque lot = écriture des cours par Claude → relecture par le porteur du projet → mise en ligne.
- **Écrans sobres qui fonctionnent.** Tous les écrans (leçons, exemples, clavier dédié, QCM, révisions, page de suivi) sont construits et utilisables dès l'étape 1, avec un style neutre et lisible. Les calculs y sont écrits comme sur une copie (voir §3) ; les aides visuelles (couleurs, repères) sont réservées aux leçons, exemples guidés et explications d'erreur. Pas d'identité graphique : l'appli sera « habillée » à l'étape design visuel, sans changer le fonctionnement. Les styles sont donc centralisés pour faciliter ce rhabillage.

## 11. Règle de validation (décidée)

Le porteur du projet **valide toute la logique de l'application** avant qu'elle soit codée : tout ce qui change ce que l'élève voit, fait ou comment elle progresse. Seuls les choix **purement techniques** (qu'il ne pourrait pas juger) sont décidés par Claude, et même ceux-là lui sont **annoncés** (« j'ai fait ça »). En cas de doute, on demande.

**À présenter et faire valider avant implémentation** (documents courts, avec exemples concrets) :
- **Algorithme de répétition espacée** : quand un calcul revient, quand le niveau monte ou descend, combien d'erreurs font redescendre, critère de maîtrise d'un niveau et de déblocage du cours suivant.
- **Dosage des révisions** : formule de proportion, plafond, ordre de priorité des révisions reportées (dans le cadre du §4.4).
- **Clavier dédié** : touches, disposition, saisie des nombres négatifs et des fractions.
- **Distracteurs QCM** : comment on choisit les erreurs typiques et les valeurs « non typiques », et comment le mélange évolue.
- **Format des réponses** : forme irréductible exigée ou non pour les fractions, écritures acceptées (−2/3, 2/(−3)…).
- **Détection et explication des erreurs** : liste des erreurs typiques reconnues par cours et texte d'explication associé (inclus dans les documents de contenu de chaque cours).
- **Contenu de chaque cours** (§5) et aides visuelles des leçons.
- **Contenu de la page de suivi** et calcul des indicateurs (dont la tendance « erreurs de signes »).

## 12. Choix faits par Claude (à vérifier par le porteur du projet)

- Front en **TypeScript + React**.
- **Unité de répétition espacée = le cours** (chaque cours a son niveau et sa prochaine date de révision). Les **types d'erreur** sont enregistrés pour chaque réponse et servent au choix des exercices (faire revenir le cas raté) et à la page de suivi.
- **Le « jour »** (objectif de 15 min, série de jours, révisions dues) suit l'heure de Paris.
- **Tendance « erreurs de signes »** sur la page de suivi : calculée à partir des erreurs détectées comme erreurs de signe (signe inversé, règle des signes mal appliquée).
- **Connexion par code personnel**, comptes créés par un script d'admin (pas d'interface en V1).
- Pas de notifications en V1.

## 13. Choix purement techniques (décidés par Claude, annoncés au porteur du projet)

- Schéma de base de données, API, format du code de connexion, outil de création de comptes.
- Outillage (bundler, tests, déploiement), dans le cadre TypeScript + React + Cloudflare.
