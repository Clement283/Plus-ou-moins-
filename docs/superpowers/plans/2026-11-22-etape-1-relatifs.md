# Étape 1 « Calculs : relatifs » — Plan d'implémentation (version 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** Livrer une PWA mobile utilisable de bout en bout (cours, révisions espacées, entraînement, hors-ligne, page de suivi) avec le module 1 « Calculs » : le Cours 0 « Bien écrire un calcul » et les 7 cours « Relatifs ».

**Architecture :**
- **Monorepo npm workspaces.** Un paquet TypeScript pur, `@pom/engine`, contient le « cerveau » : maths exactes, saisie brute, cours, fabrication des 8 types d'exercices, répétition espacée, liste des révisions, temps du jour, statistiques de suivi. Il est utilisé par l'appli web React (PWA, IndexedDB) et par le Worker Cloudflare.
- **Le serveur ne stocke qu'un journal d'événements en ajout seul.** L'état (progression, révisions à faire, page de suivi) est obtenu en « repliant » ce journal (`foldProgress`, `computeDashboard`). Sur le téléphone, cet état est **mis en cache et mis à jour à chaque nouvel événement**, sans recalcul quotidien.

**Tech Stack :** TypeScript strict, Vite, React 18, vite-plugin-pwa (Workbox), idb, KaTeX (calculs « comme sur une copie », fractions empilées), Hono sur Cloudflare Workers (Static Assets + API), D1, Vitest (+ @cloudflare/vitest-pool-workers, @testing-library/react, fake-indexeddb), Playwright (Chromium préinstallé).

**Spec :** `docs/superpowers/specs/2026-11-22-plus-ou-moins-v1-design.md`

**Documents validés (font foi, avant ce plan en cas de doute) :** `docs/validation/01` à `06`, tous au statut « Validé ». **Les tests de la logique sont les tableaux « Exemples » de ces documents**, recopiés tels quels : une ligne = un cas `it.each`. Aucun test ne doit inventer de valeur absente des documents.

## Avancement

- **Phase A (tâches 1-2), documents de logique : ✅ terminée.** Les 6 documents sont validés par le porteur du projet le 2026-11-22.
- **Phase B (tâches 3-6) :** infrastructure.
- **Phase C (tâches 7-15) :** logique validée, écrans, page de suivi, déploiement.

## Global Constraints

- Toute l'interface est en **français**.
- **Exercices, révisions et entraînement s'affichent comme sur une copie :**
  - notation normale rendue par KaTeX ;
  - fractions **empilées** ;
  - un nombre négatif entre parenthèses sauf en tête de calcul ;
  - **aucune couleur ni aide visuelle** sur les calculs.

  Couleurs et **animations** sont réservées aux leçons, aux exemples guidés et aux explications d'erreur (doc 06, règles communes).
- **Saisie entièrement manuelle (doc 03 §1) :** l'appli ne modifie jamais ce que l'élève tape.
- Le « jour » est toujours celui d'**Europe/Paris**.
- **Le serveur est la source de vérité.** Chaque événement a un `id` (UUID v4) créé sur le téléphone, et l'insertion côté serveur est idempotente.
- Correction et explications **sur le téléphone, sans appel serveur**.
- Données personnelles : uniquement un prénom ou pseudo et un code haché. Pas d'email.
- **Cloudflare, offre gratuite :** un seul Worker (assets + `/api/*`) et une base D1.
- Mobile d'abord : iPhone (Safari) et Android (Chrome), installable sur l'écran d'accueil.
- Pas de notifications, pas d'admin graphique, pas d'écriture au doigt, pas d'inscription publique, pas de choix de module en V1 (spec §2).
- Styles **sobres et centralisés** dans `apps/web/src/theme.css`, pour le rhabillage à l'étape design. Chaque module expose une couleur de thème via une variable CSS.
- **Règle de validation (spec §11) :** toute logique visible absente des documents validés est **demandée au porteur du projet avant d'être codée**. Les choix purement techniques lui sont annoncés.
- Commits : messages en anglais, terminés par les lignes d'attribution fournies par le harnais.

## Review Focus

