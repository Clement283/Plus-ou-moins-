# Plus ou moins — V1 : document de conception

*Date : 2026-11-22 — Statut : en attente de validation finale*

## 1. Intention et pourquoi

Application web mobile d'entraînement aux mathématiques, pensée d'abord pour une élève de première spécialité maths, **dyslexique**. Elle maîtrise les méthodes du programme (son dernier contrôle portait sur le second degré, toutes les méthodes étaient justes) mais **perd des points sur le calcul de base** : erreurs de signes (3 + (−3), 3 × (−3)), additions, soustractions, multiplications, divisions, fractions. La règle n'est pas encore automatique.

Ce dont elle a besoin : **beaucoup de pratique, courte et régulière** (10–15 min par jour), avec une **répétition espacée** à la Babbel / Duolingo : ce qu'elle rate revient vite (lendemain, surlendemain), ce qu'elle réussit revient de plus en plus rarement. Son frère, qui lui donne des cours, veut **suivre ses résultats** pour savoir quoi retravailler.

L'appli doit être simple, intuitive, adaptée aux jeunes, et peut s'étendre rapidement à d'autres personnes de l'entourage et à d'autres chapitres du programme de première.

**Critère de réussite :** ses erreurs de signes et de calcul de base diminuent au fil des semaines, visible sur la page de suivi, et elle fait ses sessions régulièrement.

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
- Notifications (« elle n'a pas fait sa session »).
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
     ├─ Mini-leçon : la règle, courte et visuelle
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
| **Entraînement** | plus rapide | QCM |
| **Révisions quotidiennes** | très rapide : a-t-elle compris ou pas | réponse finale seulement (QCM) |

- Entraînement et révisions ne portent que sur des cours **déjà faits**.
- **QCM** : au début (niveau 1 / premières fois), les distracteurs sont surtout les **erreurs typiques** (pour (−3) × (−3) : 9, −9, 6, 0). Ensuite, **mélange** d'erreurs typiques et de valeurs plausibles « non typiques », pour qu'on ne puisse pas se dire « c'est 9 ou −9 ». La réponse choisie renseigne quelle erreur elle fait.

### 4.3 Progression

- **Chemin unique** de cours. Le cours suivant se débloque quand le **niveau 1** du cours courant est maîtrisé (critère de maîtrise : décidé pendant la construction, ex. N réussites sur les M derniers exercices).
- **Les niveaux montent automatiquement via la répétition espacée** (décidé, option « C ») : réussite en révision → l'item revient **plus tard et plus dur** (N1 → N2 → N3) ; erreur → il revient **plus tôt et plus simple**. Elle ne choisit jamais de niveau, ne refait jamais de cours.
- Chaque cours affiche **1, 2 ou 3 étoiles** selon le niveau atteint (repère de progression pour elle).
- Le suivi se fait **par type d'erreur / par cours**, pas globalement : si elle rate souvent « moins par moins », c'est ce cas précis qui revient.

### 4.4 Session quotidienne (validé)

- Environ 10 minutes, 15–20 calculs.
- D'abord les révisions dues ce jour-là, puis la suite du parcours (cours suivant) ou de l'entraînement.
- **Autant de sessions par jour qu'elle le souhaite.**

### 4.5 Retour sur erreur

À chaque erreur, immédiatement et localement :
1. la bonne réponse ;
2. **pourquoi** : la règle concernée, en version visuelle et courte (« − × − = + »), adaptée à l'erreur détectée quand elle est reconnue (signe inversé, mauvaise opération, oubli de priorité…) ;
3. un calcul du même type revient un peu plus loin dans la session, pour repartir sur une réussite.

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

- **Régularité** : session faite aujourd'hui ? série de jours, calendrier des jours faits / manqués.
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
- **Retenu (choix du porteur du projet) : hybride simplifié.** Cloudflare est la source de vérité. Le téléphone a de quoi faire les prochaines sessions quotidiennes hors ligne ; les réponses faites hors ligne sont mises en file d'attente et envoyées au retour du réseau ; en ligne, envoi immédiat. Simple parce que les réponses forment un **journal en ajout seul** (aucune modification après coup → pas de conflit).

**Où vit le « cerveau » (génération, correction, détection d'erreurs, répétition espacée) ?**
- **A. Sur le téléphone, en code partagé — retenu.** Correction et explication instantanées sans appel serveur (exigence du porteur du projet : « il ne faut pas qu'à chaque erreur il y ait un appel serveur »). Le hors-ligne en découle naturellement.
- B. Sur le serveur — chaque réponse attend le réseau, hors-ligne obligerait à dupliquer le cerveau. Écarté.
- Framework à rendu serveur (SvelteKit, Remix) — va contre le hors-ligne. Écarté.

**Forme des réponses :** réponse tapée exacte en cours ; QCM en entraînement et révisions (décidé).

**Niveaux :** module refait 3 fois (trop long), chemin entrecroisé (45 étapes), ou **niveaux qui montent dans les révisions — retenu**, combiné avec la règle « nouvelle méthode = nouveau cours ».

## 9. Architecture (décidée dans ses grandes lignes)

- **Front** : PWA en TypeScript + React (choix de Claude), servie par **Cloudflare Pages**. Service worker pour l'installation et le hors-ligne.
- **Cerveau partagé** : bibliothèque TypeScript indépendante de l'interface, utilisée par le front (sessions, correction) et par le serveur (calcul des statistiques de suivi). Contient :
  - les **modules** ; chaque type d'exercice est un module/bloc avec : générateur paramétré par niveau, correction, erreurs typiques, explications, éventuellement étapes ;
  - le **planificateur de répétition espacée** (quand revient un item, à quel niveau).
  - Ajouter un module (ex. second degré) = ajouter un bloc, sans toucher au reste.
- **Serveur** : Cloudflare Workers + base **D1** (SQLite). Stocke les comptes, liens élève↔suiveur, et le **journal des réponses** (date, cours, niveau, exercice, réponse donnée, juste/faux, type d'erreur détecté, mode). L'état de progression se recalcule à partir du journal.
- **Hors ligne** : stockage local (IndexedDB) = cache de l'état + file d'attente des réponses non envoyées ; envoi au retour du réseau, sans doublon (identifiant unique par réponse).
- **Contenu** (leçons, exemples, textes d'explication) : fichiers dans le projet, relus par le porteur du projet.

## 10. Livraison par étapes et écrans (décidé)

- **Par étapes.** Étape 1 : une version complète de bout en bout (moteur, répétition espacée, hors-ligne + synchro, comptes, page de suivi) avec **uniquement les cours « Relatifs »** (cours 1–7), son problème principal, pour qu'elle commence à s'entraîner au plus tôt. Étapes suivantes : Priorités, puis Fractions, puis Carrés, par lots ; chaque lot = écriture des cours par Claude → relecture par le porteur du projet → mise en ligne.
- **Écrans sobres qui fonctionnent.** Tous les écrans (leçons, exemples, clavier dédié, QCM, révisions, page de suivi) sont construits et utilisables dès l'étape 1, avec un style neutre et lisible. Les calculs y sont écrits comme sur une copie (voir §3) ; les aides visuelles (couleurs, repères) sont réservées aux leçons, exemples guidés et explications d'erreur. Pas d'identité graphique : l'appli sera « habillée » à l'étape design visuel, sans changer le fonctionnement. Les styles sont donc centralisés pour faciliter ce rhabillage.

## 11. Choix faits par Claude (à vérifier par le porteur du projet)

- Front en **TypeScript + React**.
- **Unité de répétition espacée = le cours** (chaque cours a son niveau et sa prochaine date de révision). Les **types d'erreur** sont enregistrés pour chaque réponse et servent au choix des exercices (faire revenir le cas raté) et à la page de suivi.
- **Le « jour »** (sessions, série de jours) suit l'heure de Paris.
- **Tendance « erreurs de signes »** sur la page de suivi : calculée à partir des erreurs détectées comme erreurs de signe (signe inversé, règle des signes mal appliquée).
- **Connexion par code personnel**, comptes créés par un script d'admin (pas d'interface en V1).
- Pas de notifications en V1.

## 12. Détails techniques décidés pendant la construction

Points qui ne changent pas ce que l'appli fait pour l'élève ou le suiveur ; ils seront tranchés au moment de coder, et signalés au porteur du projet s'ils ont un effet visible.

- Algorithme exact de répétition espacée (intervalles, montée/descente de niveau) et critère de maîtrise d'un niveau.
- Composition précise d'une session, durée exacte.
- Clavier dédié : disposition des touches (chiffres, « − » bien visible, fraction).
- Format attendu pour les fractions (forme irréductible exigée ou non selon le cours).
- Génération des distracteurs QCM « non typiques ».
- Schéma de base de données, API, format du code de connexion, outil de création de comptes.
- Outillage (bundler, tests, déploiement), dans le cadre TypeScript + React + Cloudflare.
- Aides visuelles des mini-leçons (couleurs, repères) : affinées à l'écriture des cours et à l'étape design visuel.
