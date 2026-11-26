---
name: plus-ou-moins-ecrire-un-cours
description: Use when writing, rewriting or reviewing a course (« cours ») of the Plus ou moins app — its lesson screens, small questions, guided examples, end exercises, error messages or feedback — for any module, or when a course feels empty, unclear, too fast, or "just shows examples without explaining". Reads one course sheet (fiche) and fills the app's existing screens; designs nothing visually.
---

# Écrire un cours (Plus ou moins)

## Principe

Un cours **explique avant de montrer, et fait faire juste après avoir expliqué** : une idée par écran, de vraies phrases, un rythme lent choisi par l'élève (« Suite »), un retour précis sur chaque erreur. L'élève : première spécialité maths, **dyslexique**, connaît les méthodes mais se trompe en calcul ; elle a **besoin des phrases** et de visuel, sans ton enfantin.

Un cours est **du contenu**, pas du design : l'apparence (boutons, couleurs, scènes) est fixée par l'appli. On remplit les écrans existants du catalogue ; on ne touche pas à `apps/web`.

## Ce que tu lis, et rien d'autre

1. **La fiche du cours** (`docs/modules/NN-nom/nom-du-cours.md`, chemin donné dans la demande). Elle contient règles, erreurs, techniques, reprises, niveaux.
2. **Ce qui a déjà été vu** : le `module.md` de **chaque module précédent**, le `module.md` du module courant et les **12 premières lignes (points importants) de chaque cours précédent du module** (`head -n 12`). Adapter le cours à cela : vocabulaire déjà donné, techniques déjà connues, reprises.
3. `references/catalogue-ecrans.md` : tous les écrans, scènes, actions, questions, signatures.
4. `references/gabarit-cours.ts.txt` : le cours type, déjà à la bonne forme.

**Ne pas ouvrir** : `docs/validation/` (archives), maquettes, snapshots, `types.ts`, `shared.ts`, le code des cours précédents, autres skills. Un doute précis se règle par un `grep` ciblé, jamais par une lecture entière. Si la fiche manque ou contredit le catalogue, le dire au lieu de deviner.

## Déroulé fixe (le gabarit le respecte)

