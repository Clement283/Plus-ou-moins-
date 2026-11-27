# Élèves IA — tester la compréhension d'un cours (conception)

Date : 2026-11-27. Décidé avec Clément en séance de questions (« grill »).

## Pourquoi

Les nouveaux cours sont parfois difficiles à comprendre : phrases compliquées, mots trop difficiles, cours trop gros ou trop lourd. Avant de sortir un cours du module « Essais », Clément veut que **plusieurs élèves différents** l'essaient et qu'un **prof de maths** le relise, pour savoir si le cours est logique et compréhensible, puis décider lui-même quoi corriger.

Ce n'est **pas** un test « le cours est-il cassé » : ce rôle reviendra plus tard à des bots programmés (sans IA) lancés par `npm test` sur tous les cours. Hors de ce document.

## Objectifs

- Faire lire un cours (ou un module entier) par **3 élèves IA** de niveaux différents et par **un prof de maths IA**.
- Produire **un rapport** qui liste les problèmes, du plus grave au moins grave, avec une proposition de réécriture pour chacun.
- Coût raisonnable : environ 100 000 tokens pour un cours, 400 000 à 600 000 pour un module de 11 cours. Le rapport donne le coût réel mesuré.

## Hors objectifs

- Vérifier l'exactitude des calculs ou que le cours fonctionne (les tests du moteur le font déjà, les bots programmés le feront).
- Juger le visuel (couleurs, mise en page).
- Tester dans la vraie application (navigateur) : trop coûteux (plusieurs millions de tokens par cours).
- Faire tourner les élèves IA sur GitHub.

## À éviter absolument (anti-objectifs)

- **Un élève faible qui comprend tout** parce qu'une IA fait semblant d'être faible. Les connaissances de chaque élève sont écrites et la règle est stricte (voir plus bas).
- **Un élève qui apprend dans la fiche** au lieu du cours : il ne verrait pas les trous du cours.
- **Modifier un cours sans le go de Clément.** Le rapport propose ; Clément décide ; la correction se fait ensuite avec la méthode `plus-ou-moins-ecrire-un-cours`.

## Ce qu'on teste (5 points)

1. **Phrases et mots difficiles** : phrase trop longue, deux idées dans une phrase, mot inconnu ou trop compliqué, consigne ambiguë.
2. **Trop lourd** : trop d'écrans, trop de texte, répétitions, l'élève décroche.
3. **Trous dans l'explication** : un exercice demande une chose que la leçon n'a pas montrée.
4. **Messages d'erreur inutiles** : l'élève s'est trompé, lit le message, et ne sait toujours pas quoi corriger.
5. **Incohérences** : mot ou notation qui change d'un cours à l'autre, mot utilisé avant d'être expliqué.

## Approches envisagées

| Approche | Pour | Contre |
|---|---|---|
| (a) L'élève joue dans la vraie application (Playwright, écran lu en texte, clics) | Fidèle à ce que voit l'élève | 4 à 7 millions de tokens et 100 à 170 actions par cours |
| **(b) L'élève lit une version texte du cours, écran par écran** — **choisie** | ~100 000 tokens par cours ; permet un module entier d'un coup ; le moteur sait déjà sortir tous les textes | On ne touche pas les vrais boutons (ce n'est pas ce qu'on teste) |
| (c) Une seule IA relit le cours sans jouer de rôle | Encore moins cher | Ne montre pas où un élève faible ou distrait décroche |

Clément a choisi (b) après avoir vu le coût de (a).

## Comment ça marche

### 1. Le script « cours en texte »

Un script (TypeScript, lancé avec `tsx`, dans `scripts/`) prend un identifiant de cours ou de module et écrit, pour chaque cours, un fichier texte qui reproduit **les écrans dans l'ordre** :

- chaque partie de `course.parts` (explication, étapes, autres, question, pratique) devient un ou plusieurs écrans numérotés, avec leurs titres, sous-titres, consignes et blocs de texte. Les blocs math sont écrits en clair (LaTeX simple accepté) ;
- pour chaque question : les choix proposés s'il y en a, la **bonne réponse** et, pour chaque erreur typique connue (`errors`, `wrongValues`, erreurs prévues dans les étapes), **le message affiché** (comme les instantanés de textes des tests, ex. `c06.test.ts.snap`) ;
- les dessins (droite graduée, tableau, animation) sont décrits en une ligne (« [droite graduée de −5 à 5, saut de +3 depuis −2] ») ;
- les 5 exercices de fin : tirés avec une graine fixe (`seededRng`), même présentation que les questions ;
- la fiche mémo du cours si elle existe ;
- en tête, les **chiffres du cours** : nombre d'écrans, de mots, de questions.

Les bonnes réponses et les messages sont dans une partie séparée du fichier (ou un second fichier) que **l'orchestrateur** garde : l'élève ne reçoit un message qu'après avoir donné sa réponse (voir 3).

Le script calcule aussi, une fois, la **moyenne des cours publiés** (ceux de `MODULES`) : écrans, mots, questions. Elle sert de repère « trop lourd ».

### 2. Les personnages

