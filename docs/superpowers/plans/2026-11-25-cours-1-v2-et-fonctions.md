# Cours 1 v2, Cours 0 v3, fiche mémo, échauffement, « Demander à Clément » et « Écouter » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer le Cours 1 v2 (leçon à étapes interactives, comparer deux cas, série de pratique, exemples guidés dégressifs) avec les briques réutilisables qu'il demande, la fiche mémo, l'échauffement du jour, « Demander à Clément » (élève, API, suiveur) et le bouton « Écouter », puis réécrire le Cours 0 en version 3 avec ces mêmes briques.

**Architecture:** Le moteur (`@pom/engine`) porte les données et les règles : types de parties et d'étapes interactives, question « toucher la droite », fiche mémo par cours, échauffement, contrat des questions à Clément. L'appli web les affiche avec des composants génériques (les cours ne contiennent que des données, comme le Cours 0 v2). Le serveur gagne une table D1 dédiée `questions` (le suiveur y écrit, donc pas dans le journal d'événements). Une tâche 1 fixe tous les contrats, les routes, les emplacements d'écran et les fichiers CSS pour que les tâches suivantes touchent des fichiers différents et tournent en parallèle.

**Tech Stack:** TypeScript, React 18 (PWA), Vitest + Testing Library, Playwright (e2e), Cloudflare Worker (Hono) + D1.

**Spec:** `docs/validation/06-cours-relatifs.md` (partie « Cours 1 », version 2 ; partie « Cours 0 », version 3 ; fiche mémo, formats de révision et « Comparer deux cas » validés le 2026-11-25), `docs/validation/08-decisions-ecrans.md` (n° 32 à 50), maquettes `docs/design/ecrans/cours-1-v2.html` et `docs/design/ecrans/nouvelles-fonctions.html` (versions retenues), `docs/design/ecrans/cours-0-v3.html` (Cours 0 v3 : textes, fiche, `toSpeech`), skill `.claude/skills/plus-ou-moins-ecrire-un-cours/SKILL.md`. Plan précédent pour le style : `docs/superpowers/plans/2026-11-24-cours-0-v2.md`.

## Carte des vagues

Les tâches d'une même vague touchent des fichiers différents : elles peuvent tourner en même temps (une branche ou un worktree par tâche, fusion à la fin de la vague ; seuls `apps/web/src/App.tsx` et `apps/web/src/main.tsx` sont de petits points de fusion, voir tâche 1).

| Vague | Tâches | Peuvent tourner ensemble |
|---|---|---|
| 1 | T1 Contrats | seule |
| 2 | T2 Droite graduée · T3 Fiche mémo · T4 Échauffement · T5 API « Clément » · T6 Écouter · T7 Formats de révision (moteur) · T12 Suiveur (page de suivi) | les 7 (on peut les lancer en deux groupes si trop lourd : T2, T3, T7 puis T4, T5, T6, T12) |
| 3 | T8 Étapes interactives · T9 Questions et écrans de pratique · T10 Cours 1 v2 (données) · T11 « Clément » côté élève · T15 Cours 0 v3 (données) | T8, T9, T10, T11 ensemble ; **T15 démarre quand T8 et T9 sont fusionnées** (elle réutilise leurs composants), pendant que T10 et T11 finissent |
| 4 | T13 e2e du Cours 1 v2, du Cours 0 v3 et des fonctions | seule |
| 5 | T14 Relecture, captures, mise en ligne, avancement | seule |

Dépendances : T2→(T8, T9) ; T7→T10 ; T5→T11 ; (T3, T7, T8, T9)→T15 ; T1→tout. T8 et T9 testent aussi les briques avec un faux cours « façon Cours 0 » (toucher un morceau d'un calcul, toucher un endroit) ; T15 les emploie sur le vrai Cours 0 v3.

## Global Constraints

- Textes : copier **mot pour mot** ceux du doc 06 (Cours 1 v2, écrans 1 à 15, tableaux de retours d'erreur ; Cours 0 v3, écrans 1 à 18, tableaux de retours d'erreur, pour T15) ; signe moins Unicode « − » (U+2212) dans tout texte affiché, `**gras**` via le composant `Bold`.
- Couleurs (doc 08 n° 27) : négatifs **orange**, positifs **bleu**, surligneur jaune « regarde ici », seulement dans les explications ; **grise** pendant une question (aucune couleur qui donne un indice) ; vert / rouge seulement **après** la réponse ; jamais de rouge pour un négatif. Utiliser les tokens de `apps/web/src/theme.css`.
- Ce qu'on touche est **en bas de l'écran** (doc 08 n° 28), sauf la droite touchable de la leçon (consigne en gras juste au-dessus).
- Étapes interactives : erreur = « Pas tout à fait. <message> Essaie encore. », nouvel essai, **rien n'est noté** ; elles remplacent « Suite ».
- Scène touchable : pastilles rondes visibles qui « respirent », main animée la **1re fois seulement**, cibles **≥ 44 px de large**, **8 graduations au plus** (droite pleine largeur d'écran : 8 × 44 = 352 px tient dès 360 px), pastilles qui ne cachent pas les nombres, main qui ne cache pas le 0.
- 2 phrases visibles au plus, le début derrière « Relire le début » / « Replier le début » ; jamais plus de 2 étapes de lecture d'affilée sans action.
- Note du Cours 1 : **11 questions** (4 pratique + 2 exemples guidés, **une seule case notée par exemple** + 5 fin), 80 % et 4 fins sur 5.
- Note du Cours 0 v3 : **14 questions** (1 + 2 petites questions, 4 pratique, 2 exemples guidés à une case notée chacun, 5 fin), 80 % et 4 fins sur 5 ; **aucune couleur de signe** dans ce cours.
- Une question ratée de la série de pratique **repasse avant les exercices de fin** (« Tu retrouveras ce calcul à la fin de la leçon. »), seule la 1re réponse compte (doc 08 n° 49).
- `prefers-reduced-motion` : animations coupées, contenu identique. Hors ligne : fiche mémo et leçon n'ont besoin d'aucun réseau.
- Travail sur `main`, un commit par tâche, messages en anglais, terminés par une ligne vide puis les lignes d'attribution de la session. Pas de push.
- À la fin de chaque tâche : `npm test` et `npx tsc --noEmit` (moteur, web, api) verts.

## Review Focus

1. Droite à 8 graduations sur un écran de 360 px : cibles ≥ 44 px, aucune coupure ni défilement horizontal, pastilles et main ne cachent ni les nombres ni le 0 (tâche 2, test CSS/DOM à 360 et 390 px dans `e2e/shots.ts`).
2. Question à Clément envoyée hors ligne, appli fermée puis rouverte, réseau de retour : elle part **une seule fois** (id client idempotent), et l'élève A ne voit jamais les questions de l'élève B (tâches 5 et 11).
3. Échauffement : aucun cours validé, ou 1re ouverture à minuit (jour de Paris), ou « Passer » puis recharger la page : pas de seconde proposition le même jour (tâche 4).
4. Réponse à une question de Clément par un suiveur qui ne suit pas cet élève, par l'élève lui-même, ou sans connexion : refusée (403/401), et un texte vide ou énorme est refusé (400) (tâche 5).
5. « Écouter » sans `speechSynthesis`, ou quand `speak` lève une exception : aucune erreur visible ; changer d'écran coupe la voix ; « −3 + (−5) » est lu « moins trois plus ouvre la parenthèse moins cinq ferme la parenthèse » (tâche 6).
6. Cours 0 v3 : la note fait **exactement 14** (1 + 2 + 4 + 2 + 5) ; aucune étape interactive ni la case 1 de l'exemple 2 ni les questions pour deviner / comprendre n'entrent dans la note ; une question de la série ratée repasse avant les fins ; « toucher un endroit » : cibles ≥ 44 px, aucun glisser ; la fiche du Cours 0 s'ouvre depuis Mes cours **avant** la validation (tâches 3 et 15).

---

## Décisions du porteur du projet (2026-11-25, doc 08 n° 43 à 50) et ce qui reste ouvert

Décidées (le plan les applique ; elles remplacent les points ouverts de la version précédente) :

1. **Fiche mémo avant validation : oui** (n° 46). Le code lit une seule constante `MEMO_BEFORE_VALIDATION`, valeur initiale **`true`** (tâche 3) : la fiche est consultable depuis Mes cours dès que le cours n'est pas verrouillé, pas seulement après la validation.
2. **Exemple guidé 2 : seule la dernière case (le résultat) compte** (n° 48) ; **la case 1 est un entraînement non noté** (`uncounted`), Cours 1 : 11 questions (tâche 10) ; même principe au Cours 0 v3 : 14 questions (tâche 15).
3. **Série de pratique : notée** (n° 45), au Cours 0 comme au Cours 1 ; **une question ratée repasse avant les exercices de fin**, comme les autres questions de leçon (n° 49 : « Tu retrouveras ce calcul à la fin de la leçon. »), seule la 1re réponse compte (tâches 10 et 15).
4. **Échauffement : une erreur apparaît dans « Erreurs les plus communes »** du suivi, **mais ne compte pas dans la note** du cours (n° 50, tâche 4).
5. Cours 0 v3 : note à **14**, on **touche l'endroit** (pas de glisser), astuce de la fiche validée (n° 43, 44, 47, tâche 15).

Reste ouvert (choix du plan, non tranché par le porteur du projet) :

- **« Faire le bond »** : aucune étape du Cours 1 ne demande un geste séparé de « toucher la graduation ». Le plan fait de « faire le bond » le **résultat** du bon toucher (le bond se dessine) ; pas de geste de plus. À confirmer.
- **Fiche d'un cours « disponible » mais pas commencé** : avec `MEMO_BEFORE_VALIDATION = true`, `canOpenMemo` l'ouvre aussi (seul « verrouillé » la refuse). À confirmer.
- **Cours 0, exemple guidé 2** : le n° 48 est dit pour le Cours 1 ; le plan l'applique aussi au Cours 0 (la case 2 « Le calcul bien écrit » compte, la case 1 non) car c'est ce qui donne 14 questions. À confirmer.

---

### Task 1: Contrats moteur, API client, routes et emplacements d'écran

**Modèle : Sonnet. Vague 1. Dépend de : rien. Seule dans sa vague.**

**Files:**
- Modify: `packages/engine/src/courses/types.ts` (types ci-dessous, `lessonStep` compte la partie `pratique` comme 1 écran)
- Modify: `packages/engine/src/events.ts` (`Activity` + `'echauffement'`, `QuestionKind` + `'droite'`, listes de `isAppEvent`)
- Modify: `packages/engine/src/exercises/types.ts` (question `droite`, réponse `{ point }`)
- Create: `packages/engine/src/exercises/build/droite.ts` ; Modify: `build/index.ts`, `exercises/check.ts`, `feedback.ts`, `activity.ts` (`promptOf`, `courseRunItems`, `withTexts`)
- Create: `packages/engine/src/questions.ts` (contrat des questions à Clément) ; Modify: `packages/engine/src/index.ts`
- Modify: `apps/web/src/api.ts` (5 fonctions client), `apps/web/src/router.tsx`, `apps/web/src/App.tsx`, `apps/web/src/main.tsx`, `apps/web/src/screens/Activity.tsx`, `apps/web/src/screens/Home.tsx`
- Create (squelettes qui ne rendent rien ou « À venir ») : `apps/web/src/components/{ListenButton,AskClement,HomeBubble,ClementCard,WarmupChip}.tsx`, `apps/web/src/screens/{Memo,Warmup,Questions,QuestionDetail,SuiviQuestion}.tsx`
- Create (vides) : `apps/web/src/styles/{line,etapes,series,memo,warmup,questions,listen}.css`, importés dans `main.tsx`
- Test: `packages/engine/test/{events,activity,courses/lessons,exercises/droite}.test.ts`, `apps/web/test/{api,router}.test.ts`

**Interfaces — Produces** (les autres tâches ne dépendent que de ces noms) :

```ts
// courses/types.ts
export interface LineScene {            // la droite graduée d'une scène
  from: number; to: number;             // 8 graduations au plus en pratique
  jumps: { from: number; by: number; label?: string; after?: boolean }[]; // after: dessiné seulement une fois l'action réussie
  highlight?: number[];                 // graduations surlignées en jaune (ex. [0])
  marks?: { at: number; text: string }[];  // « départ », « arrivée »
  legend?: string;                      // « négatifs à gauche · positifs à droite »
  tone: 'color' | 'neutral';            // 'neutral' = grise
}
export interface Scene { layout: 'one'|'row'|'pairs'|'line'|'lines'; calcs: SceneCalc[]; caption?: string; line?: LineScene }
// 'line' : calcs[0] = le calcul affiché au-dessus de la droite ; 'lines' : résolution ligne à ligne, la dernière calc est surlignée (exemples guidés)
export interface StepFault { at: number[]; message: string }        // indices touchés → message
export type StepAction =
  | { type: 'trou'; open: string; choices: string[]; correct: number; errors: Record<number, string> }  // open contient « [ ? ] », remplace la phrase ; step.text = la phrase remplie
  | { type: 'graduation'; consigne: string; target: number; errors: StepFault[]; fallback: string }       // toucher une graduation de scene.line ; le bon toucher dessine les jumps `after`
  | { type: 'comprends'; label?: string }                                                                 // bouton « Je comprends », pas d'erreur possible
  | { type: 'morceau' | 'endroit'; consigne: string; calc: number; target: number[]; errors: StepFault[]; fallback: string }
  // morceau : indices de tokens de scene.calcs[calc] ; endroit : indices d'espaces entre tokens (0 = avant le 1er)
export interface EtapeStep { /* existant */ action?: StepAction }
export interface Compare { a: { label: string; latex: string }; b: { label: string; latex: string }; note: string; line: LineScene; after: string[] }
export interface PartTexts { /* existant */ series?: { n: number; of: number }; above?: string[]; help?: string; mention?: string; uncounted?: true; compare?: Compare }
export type LessonPart = /* existant */ | { type: 'pratique'; title: string; questions: { question: Question; texts?: PartTexts }[] };
export interface MemoCard { rule: string; ruleBullets?: string[]; examples: string[]; mistake: { wrong: string; why: string }; tip: string }
export type ReviewFormat = 'saisie' | 'droite' | 'signe' | 'vraifaux' | 'erreur';
export interface CourseDef { /* existant */ memo?: MemoCard; formats?: ReviewFormat[];
  /** Texte propre au cours pour une réponse (juste ou fausse) ; null = texte du moteur. */
  feedbackText?(q: Question, o: Outcome): string | null }
// exercises/types.ts
| { kind: 'droite'; ex: Exercise; promptLatex: string; line: { from: number; to: number }; jumps: { from: number; by: number }[]; answer: number }
Answer += { point: number }
export function droiteExercise(course: CourseDef, rng: Rng): Exercise   // exercises/build/droite.ts
// questions.ts
export interface ClementQuestion { id: string; courseId: string; calc: string; given: string; expected: string; correction: string;
  note: string | null; askedAt: number; answer: string | null; answeredAt: number | null; answeredBy: string | null; readAt: number | null }
export type NewClementQuestion = Pick<ClementQuestion, 'id'|'courseId'|'calc'|'given'|'expected'|'correction'|'note'|'askedAt'>
export const QUESTION_LIMITS = { calc: 200, given: 100, expected: 100, correction: 600, note: 500, answer: 2000 } as const;
export function isNewClementQuestion(x: unknown): x is NewClementQuestion
export function isAnswerText(x: unknown): x is string    // non vide après trim, ≤ answer
// api.ts (apps/web) : contrat du serveur (tâche 5)
postQuestion(token, q: NewClementQuestion): Promise<void>               // POST /api/questions
getMyQuestions(token): Promise<ClementQuestion[]>                       // GET  /api/questions
markQuestionRead(token, id: string): Promise<void>                      // POST /api/questions/:id/read
getStudentQuestions(token, studentId: string): Promise<ClementQuestion[]>        // GET  /api/students/:id/questions
answerQuestion(token, studentId: string, id: string, answer: string): Promise<void> // POST /api/students/:id/questions/:qid/answer {answer}
// router.tsx : routes ajoutées
{ name:'fiche', id } = #/cours/:id/fiche · { name:'echauffement' } = #/echauffement · { name:'questions' } = #/questions
{ name:'question', id } = #/questions/:id · { name:'suivi-question', eleve, id } = #/suivi/:eleve/question/:id
// composants-emplacements (T1 les câble, d'autres tâches les remplissent)
<ListenButton rootRef={RefObject<HTMLElement|null>} />                  // câblé dans le cadre des écrans de leçon d'Activity.tsx
<AskClement courseId question outcome correction />                    // câblé sous le retour d'erreur d'Activity.tsx (seulement faux, record, élève)
<HomeBubble /> (barre du haut de Home) · <ClementCard /> et <WarmupChip /> (corps de Home)
```

**Comportements décidés (moteur) :**
- `courseRunItems` : une partie `pratique` donne autant d'éléments `question` (activité `lecon`) que de questions, ids `partie-<i>-<k>`, avec `texts.series = { n: k+1, of }` ; `texts.uncounted` rend l'élément `decouverte` (ne compte pas, ne repasse pas) ; `withTexts` copie `series`, `above`, `help`, `mention`, `compare`. Un `compare` est une question `choix` de type `decouverte`.
- `droiteExercise` : tire avec `course.generate(1, rng)` jusqu'à une somme de deux termes dont les points `0`, `a`, `a+b` tiennent dans **8 graduations** (`max − min ≤ 7`). Question `droite` : `line = { from: min(0,…) , to: max(0,…) }`, `jumps` dessinés sans étiquette, `answer = ex.answer`. `checkAnswer` : juste ssi `point === answer` ; sinon diagnostic du cours sur `rat(point)` (mêmes erreurs que la saisie). `outcome.given`/`expected` en texte avec « − ».

- [ ] **Step 1: Tests moteur** — `droite.test.ts` : `droiteExercise(c01, rng)` 500 tirages → `max − min ≤ 7`, deux termes ; `checkAnswer(c01, q('−2 + (−5)'), { point: -7 }).correct === true` ; `{ point: 7 }` → `errorType 'signe-oublie'` ; `{ point: -3 }` → `'soustraction-au-lieu-addition'` (c01 actuel). `events.test.ts` : `isAppEvent` accepte `activity: 'echauffement'` et `questionKind: 'droite'`. `lessons.test.ts` : un faux cours avec une partie `pratique` de 4 questions → 4 éléments, `texts.series` `{n:1,of:4}`…`{n:4,of:4}`, `lessonStep` compte 1 écran ; un `uncounted` → `activity === 'decouverte'`. `questions.test.ts` : `isNewClementQuestion` refuse `note` de 501 caractères et un `id` vide, accepte `note: null` ; `isAnswerText('  ')` faux.
- [ ] **Step 2: Lancer** `npm test -w @pom/engine` — attendu : FAIL (symboles absents).
- [ ] **Step 3: Implémenter** types, `droite.ts`, `check.ts` (cas `droite`), `feedback.ts` (cas `droite` + appel de `course.feedbackText` en premier pour tout type), `promptOf` (`droite` → `promptLatex`), `questions.ts`, `events.ts`.
- [ ] **Step 4: Web** — `router.test.ts` : `parseRoute('#/cours/c01/fiche')` → `{ name:'fiche', id:'c01' }` et `toHash` aller-retour pour les 5 routes ; `api.test.ts` : chaque fonction appelle l'URL et la méthode du contrat avec l'en-tête `authorization`. Câbler les emplacements (rendent `null`), les 5 écrans squelettes dans `App.tsx`, les 7 CSS vides dans `main.tsx`.
- [ ] **Step 5: Vérifier** `npm test` et `npx tsc --noEmit` dans les 3 paquets — attendu : tout vert, aucun écran visible n'a changé.
- [ ] **Step 6: Commit** `feat: contracts for interactive steps, droite question, memo, Clément questions and screen slots`

---

### Task 2: Droite graduée (composant)

**Modèle : Sonnet. Vague 2. Dépend de : T1. En parallèle avec : T3, T4, T5, T6, T7, T12.**

**Files:**
- Modify: `apps/web/src/components/NumberLine.tsx` (étendu, pas dupliqué ; le Cours 1 v1 et les anciens appels gardent leur rendu par défaut)
- Modify: `apps/web/src/styles/line.css`
- Test: `apps/web/test/number-line.test.tsx` (nouveau)

**Interfaces:**
- Consumes: `LineScene` (T1).
- Produces: `<NumberLine from to jumps />` inchangé, plus `<LineView line: LineScene, mode?: 'lesson'|'question', touch?: { onPick(point: number): void; picked?: number | null; hand?: boolean; consigne: string }, replay?: number />`.

Comportement : `tone: 'color'` → arcs orange (négatif) / bleu (positif), 0 surligné si `highlight`, étiquettes `marks`, `legend` ; `neutral` → tout en gris. Avec `touch` : une pastille ronde par graduation (`button`, `aria-label` « Graduation −3 »), classe `is-breathing` (animation coupée si reduced-motion), consigne en gras **au-dessus**, main animée si `hand` (une seule fois : l'appelant décide de passer `hand`, le composant ne mémorise rien). Colonne cliquable de largeur `max(44px, 100% / graduations)` ; la droite prend toute la largeur de l'écran ; les nombres sont **sous** les pastilles ; la main est posée sur la graduation la plus proche **sauf 0**. Jumps `after` : dessinés avec animation quand `line.jumps[i].after` passe à visible (prop `revealed`).

- [ ] **Step 1: Tests** — `line avec touch : 8 graduations → 8 boutons, chacun avec style min-width 44px` ; `clic sur −3 appelle onPick(-3)` ; `tone neutral → aucune classe is-neg/is-pos` ; `tone color → arc de −3 a la classe is-neg, arc de +3 is-pos` ; `la main n'est pas rendue sans hand, et n'est jamais ancrée sur 0` ; `consigne rendue avant la droite dans le DOM` ; `reduced-motion : pas de classe d'animation`.
- [ ] **Step 2: Lancer** `npm test -w web -- number-line` — attendu : FAIL.
- [ ] **Step 3: Implémenter** `LineView` dans `NumberLine.tsx` en réutilisant l'axe, les graduations et les arcs existants ; couleurs par tokens (`--neg-orange`, `--pos-blue` : les créer dans `styles/line.css` s'ils n'existent pas, avec leurs variantes sombres).
- [ ] **Step 4: Lancer** les tests web — attendu : PASS (aucun test d'ancien rendu cassé).
- [ ] **Step 5: Commit** `feat(web): touchable coloured number line`

---

### Task 3: Fiche mémo (écran, accès, Cours 0)

**Modèle : Sonnet. Vague 2. Dépend de : T1. En parallèle avec : T2, T4, T5, T6, T7, T12.**

**Files:**
- Create: `packages/engine/src/courses/memo.ts` (`MEMO_BEFORE_VALIDATION`, `canOpenMemo`) ; Modify: `courses/index.ts` (export)
- Modify: `packages/engine/src/courses/calculs/c00-bien-ecrire.ts` (champ `memo`)
- Modify: `apps/web/src/screens/Memo.tsx` (squelette T1 → écran), `apps/web/src/screens/Courses.tsx`, `apps/web/src/screens/CourseResult.tsx`, `apps/web/src/styles/memo.css`
- Test: `packages/engine/test/courses/memo.test.ts`, `apps/web/test/memo.test.tsx`

**Interfaces:**
- Consumes: `MemoCard`, `CourseDef.memo`, route `fiche` (T1).
- Produces: `export const MEMO_BEFORE_VALIDATION = true` (décision n° 46) ; `export function canOpenMemo(status: CourseStatus, hasMemo: boolean): boolean` = `hasMemo && status !== 'verrouille' && (status === 'valide' || MEMO_BEFORE_VALIDATION)` ; écran `Memo({ courseId })`.

Cours 0, texte de la maquette `cours-0-v3.html` (écran « Fiche mémo ») : règle « Un calcul s'écrit d'une seule façon. On doit toujours savoir quel rôle joue chaque − : soustraire, ou signe d'un nombre. » avec les 4 puces (« Deux signes ne se suivent jamais. », « En tête, pas de parenthèses. », « Le − se met avant le nombre. », « Une parenthèse ouverte se ferme. »), exemples « 4 × (−3) » et « −3 + 5 », erreur « 4 × −3 » avec « Le × et le − se touchent. On écrit 4 × (−3). », astuce validée (doc 08 n° 47) « Cherche d'abord les signes qui se touchent, puis demande-toi pour chaque − : il soustrait, ou c'est le signe d'un nombre ? ». Tous les textes de la fiche du Cours 0 sont validés (doc 06, Cours 0 v3, « Fiche mémo ») : pas de marqueur « à valider ». T15 vérifie le texte contre le doc 06.

- [ ] **Step 1: Tests** — moteur : `canOpenMemo('valide', true) === true` ; `canOpenMemo('en-cours', true) === true` et `canOpenMemo('a-rattraper', true) === true` (constante à `true`) ; `canOpenMemo('valide', false) === false` ; `canOpenMemo('verrouille', true) === false` ; `c00.memo.examples` a 2 entrées. Web : écran `#/cours/c00-bien-ecrire/fiche` affiche « Fiche mémo · Cours 0 », « La règle », « Exemples », « L'erreur à éviter », « L'astuce », le bouton « Retour » ; `Courses` montre le bouton « Fiche » sur la ligne d'un cours validé et « Voir la fiche mémo » sur la carte d'un cours « À valider » (**avant** la validation, comme la maquette `cours-0-v3.html`), et rien sur un cours verrouillé ; `CourseResult` validé montre « Voir la fiche mémo » (et la phrase « Ta fiche mémo est prête » de la maquette) ; l'écran se rend sans appel `fetch` (hors ligne) et contient `<ListenButton>`.
- [ ] **Step 2: Lancer** `npm test` — attendu : FAIL.
- [ ] **Step 3: Implémenter** `memo.ts`, l'écran (mise en page de la maquette : blocs « La règle », « Exemples », « L'erreur à éviter » dans un bloc distinct ; la fiche est un écran de leçon, les couleurs y sont permises), les deux entrées d'accès via `canOpenMemo`.
- [ ] **Step 4: Lancer** `npm test` — attendu : PASS.
- [ ] **Step 5: Commit** `feat: memo card screen with entries from My courses and course validated`

---

### Task 4: Échauffement du jour

**Modèle : Sonnet. Vague 2. Dépend de : T1. En parallèle avec : T2, T3, T5, T6, T7, T12.**

**Files:**
- Create: `packages/engine/src/warmup.ts` ; Modify: `index.ts` (export), `srs.ts` (cas `echauffement`), `daily.ts`, `dashboard.ts` (une erreur d'échauffement alimente « Erreurs les plus communes », décision n° 50)
- Modify: `apps/web/src/screens/Warmup.tsx`, `apps/web/src/components/WarmupChip.tsx`, `apps/web/src/App.tsx` (porte d'entrée), `apps/web/src/styles/warmup.css`
- Test: `packages/engine/test/warmup.test.ts`, `packages/engine/test/{srs,daily,dashboard}.test.ts` (cas ajoutés), `apps/web/test/warmup.test.tsx`

**Interfaces:**
- Consumes: `Activity 'echauffement'` (T1), `pendingReviews`, `buildQuestion`, `checkAnswer`.
- Produces:
```ts
export interface Warmup { activityId: string; courseId: string; question: Question }
export function warmupCourse(state: ProgressState, today: string): string | null   // 1er cours à revoir ; sinon le validé dont nextReview est le plus proche ; null si aucun validé
export function warmupDue(state: ProgressState, events: AppEvent[], today: string): boolean // aucun événement du jour (quelque nature), aucun 'echauffement' du jour, et warmupCourse ≠ null
export function buildWarmup(state: ProgressState, today: string, rng: Rng): Warmup | null    // une question qcm au niveau du cours (LADDER), 'qcm' via buildQuestion
export function warmupAnswerEvent(w: Warmup, o: Outcome, durationMs: number): NewAnswerEvent  // activity 'echauffement', attempt 1
export function warmupSkipEvent(w: Warmup): NewActivityEndEvent                                // activity_end, completed false
export function warmupDoneToday(events: AppEvent[], today: string): boolean
```
Règles : une réponse `echauffement` **fausse** sur un cours validé met `nextReview = min(nextReview, day)` (le cours entre dans `pendingReviews`, étape de l'échelle inchangée) ; juste : rien ; jamais dans les tallies ni dans la note. **Une réponse `echauffement` fausse (1re réponse) entre dans `commonErrors` (et `errors28` du cours) de `computeDashboard`** (n° 50) en réutilisant `countErrors`, mais **ni dans `successRate`, ni dans `toRework`, ni dans la note du cours** ; si `wrongCalcul` suppose une reprise dans l'activité, afficher le calcul sans issue. `dailyTime` gagne `warmupMs` (au plus 2 min) inclus dans `totalMs`. « Passer » compte comme fait (pas de seconde proposition) mais ne compte pas dans le temps.

- [ ] **Step 1: Tests moteur** — `warmupDue` faux sans cours validé ; faux si un événement `answer` existe déjà aujourd'hui ; faux après un `activity_end` `echauffement` du jour ; vrai le lendemain ; `warmupCourse` choisit le cours dont la révision est la plus en retard ; `foldProgress` avec une réponse `echauffement` fausse sur un cours validé non dû → `pendingReviews(state, day)` le contient, `step` inchangé ; juste → inchangé ; `dailyTime` : 20 s d'échauffement → `warmupMs 20000` et `totalMs 20000`, 5 min plafonnées à 2 min ; événements acceptés par `isAppEvent` ; `dashboard.test.ts` : une réponse `echauffement` fausse d'`errorType 'signe-oublie'` → `home.commonErrors.top` contient `signe-oublie` avec `count 1`, alors que `successRate`, `toRework` et la note du cours (`foldProgress`) restent identiques à ceux d'avant ; une réponse juste n'ajoute rien.
- [ ] **Step 2: Lancer** `npm test -w @pom/engine -- warmup srs daily dashboard` — attendu : FAIL.
- [ ] **Step 3: Implémenter** `warmup.ts`, les deux cas de `srs.ts` / `daily.ts` (`step()` : pour `echauffement`, traiter avant le tally puis retourner) et la branche `echauffement` de `computeDashboard` (erreurs communes seulement).
- [ ] **Step 4: Tests web** — avec 1 cours validé et aucun événement du jour, l'ouverture de `#/` redirige vers `#/echauffement` : écran centré « Un petit calcul avant de commencer », « 1 question · environ 20 secondes », choix, « Passer » discret ; bonne réponse → « Juste. » + explication + « Aller à l'accueil » et un événement `echauffement` est enregistré ; mauvaise → « Pas tout à fait. », « Ce cours reviendra dans tes révisions. » ; « Passer » → accueil, jamais reproposé après rechargement ; rôle suiveur : jamais d'échauffement ; l'accueil montre `WarmupChip` « Échauffement fait » après coup.
- [ ] **Step 5: Implémenter** l'écran (réutiliser `QuestionView` verrouillable et `FeedbackPanel`), la porte dans `App.tsx` (une fois par chargement, après `useStoredReady`).
- [ ] **Step 6: Lancer** `npm test` — attendu : PASS. **Commit** `feat: daily warm-up question on a validated course`

---

### Task 5: API « Demander à Clément »

**Modèle : Sonnet. Vague 2. Dépend de : T1 (contrat dans `questions.ts`). En parallèle avec : T2, T3, T4, T6, T7, T12.**

**Files:**
- Create: `apps/api/migrations/0002_questions.sql`, `apps/api/src/routes/questions.ts`
- Modify: `apps/api/src/index.ts` (montage + `requireAuth`), `apps/api/src/routes/students.ts` (2 routes suiveur, helper `assertFollows(c, eleveId)` extrait de la route existante et réutilisé)
- Test: `apps/api/test/questions.test.ts` (même harnais que `api.test.ts`), `apps/api/test/apply-migrations.ts` si la liste des migrations y est écrite en dur

**Interfaces:**
- Consumes: `isNewClementQuestion`, `isAnswerText`, `ClementQuestion` (T1) ; `requireRole`, `requireAuth`.
- Produces: les 5 routes du contrat de T1 ; réponses JSON `{ questions: ClementQuestion[] }` (tri `asked_at DESC`) ou `{ ok: true }`.

Table : `questions(id TEXT PRIMARY KEY, eleve_id TEXT NOT NULL REFERENCES users(id), course_id TEXT NOT NULL, calc TEXT NOT NULL, given TEXT NOT NULL, expected TEXT NOT NULL, correction TEXT NOT NULL, note TEXT, asked_at INTEGER NOT NULL, answer TEXT, answered_at INTEGER, answered_by TEXT REFERENCES users(id), read_at INTEGER)` + index `(eleve_id, asked_at)`. `answeredBy` est renvoyé **par prénom** (jointure `users.name`). `eleve_id` vient toujours du jeton, jamais du corps.

Règles : `POST /api/questions` (rôle élève) : 400 si invalide ; même `id` + même élève → 200 sans doublon ; même `id` autre utilisateur → 409. `GET /api/questions` (élève) : les siennes seulement. `POST /api/questions/:id/read` (élève) : pose `read_at` seulement si la question est à lui **et** répondue, sinon 404. `GET /api/students/:id/questions` (suiveur qui suit `:id`, sinon 403). `POST /api/students/:id/questions/:qid/answer` (suiveur qui suit `:id`) : 404 si `qid` n'est pas à `:id`, 400 si `isAnswerText` faux ; une 2e réponse remplace la 1re et remet `read_at` à `NULL`.

- [ ] **Step 1: Tests** (un `it` par ligne) — 401 sans jeton sur les 5 routes ; `eleve` crée → 200, le même id rejoué → 200 et 1 seule ligne ; suiveur ne peut pas créer (403) ; élève ne peut pas répondre (403) ; élève B `read` sur la question de A → 404 ; élève B `GET` ne voit pas celle de A ; suiveur de A lit celles de A ; suiveur sans lien → 403 sur liste et réponse ; `qid` d'un autre élève → 404 ; réponse `'  '` → 400, réponse de 2001 caractères → 400 ; note de 501 caractères → 400 ; réponse puis `read` → `readAt` non nul ; nouvelle réponse → `readAt` nul.
- [ ] **Step 2: Lancer** `npm test -w api` — attendu : FAIL.
- [ ] **Step 3: Implémenter** migration, routes, montage ; `assertFollows` : `SELECT 1 FROM follows WHERE suiveur_id = ? AND eleve_id = ?`.
- [ ] **Step 4: Lancer** `npm test -w api` — attendu : PASS (les 19 tests existants inclus).
- [ ] **Step 5: Commit** `feat(api): Clément questions table and routes`

---

### Task 6: Bouton « Écouter »

**Modèle : Sonnet. Vague 2. Dépend de : T1 (emplacement `ListenButton`). En parallèle avec : T2, T3, T4, T5, T7, T12.**

**Files:**
- Create: `apps/web/src/listen/toSpeech.ts`, `apps/web/src/listen/speak.ts`
- Modify: `apps/web/src/components/ListenButton.tsx`, `apps/web/src/styles/listen.css`, `apps/web/src/ui/icons.tsx` (icône haut-parleur de `cours-0-v3.html`)
- Test: `apps/web/test/listen.test.tsx`

**Interfaces:**
- Produces: `toSpeech(text: string): string` ; `speakable(root: HTMLElement): string` ; `speak(text: string, onEnd?: () => void): void` ; `stopSpeaking(): void` ; `<ListenButton rootRef />` (déjà câblé par T1).

Règles : `toSpeech` porté de `cours-0-v3.html` : nombres 0 à 20 en mots (`zéro … vingt`), plus grands laissés en chiffres ; `×` « fois », `÷` « divisé par », `+` « plus », `−` « moins », `=` « égale », `(` « ouvre la parenthèse », `)` « ferme la parenthèse », `▢` « case vide », `✓` « juste », `✗` « faux » ; espaces normalisés, pas d'espace avant `. , ? ! : ;`. `speakable` lit le titre, la phrase affichée (les 2 phrases visibles, pas le début replié) et la consigne ; ignore les éléments marqués `data-speak-skip` (points d'étape, boutons, « Relire le début ») ; un trou ouvert se lit « un mot à trouver ». `speak` : `lang = 'fr-FR'`, voix `fr*` si disponible, **échec silencieux** (`try/catch`, absence de `speechSynthesis` ou de `SpeechSynthesisUtterance`), un 2e toucher pendant la lecture l'arrête ; le bouton porte `aria-label` « Écouter cet écran à voix haute » et la classe `is-on` pendant la lecture ; démontage = `speechSynthesis.cancel()`.

- [ ] **Step 1: Tests** — `toSpeech('−3 + (−5) = ?')` → `'moins trois plus ouvre la parenthèse moins cinq ferme la parenthèse égale ?'` ; `toSpeech('12 × 40')` → `'douze fois 40'` ; `speakable` ignore un nœud `data-speak-skip` ; avec `speechSynthesis` simulé : un clic appelle `speak` avec un énoncé de `lang 'fr-FR'` ; un 2e clic appelle `cancel` ; le démontage appelle `cancel` ; sans `speechSynthesis` (supprimé de `window`) le clic ne lève rien ; `speak` qui lève → aucune erreur remontée.
- [ ] **Step 2: Lancer** `npm test -w web -- listen` — attendu : FAIL.
- [ ] **Step 3: Implémenter** les trois fichiers et le bouton (coin haut droit du cadre des écrans de leçon et de la fiche mémo, cible ≥ 44 px).
- [ ] **Step 4: Lancer** `npm test -w web` — attendu : PASS. **Commit** `feat(web): Listen button reading the screen aloud`

---

### Task 7: Formats de révision et d'entraînement (moteur)

**Modèle : Sonnet. Vague 2. Dépend de : T1. En parallèle avec : T2, T3, T4, T5, T6, T12.**

**Files:**
- Modify: `packages/engine/src/reviews.ts` (`kindsFor`), `packages/engine/src/activity.ts` (`availableKinds`, `trainingSeries`), `packages/engine/src/exercises/build/index.ts`
- Create: `packages/engine/src/exercises/build/signe.ts`
- Test: `packages/engine/test/reviews.test.ts`, `packages/engine/test/exercises/{droite,signe}.test.ts`

**Interfaces:**
- Consumes: `CourseDef.formats`, `droiteExercise` (T1), `signBox` (`courses/calculs/shared.ts`).
- Produces: `buildSigne(course, ctx): Question` (QCM à deux boutons « + » / « − », résultat jamais 0, `errorType` = l'erreur de signe du cours) ; `availableKinds(course)` inclut `'droite'` si `formats` contient `'droite'` ; `kindsFor` : si `course.formats` est défini, 3 formats **différents** tirés dedans (comme le Cours 0) ; `'signe'` → question `qcm` signe, `'saisie' | 'vraifaux' | 'erreur'` → types existants. L'entraînement tire dans les mêmes formats. Les cours sans `formats` gardent exactement le tirage actuel (« surtout QCM »).

- [ ] **Step 1: Tests** — faux cours avec `formats: ['saisie','droite','signe','vraifaux','erreur']` : 200 séances → toujours 3 formats distincts, chacun présent au moins une fois sur l'ensemble ; `droite` n'est tirée qu'au niveau 1 (jamais plus de 8 graduations, 500 tirages) ; niveau 2 ou 3 : repli sur `saisie` ; `buildSigne` : `choices` = `+`, `−`, `correctIndex` selon le signe de la réponse ; cours sans `formats` : séance identique à celle d'avant (graine fixée, tests existants verts).
- [ ] **Step 2: Lancer** `npm test -w @pom/engine -- reviews` — attendu : FAIL.
- [ ] **Step 3: Implémenter.**
- [ ] **Step 4: Lancer** `npm test -w @pom/engine` — attendu : PASS. **Commit** `feat(engine): per-course review and training formats`

---

### Task 8: Étapes interactives et lecture à 2 phrases (écran)

**Modèle : Sonnet. Vague 3. Dépend de : T1, T2 (`LineView`). En parallèle avec : T9, T10, T11.**

**Files:**
- Modify: `apps/web/src/components/Etapes.tsx`, `apps/web/src/styles/etapes.css`
- Create: `apps/web/src/components/etapes/{Trou,Graduation,Morceau,Comprends}.tsx`
- Test: `apps/web/test/etapes.test.tsx` (cas ajoutés)

**Interfaces:**
- Consumes: `EtapeStep.action`, `Scene.layout 'line' | 'lines'`, `LineView` (T2), `Bold`.
- Produces: `Etapes` accepte les mêmes props ; pour une étape avec `action`, le pied d'écran remplace « Suite » par l'action ; `onDone` inchangé ; rien n'est enregistré par les actions (aucun événement, aucune note).

Règles : (1) **Trou** : `open` s'affiche à la place de la phrase, avec un grand emplacement visible ; les choix sont de gros boutons en bas ; faux → bloc « Pas tout à fait. {errors[i]} Essaie encore. », le trou reste ouvert ; juste → `step.text` remplace `open`, la scène reprend ses couleurs (`tone: 'color'`), les jumps `after` apparaissent. (2) **Graduation** : `LineView` avec `touch` (consigne, pastilles, main la 1re fois de l'écran), scène grise (`tone 'neutral'`) tant que l'action est ouverte ; `errors` testés dans l'ordre sur le point touché, sinon `fallback`. (3) **Comprends** : bouton « Je comprends » (libellé `label`). (4) **Morceau / endroit** : tokens ou espaces de la scène touchables (cibles ≥ 44 px), mêmes messages. (5) **2 phrases visibles** : seules les 2 dernières phrases (`text` des étapes affichées, trou rempli compris) restent ; le début est replié derrière « Relire le début » / « Replier le début » (`aria-expanded`) ; jamais d'effet sur la phrase d'un trou ouvert. (6) « Revoir cette étape » rejoue l'animation de l'étape affichée.

- [ ] **Step 1: Tests** (faux cours « Cours 1 » pour trou et graduation, faux cours « Cours 0 » pour morceau et endroit) — `trou : choisir la mauvaise réponse affiche « Pas tout à fait. Ajouter un nombre négatif, c'est reculer : vers la gauche. Essaie encore. » et le trou reste vide` ; `trou juste : la phrase remplie remplace la phrase à trous, « Suite » n'était jamais affiché` ; `graduation : toucher 0 → « Tu es resté au départ : le bond fait 3 graduations. »` ; `toucher 1 → fallback` ; `toucher 3 → le bond de 3 est dessiné, la droite passe de neutral à color` ; `comprends : un seul bouton, aucune erreur` ; `morceau : toucher le mauvais token → message, le bon → étape suivante` ; `endroit : cibles d'espaces` ; `après 4 étapes de lecture seules 2 phrases sont dans le DOM visible, « Relire le début » les montre toutes, « Replier le début » les cache` ; `aucun fetch ni événement n'est émis par une action`.
- [ ] **Step 2: Lancer** `npm test -w web -- etapes` — attendu : FAIL.
- [ ] **Step 3: Implémenter** les composants d'action ; `Etapes` choisit l'action de l'étape courante ; marquer `data-speak-skip` sur points, « Relire le début » et boutons.
- [ ] **Step 4: Lancer** `npm test -w web` — attendu : PASS (tests `etapes` du Cours 0 v2 inchangés). **Commit** `feat(web): interactive lesson steps and two-sentence reading`

---

### Task 9: Questions touchables, comparer deux cas, série de pratique, exemples guidés

**Modèle : Sonnet. Vague 3. Dépend de : T1, T2 (`LineView`). En parallèle avec : T8, T10, T11.**

**Files:**
- Create: `apps/web/src/components/questions/Droite.tsx`, `apps/web/src/components/questions/Comparer.tsx`
- Modify: `apps/web/src/components/questions/{QuestionView,Frame,Choix}.tsx` (cas `droite` ; `above`, `series`, `help`, `mention` dans le cadre ; `compare` géré par `Choix`), `apps/web/src/screens/Course.tsx` (pastille « Cours N · Pratique » pour les éléments à `series`), `apps/web/src/styles/series.css`
- Test: `apps/web/test/questions.test.tsx`, `apps/web/test/course.test.tsx` (cas ajoutés)

**Interfaces:**
- Consumes: question `droite`, `PartTexts.{series, above, help, mention, compare}`, `LineView`.
- Produces: `Droite` : bonds dessinés sans étiquette, droite grise, départ marqué, `touch` avec la consigne `texts.consigne` (défaut « Touche la droite à l'endroit où l'on arrive. »), toucher = réponse (`onAnswer({ point }, checkAnswer(...))`), après réponse : la bonne graduation en vert, la touchée fausse en rouge, **pas de couleur de signe**. `Comparer` : deux calculs côte à côte (« Calcul A » / « Calcul B »), note, question à choix ; après la réponse, la droite `compare.line` montre les deux trajets, puis `compare.after`. Série : compteur « Question N sur 4 » et 4 points sous la pastille ; pas de bouton « Passer ». `above` : lignes LaTeX de résolution déjà posées au-dessus de la case (le calcul de départ reste toujours affiché) ; `help` : encadré d'aide de la ligne en cours.

- [ ] **Step 1: Tests** — `droite : 8 graduations, toucher −7 sur −2 + (−5) → onAnswer({point:-7}) avec correct true` ; `toucher −6 → faux, la graduation −7 est marquée juste` ; `aucune classe de signe orange/bleu pendant la question` ; `série : texts.series {n:2,of:4} → « Question 2 sur 4 », 4 points dont 1 plein` ; `comparer : la réponse « Le signe du deuxième nombre » → titre « Juste. » ; « Le premier nombre » → « Pas tout à fait, et c'est normal. » + message du doc 06 écran 4 (passé en données du test) ; après réponse la droite montre 2 trajets` ; `above : 2 lignes rendues au-dessus de la case, calcul de départ présent` ; `question uncounted : aucune mention « ne compte pas » si mention vaut ''`.
- [ ] **Step 2: Lancer** `npm test -w web -- questions course` — attendu : FAIL.
- [ ] **Step 3: Implémenter** ; `data-speak-skip` sur compteur et points.
- [ ] **Step 4: Lancer** `npm test -w web` — attendu : PASS. **Commit** `feat(web): touch-the-line question, compare screen, practice series and guided example frame`

---

### Task 10: Cours 1 v2 (données et tests)

**Modèle : Sonnet. Vague 3. Dépend de : T1, T7. En parallèle avec : T8, T9, T11.**

**Files:**
- Modify: `packages/engine/src/courses/calculs/c01-additionner-meme-signe.ts` (réécriture des `parts`, `lessonLength: 7`, `memo`, `formats`, `feedbackText`, `rule` des erreurs)
- Modify: `packages/engine/src/courses/calculs/shared.ts` si un assistant de données manque (`droiteQ`, `pratique`, `compare`, `step` : à créer ici, utilisés ensuite par les cours 2 à 7)
- Test: `packages/engine/test/courses/c01.test.ts` (mis à jour), `packages/engine/test/courses/c01-texts.test.ts` (nouveau)

**Interfaces:**
- Consumes: tous les types de T1 ; assistants existants (`etapes`, `lecon`, `exemple`, `decouverte`, `choix`, `titled`, `saisie`, `trou`, `signBox`).
- Produces: `c01` avec les parties suivantes (indices **fixes**, utilisés par `partIndex` et par T13) :

| Index | Partie | Contenu (doc 06, écran) |
|---|---|---|
| 0 | `decouverte` : question `choix` « tu dois 3 € … » + `intro` | écran 1 ; attendu 8 € ; retours du tableau « Questions pour deviner » |
| 1 | `etapes` « La droite graduée et les bonds » | écran 2 ; étapes 3 et 4 `graduation` (cibles 3 et −3, droites −3→4 et −4→3), étape 5 `trou` |
| 2 | `etapes` « Deux dettes qui s'ajoutent » | écran 3 ; étape 3 `trou` |
| 3 | `decouverte` : `choix` + `compare` | écran 4 ; A −3 + (−5), B −3 + 5 ; droite −9 à 3 |
| 4 | `etapes` « J'additionne les longueurs des bonds » | écran 5 ; `trou` 3 + 5 = [ ? ] ; encadré Règle 1 |
| 5 | `etapes` « Je garde le signe » | écran 6 ; `trou` ; encadré Règle 2 |
| 6 | `etapes` « Les 2 règles à retenir » | écran 7 ; `recap` des 2 règles + encadré « En une phrase » |
| 7 | `pratique` « Cours 1 · Pratique » | écran 8 : Q1 `droite` −2 + (−5) (droite −7 à 0), Q2 `qcm` signe −4 + (−3), Q3 `vraifaux` −4 + (−3) = 7 (faux), Q4 `saisie` −8 + (−9) |
| 8 | `etapes` exemple 1 (résolution à l'écran) | écran 9 : 2 actions `comprends`, lignes `= −(4 + 9)` et `= −(13)` |
| 9 | `exemple` `trou` `= ▢` (−13), `above` les 2 lignes | écran 9, dernière ligne |
| 10 | `exemple` `trou` case 1 `6 + ▢` (1), `uncounted` | écran 10 |
| 11 | `exemple` `trou` case 2 `= ▢` (−7), compté | écran 10 |
| 12 | `etapes` annonce « Place aux 5 exercices de fin » | écran 11 |

`lessonLength = 7`. Les 7 `explication`/`etapes`/`decouverte` donnent « étape N sur 7 ». Notées : indices 7 (×4), 9, 11 et les 5 fins = **11**. Règles des erreurs : `signe-oublie` → `{ n: 2, label: 'Je garde le signe des deux nombres', partIndex: 5 }`, `soustraction-au-lieu-addition` → `{ n: 1, label: "J'additionne les nombres sans leur signe", partIndex: 4 }`. `formats: ['saisie','droite','signe','vraifaux','erreur']`. `memo` = fiche du doc 06 (règle, deux exemples, erreur « −3 + (−5) = 8 » ou « = −2 », astuce des bonds). `feedbackText` couvre les tableaux « Questions qui comptent » (Q1 à Q4, cases des exemples, exercices de fin avec nombres tirés, signe suivant les nombres, cas « autre ») pour les réponses justes **et** fausses.

- [ ] **Step 1: Tests de texte** (`c01-texts.test.ts`, une ligne de table par cas, tirée du doc 06) — pour chaque partie `etapes` : titre et chaque `text` attendu mot pour mot ; messages des 14 lignes « Étapes interactives » : `part.steps[i].action.errors` / `errors[choix]` / `fallback` ; 5 lignes « devine/comprendre » ; pour chaque ligne de « Questions qui comptent » : `c01.feedbackText(question, outcome)` renvoie le texte du tableau (ex. `Q4, réponse 17 → « Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − ! »`, `Q4, −1 → « Même signe : on **additionne** … 8 + 9 = 17, donc −17. »`, `case 2 de l'exemple 2, 7 → …`) ; `7 + 6` avec −13 → « Les deux nombres sont positifs : le résultat est positif aussi. ».
- [ ] **Step 2: Tests de structure** — `c01.parts.length === 13`, `lessonLength === 7`, types de partie dans l'ordre du tableau ; `courseRunItems(c01, rng)` → exactement 11 éléments notés (`activity` ∈ `lecon | exemple | fin`, hors `decouverte`) ; la question de l'écran 1 et celle de l'écran 4 sont `decouverte` ; aucune action n'est notée ; toutes les cibles `graduation` sont dans la droite de leur scène et la droite a ≤ 8 graduations ; `rule.partIndex` pointe une partie dont l'encadré porte le même numéro de règle ; réponses tapées de l'ancien tableau (8 → `signe-oublie`, −2 et 2 → `soustraction-au-lieu-addition`, −7 → `autre`) conservées ; **repassage** (doc 08 n° 49) : avec l'aide de test de `lessons.test.ts`, une question de la partie 7 (série) ratée repasse **avant** le premier exercice de fin avec « Tu retrouveras ce calcul à la fin de la leçon. », et seule sa 1re réponse compte ; la case 1 de l'exemple 2 (partie 10) ne compte pas, même ratée.
- [ ] **Step 3: Test de propriété** — 500 tirages par niveau : deux termes de même signe, négatifs ≈ 70 % (entre 60 % et 80 % sur 500), tailles 1–9 / 10–99 / 100–999, `resolution` en 3 lignes correctes (`−3 + (−5)`, `= −(3 + 5)`, `= −8`), `wrongValues` jamais égal à la bonne réponse, et le calcul-piège de chaque erreur est reconnu comme cette erreur ; `droiteExercise(c01, rng)` 500 tirages ≤ 8 graduations.
- [ ] **Step 4: Lancer** `npm test -w @pom/engine -- c01` — attendu : FAIL.
- [ ] **Step 5: Implémenter** les données (copier les textes du doc 06), `feedbackText` (table indexée par `question.kind` + `promptLatex`/`ex`, jamais par numéro d'écran), les assistants partagés.
- [ ] **Step 6: Lancer** `npm test -w @pom/engine` — attendu : PASS (les tests de `lessons.test.ts` et `module.test.ts` sur tous les cours restent verts). **Commit** `feat(engine): Course 1 v2 with interactive lesson, practice series and guided examples`

---

### Task 11: « Demander à Clément » côté élève

**Modèle : Sonnet. Vague 3. Dépend de : T1, T5. En parallèle avec : T8, T9, T10.**

**Files:**
- Modify: `apps/web/src/store/db.ts` (`DB_VERSION` 5, magasins `asks` — envois en attente — et `questions` — copie du serveur —, `DB_SCHEMA`), `apps/web/src/store/sync.ts` (un appel `flushAsks()` et `refreshQuestions()` dans `flush`/`refreshRemote`/`startSync`), `apps/web/src/components/{AskClement,HomeBubble,ClementCard}.tsx`, `apps/web/src/screens/{Questions,QuestionDetail}.tsx`, `apps/web/src/styles/questions.css`, `e2e/shots.ts` (schéma de base)
- Create: `apps/web/src/store/questions.ts`
- Modify: `packages/engine/src/feedback.ts` (export `feedbackText(f: Feedback): string`, texte brut de la correction)
- Test: `apps/web/test/questions-store.test.ts`, `apps/web/test/clement.test.tsx`, `apps/web/test/progress.test.tsx` (cohérence du schéma)

**Interfaces:**
- Consumes: `postQuestion`, `getMyQuestions`, `markQuestionRead` (T1), routes `questions` / `question`, `Feedback`.
- Produces: `askClement(input: Omit<NewClementQuestion, 'id' | 'askedAt'> ): Promise<string>` (id `crypto.randomUUID()`, écrit dans `asks`, envoie si réseau) ; `useMyQuestions(): ClementQuestion[]` (serveur + envois en attente, ceux-ci marqués « Envoyée, en attente de réseau ») ; `useUnreadCount(): number` (répondues et `readAt` nul) ; `markRead(id): Promise<void>` ; `refreshQuestions(): Promise<void>`.

Écrans : sous un retour **faux** d'une activité enregistrée (pas « Relire »), bouton discret « Demander à Clément » (le prénom vient de la dernière réponse reçue, sinon « Clément ») → feuille (`ui/Sheet`) avec le résumé (calcul, « Ta réponse », « La bonne réponse »), petit mot facultatif (≤ 500) et « Envoyer » ; après envoi : « Envoyé. Clément te répondra ici. » et le bouton passe en « Envoyé ». Barre du haut de l'accueil : bulle ronde 44 px, grise sans nouveauté, colorée avec point si `useUnreadCount() > 0`, ouvre `#/questions` (« Mes questions » : liste, réponse en dessous de la question, « Pas encore de réponse »). Carte d'accueil « Clément a répondu à ta question » **seulement** si non lue ; l'ouvrir ou voir la réponse appelle `markRead`.

- [ ] **Step 1: Tests du magasin** — `askClement` hors ligne : 1 entrée dans `asks`, aucun `fetch` ; retour du réseau (`flush`) : un seul `postQuestion` avec le même `id` ; second `flush` : rien ; rechargement (nouvelle instance du magasin) puis `flush` : toujours un seul envoi par id ; erreur 409/400 → l'entrée est supprimée (pas de boucle) ; erreur réseau → conservée ; `useUnreadCount` : 0 sans réponse, 1 avec réponse non lue, 0 après `markRead` ; un compte B sur le même téléphone ne voit pas les envois de A.
- [ ] **Step 2: Tests d'écran** — après une erreur à une question de cours, « Demander à Clément » est visible ; absent après une bonne réponse, hors enregistrement (`record` faux), et pour un suiveur ; envoyer avec un mot de 501 caractères est bloqué ; la bulle est grise sans nouveauté et a `data-unread="true"` avec réponse non lue ; la carte n'apparaît que si non lue et disparaît après ouverture ; `#/questions` liste les questions avec leur réponse.
- [ ] **Step 3: Lancer** `npm test -w web -- questions clement progress` — attendu : FAIL.
- [ ] **Step 4: Implémenter** ; migration IndexedDB 4 → 5 (`createObjectStore('asks')`, `('questions')`), sans toucher aux magasins existants.
- [ ] **Step 5: Lancer** `npm test -w web` — attendu : PASS. **Commit** `feat(web): ask Clément from an error, My questions screen and unread bubble`

---

### Task 12: « Demander à Clément » côté suiveur (page de suivi)

**Modèle : Sonnet. Vague 2. Dépend de : T1 (fonctions `api.ts`, route `suivi-question`). En parallèle avec : T2, T3, T4, T5, T6, T7.**

**Files:**
- Modify: `apps/web/src/screens/Dashboard.tsx`, `apps/web/src/store/follow.ts` (clé `questions:<eleveId>` dans le magasin `follow`, lisible hors ligne), `apps/web/src/screens/SuiviQuestion.tsx`
- Test: `apps/web/test/dashboard.test.tsx`, `apps/web/test/suivi-question.test.tsx`

**Interfaces:**
- Consumes: `getStudentQuestions`, `answerQuestion`, `ClementQuestion`, route `suivi-question`.
- Produces: dans la page de suivi d'une élève, une section « Questions à Clément » avec badge du nombre de questions **sans réponse** et une ligne par demande (calcul, « Sa réponse », « La bonne réponse », mot, date, « Répondre ») ; l'écran `SuiviQuestion` affiche la demande en entier, un champ texte (≤ 2000) et « Envoyer la réponse » (désactivé si vide après `trim`), puis retour au suivi ; une demande déjà répondue montre la réponse et « Modifier ma réponse ».

- [ ] **Step 1: Tests** — badge « 2 » avec 2 questions sans réponse, absent à 0 ; la liste vient du cache hors ligne quand le réseau échoue ; `Envoyer la réponse` désactivé sur `'   '` ; envoi → `answerQuestion(token, eleve, id, texte)` appelé une fois puis retour ; erreur 403 → message « Tu ne suis plus cette élève. » ; un texte de 2001 caractères est refusé avant l'envoi.
- [ ] **Step 2: Lancer** `npm test -w web -- dashboard suivi-question` — attendu : FAIL.
- [ ] **Step 3: Implémenter** (même mise en page que `suivi.html` ; pas d'emoji).
- [ ] **Step 4: Lancer** `npm test -w web` — attendu : PASS. **Commit** `feat(web): follower sees and answers Clément questions`

---

### Task 15: Cours 0 v3 (données, textes, tests)

**Modèle : Sonnet. Vague 3, deuxième moitié (numérotée 15 pour ne pas renuméroter les tâches ci-dessus). Dépend de : T1, T3 (fiche mémo), T7 (formats), T8 (étapes interactives, dont « toucher un morceau » et « toucher un endroit »), T9 (série de pratique, comparer, aide qui s'efface). Démarre quand T8 et T9 sont fusionnées ; T10 et T11 peuvent encore tourner. Seule à toucher `c00-bien-ecrire.ts`.**

**Spec :** `docs/validation/06-cours-relatifs.md` (partie « Cours 0 », version 3), `docs/validation/08-decisions-ecrans.md` (n° 43 à 50), maquette `docs/design/ecrans/cours-0-v3.html` (textes, ordre, animations).

**Files:**
- Modify: `packages/engine/src/courses/calculs/c00-bien-ecrire.ts` (réécriture des `parts` ci-dessous, `lessonLength: 11`, `feedbackText`, `rule.partIndex` des 4 erreurs ; `memo` déjà posé par T3, texte vérifié ici)
- Modify: `packages/engine/src/courses/types.ts` (`Compare.line` devient **optionnel**, et `Compare` gagne `highlight?: { a: SceneToken[]; b: SceneToken[] }` : les deux calculs montrés après la réponse, morceaux surlignés ; le Cours 1 v2 garde `line`), `apps/web/src/components/questions/Comparer.tsx` (sans `line` : montrer `highlight` à la place de la droite)
- Pas de modification de `shared.ts` (propriété de T10) : les assistants manquants sont définis en tête de `c00-bien-ecrire.ts` ; leur factorisation avec `shared.ts` se fait à la relecture (T14)
- Test: `packages/engine/test/courses/c00.test.ts` (mis à jour), `packages/engine/test/courses/c00-texts.test.ts` (nouveau), `apps/web/test/c00-lesson.test.tsx` (nouveau)

**Interfaces:**
- Consumes: tous les types de T1 (`StepAction` `trou` / `morceau` / `endroit` / `comprends`, `PartTexts.{series, above, help, mention, uncounted, compare}`, `MemoCard`) ; assistants existants (`etapes`, `decouverte`, `choix`, `exemple`, `texted`, `lecon`) ; question `reecrire` existante.
- Produces: `c00` avec les parties suivantes (indices **fixes**, utilisés par `partIndex` et par T13). Le calcul de l'écran « morceau » est découpé en morceaux : un nombre = un morceau, chaque signe et chaque parenthèse = un morceau (`−6 + 2 − 5` : `−`, `6`, `+`, `2`, `−`, `5`).

| Index | Partie | Contenu (doc 06, écran) |
|---|---|---|
| 0 | `decouverte` : `choix` « ce calcul est-il bien écrit ? » 4 × −3 + `intro` | écran 1 ; attendu Non ; retours du tableau « Questions pour deviner » |
| 1 | `etapes` « Le signe − a deux rôles » | écran 2 : étapes 1 et 2 lues ; étape 3 `morceau` (calc −6 + 2 − 5, cible : le 5e morceau) ; étape 4 `trou` (« le signe du nombre » / « une soustraction ») |
| 2 | `etapes` « Quand deux signes se touchent » | écran 3 : étape 1 lue ; étape 2 `morceau` (4 × −3, cible : le −) ; étape 3 `endroit` (cible : l'espace 2, entre × et −) ; étape 4 encadré Règle 1 |
| 3 | `choix` (activité `lecon`) « Comment écrire correctement ce calcul ? » 5 + −2, `above` : les deux paires 7 − −1 → 7 − (−1) et 8 ÷ −4 → 8 ÷ (−4) | écran 4 ; attendu 5 + (−2) ; **compté** |
| 4 | `decouverte` : `choix` règle 2 (−3 + 5, Oui / Non) + encadré Règle 2 et « pas faux, mais inutile » | écran 5 ; attendu Non ; titre « Pas besoin. » si Oui |
| 5 | `etapes` « Le moins se met avant le nombre » | écran 6 : étape 1 lue ; étape 2 `morceau` (3 − + 4, cible : le −) ; étape 3 `endroit` (calcul 3 + 4, cible : l'espace 0, avant le 3) ; étape 4 encadré Règle 3 |
| 6 | `etapes` « Une parenthèse ouverte se ferme » | écran 7 : étape 1 lue ; étape 2 `trou` (« s'arrête » / « commence ») ; étape 3 `endroit` (tokens 4 × ( − 3, espaces 1 à 5, cible 5) ; étape 4 encadré Règle 4 |
| 7 | `choix` « Lequel est bien écrit ? » [7−] [−7] | écran 8, 1re question ; **compté** |
| 8 | `choix` « Que manque-t-il à ce calcul ? » 4 × (−3, `joinPrevious: true` | écran 8, 2e question ; **compté** |
| 9 | `decouverte` : `choix` + `compare` (A 4 × (−3), B 4 × −3 ; `highlight`, sans droite) | écran 9 ; attendu « La façon de l'écrire » |
| 10 | `etapes` « Les 4 règles à retenir » | écran 10 : `recap` des 4 règles + « Maintenant, à toi de les utiliser. » |
| 11 | `pratique` « Cours 0 · Pratique » | écran 11 : Q1 `erreur` (le « Toucher la faute » existant : 5 + −2 en 4 cases, bonnes cases le + **ou** le −, consigne avec la règle 1 rappelée), Q2 `choix` (4 × (−3, 3 règles, attendu la 3e), Q3 `choix` Vrai / Faux sur −6 − (−2) × 4 (attendu Vrai), Q4 `reecrire` 9 + −4 |
| 12 | `etapes` exemple 1 (résolution à l'écran) | écran 12 : 2 actions `comprends`, lignes « Signes collés : × et − » et « On met −2 entre parenthèses : 6 × (−2) » |
| 13 | `exemple` `reecrire` « Le calcul bien écrit : ▢ » (6 × (−2)), `above` les 2 lignes | écran 12, dernière ligne ; **compté** |
| 14 | `exemple` `reecrire` « Le − passe devant le 3 : ▢ + 4 » (−3), `uncounted` | écran 13, case 1 (calcul de départ 3− + 4 toujours affiché) |
| 15 | `exemple` `reecrire` « Le calcul bien écrit : ▢ » (−3 + 4), `above` la ligne de la case 1 remplie | écran 13, case 2 ; **compté** |
| 16 | `etapes` annonce « Place aux 5 exercices de fin » | écran 14 |

Les écrans 15 à 18 de la maquette (modèle d'exercice de fin, résultat, Mes cours, fiche) ne sont pas des parties : les 5 exercices de fin sont générés (« Toucher la faute », inchangé), le résultat et Mes cours existent déjà, la fiche est celle de T3. `lessonLength = 11` (parties 0 à 10) ; `lessonStep(c00, i)` donne « étape N sur 10 » (la partie 8 partage l'écran de la 7) : parties 0 à 6 → 1 à 7, parties 7 et 8 → 8, partie 9 → 9, partie 10 → 10. **Notées : parties 3, 7, 8, 11 (×4), 13, 15 et les 5 fins = 1 + 1 + 1 + 4 + 1 + 1 + 5 = 14.** `rule.partIndex` : `signes-colles` → 2, `parentheses-en-tete` → 4, `moins-apres` → 5, `parenthese` → 6. Le générateur, les erreurs reconnues et leurs calculs-pièges sont **inchangés**. `formats` reste non défini : les révisions et l'entraînement du Cours 0 gardent leur tirage (Classer, Quelle règle ?, Lequel est bien écrit ?, Réécris, Toucher la faute). `feedbackText` couvre le tableau « Questions qui comptent » (écrans 4, 8, 11, 12, 13) pour les réponses justes **et** fausses, y compris la case 1 de l'exemple 2 (non notée, messages affichés quand même).

- [ ] **Step 1: Tests de texte** (`c00-texts.test.ts`, une ligne de table du doc 06 = un cas) — pour chaque partie `etapes` : titre et chaque `text` mot pour mot, et la consigne de chaque action ; les **17 lignes** du tableau « Étapes interactives » : `part.steps[i].action.errors` (indices touchés → message), `fallback`, `errors[choix]` du trou (ex. `partie 2, étape 3, espace entre − et 3 → « Là, elle couperait −3 en deux. Le − fait partie du nombre : il doit être dedans. »`, `partie 1, étape 3, toucher le 6 → « Ce n'est pas un −. Cherche les deux traits − du calcul. »`) ; les **7 lignes** de « Questions pour deviner et pour comprendre » ; chaque ligne de « Questions qui comptent » : `c00.feedbackText(question, outcome)` renvoie le texte du tableau (ex. `écran 11 Q4, « 9 + (4−) » → « Le signe − se met avant le 4 : 9 + (−4). »`, `écran 13 case 2, « (−3) + 4 » → « Pas tout à fait. En tête du calcul, on n'écrit pas de parenthèses : −3 + 4. »`, `écran 12, « 6 × −2 » → « Le × et le − se touchent encore. Mets −2 entre parenthèses. »`) ; `c00.memo.tip === "Cherche d'abord les signes qui se touchent, puis demande-toi pour chaque − : il soustrait, ou c'est le signe d'un nombre ?"` (doc 08 n° 47).
- [ ] **Step 2: Tests de structure** — `c00.parts.length === 17`, `lessonLength === 11`, types de partie dans l'ordre du tableau ; `lessonStep` comme ci-dessus ; `courseRunItems(c00, rng)` → exactement **14** éléments notés (`activity` ∈ `lecon | exemple | fin`, hors `decouverte`) ; les questions des parties 0, 4, 9 et la case 1 (partie 14) sont `decouverte` ; aucune action d'étape n'est notée ; toutes les cibles `morceau` sont des indices de morceaux de leur calcul, toutes les cibles `endroit` sont des espaces valides (0 à n), la cible du trou est un indice de ses choix ; `rule.partIndex` pointe une partie dont l'encadré porte le même numéro de règle ; **repassage** (doc 08 n° 49) : avec l'aide de test de `lessons.test.ts`, une question de la partie 11 ratée repasse **avant** le premier exercice de fin, avec « Tu retrouveras ce calcul à la fin de la leçon. », et seule sa 1re réponse compte dans la note ; une erreur à une étape interactive ne produit aucun événement.
- [ ] **Step 3: Test de propriété** — les tests existants de `c00.test.ts` (500 tirages par niveau : « Toucher la faute », cases acceptées pour les 3 fautes, `parentheses-en-tete` seulement en réponse tapée, générateur niveaux 1 à 3, calculs-pièges reconnus) restent **tels quels** et verts ; ajouter : les 5 exercices de fin tirés pour 500 graines contiennent « tout bien écrit » environ 1 fois sur 5 (entre 10 % et 30 % sur 2 500 exercices).
- [ ] **Step 4: Test d'écran** (`c00-lesson.test.tsx`, vrai Cours 0) — écran 2 : « Touche le − qui sert à soustraire. » ; toucher le premier − → bloc « Pas tout à fait. Ce − est tout au début : il n'y a rien à soustraire. C'est le signe de −6. Essaie encore. » ; toucher le bon − → la phrase de suite remplace « Suite » (jamais affiché) ; écran 3 étape 3 : trois emplacements ≥ 44 px, le bon fait apparaître « 4 × (−3) » ; écran 6 étape 3 : un − « à placer » et trois emplacements, le bon l'amène devant le 3 ; écran 7 étape 3 : cinq emplacements, le bon fait apparaître « ) » ; écran 9 : après la réponse, les parenthèses de A et les signes collés de B sont surlignés, aucune droite ; aucune couleur orange ou bleue dans tout le cours ; après 4 étapes de lecture seules 2 phrases visibles ; l'écran 11 affiche « Question 1 sur 4 » ; hors ligne, la fiche s'ouvre (« Voir la fiche mémo » depuis Mes cours **avant** la validation).
- [ ] **Step 5: Lancer** `npm test -w @pom/engine -- c00` puis `npm test -w web -- c00-lesson` — attendu : FAIL.
- [ ] **Step 6: Implémenter** les données (copier les textes du doc 06 et de la maquette mot pour mot), `feedbackText` (table indexée par `question.kind` + `promptLatex`, jamais par numéro d'écran), le type `Compare` assoupli et `Comparer.tsx`.
- [ ] **Step 7: Lancer** `npm test` et `npx tsc --noEmit` (3 paquets) — attendu : PASS (les tests de `lessons.test.ts` et `module.test.ts` sur tous les cours restent verts ; le Cours 1 v2 est inchangé). **Commit** `feat(engine): Course 0 v3 with interactive lesson, practice series and fading help`

---

### Task 13: e2e du Cours 1 v2, du Cours 0 v3 et des nouvelles fonctions

**Modèle : Sonnet. Vague 4. Dépend de : T3 à T12 et T15. Seule dans sa vague.**

**Files:**
- Modify: `e2e/driver.ts` (gestes : trou, graduation, morceau, endroit, « Je comprends », pratique, comparer), `e2e/fixtures.ts`, `e2e/eleve.spec.ts`
- Create: `e2e/cours1.spec.ts`, `e2e/cours0.spec.ts`, `e2e/fonctions.spec.ts`

- [ ] **Step 1: Écrire** `cours1.spec.ts` : parcours complet du Cours 1 v2 (7 écrans de leçon avec erreurs volontaires sur la droite et sur un trou, comparer, 4 questions de pratique dont une ratée, 2 exemples guidés, annonce, 5 fins justes) → écran « Cours 1 validé » ; vérifier la pastille « Cours 1 · Leçon · étape 7 sur 7 » et que `localStorage`/réseau ne reçoivent aucun événement `answer` pour les actions interactives ; vérifier à 360 et 390 px qu'aucune page ne déborde (`scrollWidth`) ; variante : rater les 5 fins → « Tes erreurs : » avec « Relire la règle 2 » qui rouvre la partie 5 ; une question de la série ratée **repasse avant les fins** ; la case 1 de l'exemple 2 ratée ne change pas la note.
- [ ] **Step 1 bis: Écrire** `cours0.spec.ts` : parcours complet du Cours 0 v3 (10 écrans de leçon avec erreurs volontaires sur un morceau touché, un endroit touché et un trou ; « Comparer deux cas » ; série de 4 questions dont une ratée qui repasse avant les fins ; exemple 1 (« Je comprends » ×2 puis la case) ; exemple 2 (deux cases, la case 1 ratée) ; annonce ; 5 fins justes) → écran « Cours 0 validé » ; vérifier la pastille « Cours 0 · Leçon · étape 10 sur 10 », que la note est calculée sur **14** questions (un cours raté affiche « N bonnes réponses sur 14 »), qu'aucun événement `answer` n'est envoyé pour les étapes interactives, qu'aucune couleur orange ou bleue n'apparaît, qu'aucune page ne déborde à 360 et 390 px (`scrollWidth`) ; variante : rater les 5 fins → « Relire la règle 1 » rouvre la partie 2 ; **la fiche mémo du Cours 0 s'ouvre depuis Mes cours avant la validation** (« Voir la fiche mémo » sur la carte « À valider »), hors ligne.
- [ ] **Step 2: Écrire** `fonctions.spec.ts` : fiche mémo hors ligne (`context.setOffline(true)`) depuis Mes cours et depuis « Cours validé » ; échauffement à la 1re ouverture du jour puis rechargement (pas de 2e) ; « Demander à Clément » hors ligne → retour du réseau → la demande apparaît côté suiveur (fixtures `page.route`), réponse du suiveur → bulle colorée + carte côté élève, puis lue ; « Écouter » avec `speechSynthesis` simulé (appel `speak`, `lang 'fr-FR'`, `cancel` en quittant l'écran).
- [ ] **Step 3: Lancer** `npm run e2e` — attendu : tous les parcours verts (les 4 existants compris, adaptés au Cours 1 v2 et au Cours 0 v3 dans `driver.ts`).
- [ ] **Step 4: Commit** `test(e2e): Course 1 v2, Course 0 v3 and new features`

---

### Task 14: Relecture finale, captures, mise en ligne, avancement

**Modèle : relecture par un assistant plus capable que Sonnet (Opus) pour l'étape 1 ; le reste Sonnet. Vague 5. Dépend de : T13. Seule.**

**Files:**
- Modify: `e2e/shots.ts` (nouvelles situations), `docs/superpowers/plans/2026-11-22-etape-1-avancement.md`, `docs/deploiement.md` (migration 0002)

- [ ] **Step 1: Relecture de toute la branche** par un assistant frais : `git diff <base>..HEAD`, contrôle des Global Constraints (textes mot pour mot contre le doc 06, couleurs, cibles, hors ligne), des 6 lignes de Review Focus, des décisions n° 43 à 50 et des 3 points restés ouverts ; factorisation des assistants de `c00-bien-ecrire.ts` avec `shared.ts` ; corrections en commits séparés.
- [ ] **Step 2: Captures téléphone** (390 × 844, clair et sombre) : `npm run shots -- cours1-droite cours1-trou cours1-comparer cours1-pratique cours1-exemple cours0-morceau cours0-endroit cours0-comparer cours0-pratique cours0-exemple fiche echauffement clement-envoi clement-mes-questions clement-suivi accueil-bulle ecouter` ; sortie 0 (aucun débordement, aucune erreur console) ; relecture visuelle avec `ui-design-review:review`.
- [ ] **Step 3: Mise en ligne** : `npm ci`, `npm test`, `npm run e2e`, puis (jeton du porteur du projet) `cd apps/api && npx wrangler d1 migrations apply plus-ou-moins --remote` **avant** `CLOUDFLARE_ACCOUNT_ID=7aeceb03afcfd29a243fabb675907335 npm run deploy` ; vérifier `/api/questions` (401 sans jeton) et le Cours 1 v2 dans l'appli en ligne.
- [ ] **Step 4: Mettre à jour** `docs/superpowers/plans/2026-11-22-etape-1-avancement.md` : section « Cours 1 v2 et fonctions (2026-11-25) » (ce qui est fait, tests, Cours 0 v3, briques réutilisables pour les cours 2 à 7, points ouverts tranchés ou non) ; commit `docs: progress after Course 1 v2 and new features`.

---

## Auto-relecture

- **Couverture de la spec :** briques (T1, T2, T8, T9) ; Cours 1 v2 (T10 ; 11 questions, erreurs, `partIndex`, fiche, formats, `lessonLength`, tests textes/propriété) ; fiche mémo (T3, Cours 0 compris, avant validation : n° 46) ; échauffement (T4) ; Clément (T5 API, T11 élève, T12 suiveur ; table dédiée choisie car le suiveur écrit) ; Écouter (T6) ; fin (T13, T14). Cours 0 v3 (T15 : 17 parties, 14 questions notées, étapes `morceau` / `endroit` / `trou` de T8, série et comparer de T9, fiche de T3).
- **Cohérence des noms :** `LineScene`, `StepAction`, `MemoCard`, `ReviewFormat`, `ClementQuestion`, `Warmup`, `LineView`, `canOpenMemo`, `feedbackText` sont définis une fois (T1, T3, T4) et réutilisés tels quels ; indices de parties de T10 repris par T13.
- **Fichiers partagés :** `Activity.tsx`, `Home.tsx`, `router.tsx`, `api.ts` et les CSS ne sont modifiés que par T1 ; `App.tsx` : T1 (cas de routes) puis T4 (porte d'échauffement) seulement ; `NumberLine.tsx` : T2 seule ; `Etapes.tsx` : T8 seule ; `Dashboard.tsx` : T12 seule ; `c01` : T10 seule ; `c00-bien-ecrire.ts` : T15 seule (T3 n'y pose que le champ `memo`, avant) ; `Compare` (`types.ts`) et `Comparer.tsx` : T1 et T9 d'abord, puis T15 pour le cas sans droite ; `dashboard.ts` : T4 seule.
