---
name: plus-ou-moins-ecrire-un-cours
description: Use when writing, rewriting or reviewing a course (« cours ») of the Plus ou moins app — its lesson screens, small questions, guided example, end exercises, error messages or feedback — for any module, or when a course feels empty, unclear, too long, repetitive, or "just shows examples without explaining". Reads one course sheet (fiche) and fills the app's existing screens; designs nothing visually.
---

# Écrire un cours (Plus ou moins)

## Principe

Un cours **explique juste ce qu'il faut, puis fait faire** : une idée par écran, de vraies phrases, un rythme lent choisi par l'élève (« Suite »), un retour précis sur chaque erreur. **On apprend surtout en faisant** : le cours est court, l'exemple guidé et les exercices de fin portent l'essentiel. L'élève : première spécialité maths, **dyslexique**, connaît les méthodes mais se trompe en calcul ; elle a **besoin des phrases** et de visuel, sans ton enfantin. **Tout se fait sur l'écran** : elle écrit ses étapes (calcul par lignes, résolution ligne par ligne) ; seul ce que l'appli ne sait pas encore lire reste sur brouillon.

Un cours est **du contenu**, pas du design : l'apparence (boutons, couleurs, scènes) est fixée par l'appli. On remplit les écrans existants du catalogue ; on ne touche pas à `apps/web`.

## Ce que tu lis, et rien d'autre

1. **La fiche du cours** (`docs/modules/NN-nom/nom-du-cours.md`, chemin donné dans la demande). Elle contient règles, erreurs, techniques, reprises, niveaux.
2. **Ce qui a déjà été vu** : le `module.md` de **chaque module précédent**, le `module.md` du module courant (**dont ses « Règles de rédaction »**) et les **12 premières lignes (points importants) de chaque cours précédent du module** (`head -n 12`). Adapter le cours à cela : vocabulaire déjà donné, techniques déjà connues.
3. `references/catalogue-ecrans.md` : tous les écrans, scènes, actions, questions, signatures.
4. `references/gabarit-cours-guide.ts.txt` : **le cours type** (cours 2 du module Équations, validé par le porteur du projet le 2026-11-26 avec les cours 1 à 6), à copier. `references/gabarit-cours.ts.txt` est l'**ancien déroulé** (série de pratique, deux exemples) des cours du module Relatifs : ne plus le copier pour un nouveau cours.

**Ne pas ouvrir** : `docs/validation/` (archives), maquettes, snapshots, `types.ts`, `shared.ts`, le code des cours précédents, autres skills. Un doute précis se règle par un `grep` ciblé, jamais par une lecture entière. Si la fiche manque ou contredit le catalogue, le dire au lieu de deviner.

## Déroulé guidé (le gabarit le respecte)