1. **Réponses envoyées deux fois.** Une réponse donnée hors ligne, puis un réseau qui coupe pendant l'envoi : chaque réponse doit apparaître une seule fois sur le serveur et sur la page de suivi. Tests dans les tâches 5 et 6.
2. **Passage de minuit, à Paris ou ailleurs.** Une réponse à 23 h 59 puis une à 0 h 01, heure de Paris (y compris le jour du changement d'heure), ou un téléphone réglé sur un autre fuseau : les jours sont ceux de Paris. Test dans la tâche 4.
3. **Retour après une absence.** 12 révisions en attente donnent des séances de 5 + 5 + 2, dans l'ordre des dates, sans rien perdre. Une séance interrompue ne compte pas les révisions non terminées. Test dans la tâche 12.
4. **Téléphone vidé ou nouveau téléphone.** Après reconnexion avec le même code, l'état est identique. Test dans la tâche 6.
5. **Exercices générés impossibles ou ambigus.** Pas de division par 0, pas de quotient non entier au cours 6, pas de trou à plusieurs réponses, pas de doublon parmi les choix, les paires ou les étiquettes, pas de piège égal à la bonne réponse. Tests de propriété sur 1 000 tirages dans les tâches 8 et 9.

Cas additionnels épinglés :
- **Saisie mal écrite** (« 3− », « (−3 », fraction au dénominateur vide) : jamais de plantage, toujours l'erreur d'écriture prévue. Tâche 7.
- **Même calcul raté en boucle :** « Passer » apparaît au 2e échec, et seule la 1re réponse compte. Tâche 13.

---

## Structure des fichiers

```
package.json                         workspaces: packages/*, apps/*
tsconfig.base.json
packages/engine/src/
  math/rational.ts                   fractions exactes
  math/expr.ts                       arbre d'expression, évaluation, rendu LaTeX
  rng.ts, time.ts, events.ts
  input/raw.ts                       saisie brute (jetons, fraction empilée) + lecture (tâche 7)
  courses/types.ts                   ModuleDef, CourseDef, Exercise, LessonPart…
  courses/calculs/index.ts           module « Calculs » (thème, ordre des cours)
  courses/calculs/c00-bien-ecrire.ts … c07-multiplier-plusieurs.ts
  courses/index.ts                   registre MODULES / getCourse
  exercises/types.ts                 Question (8 types), Answer, Outcome
  exercises/build/*.ts               un fabricant par type (tâche 9)
  exercises/check.ts                 juste/faux + erreur enregistrée
  srs.ts                             échelle A–H, validation de cours, foldProgress (tâche 11)
  reviews.ts                         liste des révisions, séances, composition (tâche 12)
  daily.ts                           temps du jour (tâche 12)
  activity.ts                        file d'activité : repassages, « Passer » (tâche 13)
  dashboard.ts                       computeDashboard (tâche 14)
  index.ts
apps/api/   (Hono, D1, migrations, wrangler.toml)
scripts/create-user.ts
apps/web/src/
  theme.css, api.ts, store/{db,sync,state}.ts
  components/Math.tsx, components/Keypad.tsx, components/questions/*.tsx, components/LessonPart.tsx
  screens/{Login,Home,Modules,Course,Review,Practice,Dashboard,DashModule,DashCourse}.tsx
e2e/*.spec.ts
```

---

## Phase B : infrastructure

### Task 3 (Tâche 3) : Monorepo et maths exactes

**Files :**
- Create: `package.json`, `tsconfig.base.json`, `packages/engine/{package.json,tsconfig.json,vitest.config.ts}`, `packages/engine/src/math/rational.ts`, `packages/engine/src/math/expr.ts`, `packages/engine/src/rng.ts`, `packages/engine/src/index.ts`
- Test: `packages/engine/test/rational.test.ts`, `packages/engine/test/expr.test.ts`

**Interfaces :**
- Produces :
  - `type Rational = { n: number; d: number }` (normalisé : `d > 0`, `pgcd(|n|, d) = 1`).
  - `rat(n, d = 1)` (lève une erreur si `d = 0`).
  - `add`, `sub`, `mul`, `div` (`div` lève une erreur sur 0), `neg`, `eqRat`, `ratToString` (`"-12/5"`).
  - `type Expr = { k: 'num'; v: Rational } | { k: 'op'; op: '+' | '-' | '*' | '/'; a: Expr; b: Expr } | { k: 'pow'; a: Expr; e: number }`.
  - Aides de construction : `num`, `op`, `pow`.
  - `evaluate(e: Expr): Rational`.
  - `toLatex(e: Expr): string`.
  - `terms(e: Expr): Expr[]` (termes d'une somme, pour les cours 3 et 7).
  - `type Rng = () => number`, `seededRng(seed)` (mulberry32), `randInt(rng, min, max)`, `pick(rng, arr)`, `shuffle(rng, arr)`.

- [ ] **Étape 1 : écrire les tests qui échouent.**

```ts
expect(add(rat(3,4), rat(1,6))).toEqual({ n: 11, d: 12 });
expect(rat(2,-4)).toEqual({ n: -1, d: 2 });
expect(() => div(rat(1), rat(0))).toThrow();
expect(toLatex(op('+', num(-3), num(-5)))).toBe('-3 + (-5)');      // négatif en tête : sans parenthèses
expect(toLatex(op('*', num(4), num(-3)))).toBe('4 \\times (-3)');
expect(toLatex(op('/', num(-12), num(4)))).toBe('-12 \\div 4');
expect(toLatex(pow(num(-3), 2))).toBe('(-3)^{2}');
expect(evaluate(op('-', num(3), op('*', num(2), num(-4))))).toEqual(rat(11));
expect(seededRng(42)()).toBe(seededRng(42)());
```

- [ ] **Étape 2 :** lancer `npm test -w @pom/engine`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Parenthésage selon les priorités, avec un négatif entre parenthèses sauf en tête (doc 06). Les signes « − » sont émis en `-`, KaTeX rend le moins typographique.
- [ ] **Étape 4 :** lancer `npm test -w @pom/engine`. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Task 4 (Tâche 4) : Journal d'événements et jour de Paris

**Files :**
- Create: `packages/engine/src/time.ts`, `packages/engine/src/events.ts`
- Test: `packages/engine/test/time.test.ts`, `packages/engine/test/events.test.ts`

**Interfaces :**
- Produces :
  - `parisDay(ms): string` (`'YYYY-MM-DD'`).
  - `addDays(day, n): string`.
  - `diffDays(a, b): number`.

```ts
type Activity = 'lecon' | 'exemple' | 'fin' | 'rattrapage' | 'revision' | 'entrainement';
type QuestionKind = 'saisie' | 'trou' | 'ordre' | 'erreur' | 'paires' | 'classer' | 'qcm' | 'vraifaux';
type ErrorFamily = 'signe' | 'ecriture' | 'calcul' | 'autre';
type AppEvent = { id: string; userId: string; at: number; day: string } & (
  | { kind: 'answer'; activityId: string; activity: Activity; moduleId: string; courseId: string;
      level: 1 | 2 | 3; questionKind: QuestionKind; prompt: string; given: string; expected: string;
      correct: boolean; unfinished: boolean /* « Simplifie » */; errorType: string | null;
      errorFamily: ErrorFamily | null; attempt: number /* 1 = première réponse */; skipped: boolean;
      durationMs: number }
  | { kind: 'lesson_part_done'; activityId: string; moduleId: string; courseId: string; partIndex: number; durationMs: number }
  | { kind: 'activity_end'; activityId: string; activity: Activity; moduleId: string; courseId: string | null; completed: boolean }
);
```

  - `isAppEvent(x): x is AppEvent`.

- [ ] **Étape 1 : écrire les tests qui échouent** (Review Focus n° 2).

```ts
expect(parisDay(Date.parse('2026-11-22T22:59:00Z'))).toBe('2026-11-22');
expect(parisDay(Date.parse('2026-11-22T23:01:00Z'))).toBe('2026-11-23');
expect(parisDay(Date.parse('2026-07-01T21:59:00Z'))).toBe('2026-07-01');
expect(parisDay(Date.parse('2026-07-01T22:01:00Z'))).toBe('2026-07-02');
expect(parisDay(Date.parse('2026-10-25T00:30:00Z'))).toBe('2026-10-25');
expect(addDays('2026-03-25', 10)).toBe('2026-04-04');
expect(isAppEvent({ kind: 'answer' })).toBe(false);
```

- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS, aussi avec `TZ=America/New_York`.
- [ ] **Étape 5 : commit.**

### Task 5 (Tâche 5) : Serveur (Worker, D1, connexion, journal)

**Files :**
- Create: `apps/api/{package.json,wrangler.toml,vitest.config.ts}`, `apps/api/migrations/0001_init.sql`, `apps/api/src/{index,auth}.ts`, `apps/api/src/routes/{events,students}.ts`, `scripts/create-user.ts`
- Test: `apps/api/test/api.test.ts`

**Interfaces :**
- Consumes : `AppEvent`, `isAppEvent`.
- Produces (JSON, `Authorization: Bearer <token>`) :
  - `POST /api/login {code}` → `{ token, user: { id, name, role: 'eleve' | 'suiveur' } }`, ou `401`.
  - `POST /api/events {events}` (élève, ses propres événements, 500 au maximum) → `{ accepted: string[] }`.
  - `GET /api/events` → mes événements, triés par `at`.
  - `GET /api/students` (suiveur) → `{ students: {id, name}[] }`.
  - `GET /api/students/:id/events` (suiveur lié) → `{ events }`, sinon `403`.
- Schéma :
  - `users(id PK, name, role, code_hash UNIQUE, created_at)` ;
  - `follows(suiveur_id, eleve_id, PK both)` ;
  - `tokens(token_hash PK, user_id, created_at)` ;
  - `events(id PK, user_id, at, day, kind, payload)`, avec un index `(user_id, at)`.
- Codes : 8 caractères, sans caractères ambigus. Codes et jetons sont stockés en SHA-256. Les jetons n'expirent pas.
- `scripts/create-user.ts --name --role [--follows <eleveId>] [--remote]` affiche le code une seule fois.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - `login: bon code → token; mauvais → 401`
  - `POST /api/events: même lot deux fois → 1 ligne par id; les deux réponses listent tous les ids` (Review Focus n° 1)
  - `POST /api/events: userId d'un autre → 403; objet invalide → 400`
  - `GET /api/events: uniquement les miens, triés`
  - `GET /api/students/:id/events: suiveur lié 200; non lié 403; élève 403`
- [ ] **Étape 2 :** lancer `npm test -w api`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** `INSERT OR IGNORE` dans `db.batch`. Static Assets (`../web/dist`) avec routage SPA.
- [ ] **Étape 4 :** lancer `npm test -w api`. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Task 6 (Tâche 6) : Appli web, connexion, stockage local, synchronisation

**Files :**
- Create: `apps/web/` (Vite + React + TS, vite-plugin-pwa `autoUpdate`, manifeste en français, `display: standalone`), `apps/web/src/{theme.css,api.ts,App.tsx}`, `apps/web/src/store/{db,sync}.ts`, `apps/web/src/screens/Login.tsx`
- Test: `apps/web/test/sync.test.ts`

**Interfaces :**
- Produces :
  - `recordEvent(e: Omit<AppEvent, 'id' | 'userId' | 'at' | 'day'>): Promise<AppEvent>`, qui écrit dans `events` et `outbox`, puis lance `flush()`.
  - `flush()` : lots de 500, une seule exécution à la fois, relancée sur `online`, `visibilitychange` et au démarrage.
  - `loadAll()` : le cache local fusionné avec le serveur, dédoublonné par `id` et trié.
  - `useEvents()`.
  - `session` (dans IndexedDB).

- [ ] **Étape 1 : écrire les tests qui échouent** (fake-indexeddb, `fetch` simulé).
  - `hors ligne: 3 recordEvent → outbox=3`
  - `retour réseau: flush → POST des 3, outbox=0`
  - `coupure pendant l'envoi puis renvoi → chaque id une seule fois dans loadAll` (Review Focus n° 1)
  - `deux flush simultanés → un seul POST`
  - `base locale vide + login + loadAll → mêmes événements que le serveur` (Review Focus n° 4)
- [ ] **Étape 2 :** lancer `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** L'écran de connexion a un seul champ « Ton code ». Après connexion, l'élève arrive sur `Home` et le suiveur sur `Dashboard` (des écrans vides pour l'instant). Le service worker met en cache tout le shell de l'appli.
- [ ] **Étape 4 :** lancer `npm test -w web` et `npm run build -w web`. Attendu : SUCCÈS, et `dist/sw.js` est présent.
- [ ] **Étape 5 : commit.**

---

## Phase C : logique validée, écrans, déploiement

### Task 7 (Tâche 7) : Saisie brute et clavier maths (réf. doc 03)

**Files :**
- Create: `packages/engine/src/input/raw.ts`, `apps/web/src/components/Keypad.tsx`, `apps/web/src/components/RawInputView.tsx`
- Test: `packages/engine/test/raw.test.ts`, `apps/web/test/keypad.test.tsx`

**Interfaces :**
- Produces :

```ts
type RawToken = { t: 'c'; c: '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'-'|'('|')' }
              | { t: 'frac'; num: RawToken[]; den: RawToken[] };
type RawInput = { tokens: RawToken[]; cursor: CursorPath };      // curseur : racine | numérateur | dénominateur
type Key = 'digit:0'…'digit:9' | 'minus' | 'lpar' | 'rpar' | 'frac' | 'next' | 'back';
pressKey(input: RawInput, key: Key): RawInput        // aucune correction automatique ; 12 caractères au maximum
rawToString(input): string                           // pour le journal ; une fraction s'écrit "[num/den]", ex. "-[12/4]", "3-"
rawToLatex(input): string                            // affichage « copie », fraction empilée \frac
type ReadResult =
  | { kind: 'value'; value: Rational; note: 'zero-signe' | 'zero-tete' | null }
  | { kind: 'unfinished' }                           // « Simplifie » (fraction non réduite, valeur entière attendue)
  | { kind: 'writing-error'; errorType: 'moins-apres' | 'double-signe' | 'parenthese' | 'ecriture-invalide'; divZero: boolean };
readRaw(input: RawInput, expectInteger: boolean): ReadResult
canSubmit(input): boolean                            // vrai dès qu'il y a au moins un caractère
```

- [ ] **Étape 1 : écrire les tests qui échouent.** Toutes les lignes des tableaux « Exemples » et « §3 » du doc 03 : séquence de touches → affichage → résultat. On ajoute un test de non-plantage : 10 000 séquences de touches aléatoires → `readRaw` ne lève jamais d'exception.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
  - Clavier : disposition exacte du doc 03 §2, avec la touche « Valider » sur toute la largeur.
  - `inputMode="none"` : aucun clavier natif ne s'ouvre.
  - La fraction est empilée, le curseur est visible, et `→` / `⌫` se comportent comme décrit dans le doc 03.
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Task 8 (Tâche 8) : Module « Calculs » et ses 8 cours (réf. doc 06)

**Files :**
- Create: `packages/engine/src/courses/types.ts`, `packages/engine/src/courses/index.ts`, `packages/engine/src/courses/calculs/index.ts`, `packages/engine/src/courses/calculs/c00-bien-ecrire.ts` … `c07-multiplier-plusieurs.ts`
- Test: `packages/engine/test/courses/*.test.ts`

**Interfaces :**
- Consumes : `Expr`, `Rational`, `Rng`.
- Produces :

```ts
type Level = 1 | 2 | 3;
interface ModuleDef { id: string; title: string; theme: string; colorVar: string; courseIds: string[] }
interface Exercise { courseId: string; level: Level; expr: Expr; answer: Rational; meta?: Record<string, unknown> }
interface ErrorDef { id: string; family: ErrorFamily; detect(ex: Exercise, given: Rational): boolean;
                     explain(ex: Exercise): Explanation; trap(level: Level, rng: Rng): Exercise }
interface Explanation { rule: string; steps: LessonBlock[] }             // couleurs et animations autorisées
type LessonBlock = { t: 'text'; text: string } | { t: 'math'; latex: string; colorize?: boolean }
                 | { t: 'number-line'; from: number; to: number; jumps: { from: number; by: number }[]; animate: true }
                 | { t: 'anim'; name: string };
type LessonPart = { type: 'explication'; blocks: LessonBlock[] }
                | { type: 'question'; activity: 'lecon' | 'exemple'; question: Question };
interface CourseDef {
  id: string; moduleId: string; order: number; title: string; rule: string;
  parts: LessonPart[];                       // déroulé propre au cours, dans l'ordre
  endExercises: { count: 5; kind: 'saisie' | 'trou' | 'erreur' };   // 'erreur' = exception du Cours 0
  generate(level: Level, rng: Rng): Exercise;
  errors: ErrorDef[];                        // dans l'ordre de détection
  generalExplanation(ex: Exercise): Explanation;
  resolution(ex: Exercise): string[];        // lignes LaTeX de la résolution type
  classes: { id: string; label: string; of(ex: Exercise): string }[];   // pour « Classer »
  expectInteger: boolean;
}
MODULES: ModuleDef[]; getCourse(id): CourseDef; getModule(id): ModuleDef
diagnose(course: CourseDef, ex: Exercise, given: Rational): { errorType: string; family: ErrorFamily } | null
```

Le Cours 0 n'a pas de résultat numérique. Son `Exercise` porte une écriture (`meta.tokens`, `meta.faultAt`) et ses `errors` sont ceux du doc 06 (`signes-colles`, `moins-apres`, `parenthese`).

- [ ] **Étape 1 : écrire les tests qui échouent**, pour chaque cours :
  - les 9 calculs d'exemple et leurs réponses ;
  - chaque ligne « réponse donnée → erreur reconnue » via `diagnose` ;
  - `resolution` sur le calcul de la résolution type du doc 06 ;
  - test de propriété, 1 000 tirages par niveau (Review Focus n° 5) : `evaluate(expr)` égale `answer`, les plages et contraintes du doc 06 sont respectées, et chaque `trap` produit un calcul du niveau demandé.
  - Pour le Cours 0 : les lignes de son tableau d'exemples, et `(−3) + 5` n'est jamais détecté comme faute.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter les 8 fichiers**, en recopiant **exactement** les textes validés (règles, leçons, explications).
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Task 9 (Tâche 9) : Fabrication et correction des 8 types d'exercices (réf. doc 04)

**Files :**
- Create: `packages/engine/src/exercises/types.ts`, `packages/engine/src/exercises/build/{saisie,trou,ordre,erreur,paires,classer,qcm,vraifaux}.ts`, `packages/engine/src/exercises/check.ts`
- Test: `packages/engine/test/exercises/*.test.ts`

**Interfaces :**
- Consumes : `CourseDef`, `Exercise`, `diagnose`, `readRaw`, `toLatex`.
- Produces :

```ts
type Question =
  | { kind: 'saisie'; ex: Exercise; promptLatex: string }
  | { kind: 'trou'; ex: Exercise; promptLatex: string; hidden: Rational }
  | { kind: 'ordre'; ex: Exercise; tiles: { id: string; latex: string }[]; solution: string[]; trapTile?: { latex: string; errorType: string } }
  | { kind: 'erreur'; ex: Exercise; lines: string[]; wrongLine: number | null /* null = « Tout est juste » */; errorType: string | null }
  | { kind: 'paires'; exs: Exercise[]; left: string[]; right: { latex: string; value: Rational }[] }
  | { kind: 'classer'; exs: Exercise[]; classes: { id: string; label: string }[]; expected: string[] }
  | { kind: 'qcm'; ex: Exercise; choices: { value: Rational; latex: string; errorType: string | null }[]; correctIndex: number; formula: 'debut' | 'paires-signes' | 'melangee' }
  | { kind: 'vraifaux'; ex: Exercise; shown: Rational; isTrue: boolean; errorType: string | null };
interface BuildCtx { rng: Rng; level: Level; timesSeen: number; trapErrorType?: string }
buildQuestion(course: CourseDef, kind: QuestionKind, ctx: BuildCtx): Question
type Answer = { raw: RawInput } | { choice: number } | { order: string[] } | { line: number | null }
            | { pairs: [number, number][] } | { classes: string[] } | { bool: boolean };
interface Outcome { correct: boolean; unfinished: boolean; errorType: string | null; errorFamily: ErrorFamily | null; given: string; expected: string }
checkAnswer(course: CourseDef, q: Question, a: Answer): Outcome
```

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Chaque tableau « Exemples » des chapitres 1 à 8 du doc 04, recopié tel quel.
  - Les « Règles vérifiées sur 1 000 tirages » de chaque chapitre (Review Focus n° 5) :
    - QCM : 4 choix, la bonne réponse exactement une fois, aucun doublon ;
    - vrai ou faux : entre 45 % et 55 % de « Vrai » ;
    - trouver l'erreur : entre 15 % et 25 % de résolutions entièrement justes ;
    - relier les paires : résultats tous différents ;
    - compléter le trou : une seule réponse possible ;
    - classer : au moins un élément par case.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Un tirage qui ne respecte pas les règles est refait, avec au plus 50 essais. Au-delà, l'appli lève une erreur, que les tests de propriété doivent rendre impossible.
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Task 10 (Tâche 10) : Composants d'affichage des 8 types (réf. doc 03 §5, doc 04)

**Files :**
- Create: `apps/web/src/components/Math.tsx`, `apps/web/src/components/questions/{Saisie,Trou,Ordre,Erreur,Paires,Classer,Qcm,VraiFaux,QuestionView}.tsx`, `apps/web/src/components/LessonPart.tsx`
- Test: `apps/web/test/questions.test.tsx`

**Interfaces :**
- Consumes : `Question`, `Answer`, `checkAnswer`, `Keypad`.
- Produces :
  - `<QuestionView question course onAnswer={(a: Answer, o: Outcome) => void} />`.
  - `<LessonPart part />` : explications avec couleurs et animations (bonds animés sur la droite graduée, étapes qui apparaissent).

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Pour chaque type, une interaction complète juste et une fausse, avec l'`Outcome` attendu (exemples du doc 04).
  - Pour les paires et le classement : réussite seulement si tout est juste du premier coup.
  - Pour les étiquettes : toucher pour placer, toucher pour retirer.
  - **Exercices (hors leçon) : aucun élément de calcul n'a de style couleur.**
- [ ] **Étape 2 :** lancer `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Interactions exactes du doc 03 §4-§5 et croquis du doc 04.
- [ ] **Étape 4 :** lancer `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Task 11 (Tâche 11) : Répétition espacée et progression (réf. doc 01)

**Files :**
- Create: `packages/engine/src/srs.ts`
- Test: `packages/engine/test/srs.test.ts`

**Interfaces :**
- Consumes : `AppEvent`, `MODULES`, `CourseDef`.
- Produces :

```ts
const LADDER = [ {step:'A',level:1,days:2}, {step:'B',level:2,days:2}, {step:'C',level:2,days:7},
  {step:'D',level:3,days:2}, {step:'E',level:3,days:7}, {step:'F',level:3,days:30},
  {step:'G',level:3,days:90}, {step:'H',level:3,days:180} ] as const;
type CourseStatus = 'verrouille' | 'disponible' | 'en-cours' | 'a-rattraper' | 'valide';
interface CourseProgress { courseId: string; status: CourseStatus; validatedOn: string | null;
  step: number | null; level: Level | null; stars: 0 | 1 | 2 | 3; nextReview: string | null;
  lastReviewFailed: boolean; reviewHistory: { day: string; ok: boolean }[];
  recentErrors: Record<string, number> /* 10 dernières réponses */; failedTwiceInARow: boolean }
interface ModuleProgress { moduleId: string; validated: number; total: number; done: boolean }
interface ProgressState { courses: Record<string, CourseProgress>; modules: Record<string, ModuleProgress> }
foldProgress(events: AppEvent[]): ProgressState
applyEvent(state: ProgressState, e: AppEvent): ProgressState     // mise à jour incrémentale (cache)
```

  - **Validation d'un cours** (doc 01 §2) : sur les réponses `attempt === 1` de l'activité du cours, au moins 80 % de justes, et au moins 4 justes sur 5 aux exercices de fin.
  - **Rattrapage** : au moins 4 sur 5.
  - **Une révision compte** quand ses 3 questions ont reçu une première réponse dans une activité `revision`. Elle est réussie avec 3 sur 3 (doc 01 §4).

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Le tableau « Exemples » du doc 01 (cours 5, du 2 mars au 6 mai 2026) et le tableau « Autres cas », ligne par ligne.
  - Invariant : `foldProgress(evts)` égale l'application successive de `applyEvent`, quel que soit le découpage.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Task 12 (Tâche 12) : Liste des révisions, séances et temps du jour (réf. doc 02, doc 01 §3 et §5, doc 04 §9)

**Files :**
- Create: `packages/engine/src/reviews.ts`, `packages/engine/src/daily.ts`
- Test: `packages/engine/test/reviews.test.ts`, `packages/engine/test/daily.test.ts`

**Interfaces :**
- Consumes : `ProgressState`, `buildQuestion`, `CourseDef`.
- Produces :

```ts
pendingReviews(state: ProgressState, today: string): { courseId: string; due: string }[]
  // triées par date, puis par ordre de validation du cours (doc 02 §4)
nextReviewSession(state, today, rng): { activityId: string; items: { courseId: string; question: Question }[] } | null
  // 5 cours au plus × 3 questions, entremêlées ; niveaux selon l'étape (doc 01 §3) ;
  // au moins 1 calcul-piège si erreurs récentes (doc 01 §5) ; formats doc 04 §9
dailyTime(events: AppEvent[], day: string): { totalMs: number; reviewMs: number; courseMs: number; trainingMs: number; goalReached: boolean }
  // 2 min max par question, 3 min max par explication (doc 02 §1)
```

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Les tableaux « Exemples » et « Comptage du temps » du doc 02.
  - La composition des niveaux pour chaque étape A à H (doc 01 §3).
  - Une séance interrompue : les révisions dont les 3 questions n'ont pas toutes une 1re réponse restent à faire (Review Focus n° 3).
  - Un cours révisé aujourd'hui n'est pas reproposé aujourd'hui.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Le chronomètre côté web se met en pause sur `visibilitychange` (exposé par `apps/web/src/store/state.ts`).
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Task 13 (Tâche 13) : Activités et écrans de l'élève (réf. doc 01 §2 et §6, doc 02 §6, doc 03 §5, doc 06)

**Files :**
- Create: `packages/engine/src/activity.ts`, `apps/web/src/store/state.ts`, `apps/web/src/screens/{Home,Modules,Course,Review,Practice}.tsx`, `apps/web/src/components/Feedback.tsx`
- Test: `packages/engine/test/activity.test.ts`, `apps/web/test/screens.test.tsx`, `e2e/eleve.spec.ts`

**Interfaces :**
- Consumes : tout ce qui précède.
- Produces :
  - `createActivity(kind: Activity, items, rng)` / `answer(activity, outcome)` / `skip(activity)` (doc 01 §6) :
    - après une erreur, un calcul du même type 3 questions plus loin, et le même calcul à la fin, jusqu'à ce qu'il soit juste ;
    - `canSkip` devient vrai au 2e échec sur le même calcul ;
    - `attempt` est compté pour chaque calcul.
  - `useProgress()` : l'état replié, mis en cache dans IndexedDB et mis à jour par `applyEvent`.
  - **Écrans :**
    - **Accueil** : jauge des 15 minutes, carte « Révisions » mise en avant si des révisions sont à faire, « Prochain cours », « Entraînement », « Mes cours » (croquis du doc 02 §6) ;
    - **Mes cours** : le module, avec sa progression « n / 8 », sa couleur de thème et ses cours avec étoiles. On peut y relire une leçon ;
    - **Cours** : les parties dans l'ordre, puis les 5 exercices de fin, puis le résultat (validé, ou rattrapage proposé) ;
    - **Révisions** : la séance de 5 au maximum, puis « Encore des révisions » ou « Révisions faites ✓ » ;
    - **Entraînement** : « tout mélangé » ou un cours au choix, par séries de 10, tous types (doc 03 §5). Ne touche pas au calendrier ;
    - **Retour sur erreur** : la bonne réponse et l'explication colorée ou animée (doc 06), puis le bouton discret « Passer » quand il est autorisé.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Moteur : les lignes du doc 01 §6 et les cas « Même calcul raté 2 fois → Passer » et « seule la 1re réponse compte ».
  - Écrans :
    - `Accueil: révisions à faire → carte Révisions en premier, Prochain cours toujours actif` ;
    - `Révisions: uniquement qcm/vraifaux/classer` ;
    - `Fin de cours: uniquement saisie/trou (erreur pour le Cours 0)` ;
    - `Entraînement: aucun changement de nextReview` ;
    - `aucune couleur sur les calculs hors leçon`.
  - E2E Playwright, iPhone :
    1. connexion ;
    2. Cours 0, puis Cours 1, avec une erreur volontaire → explication, repassage en fin d'activité ;
    3. validation ;
    4. l'accueil montre la jauge et « Calculs 2 / 8 ».
- [ ] **Étape 2 :** lancer `npm test` et `npx playwright test e2e/eleve.spec.ts --trace off`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** relancer les deux commandes. Attendu : SUCCÈS.
- [ ] **Étape 5 : test E2E hors ligne.** `setOffline(true)`, 3 réponses, `setOffline(false)` : la file d'attente se vide, et chaque événement est une seule fois sur le serveur local. Attendu : SUCCÈS.
- [ ] **Étape 6 : commit.**

### Task 14 (Tâche 14) : Page de suivi (réf. doc 05)

**Files :**
- Create: `packages/engine/src/dashboard.ts`, `apps/web/src/screens/{Dashboard,DashModule,DashCourse}.tsx`
- Test: `packages/engine/test/dashboard.test.ts`, `apps/web/test/dashboard.test.tsx`

**Interfaces :**
- Consumes : `GET /api/students`, `GET /api/students/:id/events`, `foldProgress`, `dailyTime`, `pendingReviews`.
- Produces : `computeDashboard(events, today): Dashboard`, dont les champs suivent exactement les 5 blocs de l'accueil du doc 05 §1 et les vues module et cours (§2, §3) :
  - 30 jours ;
  - état ;
  - révisions pas faites ;
  - erreurs les plus communes, avec leurs calculs ;
  - à retravailler (3 au maximum) ;
  - modules ;
  - détail d'un cours.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Les tableaux « Exemples » et « Autres cas » du doc 05.
  - Écran : un suiveur avec 2 élèves → sélecteur, dernier élève mémorisé, lecture seule (aucun bouton d'action).
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Task 15 (Tâche 15) : Déploiement Cloudflare et comptes réels

**Files :**
- Modify: `apps/api/wrangler.toml` (`database_id`), `package.json` (script `deploy`)
- Create: `docs/deploiement.md` (étapes en français)

- [ ] **Étape 1 : accès au compte Cloudflare.** Un jeton d'API est demandé par le formulaire de secrets de l'environnement, jamais dans le chat. Sinon, le porteur du projet lance lui-même les commandes de `docs/deploiement.md`.
- [ ] **Étape 2 : créer la base.** `wrangler d1 create plus-ou-moins`, puis `wrangler d1 migrations apply plus-ou-moins --remote`. Attendu : la migration 0001 est appliquée.
- [ ] **Étape 3 : déployer.** `npm run deploy`. Attendu : une URL `*.workers.dev`, la connexion fonctionne sur téléphone, et l'appli s'installe sur iPhone et sur Android.
- [ ] **Étape 4 : créer les comptes réels.** Le compte de l'élève, puis le suiveur qui la suit. Les codes sont remis en privé au porteur du projet.
- [ ] **Étape 5 : vérification finale.** `npm test` partout, puis la suite E2E contre l'URL déployée. Attendu : tout passe. Annoncer au porteur du projet les choix techniques faits pendant la construction.
- [ ] **Étape 6 : commit et push.**
