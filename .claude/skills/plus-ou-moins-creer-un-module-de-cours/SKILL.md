---
name: plus-ou-moins-creer-un-module-de-cours
description: Use when turning a math chapter of the French lycée programme (e.g. équations, suites, second degré, fractions) into a module of the Plus ou moins app, when the user sends class documents (cours du prof, cahier, exercices, contrôles) to build from, or when detailing one course of a module before it is written. Produces the module folder (module.md with the list of courses) and, on request, one sheet (fiche) per course; knows no module by heart.
---

# Créer un module de cours (Plus ou moins)

## Principe

Entrée : **un chapitre du programme** et les documents de classe. Sortie : un **dossier de module** `docs/modules/NN-nom/` avec un `module.md` : le descriptif global du module et la **liste ordonnée de ses cours** (une méthode par cours). Chaque cours est ensuite détaillé dans sa **fiche** (`nom-du-cours.md`, même dossier), puis écrit avec `plus-ou-moins-ecrire-un-cours`.

Le skill décide **ce qui est important** ; il ne rédige aucun texte d'écran. Ce skill ne contient **aucun plan de module** : la liste des modules, leur ordre et leur état sont dans **`docs/modules.md`**, qu'il lit en premier et met à jour en dernier.

Vocabulaire : un *module* regroupe des *cours* ; ce que le porteur du projet appelle parfois « un cours » (le chapitre du prof) est ici un **chapitre**.

## Ce qu'il lit (et rien d'autre)

1. `docs/modules.md`, puis le **`module.md` de chaque module précédent** (ce que l'élève a déjà vu : vocabulaire, techniques, limites) ; pour les modules plus avancés, rien d'autre.
2. Les **documents de classe** fournis (ordre, vocabulaire, notations à garder).
3. Une **recherche Internet** : programme officiel de la classe (Éduscol, Bulletin officiel), méthodes et astuces, erreurs classiques, ce qui servira l'année suivante. Les programmes sont **téléchargés dans `docs/sources/`** (PDF + `pdftotext -layout`) et lus ; citer le texte et la page, jamais un extrait de recherche. Signaler tout écart avec le cours du prof. Chaque élément du plan dit d'où il vient.

## 1. Définir le module : `docs/modules/NN-nom/module.md`

NN = numéro du module dans `docs/modules.md`. Contenu (court, 60 lignes au plus) :

- **Points importants du module** (en haut) : ce que l'élève saura faire en contrôle ; vocabulaire et notations de la classe ; techniques enseignées ; limites volontaires ; ce qui sert aux modules suivants. Ébauché ici, **complété à la fin du module** avec ce qui a vraiment été enseigné.
- **Les cours dans l'ordre** : tableau titre · règle en une phrase · pourquoi un cours à part. **Nouvelle méthode = nouveau cours**, jamais deux méthodes dans un cours. Un module par défaut ; plusieurs seulement s'il est trop long ou si deux parties s'apprennent indépendamment (raisons données).
- **Règles de rédaction des cours** (court) : reprendre celles du skill `plus-ou-moins-ecrire-un-cours` (cours courts, répétition limitée, étapes écrites sur l'écran), plus les retours du porteur du projet propres au module.
- **Ce qui manque dans l'appli** : types d'écran absents de `.claude/skills/plus-ou-moins-ecrire-un-cours/references/catalogue-ecrans.md` (graphes, tableaux de signes, schémas, problèmes en mots, saisie d'une inconnue…). Les décider **ici**, avant les fiches : un nouveau type d'écran passe par une maquette.
- **Questions pour toi** (5 au plus, chacune avec une recommandation) et **Sources**.

À valider par le porteur du projet **avant toute fiche**. Pas de page HTML sauf demande. Ensuite : créer le dossier, ajouter la ligne à `docs/modules.md`.

## 2. Détailler un cours : `nom-du-cours.md`

Sur demande, juste avant d'écrire un cours : une fiche au format de `references/modele-fiche.md` (40 lignes au plus), dans le dossier du module. Le skill lit alors le `module.md` du module et le **début (points importants) de chaque cours précédent du module** pour adapter le cours à ce qui a déjà été vu.

## Numéros et reprises

- **Identifiant de cours = un nom sans numéro** (`equations-premier-degre`), **stable**, qui sert aussi de nom de fichier (fiche `.md`, code `.ts`, test). Jamais de numéro dans un identifiant : insérer un cours ne doit rien casser. L'ordre d'apprentissage vient de `docs/modules.md` et de la liste du `module.md` ; **le numéro affiché à l'élève (« Cours 3 ») est calculé** par l'appli : place du cours dans son module, qui repart de 1. Les cours déjà existants gardent leur ancien identifiant (`c04-soustraire`…), car la progression de l'élève y est attachée. **Dans un texte d'écran, ne jamais citer un autre cours par son numéro** : le désigner par son titre.
- **Reprise naturelle** : un cours contient souvent les méthodes d'avant ; le noter dans la fiche.
- **Comparer deux cas** (déroulé guidé, voir `plus-ou-moins-ecrire-un-cours`) : seulement si deux cas **se confondent vraiment** (x + 3 = 7 contre x − 3 = 7) ; la fiche dit lesquels ou « aucun ». **Plus de série de pratique** : le mélange d'anciens calculs se fait par les révisions et l'entraînement. (Ancien déroulé, cours du module Relatifs : un cas et une des 4 questions venaient d'un cours précédent.)
- **Jamais de calculs d'anciens cours dans les 5 exercices de fin** : le mélange va dans la série de pratique, les révisions et l'entraînement.

## Ne pas faire

Suivre seulement le cours du prof (garder son ordre, compléter avec la recherche) ; écrire une fiche avant la validation du `module.md` ; une seule astuce par cours ; citer le programme sans le PDF ; copier ici un plan, un ordre ou des numéros de modules.
