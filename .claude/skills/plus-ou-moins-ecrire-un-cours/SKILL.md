---
name: plus-ou-moins-ecrire-un-cours
description: Use when writing, rewriting or reviewing a course (« cours ») of the Plus ou moins app — its lesson screens, small questions, guided examples, end exercises, error messages or feedback — for any module (relatifs, priorités, fractions, second degré…), or when a course feels empty, unclear, too fast, or "just shows examples without explaining".
---

# Écrire un bon cours (Plus ou moins)

## Principe

Un cours **explique avant de montrer, et fait faire juste après avoir expliqué**. Une idée par écran, de vraies phrases, un rythme lent choisi par l'élève (« Suite »), et un retour précis sur chaque erreur. Le **Cours 0 v2** est la référence : quand un doute se pose, faire comme lui.

L'élève : première spécialité maths, **dyslexique**. Elle connaît les méthodes mais se trompe en calcul. Elle a **besoin des phrases** (comprendre une consigne fait partie de ce qu'elle travaille) et de visuel, sans ton enfantin.

## Sources à lire avant d'écrire

| Quoi | Où |
|---|---|
| Le modèle complet (textes, ordre, retours d'erreur) | `docs/validation/06-cours-relatifs.md`, partie « Cours 0 » v2 |
| Les règles transversales (couleurs, repassage, réponses en bas, note…) | `docs/validation/08-decisions-ecrans.md` n° 20 à 31 |
| Le code du modèle (briques, scènes, messages, tests) | `packages/engine/src/courses/calculs/c00-bien-ecrire.ts`, `shared.ts`, `test/courses/c00.test.ts` |
| Les maquettes cliquables (moteur `reveal` / `quiz` / `typed` / `trous`, bouton « Revoir », droite graduée SVG `line()`) | `docs/design/ecrans/cours-0-v2.html`, `docs/design/ecrans/cours-1-v2.html` (partir de la plus récente) |
| La version actuelle du cours à réécrire | sa partie dans le doc 06 + son fichier `cXX-*.ts` |

## Déroulé d'un cours (recette)

Écrire les écrans dans cet ordre. Le nombre de règles change d'un cours à l'autre, la forme reste la même.

1. **Accroche** : 2 ou 3 phrases (à quoi sert ce cours, ce qu'on va apprendre) + **une question pour deviner** (`decouverte`, ne compte pas) sur un cas typique.
2. **L'idée de départ** : le *pourquoi* de la méthode, avant toute règle (Cours 0 : « le − a deux rôles » ; Cours 1 : par exemple une dette, une droite graduée). Explication pas à pas (`etapes`).
3. **Pour chaque règle** :
   - une **explication pas à pas** (`etapes`, 3 à 5 étapes) : la scène montre le calcul qui se transforme, les phrases expliquent chaque transformation, la dernière étape pose l'**encadré de la règle** (`rule`) ;
   - une « règle » du doc 06 qui contient deux gestes (ex. « j'additionne… et je garde le signe ») peut être coupée en deux règles **si chacune correspond à une erreur reconnue** ; sinon, une seule règle. Le dire dans les questions « À décider » ;
   - si utile, un écran d'**exemples** (`layout: 'pairs'` ou une suite de calculs) ;
   - **une ou deux petites questions** (`choix` avec `small`), qui comptent. Varier : parfois deux questions sur le même écran (`joinPrevious`), parfois une question à deviner *avant* l'explication quand l'élève peut trouver seule.
4. **Récapitulatif** de toutes les règles, chacune avec un exemple juste et un faux (`recap`).
5. **À toi** : un ou deux exercices de leçon variés (Classer, Quelle règle ?, étiquettes, Réécris…).
6. **Exemples guidés** (2) : le calcul de départ est **toujours affiché** ; l'élève fait une vraie action. Le 1er guide davantage (cases tapées l'une après l'autre, chacune avec un sens), le 2e moins (résultat ou calcul tapé seul, avec « Étape par étape » si erreur).
7. **Annonce de la fin** : ce qu'il faut réussir (4 exercices de fin sur 5 **et** 80 % sur tout le cours) et ce qui se passe sinon (série de validation, sans refaire la leçon).
8. **5 exercices de fin**, générés, sans aide, comme en contrôle.

## Règles de forme (toutes obligatoires)

| Sujet | Règle |
|---|---|
| Écran vide | Jamais. Une **scène** (grand calcul ou image) occupe le haut dès la 1re étape et se transforme ; les phrases s'empilent dessous. |
| Texte | Phrases courtes et complètes, **gras** sur l'idée clé, une idée par écran. Dire *pourquoi*, pas seulement *quoi*. Pas de répétition titre / phrase / encadré mot pour mot. |
| Rythme | L'élève avance avec « Suite » ; « Revoir » rejoue l'animation. Rien ne défile seul. |
| Couleurs | Surligneur jaune = « regarde ici » (leçon seulement). Vert / rouge **seulement après une réponse**. **Aucune couleur qui donne un indice** pendant une question. Si les signes doivent être distingués (droite graduée) : négatifs **orange**, positifs **bleu**, jamais rouge. Les mêmes dans tous les cours. |
| Scènes pendant une question | Une scène (droite graduée, image) affichée pendant une question est **neutre** : grise, sans couleur de signe ni surlignage. Les couleurs reviennent après la réponse. |
| Réponses | Tout ce qu'on touche est **en bas de l'écran** ; la manière de répondre (toucher, glisser, taper) est **écrite dans la consigne**. Étiquettes à ordonner : on les **touche dans l'ordre** (toucher une étiquette placée la retire) ; Classer : glisser-déposer + toucher. |
| Clavier | Toujours complet (chiffres, + − × ÷, parenthèses) : il ne dicte jamais la réponse. |
| Retours d'erreur | **Chaque mauvaise réponse prévisible a son message** (tableau « Retours d'erreur précis » dans le doc 06). Jamais la règle générale du cours comme seule explication. « Étape par étape » montre de vraies étapes ; après une erreur à un exercice de fin, on montre aussi la résolution type. Question pour deviner ratée : titre « Pas tout à fait, et c'est normal. », puis un message qui ne répète pas ce titre. |
| Tolérance | Dans le cours qui enseigne une règle, **aucune erreur sur cette règle n'est tolérée**. Une erreur sur une règle d'un cours précédent peut être traitée comme une erreur d'attention. |
| Repassage | Petite question ratée : revient 2 écrans plus loin, choix remélangés. Autres questions de leçon : avant les exercices de fin. Question pour deviner : ne revient pas. (Déjà codé ; ne rien réinventer.) |
| Sons | Juste, faux, cours validé, objectif atteint : déjà branchés dans l'appli. Le cours n'ajoute pas de son à lui. |
| Messages de fin | Un échec dit **quoi** a manqué (chiffres, erreurs par règle) et **quoi relire** (`ErrorDef.rule` rempli pour chaque erreur reconnue). |

## Méthode de travail (dans cet ordre)

1. **Lire** les sources ci-dessus et la version actuelle du cours.
2. **Proposer le déroulé au porteur du projet sous forme de maquette cliquable** : copier `docs/design/ecrans/cours-0-v2.html` dans `docs/design/ecrans/cours-N-v2.html`, remplacer les écrans (même moteur `reveal` / `quiz` / `typed`), et la publier en artefact. Noter à droite de chaque écran ce qu'il fait, pourquoi, et les questions à décider. **Ne rien coder dans l'appli avant sa validation.**
3. **Écrire la spec** : remplacer la partie du cours dans le doc 06 par une « version 2 » au format de celle du Cours 0 (règles, déroulé écran par écran avec les textes exacts, note du cours, tableau des retours d'erreur, révisions, générateur, erreurs reconnues avec leur règle). Faire valider.
4. **Coder** dans `packages/engine/src/courses/calculs/cXX-*.ts` avec les briques existantes (`etapes`, `choix` + `small`, `decouverte`, `texted`, `joinPrevious`, `reecrire`, `lessonLength`, `ErrorDef.rule`). Une nouvelle brique d'écran n'est ajoutée que si aucune existante ne convient ; elle doit être réutilisable.
5. **Tester** : textes mot pour mot, indices des parties, `lessonStep`, chaque message d'erreur du tableau, propriété sur 500 tirages pour tout générateur. Captures téléphone (`npm run shots`) des écrans nouveaux, à regarder une fois.

## Erreurs fréquentes (vues sur le Cours 0 v1)

| Ce qui a été fait | Ce qu'il faut faire |
|---|---|
| Un écran = un calcul faux, une animation, un calcul juste, sans phrase | Scène + phrases pas à pas qui expliquent chaque changement |
| Le même rouge pour « nombre négatif » et pour « faux » | Code couleur ci-dessus |
| Titre, sous-titre et paragraphe qui répètent la même phrase | Le titre nomme l'idée, les phrases l'expliquent, l'encadré la résume |
| Exemple guidé « 6 × ( ▢ ) » sans le calcul de départ : n'importe quelle réponse semblait juste | Toujours montrer le calcul de départ ; la bonne réponse doit être la seule logique |
| Calcul découpé en boutons, lu et répondu au même endroit | Calcul en haut écrit normalement, cases ou choix en bas |
| Classer par toucher-toucher sans explication | Glisser-déposer + consigne qui dit comment faire |
| Retour d'erreur = la règle générale du cours | Un message par erreur prévisible |
| Clavier réduit aux touches de la réponse | Clavier complet |
| Fin ratée sans dire pourquoi | Chiffres + erreurs par règle + « Relire la règle N » |
