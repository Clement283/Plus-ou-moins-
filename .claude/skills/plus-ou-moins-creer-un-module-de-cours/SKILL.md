---
name: plus-ou-moins-creer-un-module-de-cours
description: Use when turning a math chapter of the French lycée programme (e.g. second degré, fractions, équations, suites) into one or more modules of the Plus ou moins app, when the user sends class documents (cours du prof, cahier, exercices, contrôles) to build courses from, or when planning the order, prerequisites and reuse between courses. Produces the module plan and one short sheet (fiche) per course; knows no module by heart.
---

# Créer un module de cours (Plus ou moins)

## Principe

Entrée : **un chapitre du programme** (intitulé, classe) et les documents de classe. Sortie : **le chapitre découpé en un module ou plusieurs**, chacun une **suite ordonnée de cours** (une méthode par cours), et pour chaque cours une **fiche** (`references/modele-fiche.md`). Ce skill ne contient **aucun plan de module** : la liste des modules, leur ordre, leurs numéros et leur état sont dans **`docs/modules.md`**, qu'il lit en premier et met à jour en dernier.

Le skill décide de **ce qui est important dans chaque cours** ; il ne rédige aucun texte d'écran. Chaque cours est ensuite écrit avec `plus-ou-moins-ecrire-un-cours`, qui lit uniquement la fiche : une fiche claire et courte est ce qui fait un bon cours.

Vocabulaire : un *module* de l'appli regroupe des *cours* ; ce que le porteur du projet appelle parfois « un cours » (le chapitre du prof) est ici un **chapitre**.

## Sources (toujours les deux)

1. **Les documents fournis** : ordre, vocabulaire et notations de la classe, à garder.
2. **Une recherche Internet** : programme officiel de la classe (Éduscol, Bulletin officiel), méthodes et astuces que les profs ne donnent pas toujours, erreurs classiques, ce qui servira l'année suivante.
   - Les programmes sont **téléchargés dans `docs/sources/`** (PDF + `pdftotext -layout`) et lus ; les points du plan citent le texte et la page. Ne jamais citer un extrait de recherche. Signaler tout écart entre le plan et le programme.

Chaque élément du plan dit d'où il vient.

## Le plan du module : `docs/validation/NN-module-<nom>.md`

NN = numéro suivant dans `docs/validation/`. Résumé d'une dizaine de lignes en tête, puis **« Points importants du chapitre »** (ce qui est à relire et à valider : découpage, écarts avec le cours du prof, choix non évidents, risques), « Questions pour toi » (5 au plus, chacune avec une recommandation) à la fin. À valider **avant tout cours**. Pas de page HTML sauf si le porteur du projet la demande. Contenu :

1. **Le chapitre** : intitulé, classe, documents reçus, objectifs (ce que l'élève saura faire en contrôle).
2. **Le découpage** : **un seul module par défaut** ; plusieurs seulement si le module devient trop long ou si deux parties s'apprennent indépendamment (raisons données). Il décide.
3. **Pour chaque module, les cours dans l'ordre** (nouvelle méthode = nouveau cours, jamais deux méthodes dans un cours) : règle en une phrase, idée de départ (*pourquoi*), erreurs classiques attendues, **2 à 4 techniques** (nom, quand, exemple chiffré, piège évité ; laquelle va dans la fiche mémo, lesquelles deviennent des étapes ou « Autres façons de faire »), reprises, ce qui rend les niveaux 2 et 3 plus durs, sources.
4. **Les reprises entre cours** (tableau).
5. **Ce qui manque dans l'appli** : types d'écran absents de `.claude/skills/plus-ou-moins-ecrire-un-cours/references/catalogue-ecrans.md` (graphes, tableaux, schémas, problèmes en mots…). Les chapitres qui ne sont pas du calcul en ont presque toujours besoin : les décider **ici**, avant les fiches, car un nouveau type d'écran passe par une maquette.
6. **Les sources.**

## Les fiches : `docs/fiches/cNN-nom.md`

Une par cours, au format de `references/modele-fiche.md`, écrites **après validation du plan**. Elles reprennent du plan ce qui sert à écrire le cours, rien de plus (40 lignes au plus). La section « Points importants » y est ébauchée ici (règles, pièges, écarts avec le cours du prof) et complétée par le skill cours à la fin.

## Numéros, ordre, registre

- L'ordre des modules et les numéros de cours viennent de `docs/modules.md`. Si le plan change des numéros déjà donnés, ou si l'ordre voulu les rend incohérents, **le dire avant d'écrire**.
- À la fin : mettre à jour `docs/modules.md` (module ajouté, cours, état, chemin du plan), puis `npx tsx scripts/points-importants.ts`.

## Reprises entre cours

- **Reprise naturelle** : un cours contient souvent les méthodes d'avant ; le noter.
- **Comparer deux cas** et **série de pratique** : **quand c'est utile**, un cas et une des 4 questions viennent d'un cours précédent (deux méthodes qui se confondent, une règle à reconnaître). Si deux cours n'ont aucun lien, on n'en force pas : le dire dans la fiche. Le 1er cours d'un module peut chercher son lien dans le module précédent (`docs/modules.md`).
- Pas d'écran de rappel des cours précédents.
- **Jamais de calculs d'anciens cours dans les 5 exercices de fin** : le mélange va dans la série de pratique, les révisions et l'entraînement.

## Méthode

1. Lire `docs/modules.md`, les documents fournis, puis faire la recherche.
2. Écrire le plan, le faire valider.
3. Écrire les fiches ; mettre à jour le registre.
4. Les cours s'écrivent ensuite **un par un** avec `plus-ou-moins-ecrire-un-cours`, (aucune maquette sauf nouveau type d'écran), puis une relecture et une mise en ligne **par lot**.

## Idées pour plus tard (ne pas développer sans demande)

Bilan de module / contrôle blanc ; carnet d'erreurs.

## Ne pas faire

Suivre seulement le cours du prof (garder son ordre, compléter avec la recherche) ; écrire un cours avant la validation du plan ; une seule astuce par cours ; citer le programme sans le PDF ; mettre des calculs d'anciens cours dans les exercices de fin ; copier ici un plan, un ordre ou des numéros de modules (ils vivent dans `docs/modules.md`).