12 à 15 **écrans pour apprendre** (tout ce qui précède l'annonce de la fin). **Jamais plus de 2 étapes de lecture d'affilée sans action.** Le nombre de règles (1 à 3) change, la forme non.

1. **Accroche** (2 ou 3 phrases) + question pour deviner (`decouverte`, ne compte pas).
2. **Idée de départ** : le *pourquoi* avant toute règle, avec au moins une action.
3. **Par règle** : explication pas à pas (3 étapes de préférence, 5 au plus ; une action ; la dernière pose l'encadré) + 1 ou 2 petites questions comptées (`small`, `joinPrevious`). Une règle à deux gestes ne se coupe que si chacun correspond à une erreur reconnue.
4. **Comparer deux cas** : A de ce cours, B du cours précédent (du module précédent pour le 1er cours d'un module ; rien pour le tout premier cours).
5. **Autres façons de faire** : 2 ou 3 techniques de la fiche, un exemple chiffré chacune, essai libre non noté. La technique principale va dans la fiche mémo ; l'élève choisit sa technique, seul le résultat est corrigé.
6. **Série de pratique** : 4 questions, l'aide diminue et les formats changent ; **une** vient du cours précédent (entraînement intercalé).
7. **Deux exemples guidés** : l'aide s'efface (1er presque résolu, 2e : 2 cases), calcul de départ toujours affiché.
8. **Annonce de la fin** (`annonceFin()`, texte fixe) puis **5 exercices de fin**, générés, sans aide, niveau 1, **uniquement la méthode de ce cours** (jamais de calculs d'anciens cours).
9. **Fiche mémo** : règle, 1 ou 2 exemples, l'erreur à éviter, technique principale.

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
| Texte | Phrases courtes et complètes, **gras** sur l'idée clé, dire *pourquoi*. Titre, phrase et encadré ne se répètent pas. Écrit pour être lu à voix haute (pas d'abréviation, calculs lisibles en clair) : le bouton Écouter lit titre, phrase et consigne. |
| Rythme | L'élève avance avec « Suite » ; rien ne défile seul. |
| Couleurs | Jaune = « regarde ici » (leçon seulement). Vert / rouge **seulement après une réponse**, **jamais d'indice par la couleur pendant une question**. Négatifs orange, positifs bleu, jamais rouge. Une scène affichée pendant une question est neutre (grise). |
| Réponses | Tout ce qu'on touche est **en bas de l'écran** ; la manière de répondre est **écrite dans la consigne**. Clavier toujours complet. |
| Retours d'erreur | **Chaque mauvaise réponse prévisible a son message**, précis (jamais la règle générale seule). Question pour deviner ratée : titre « Pas tout à fait, et c'est normal. », puis un message qui ne le répète pas. |
| Tolérance | Dans le cours qui enseigne une règle, aucune erreur sur cette règle n'est tolérée. |
| Fin ratée | Dit **quoi** a manqué et **quoi relire** : `ErrorDef.rule` rempli pour chaque erreur reconnue. |
| Déjà codé | Repassage des questions ratées, sons, notation : ne rien réinventer. |
| Écriture des calculs | Un nombre négatif est entre parenthèses, sauf s'il est le premier terme : −3 + (−5), 4 × (−7). |
| Niveaux | Propres à chaque cours : même méthode, plus difficile (nombres plus grands, plus de termes…). Le cours dit ce qui change. |
| Calcul-piège | Un par erreur reconnue, **sans sortir des nombres du niveau**. |
| Réponse hors liste | Classée « autre », avec l'explication générale du cours. Deux erreurs possibles : la première de la liste gagne. Les erreurs d'écriture (moins après le nombre, double signe…) sont vérifiées avant. |

À ne pas faire : un écran sans phrase ; un exemple guidé sans le calcul de départ ; un calcul découpé en boutons ; un cours de 21 écrans où elle lit plus qu'elle ne fait ; une phrase à deux trous.

## Méthode

Un seul assistant par cours, un cours à la fois. La qualité d'abord : prendre le temps qu'il faut.

**Modèle : Sonnet.** Si la conversation tourne sur un autre modèle (Opus, par exemple), **confier l'écriture du cours à un seul assistant lancé avec l'outil Agent, `model: "sonnet"`** (jamais deux en parallèle). Son message contient : le chemin de la fiche, les chemins des `module.md` et des cours précédents à lire (règle ci-dessus), la consigne d'appliquer ce skill (étapes 1 à 8) et de rendre un compte rendu court. La conversation principale relit le compte rendu, lance `npm test` et décide de la suite. Si la conversation est déjà sur Sonnet, écrire le cours directement, sans assistant.

1. Lire la fiche, le catalogue, le gabarit.
2. Écrire `packages/engine/src/courses/<module>/nom-du-cours.ts` en **un seul `Write`**, copié du gabarit.
3. L'inscrire dans l'`index.ts` du dossier (import + liste).
4. Écrire `packages/engine/test/courses/nom-du-cours.test.ts`, court : seulement ce qui dépend des maths du cours (`propertyChecks` pour le générateur et les calculs-pièges ; un test par message de `feedbackText`). La **forme** (nombre d'écrans, lectures d'affilée, règles des erreurs, pastille, exercices de fin) est vérifiée **automatiquement** par `test/courses/contract.test.ts` pour tout cours `unePhrase`. **Aucun test de texte, aucun instantané** : le porteur du projet relit chaque cours.
5. `cd packages/engine && npx vitest run test/courses/nom-du-cours.test.ts test/courses/contract.test.ts 2>&1 | tail -15` ; corriger ; recommencer.
6. **Points importants** : compléter la section « Points importants » en haut de la fiche (format dans `modele-fiche.md`, 8 lignes au plus), notamment « Vu dans ce cours » ; si c'est le dernier cours du module, compléter aussi le `module.md`.
7. À la fin, la suite complète une fois : `npm test 2>&1 | tail -8`. Si le cours allonge le calcul, vérifier la largeur du téléphone comme `apps/web/test/c05.test.tsx`.
8. Rendre compte en quelques lignes : écrans, note du cours, choix, reste à faire. Mise en ligne **par lot** de cours. Même échec 3 fois de suite : s'arrêter et le dire.

## Mode maquette (rare)

Seulement si la fiche signale un **nouveau type d'écran** (« Hors catalogue ») ou si le porteur du projet le demande. Copier la plus récente `docs/design/ecrans/cours-N-v2.html`, ne rien coder avant validation, puis ajouter la brique (`apps/web/src/components`, design system `docs/design/design-system/README.md`) **et** une ligne au catalogue, pour que les cours suivants la réutilisent.