**8 à 12 écrans pour apprendre** (tout ce qui précède l'annonce de la fin), **9 en visant**. **Jamais plus de 2 étapes de lecture d'affilée sans action**, **jamais plus de 2 écrans du même type d'affilée**. Le nombre de règles (1 à 3) change, la forme non.

1. **Accroche** (2 phrases) + question pour deviner (`decouverte`, ne compte pas). Court : elle donne envie et pose le problème.
2. **Par règle nouvelle** : explication pas à pas (2 ou 3 étapes, 5 au plus ; une action ; la dernière pose l'encadré). **Chaque règle montre un cas nouveau** : ne jamais refaire l'exemple de l'écran d'avant (balance, puis « opération contraire » sur les mêmes nombres).
3. **Petites questions** (`small`) : **une par règle nouvelle au plus, 2 en tout**, sur le cas nouveau de la règle. Pas de petite question qui redit l'écran précédent.
4. **Comparer deux cas** : **seulement si deux cas se confondent vraiment** et que la différence change quelque chose (x + 3 = 7 contre x − 3 = 7 : retirer ou ajouter). Jamais une comparaison décorative (un + contre un ×, un calcul à vérifier contre un calcul à trouver). Sinon, pas d'écran. Toujours `inPlace: true`, une phrase d'introduction, `note: ''`, deux lignes de conclusion, messages d'option d'une phrase.
5. **Exemple guidé** : **l'écran des exercices de fin**, avec l'aide du cours affichée d'office (`guided: true`), non noté, **un seul**. Il montre un cas que les écrans de leçon n'ont pas montré (résultat négatif…).
6. **Annonce de la fin** (`annonceFin()`, texte fixe) puis **5 exercices de fin**, générés, niveau 1, **uniquement la méthode de ce cours**, **avec les écrans qui font écrire** : `resoudre` (équations et inéquations), `calculer` (remplacer x et calculer par lignes). Une saisie d'un seul coup n'est qu'un format de révision. Dans le `CourseDef` : `endExercises: { count: 5, kind: 'saisie', mix: ['resoudre', …5 fois] }` **et** `formats: ['saisie', 'resoudre', 'resoudre']` (ou `'calculer'`), sinon la révision, l'entraînement et le calcul « du même genre » après une erreur retombent sur une saisie ; `customQuestion` renvoie la bonne question pour chaque type.
7. **Fiche mémo** : règle, 1 ou 2 exemples, l'erreur à éviter, technique principale.

**Il n'y a plus** de série de pratique de 4 questions, de deuxième exemple guidé, ni d'« Autres façons de faire » : les exercices et l'indice jouent ce rôle. (Les cours du module Relatifs, déjà en ligne, gardent l'ancien déroulé : ne pas les « corriger » sans demande.)

**Répétition (règle dure)** : un même geste (« on retire le même nombre des deux côtés », « on compte les − ») est montré **2 ou 3 fois au plus dans tout le cours** : une fois au début, une fois au milieu, au plus une fois vers la fin. **Jamais 3 écrans d'affilée qui disent la même chose.** Avant de garder un écran, se demander ce qu'il apprend que les autres n'ont pas déjà appris ; sinon, le supprimer.

Le niveau du générateur agrandit les nombres **et** allonge le calcul quand le cours s'y prête, sans dépasser la largeur d'un téléphone (en cas de conflit, la largeur gagne : le dire dans « Choix faits »).

## Étapes interactives

Une action remplace « Suite » : erreur → message court, elle réessaie, rien n'est noté.
- **Phrase à trous** : remplace une phrase de l'explication, **un seul trou**, des choix qui se lisent dans la phrase (« Un bond de −3 va vers la [gauche | droite]. »), jamais des valeurs nues.
- **Ce qui se touche se voit** : pastilles visibles, consigne écrite au-dessus, cibles de 44 px au moins.
- **Une phrase à la fois** (`unePhrase: true`, toujours) : « Suite » remplace la phrase ; **la scène porte la continuité**, chaque phrase se comprend seule ; ce dont la phrase parle est surligné (`hl`) dans la scène.

## Règles de forme (toutes obligatoires)

| Sujet | Règle |
|---|---|
| Écran | Jamais vide : une **scène** occupe le haut dès la 1re étape et se transforme. |
| Texte | Phrases courtes et complètes, **gras** sur l'idée clé, dire *pourquoi*. Titre, phrase et encadré ne se répètent pas ; **un message n'est écrit qu'une fois par écran** (pas de « Juste » dans l'écran puis encore en bas). Écrit pour être lu à voix haute (pas d'abréviation, calculs lisibles en clair) : le bouton Écouter lit titre, phrase et consigne. |
| Rythme | L'élève avance avec « Suite » ; rien ne défile seul. |
| Couleurs | Jaune = « regarde ici » (leçon seulement). Vert / rouge **seulement après une réponse**, **jamais d'indice par la couleur pendant une question**. Une scène affichée pendant une question est neutre (grise). Négatifs orange, positifs bleu dans les calculs de nombres ; **dans les équations, tout reste noir** (indigo pour l'opération faite, orange pour un sens d'inégalité qui change). |
| Réponses | Tout ce qu'on touche est **en bas de l'écran** ; la manière de répondre est **écrite dans la consigne**. Clavier toujours complet. |
| Écrire ses étapes | Les exercices de fin acceptent **toute ligne juste**, quelle que soit la méthode (plusieurs opérations d'un coup, x à droite…) ; seule une ligne recopiée est refusée. L'opération faite s'affiche sous la ligne, la méthode du cours est donnée par l'indice (marqué « avec aide ») et par « Voir la méthode du cours ». |
| Retours d'erreur | **Chaque mauvaise réponse prévisible a son message**, précis (jamais la règle générale seule). Question pour deviner ratée : titre « Pas tout à fait, et c'est normal. », puis un message qui ne le répète pas. |
| Tolérance | Dans le cours qui enseigne une règle, aucune erreur sur cette règle n'est tolérée. |
| Fin ratée | Dit **quoi** a manqué et **quoi relire** : `ErrorDef.rule` rempli pour chaque erreur reconnue (`partIndex` = place de l'écran d'étapes de la règle dans `parts`). |
| Déjà codé | Repassage des questions ratées, sons, notation : ne rien réinventer. |
| Écriture des calculs | Un nombre négatif est entre parenthèses, sauf s'il est le premier terme : −3 + (−5), 4 × (−7). |
| Niveaux | Propres à chaque cours : même méthode, plus difficile (nombres plus grands, plus de termes…). Le cours dit ce qui change. |
| Calcul-piège | Un par erreur reconnue, **sans sortir des nombres du niveau**. |
| Réponse hors liste | Classée « autre », avec l'explication générale du cours. Deux erreurs possibles : la première de la liste gagne. Les erreurs d'écriture (moins après le nombre, double signe…) sont vérifiées avant. |

À ne pas faire : un écran sans phrase ; un exemple guidé sans le calcul de départ ; un calcul découpé en boutons ; un cours où elle lit plus qu'elle ne fait ; trois écrans qui disent la même chose ; une comparaison où rien ne se confond ; une phrase à deux trous.

## Méthode

La qualité d'abord, mais **court** : un cours compte une quinzaine d'écrans, exercices compris.

**Modèle : Sonnet.** Si la conversation tourne sur un autre modèle (Opus, par exemple), **confier l'écriture à un assistant lancé avec l'outil Agent, `model: "sonnet"`**. Si la conversation est déjà sur Sonnet, écrire le cours directement.

- **Un assistant peut écrire deux cours à la suite** : le 2e coûte moins (documents lus une fois). Mesures du 2026-11-26 sur Sonnet : ancien déroulé, un cours seul 190 000 à 200 000 jetons et 32 à 43 actions, deux cours à la suite 133 000 par cours ; **déroulé guidé, deux cours à la suite (fiches comprises) 193 000 jetons et 40 actions, soit environ 97 000 par cours**. La consommation se lit à la fin de l'assistant, pas dans son compte rendu.
- **Plusieurs assistants en parallèle** : possible si chacun a **son propre espace de travail** (`isolation: "worktree"`) et **part de la branche en cours** (leur message demande `git merge --ff-only <branche>` avant tout, puis `npm ci`) ; chacun commite sur sa branche sans pousser ; la conversation principale fusionne et résout à la main les conflits de `essais/index.ts`.
- Son message contient : le chemin de la fiche (ou la demande de l'écrire), les chemins des `module.md` et des cours précédents à lire, la consigne d'appliquer ce skill, les décisions du porteur du projet déjà prises, la consigne de ne pas toucher aux fichiers communs (ou de le dire), et de rendre un compte rendu court. La conversation principale relit le compte rendu, lance `npm test` et décide de la suite.

1. Lire la fiche, le catalogue, le gabarit guidé.
2. Écrire `packages/engine/src/courses/<module>/nom-du-cours.ts` en **un seul `Write`**, copié du gabarit guidé.
3. L'inscrire dans l'`index.ts` du dossier (import + liste).
4. Écrire `packages/engine/test/courses/nom-du-cours.test.ts`, court : seulement ce qui dépend des maths du cours (`propertyChecks` pour le générateur et les calculs-pièges ; un test par message de `feedbackText`). La **forme** (nombre d'écrans, lectures d'affilée, règles des erreurs, pastille, exemple guidé, exercices de fin) est vérifiée **automatiquement** par `test/courses/contract.test.ts` pour tout cours `unePhrase`. **Aucun test de texte, aucun instantané** : le porteur du projet relit chaque cours.
5. `cd packages/engine && npx vitest run test/courses/nom-du-cours.test.ts test/courses/contract.test.ts 2>&1 | tail -15` ; corriger ; recommencer.
6. **Points importants** : compléter la section « Points importants » en haut de la fiche (format dans `modele-fiche.md`, 8 lignes au plus), notamment « Vu dans ce cours » ; si c'est le dernier cours du module, compléter aussi le `module.md`.
7. À la fin, la suite complète une fois : `npm test 2>&1 | tail -8`. Si le cours allonge le calcul, vérifier la largeur du téléphone comme `apps/web/test/c05.test.tsx`.
8. Rendre compte en quelques lignes : écrans, choix faits sans document, reste à faire. Mise en ligne **par lot** de cours. Même échec 3 fois de suite : s'arrêter et le dire.
9. **Avant de dire qu'une pull request est « à jour », lire son état** (`merged`). Si elle a été fusionnée, tout ce qui est poussé ensuite sur la branche n'est dans aucune pull request : remettre la branche à jour avec `main` (`git merge origin/main`) et ouvrir une **nouvelle** pull request. Un cours n'est « en ligne » que lorsque le commit du build, affiché en bas du suivi, est celui de `main`.

## Mode maquette (rare)

Seulement si la fiche signale un **nouveau type d'écran** (« Hors catalogue ») ou si le porteur du projet le demande. Copier la plus récente maquette de `docs/design/ecrans/` (`equations-resolution-ligne.html` : états du clavier, de la feuille de lignes, de l'indice), ne rien coder avant validation, puis coder la brique (`apps/web/src/components`, design system `docs/design/design-system/README.md`) avec ses tests **et** ajouter une ligne au catalogue, pour que les cours suivants la réutilisent. Pour **voir** un cours ou une maquette : monter les vrais écrans sur une page de test temporaire (`ActivityScreen` avec `courseRunItems`), prendre des captures avec Playwright (bonne réponse cochée à chaque écran), les assembler dans une page de comparaison ; supprimer la page de test ensuite.
