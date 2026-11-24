---
name: plus-ou-moins-creer-un-module-de-cours
description: Use when turning a math chapter (« chapitre » of the French lycée programme, e.g. second degré, fractions, dérivation) into one or more modules of the Plus ou moins app, when the user sends class documents (cours du prof, cahier de l'élève, exercices, contrôles) to build courses from, or when planning the order, prerequisites and cross-course reuse of a module's courses.
---

# Créer un module de cours (Plus ou moins)

## Principe

Un **chapitre** du programme devient **un module** de l'appli (plusieurs seulement si c'est justifié), et un module est une **suite ordonnée de cours**, une méthode par cours. Ce skill fait le **plan du module** ; chaque cours est ensuite **obligatoirement** écrit avec le skill `plus-ou-moins-ecrire-un-cours`. Les cours sont écrits un par un, mais c'est le module qui décide de ce qu'ils reprennent les uns des autres.

Vocabulaire : dans l'appli, un *module* (ex. « Calculs ») regroupe des *cours* (ex. Cours 0 à 7). Ce que le porteur du projet appelle parfois « un cours » (le chapitre du prof) est ici un **chapitre**.

## Sources (toujours les deux)

1. **Les documents fournis** : cours du prof, cahier de l'élève, fiches d'exercices, contrôles. Ils donnent l'ordre, le vocabulaire et les notations de la classe : les garder.
2. **Une recherche Internet systématique** :
   - le programme officiel de la classe (Éduscol, Bulletin officiel) : ne rien oublier ;
   - les méthodes et astuces que les profs ne donnent pas toujours (sites de profs, manuels, vidéos de méthode) ;
   - les erreurs classiques des élèves sur ce chapitre ;
   - ce qui servira l'année suivante (prérequis de la terminale ou du chapitre suivant).

Chaque élément du plan dit d'où il vient (document ou lien).

## Le plan du module (ce que le skill produit)

Un document `docs/validation/NN-module-<nom>.md` (NN = numéro suivant dans `docs/validation/`), publié aussi en page lisible (artefact HTML : convertir le Markdown en une page à une colonne, tableaux défilants, clair et sombre) pour validation. Les cours gardent une **numérotation continue dans toute l'appli**, d'un module à l'autre. En tête : un résumé simple d'une dizaine de lignes ; à la fin : « Questions pour toi » (5 au plus, chacune avec une recommandation). Il contient, dans cet ordre :

1. **Le chapitre** : intitulé, classe, documents reçus, objectifs (ce que l'élève saura faire en contrôle).
2. **Le découpage en modules** : **un seul module par défaut**. Proposer d'en faire plusieurs seulement si le module devient trop long ou si le chapitre a deux parties qu'on peut apprendre indépendamment ; donner les raisons. Le porteur du projet décide.
3. **Pour chaque module, la liste ordonnée des cours** (une nouvelle méthode = un nouveau cours) ; pour chaque cours :
   - la règle (en une phrase) et l'idée de départ (le *pourquoi*) envisagée ;
   - les erreurs classiques attendues (deviendront les erreurs reconnues) ;
   - l'astuce trouvée (deviendra la fiche mémo) ;
   - les **reprises** : ce qu'il reprend des cours précédents (voir ci-dessous) ;
   - ce qui rend ses niveaux 2 et 3 plus difficiles ;
   - les sources.
4. **Les reprises entre cours** (tableau cours × cours précédents).
5. **Ce qui manque dans l'appli** pour ce module (vérifié en lisant le code du moteur et de l'appli, sans le modifier) (nouvelle brique d'écran, nouveau type de calcul, reprise de calculs d'un autre cours dans le moteur…) : à développer au moment de coder le premier cours qui en a besoin.
6. **Les sources** (liste des liens et documents).

## Reprises entre cours (règles)

- **Reprise naturelle** : un cours contient souvent les méthodes d'avant (le cours « additionner plusieurs nombres » contient les additions des cours précédents). Le noter.
- **Comparer deux cas** et **série de pratique** : à partir du 2e cours du module, un des deux cas comparés et **une des 4 questions de la série de pratique viennent d'un cours précédent** (entraînement intercalé : elle apprend à reconnaître quelle règle s'applique).
- **Pas d'écran de rappel** des cours précédents : les cours se suivent, elle s'en souvient.
- **Jamais de calculs d'anciens cours dans les 5 exercices de fin** : ils valident ce cours-ci. Le mélange va dans la série de pratique, les révisions et l'entraînement.

## Méthode de travail (dans cet ordre)

1. **Lire** les documents fournis, puis faire la recherche Internet.
2. **Écrire le plan du module** et le publier ; **le faire valider avant tout cours**.
3. **Pour chaque cours, dans l'ordre**, appliquer `plus-ou-moins-ecrire-un-cours` (maquette → spec → code), en lui passant les reprises, erreurs, astuces et sources du plan. Rythme de validation : la maquette du **1er cours seule**, puis les suivantes **par 2 ou 3**.
4. **Coder par lots**, puis **une relecture et une mise en ligne par module**.

## Idées pour plus tard (ne pas développer sans demande)

- **Bilan de module / contrôle blanc** : une série qui mélange tous les cours du module, dans les conditions d'un contrôle.
- **Carnet d'erreurs** (version suivante de l'appli) : les erreurs fréquentes de l'élève, avec règle et exemple corrigé, rejouables.

## Erreurs fréquentes

| Ce qu'on serait tenté de faire | Ce qu'il faut faire |
|---|---|
| Suivre seulement le cours du prof | Garder son ordre et son vocabulaire, et compléter avec la recherche (astuces, erreurs classiques, année suivante) |
| Écrire les cours avant que le plan soit validé | Plan validé d'abord |
| Écrire un cours sans le skill cours | Toujours `plus-ou-moins-ecrire-un-cours` |
| Fixer un nombre de cours par module | Un module par défaut, coupe proposée et justifiée si besoin |
| Mettre des calculs d'anciens cours dans les exercices de fin | Seulement dans la série de pratique, les révisions et l'entraînement |
| Mettre deux méthodes dans un même cours | Une nouvelle méthode = un nouveau cours |