Chaque personnage est un sous-agent lancé par la session (outil Agent), avec une consigne de rôle écrite dans la méthode.

**Ce que l'élève sait déjà** vient des documents existants (`docs/modules.md`, `module.md`, les « points importants » en haut des fichiers de cours) pour **tout ce qui précède** les cours testés :

Chaque élève retient une part des points importants de **tous les cours précédents** (modules d'avant et cours d'avant dans le même module), tirés au hasard avec une graine notée dans le rapport, qui liste aussi les points oubliés (décision de Clément) :

- **Élève fort** : retient **90 %** des points précédents. Lit vite, comprend bien, repère les ambiguïtés. S'il bloque, c'est le cours.
- **Élève moyen et distrait** : retient **50 %** des points précédents. Saute les longs textes, répond vite. Connaît le vocabulaire courant, pas les mots techniques vus une seule fois.
- **Élève en difficulté** : retient **25 %** des points précédents, en plus des bases du collège ; se trompe sur les signes des relatifs, priorités floues. Décroche dès qu'une phrase dépasse ~15 mots ou porte deux idées. Un mot technique (« membre », « inconnue », « intervalle ») qu'il n'a pas retenu, il ne le connaît pas tant que le cours testé ne l'a pas réexpliqué.

**Règle stricte pour les trois** : tout mot ou notion qui n'est ni dans sa liste ni expliqué plus tôt dans ce qu'il a lu, il ne le connaît pas et doit le signaler en citant la phrase. Dans les cours testés, il n'apprend **que par ce qu'il lit**. Il ne lit jamais les fiches.

**Prof de maths** : lit le cours (ou le module) en texte **avec** les fiches et le `module.md`, sans le jouer, sans voir les rapports des élèves. Donne son avis sur : (1) le cours enseigne-t-il ce que la fiche prévoit, ni plus ni moins ; (2) mots et notations justes et conformes au programme de seconde ; (3) ordre des explications logique.

### 3. Le déroulé d'un élève

L'élève lit les écrans **dans l'ordre, par paquets** (un cours à la fois pour un module) et, à chaque question, écrit sa réponse et une ligne sur ce qu'il pense de l'écran. L'orchestrateur compare ses réponses aux bonnes réponses et lui renvoie le message d'erreur correspondant quand il s'est trompé (message de l'erreur typique reconnue, sinon le message général), puis l'élève dit si le message l'a aidé. Pour un module, l'élève enchaîne les cours dans l'ordre : ce qu'il a appris (ou pas compris) au cours 1 le suit au cours 2.

Chaque élève passe **une seule fois**. Les 3 élèves et le prof travaillent en parallèle.

Détail laissé au constructeur : la taille exacte des paquets (un cours par tour est le point de départ), tant que l'élève ne voit jamais la bonne réponse avant d'avoir répondu.

### 4. Le rapport

Un seul rapport par lancement (un cours ou un module), en Markdown, enregistré à côté des fiches :
`docs/modules/NN-nom/tests/<cours-ou-module>-AAAA-MM-JJ.md`, commité sur la branche.

Dans cet ordre :
1. **Résumé en 5 lignes** : chaque élève est-il allé au bout, où a-t-il décroché ; chiffres du cours comparés à la moyenne des cours publiés (« 28 écrans et 900 mots, presque deux fois plus que d'habitude »).
2. **Problèmes, du plus grave au moins grave** — pour chacun : écran (n° et titre), phrase exacte citée, type (l'un des 5 points), élèves qui l'ont rencontré, pourquoi c'est un problème, proposition de réécriture. Pour un module : regroupés par cours, plus une partie « à travers le module » (notion mal comprise qui gêne plus loin).
3. **Avis du prof**, à part.
4. **Annexe** : parcours de chaque élève, une ligne par écran ; la liste des points oubliés par l'élève moyen.
5. **Coût réel** : tokens et actions de chaque sous-agent (donnés par le résultat de l'outil Agent).

### 5. La méthode enregistrée

Une skill de projet `.claude/skills/plus-ou-moins-tester-un-cours-avec-des-eleves/` (même forme que `plus-ou-moins-ecrire-un-cours`). Clément lance en disant « teste le cours X avec les élèves » ou « teste le module Y ». La skill décrit : lancer le script, préparer les connaissances de chaque élève, lancer les 4 sous-agents avec leurs consignes, faire l'aller-retour des réponses, assembler et commiter le rapport. Elle rappelle : rapport seulement, aucune modification de cours sans go.

Ajouter une ligne dans `CLAUDE.md` (section Modules et cours) qui pointe vers cette skill.

## Premier essai

Sur **« Tester une solution »** (`equations-tester-solution`, module « Essais »). Si le rapport ne convient pas à Clément, on ajuste la méthode avant de l'utiliser pour de vrai.

## Laissé au constructeur

- La forme exacte du fichier texte des écrans et la description des dessins.
- Le découpage du script (une fonction par type de partie) et ses tests (Vitest, dans `scripts/`, lancés par `npm test`).
- Le texte précis des consignes de rôle, tant qu'il respecte les profils et la règle stricte ci-dessus.
