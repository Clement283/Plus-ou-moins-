# Catalogue des écrans (tout ce qu'un cours peut utiliser)

L'apparence est **fixée par l'appli** (`apps/web`, design system `docs/design/design-system/`) : un cours ne décrit que du **contenu** avec les briques ci-dessous. On ne touche jamais à `apps/web` pour écrire un cours. Les signatures sont dans `packages/engine/src/courses/calculs/shared.ts` ; ne pas relire ce fichier ni `types.ts` : tout ce qu'il faut est ici.

Tous les helpers s'importent de `./shared`. Toujours `M` (−) dans les textes, `txt(n)` pour écrire un entier (−5), `toText(expr)` pour un calcul en texte, `toLatex(expr)` pour LaTeX.

## Écrans de la leçon (`parts`, dans l'ordre du gabarit)

| Écran | Helper | Remarque |
|---|---|---|
| Accroche + question pour deviner | `texted(decouverte(choix(ex, consigne, options3([libellé, message]…), indiceJuste, calcLatex)), { title, intro: [phrases], mention: NOT_COUNTED_GUESS })` | ne compte pas, ne repasse pas |
| Explication pas à pas | `etapes(titre, [step(phrase, { scene, after, action, rule })…])` | 3 étapes (5 au plus) ; la dernière : `step(undefined, { scene, rule: { n, text } })` |
| Petite question (comptée) | `lecon(small(ex, calcLatex, consigne, [[libellé, message]…], indiceJuste))` | 2 sur un écran : `texted(lecon(…), { joinPrevious: true })` |
| Comparer deux cas | `texted(decouverte(choix(…)), { title, intro, mention: NOT_COUNTED_UNDERSTAND, compare: { a, b, note, highlight, after } })` | B vient du cours précédent |
| Autres façons de faire | `autres({ title, recap, intro, techniques: [{ name, quand, example, how, essai }], outro })` | `essai.kind` : `'saisie'` (valeurs → message) ou `'choix'` |
| Série de pratique | `pratique(titre, [{ question, texts: { consigne, intro, above } } ×4], phraseDeTransition)` | notée ; une question du cours précédent |
| Exemple guidé | `etapes('Exemple 1 sur 2', …)` puis `texted(exemple(trou(ex, '= \\square', valeurCachée)), { consigne, above: [lignes LaTeX], help })` | aide qui s'efface : exemple 1 presque résolu, exemple 2 : 2 cases |
| Annonce de la fin | `annonceFin()` | texte fixe, jamais réécrit |

## Scènes (le haut de l'écran, `scene` / `after` d'un `step`)

- `oneScene('−3 + ', hl('5'))` : un calcul ; `linesScene(['ligne 1'], ['ligne 2'])` : résolution ligne à ligne (la dernière est surlignée).
- `hl('x')` surligne ce dont la phrase parle (jaune, **leçon seulement**). Un morceau peut aussi être `{ t, anim: 'pin'|'bump'|'slide' }` ou `{ t, dim: true }`.
- Autres layouts (`Scene.layout`) : `'row'`, `'pairs'` (mal écrit / bien écrit, avec `tag`), `'line'` (droite graduée : `scene.line = { from, to, jumps:[{from, by, after?}], highlight?, marks?, tone }`).
- `after` : scène montrée dès que l'action est réussie. Sans `scene`, la précédente reste affichée.

## Actions d'une étape (`action`, remplacent « Suite » ; rien n'est noté)

| Action | Écriture |
|---|---|
| Phrase à trous (un seul trou) | `trouOf('… [ ? ] …', ['juste', 'faux'], indiceJuste, { 1: 'message du choix faux 1' })` |
| Je comprends | `{ type: 'comprends' }` (lecture d'une ligne résolue) |
| Toucher une graduation | `{ type: 'graduation', consigne, target, errors: [{ at: [..], message }], fallback }` |
| Toucher un morceau d'un calcul | `{ type: 'morceau', consigne, calc: indiceDeLaLigne, target: [indices de tokens], errors, fallback }` |
| Toucher l'endroit d'un symbole | `{ type: 'endroit', …même forme…, gaps?: [indices d'espaces proposés] }` |

## Questions (comptées sauf `decouverte`)

`saisie(ex)` : taper le résultat. `trou(ex, '= \\square', valeur)` : une case dans une résolution (`above` = lignes déjà posées). `signBox(ex, positif, idErreurSigne)` : boutons + / −. `choix` / `small` : choix en bas de l'écran. `droiteQ(ex, {from,to}, jumps)` : toucher l'arrivée sur la droite. `ordre(ex, étiquettes, ordreAffiché)` : remettre dans l'ordre. `resoudre` (module Équations) : `{ kind: 'resoudre', ex, start: equation(…) }` (`packages/engine/src/math/equation.ts`) ; l'élève écrit chaque ligne en entier (clavier : chiffres, x, + − ÷, = ou < > ⩽ ⩾), avec sa méthode ; chaque ligne est jugée (`judgeTypedLine`), l'opération faite s'affiche sous chaque membre, « Un indice » donne l'étape du cours et marque « avec aide » ; juste si aucune ligne fausse en route (maquette `docs/design/ecrans/equations-resolution-ligne.html`, validée). Construit par le cours (`customQuestion`), pas de générateur commun. Formats de révision (`formats` du `CourseDef`) : `saisie`, `droite`, `signe`, `vraifaux`, `erreur` (exemple : `c04-soustraire.ts`).

## Erreurs reconnues

`buildErrors([ErrorSpec…], resolution)` : par erreur, `id`, `family`, `detect(ex, réponseDonnée)`, `text(ex)` (message précis), `draw(level, rng)` (calcul-piège), `sample(ex)` (réponse fausse typique), `alsoWrong?`, `wrongLines?` (résolution fausse). Chaque erreur reçoit `rule: { n, label, partIndex }` : `partIndex` = indice de la partie `etapes` qui enseigne la règle, `label` = son titre exact. Outils : `isOpposite`, `absIs`, `is`, `intOf`, `redraw`, `stepped`, `resultLine`. `feedbackText(q, outcome)` : message par réponse prévisible aux questions qui comptent (`o.correct`, `o.given`, `o.errorFamily`).

## Générateur

`generate(level, rng)` renvoie un `Exercise` (`makeExercise(ID, level, expr)`), réponse **toujours un entier juste**. Le niveau agrandit les nombres **et** allonge le calcul si le cours s'y prête, sans dépasser la largeur d'un téléphone. Les niveaux 2 et 3 servent aux révisions et à l'entraînement ; leçon et exercices de fin : niveau 1. Outils : `draw(rng, [min, max])`, `signs(rng)`, `chain('+'|'*', nombres)`, `SIZES`.

## Hors catalogue ?

Un nouveau type d'écran (graphe, tableau, schéma…) = **mode maquette** : copier la plus récente `docs/design/ecrans/cours-N-v2.html`, ne rien coder avant validation, puis ajouter la brique (composant dans `apps/web/src/components`) **et** une ligne dans ce catalogue pour qu'elle serve aux cours suivants.
