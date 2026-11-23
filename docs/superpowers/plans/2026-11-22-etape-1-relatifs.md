# Étape 1 « Calculs : relatifs » — Plan d'implémentation (version 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** Livrer une PWA mobile utilisable de bout en bout (cours, révisions espacées, entraînement, hors-ligne, page de suivi) avec le module 1 « Calculs » : le Cours 0 « Bien écrire un calcul » et les 7 cours « Relatifs ».

**Architecture :**
- **Monorepo npm workspaces.** Un paquet TypeScript pur, `@pom/engine`, contient le « cerveau » : maths exactes, saisie brute, cours, fabrication des 8 types d'exercices, répétition espacée, liste des révisions, temps du jour, statistiques de suivi. Il est utilisé par l'appli web React (PWA, IndexedDB) et par le Worker Cloudflare.
- **Le serveur ne stocke qu'un journal d'événements en ajout seul.** L'état (progression, révisions à faire, page de suivi) est obtenu en « repliant » ce journal (`foldProgress`, `computeDashboard`). Sur le téléphone, cet état est **mis en cache et mis à jour à chaque nouvel événement**, sans recalcul quotidien.

**Tech Stack :** TypeScript strict, Vite, React 18, vite-plugin-pwa (Workbox), idb, KaTeX (calculs « comme sur une copie », fractions empilées), Hono sur Cloudflare Workers (Static Assets + API), D1, Vitest (+ @cloudflare/vitest-pool-workers, @testing-library/react, fake-indexeddb), Playwright (Chromium préinstallé).

**Spec :** `docs/superpowers/specs/2026-11-22-plus-ou-moins-v1-design.md`

**Documents validés (font foi, avant ce plan en cas de doute) :** `docs/validation/01` à `08`, tous au statut « Validé » (08 prime sur 07, qui prime sur 01 à 06). **Maquettes validées :** `docs/design/design-system/` et `docs/design/ecrans/`. **Les tests de la logique sont les tableaux « Exemples » de ces documents**, recopiés tels quels : une ligne = un cas `it.each`. Aucun test ne doit inventer de valeur absente des documents.

## Avancement

- **Phase A (tâches 1-2), documents de logique : ✅ terminée.** Les 6 documents sont validés par le porteur du projet le 2026-11-22.
- **Phase B (tâches 3-6) :** infrastructure.
- **Phase B et C, parties moteur et données (tâches 3 à 14, 16) : ✅ terminées** (voir `2026-11-22-etape-1-avancement.md`).
- **Parties écrans des tâches 6, 7, 10, 13 et 14 : remplacées par la phase D (tâches 17 à 28)**, qui suit les maquettes validées et le design system. Leurs anciennes étapes d'écran ne sont plus à faire.
- **Phase D (tâches 17-28) :** écrans. Puis tâche 15 (déploiement) et relecture finale.

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
- Styles **centralisés** dans `apps/web/src/theme.css` = design system « Cahier au propre » (`docs/design/design-system/styles.css`), tokens uniquement. Couleur du module Calculs : trio `--module-calculs*`.
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
- **Même calcul raté en boucle :** « Passer » apparaît quand le même calcul revient pour la 3e fois, après 2 échecs (doc 08 n° 9), et seule la 1re réponse compte. Tâches 13 et 23.

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

## Phase D : écrans (remplace les parties UI des tâches 6, 7, 10, 13 et 14)

**Sources de vérité, dans cet ordre :** `docs/validation/08` puis `07` puis `01` à `06` ; les maquettes validées de `docs/design/ecrans/*.html` et `docs/design/design-system/concept.html` (ouvrir la page, cliquer les boutons de situation) ; le design system `docs/design/design-system/` (`README.md`, `styles.css`). **Chaque écran reprend la maquette : mêmes textes, même ordre, mêmes composants, mêmes états.** Ce qui n'est ni dans les documents ni dans les maquettes est demandé au porteur du projet avant d'être codé (contrôleur, pas l'assistant).

**Règles communes aux tâches 17 à 28 :**
- Classes et tokens du design system uniquement : `apps/web/src/theme.css` contient `styles.css` recopié tel quel, puis, sous un commentaire « Composants des écrans », les composants stylés dans les pages de maquettes (copiés depuis leur `<style>`). Aucune couleur ni taille en dur dans les `.tsx`.
- Calculs des exercices, révisions et entraînement : `<Math>` (KaTeX), **sans couleur** (attribut `data-copie` sur le conteneur ; test : aucun descendant n'a de style `color`).
- Copie : français, tutoiement, « − » (U+2212) à l'écran, pas d'emoji, pas de « · » ni de « → » dans les textes.
- Thème clair ou sombre selon le réglage du téléphone (`prefers-color-scheme`), avec les tokens sombres du design system.
- **Vérification visuelle de chaque tâche d'écran** (étape « Revue téléphone ») : `npm run shots -- <écran>` (tâche 18) capture l'écran à 390 × 844, en clair et en sombre, dans chaque situation de la maquette ; le relecteur compare côte à côte avec la maquette, puis applique le skill `ui-design-review:ui-review` sur les captures. Attendu : aucun défaut « important » restant, `scrollWidth === 390`, aucune erreur console.

**Structure des fichiers (phase D) :**
```
packages/engine/src/home.ts          données de l'accueil élève, de Mes cours et du bilan (tâche 17)
packages/engine/src/feedback.ts      textes du retour après une réponse (tâche 17)
apps/web/src/theme.css               design system + composants des écrans (tâche 18)
apps/web/src/ui/                     Icon, Math, AppBar, Stepper, BottomNav, Sheet, Dialog, Chip… (tâche 18)
apps/web/src/router.tsx              routes par hash (tâche 18)
apps/web/src/store/progress.ts       useProgress, useToday, useSession (tâche 18)
apps/web/src/components/Keypad.tsx, RawInputView.tsx              (tâche 20)
apps/web/src/components/questions/*.tsx, QuestionView.tsx          (tâche 21)
apps/web/src/components/Feedback.tsx, LessonPart.tsx, NumberLine.tsx (tâche 22)
apps/web/src/screens/Activity.tsx    déroulé commun d'une activité (tâche 23)
apps/web/src/screens/{Login,Course,CourseResult,Home,Courses,Training,Review,ReviewSummary,Dashboard,DashModule,DashCourse}.tsx
e2e/fixtures.ts, e2e/shots.ts, e2e/*.spec.ts
```

### Task 17 (Tâche 17) : Moteur, ce qui manque aux écrans

**Files :**
- Create: `packages/engine/src/home.ts`, `packages/engine/src/feedback.ts`
- Modify: `packages/engine/src/activity.ts` (`trainingSeries`), `packages/engine/src/index.ts`
- Test: `packages/engine/test/home.test.ts`, `packages/engine/test/feedback.test.ts`, `packages/engine/test/activity.test.ts`

**Interfaces :**
- Consumes : `ProgressState`, `AppEvent`, `dailyTime`, `pendingReviews`, `readRaw`, `getCourse`, `CourseDef.errors[].explain`, `generalExplanation`, `resolution`.
- Produces :

```ts
// activity.ts — doc 08 n° 1 et n° 3 : cours validés ET à rattraper ; sélection de plusieurs cours.
trainingPool(state: ProgressState): string[]                      // ids 'valide' | 'a-rattraper', dans l'ordre des cours
trainingSeries(state, choice: 'tout' | { courseIds: string[] }, rng): QuestionItem[]   // remplace { courseId }

// home.ts
interface StudentHome {
  today: DailyTime; streak: number;                               // série : même règle que doc 05 §1
  reviews: { courses: number; questions: number; minutes: number } | null;   // minutes = arrondi(questions / 3), au moins 1
  nextSession: { courses: number; questions: number; minutes: number } | null; // séance suivante (« Encore des révisions »)
  next: { courseId: string; status: 'disponible' | 'en-cours' | 'a-rattraper' } | null;  // null = module terminé (doc 08 n° 19)
  module: { moduleId: string; title: string; validated: number; total: number; done: boolean;
            window: { courseId: string; order: number; status: CourseStatus; current: boolean }[] };  // 4 cours
}
studentHome(state: ProgressState, events: AppEvent[], today: string): StudentHome
// fenêtre : 2 cours avant le cours actuel, le cours actuel, 1 après ; décalée aux bords pour garder 4 cours.

interface RunResult { validated: boolean; ok: number; first: number; finOk: number; fin: number;
                      percent: number /* arrondi */; nextCourseId: string | null; firstReviewInHours: 48 }
runResult(state: ProgressState, activityId: string, courseId: string): RunResult    // depuis journal.runs

interface ReviewLine { courseId: string; order: number; title: string; ok: number; total: 3;
                       nextReview: string; label: string /* « revient demain », « revient dans 2 jours », « revient dans 1 semaine », « revient dans 1 mois » */ }
reviewSummary(state: ProgressState, activityId: string, today: string): { lines: ReviewLine[]; firstOk: number; firstTotal: number }

// feedback.ts — textes exacts du doc 03 §3, doc 07 n° 1, 3, 5, doc 06 (explications)
type Feedback =
  | { tone: 'juste'; title: string; note: string | null }          // note : « Juste ! On écrit simplement −7. »
  | { tone: 'pas-fini'; title: string; message: string }            // « Le calcul n'est pas fini : simplifie. » / « Simplifie. »
  | { tone: 'faux'; title: string; message: string; rightLatex: string;
      explanation: Explanation | null; steps: string[] /* résolution type, LaTeX */ };
feedbackFor(course: CourseDef, q: Question, a: Answer, o: Outcome): Feedback
```

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - `trainingPool` : cours 0 à 2 validés, 3 à rattraper → `['c00','c01','c02','c03']` ; `trainingSeries(state, { courseIds: ['c03'] })` → 10 questions du cours 3.
  - `studentHome` : aucun événement → `next = { courseId: 'c00', status: 'disponible' }`, fenêtre `c00..c03` ; cours 0 à 3 validés → fenêtre `c02..c05`, `current` sur `c04` ; 8 cours validés → `next = null`, `module.done = true`. 7 cours dus → `reviews = { courses: 5, questions: 15, minutes: 5 }`, `nextSession = { courses: 2, questions: 6, minutes: 2 }` (doc 02, exemples).
  - `runResult` : les lignes « Autres cas » du doc 01 (11 sur 12 dont 5 sur 5 → validé ; 10 sur 12 dont 3 sur 5 → non validé, `percent = 83`).
  - `reviewSummary` : étape B réussie → « revient dans 1 semaine » ; 1er raté → « revient demain ».
  - `feedbackFor`, une ligne par cas : `3−` → « Le signe moins s'écrit **avant** le nombre : −3. » ; `3−4` → « Ta réponse doit être un seul nombre. » ; `)−3` → « Une parenthèse fermée doit avoir été ouverte. » ; `(−3` → « Une parenthèse ouverte doit être fermée, et une parenthèse fermée doit avoir été ouverte. » ; fraction 5 sur 0 → « On ne divise jamais par 0. » ; `−07` pour −7 → `juste` avec « Juste ! On écrit simplement −7. » ; fraction −12 sur 4 → `pas-fini` ; `−12` pour −3 × (−4) → `faux`, `explanation` = celle de `regle-signes`, `steps` = `resolution(ex)`. Titre des erreurs d'écriture : « Réponse mal écrite ».
- [ ] **Étape 2 :** `npm test -w @pom/engine`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Réutiliser les fonctions internes de `dashboard.ts` pour la série (les exporter si besoin, sans changer leurs résultats). Les textes viennent des documents, mot pour mot.
- [ ] **Étape 4 :** `npm test -w @pom/engine`. Attendu : SUCCÈS (les 507 tests existants aussi).
- [ ] **Étape 5 : commit.**

### Task 18 (Tâche 18) : Socle des écrans (design system, KaTeX, navigation, état, captures)

**Files :**
- Modify: `apps/web/package.json` (ajouter `katex@0.16.11`, `@fontsource/lexend@5.1.1`, `@testing-library/react@16.0.1`, `jsdom@25.0.1`), `apps/web/src/theme.css`, `apps/web/src/App.tsx`, `apps/web/src/main.tsx`, `apps/web/vite.config.ts` (test `environment: 'jsdom'`), `package.json` (scripts `shots`, `e2e`)
- Create: `apps/web/src/ui/{Icon,Math,AppBar,Stepper,BottomNav,Sheet,Dialog}.tsx`, `apps/web/src/ui/icons.tsx` (sprite de `docs/design/design-system/icons.html`), `apps/web/src/router.tsx`, `apps/web/src/store/progress.ts`, `e2e/fixtures.ts`, `e2e/shots.ts`, `playwright.config.ts`
- Test: `apps/web/test/ui.test.tsx`

**Interfaces :**
- Produces :
  - `<Math latex block? />` (KaTeX `renderToString`, `throwOnError: false`) ; `<Icon name />` ; `<AppBar onClose stepper={{ total, done: ('ok'|'ko')[], current }} />` ; `<Stepper />` (segments : indigo fait, rouge raté, clair courant) ; `<BottomNav active: 'accueil'|'cours'|'entrainement' />` ; `<Sheet open onClose>` (volet en bas) ; `<Dialog title actions>`.
  - `useRoute(): Route`, `go(route)` : hash `#/`, `#/cours`, `#/cours/:id`, `#/cours/:id/relire`, `#/rattrapage/:id`, `#/revisions`, `#/entrainement`, `#/entrainement/serie`, `#/suivi`, `#/suivi/:eleve/module/:id`, `#/suivi/:eleve/cours/:id`.
  - `useSession()`, `useProgress(): ProgressState` (replié depuis `useEvents()`, mis à jour par `applyEvent` pour chaque nouvel événement, mis en cache dans IndexedDB), `useToday(): string` (jour de Paris, recalculé à minuit et au retour au premier plan).
  - `e2e/fixtures.ts` : `scenario(name): { user, events }` pour chaque situation des maquettes (début de journée, après une séance, objectif atteint, cours à rattraper, module terminé, suiveur « elle bloque », « tout va bien ») ; `e2e/shots.ts` : intercepte `/api/*` avec ces données (`page.route`), ouvre l'écran demandé sur `vite preview`, capture 390 × 844 clair et sombre dans `$SHOTS_DIR` (par défaut le dossier `shots/` à la racine, ignoré par git).
- Choix techniques à annoncer : police Lexend embarquée (marche hors ligne), routes par hash (pas de configuration serveur), thème qui suit le téléphone.

- [ ] **Étape 1 : écrire les tests qui échouent.** `Math` rend une fraction empilée (`.mfrac`) pour `\frac{-12}{4}` ; `Stepper` total 17, 8 faits dont le 6e raté → 17 segments, le 6e a la classe rouge ; `go('#/cours')` puis `useRoute()` → `{ name: 'cours' }` ; `theme.css` contient tous les tokens de `styles.css` (lecture des deux fichiers, chaque `--nom:` présent).
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** `App.tsx` : pas de session → `Login` (tâche 19) ; élève → routes élève ; suiveur → `Dashboard`. Écrans encore absents : composant vide temporaire.
- [ ] **Étape 4 :** `npm test -w web`, `npm run build -w web`, `npm run shots -- login`. Attendu : SUCCÈS, deux captures produites.
- [ ] **Étape 5 : commit.**

### Task 19 (Tâche 19) : Connexion (maquette `navigation.html`, écran 1)

**Files :** Create `apps/web/src/screens/Login.tsx` ; Modify `apps/web/src/App.tsx`, `apps/web/src/store/sync.ts` (réaction au 401) ; Test `apps/web/test/login.test.tsx`

**Interfaces :** Consumes `login(code)`, `setSession`, `ApiError`. Produces `<Login />`.

- [ ] **Étape 1 : écrire les tests qui échouent.** Les 4 situations de la maquette : « Au départ » (bouton « Entrer » inactif tant que le champ est vide) ; « Code tapé » (affiché en majuscules espacées « K7M2 9QXP », « k7m2 9qxp » envoyé tel quel au serveur) ; « Code inconnu » (401 → message de la maquette) ; « Hors ligne » (`ApiError(0)` → bloc « Pas de connexion » et bouton « Réessayer »). Un 401 sur `GET /api/events` après connexion efface la session et ramène à la connexion.
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Textes exacts de la maquette. Pas de barre du bas. Pas de bouton de déconnexion (doc 08 n° 18).
- [ ] **Étape 4 :** `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : Revue téléphone** (`npm run shots -- login`, 4 situations).
- [ ] **Étape 6 : commit.**

### Task 20 (Tâche 20) : Clavier maths et champ de réponse (maquette `exercices.html`, « Le clavier maths » ; doc 03 §2, doc 07 n° 4, doc 08 n° 12)

**Files :** Create `apps/web/src/components/Keypad.tsx`, `apps/web/src/components/RawInputView.tsx` ; Test `apps/web/test/keypad.test.tsx`

**Interfaces :** Consumes `RawInput`, `pressKey`, `rawToLatex`, `canSubmit`, `emptyRaw`. Produces `<Keypad onKey={(k: Key) => void} onSubmit canSubmit />`, `<RawInputView input placeholder="Ta réponse" state?: 'neutre'|'juste'|'faux'|'note' />` (fraction empilée, curseur visible dans la case active, aucune couleur sur la saisie en cours).

- [ ] **Étape 1 : écrire les tests qui échouent.** Disposition exacte (7 8 9 ⌫ / 4 5 6 − / 1 2 3 ▭/▭ / ( 0 ) → / Valider sur toute la largeur) ; chaque ligne « Touches → Affiché » du tableau d'exemples du doc 03 en tapant au clavier rendu ; Valider inactif sur champ vide, actif sur une fraction vide, qui est alors comptée « écriture invalide » (doc 07 n° 4, choix B) ; 13e caractère sans effet (fraction : la barre ne compte pas) ; aucun `<input>` qui ouvrirait le clavier natif (`inputMode="none"` si un élément focalisable existe).
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : Revue téléphone** (les 5 états du clavier de la maquette, via une page d'essai `#/essai/clavier` disponible seulement en développement).
- [ ] **Étape 6 : commit.**

### Task 21 (Tâche 21) : Les 8 types d'exercices (maquette `exercices.html`, « Les 8 types » ; doc 03 §4-§5, doc 04, doc 08 n° 10 à 12)

**Files :** Create `apps/web/src/components/questions/{Saisie,Trou,Ordre,Erreur,ErreurEcriture,Paires,Classer,Qcm,Signe,VraiFaux}.tsx`, `apps/web/src/components/questions/QuestionView.tsx` ; Test `apps/web/test/questions.test.tsx`

**Interfaces :**
- Consumes : `Question`, `Answer`, `Outcome`, `checkAnswer`, `checkParts`, `Keypad`, `RawInputView`, `Math`.
- Produces : `<QuestionView question course locked={boolean} onAnswer={(a: Answer, o: Outcome) => void} />`. Consigne au-dessus du calcul, textes de la maquette : « Calcule. », « Complète. », « Remets les étapes dans l'ordre. », « Une ligne est fausse. Touche-la. », « Relie chaque calcul à son résultat. », « Range chaque calcul. », « Choisis la bonne réponse. », « Vrai ou faux ? ». Cours 0 : « Touche l'endroit mal écrit. » avec le bouton « Tout est bien écrit », et en QCM « Lequel est bien écrit ? ». Case « signe du résultat » (un QCM à 2 choix `+` / `-`) : deux gros boutons « + » et « − ».

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Par type, une interaction juste et une fausse, avec l'`Outcome` des exemples du doc 04 (QCM, vrai ou faux : la réponse part au toucher, sans bouton Valider ; doc 08 n° 10).
  - Étiquettes : toucher place à la fin, toucher une étiquette placée la renvoie ; Valider actif quand le bon nombre d'étiquettes est placé.
  - Trouver l'erreur : toutes les lignes touchables, ligne de départ comprise (doc 08 n° 11).
  - Paires et classer : juste seulement si tout est juste du premier coup ; une paire juste se grise ; l'élément mal placé est montré.
  - `aucune couleur sur les calculs` : aucun élément sous `[data-copie]` n'a de style `color`.
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : Revue téléphone** (`#/essai/questions?type=<type>` en développement, chaque type de la maquette).
- [ ] **Étape 6 : commit.**

### Task 22 (Tâche 22) : Retour après une réponse et parties de leçon (maquettes `exercices.html` « Trois états corrigés », `revisions.html`, `cours.html` « La leçon » ; doc 06 règles communes, doc 07 n° 8)

**Files :** Create `apps/web/src/components/Feedback.tsx`, `apps/web/src/components/LessonPart.tsx`, `apps/web/src/components/NumberLine.tsx`, `apps/web/src/components/anims/{SignesQuiSeCognent,MoinsMoinsDevientPlus,CompterLesMoins}.tsx` ; Test `apps/web/test/feedback.test.tsx`

**Interfaces :**
- Consumes : `Feedback`, `feedbackFor` (tâche 17), `LessonBlock`, `Explanation`.
- Produces : `<FeedbackPanel feedback note?: string /* « Un calcul du même genre reviendra plus loin, et celui-ci à la fin. » | « Ce calcul reviendra encore à la fin. » */ />` ; `<LessonBlocks blocks colorize />` (négatifs rouges, positifs bleus quand `colorize`, tons `ok` ✓ vert, `ko` ✗ rouge, `neutre` gris ; droite graduée animée ; 3 animations nommées) ; `<LessonPartScreen part onNext />` avec le bouton « Suivant ».

- [ ] **Étape 1 : écrire les tests qui échouent.** `faux` → titre, « La bonne réponse est … », explication, bloc « Étape par étape » ; `juste` avec note → bandeau vert « Juste ! On écrit simplement −7. » ; `pas-fini` → bandeau indigo « Pas compté faux : corrige et valide encore. » ; bloc `tone: 'neutre'` rendu en gris (doc 07 n° 8) ; une animation inconnue ne plante pas (bloc ignoré) ; `prefers-reduced-motion` → droite graduée affichée directement à l'état final.
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Animations en CSS (transitions sur les tokens de mouvement du design system).
- [ ] **Étape 4 :** `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : Revue téléphone** (états corrigés des maquettes, les 3 premières parties de leçon du cours 4).
- [ ] **Étape 6 : commit.**

### Task 23 (Tâche 23) : Déroulé d'une activité (cadre commun ; doc 01 §6, doc 02 §1, doc 07 n° 12 à 14, doc 08 n° 7 à 9, 16)

**Files :** Create `apps/web/src/screens/Activity.tsx`, `apps/web/src/store/timer.ts` ; Test `apps/web/test/activity.test.tsx`

**Interfaces :**
- Consumes : `createActivity`, `current`, `answer`, `skip`, `explanationDone`, `endEvent`, `isDone`, `recordEvent`, `QuestionView`, `FeedbackPanel`, `LessonPartScreen`.
- Produces : `<ActivityScreen kind items chip={(step) => string} record={boolean} confirmQuit?: { title, body } onEnd={(state, completed) => void} />`.
  - Barre du haut : croix, barre d'étapes dont le total grandit après une erreur (doc 08 n° 8), segments rouges pour les ratés.
  - Pastille de contexte : « Cours 4, leçon », « Cours 4, exemple guidé 1 sur 2 », « Cours 4, exercice 2 sur 5 », « Rattrapage, 3 sur 5 », « Révisions, question 9 sur 17 » (sans nom de cours), « Cours 3, entraînement » ; sous-pastille « Même genre que ton erreur » / « Le calcul raté tout à l'heure » pour `meme-type` / `repetition` en révision (maquette `revisions.html`).
  - Après une réponse : `FeedbackPanel` puis « Continuer » ; « Simplifie » : la question reste, la saisie aussi.
  - « Passer » : petit bouton discret sous la réponse, seulement quand `canSkip` (3e passage du même calcul, doc 08 n° 9), puis la correction pas à pas.
  - Chronomètre `timer.ts` : de l'affichage à la réponse, en pause sur `visibilitychange` ; `durationMs` passé à `answer` / `explanationDone` (le plafond de 2 et 3 minutes est appliqué par `dailyTime`).
  - `record = false` (relire la leçon, doc 08 n° 17) : aucun `recordEvent`.
  - Croix : `confirmQuit` affiche le `Dialog` ; quitter enregistre `activity_end` avec `completed: false`.

- [ ] **Étape 1 : écrire les tests qui échouent** (`recordEvent` simulé).
  - Erreur au 2e calcul d'une série de 5 → total 7, le même type arrive en 5e position, la répétition exacte à la fin, posée avec le même type de question.
  - Même calcul raté 2 fois → « Passer » absent sur l'écran de retour du 2e échec, présent au 3e passage ; passer → un événement `skipped: true`.
  - Seule la 1re réponse a `attempt: 1`.
  - Arrière-plan pendant 5 min au milieu d'une question → `durationMs` sans ces 5 min.
  - `record = false` → aucun appel à `recordEvent`.
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.** (La revue téléphone se fait avec les tâches 24 et 26.)

### Task 24 (Tâche 24) : Cours, résultat, rattrapage, relire (maquette `cours.html` ; doc 01 §2, doc 08 n° 4 à 6, 16, 17)

**Files :** Create `apps/web/src/screens/Course.tsx`, `apps/web/src/screens/CourseResult.tsx` ; Test `apps/web/test/course.test.tsx`

**Interfaces :** Consumes `courseRunItems`, `rattrapageItems`, `runResult`, `ActivityScreen`, `useProgress`. Produces les routes `#/cours/:id` (cours complet), `#/rattrapage/:id`, `#/cours/:id/relire`.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Fin de cours validé → écran « Cours 4 validé » : étoile, « 11 bonnes réponses sur 12, dont 5 exercices de fin justes sur 5. », les 3 lignes (cours suivant débloqué, 1re étoile, « Première révision dans 48 heures. »), « Commencer le cours 5 », « Retour à l'accueil ».
  - Non validé → « Le cours 4 n'est pas encore validé », les deux critères avec leurs chiffres, celui qui manque en rouge (doc 08 n° 5), « Faire le rattrapage », « Relire la leçon ».
  - Rattrapage 4 sur 5 → « Cours 4 validé », « Rattrapage réussi : 4 exercices justes sur 5. » ; 3 sur 5 → « 3 sur 5, il en faut 4 », « Refaire une série de 5 » (nouveaux calculs, doc 08 n° 6).
  - Relire → mêmes parties de leçon, aucun événement ; Cours 7 validé (dernier) → bouton « Retour à l'accueil » seul.
  - Croix pendant le cours → « Quitter le cours ? Tu le reprendras depuis le début. » [Quitter] [Continuer] (doc 08 n° 16).
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Textes exacts de la maquette ; les chiffres viennent de `runResult`.
- [ ] **Étape 4 :** `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : Revue téléphone** (les 9 écrans de `cours.html`, dans les deux situations du rattrapage).
- [ ] **Étape 6 : commit.**

### Task 25 (Tâche 25) : Accueil, Mes cours, Entraînement (maquettes `concept.html` et `navigation.html` écrans 2 et 3 ; doc 02 §2 §5 §6, doc 08 n° 1 à 3, 19)

**Files :** Create `apps/web/src/screens/{Home,Courses,Training}.tsx` ; Test `apps/web/test/home.test.tsx`

**Interfaces :** Consumes `studentHome`, `trainingPool`, `trainingSeries`, `ActivityScreen`, `BottomNav`, `useSession` (prénom). Produces les routes `#/`, `#/cours`, `#/entrainement`, `#/entrainement/serie`.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Accueil, les 4 situations de `concept.html` : « Bonjour Léa ! », série, jauge (droite graduée 0 à 15, « Encore 7 minutes pour ton objectif. », puis « Objectif atteint ! 7 minutes en plus. » et 22 / 15 min) ; carte indigo « 5 révisions à faire, 15 questions, environ 5 minutes » + « Réviser », puis « Encore 2 révisions » + « Encore des révisions » ; sans révision, carte « Révisions faites » + entraînement (doc 02 §5) ; « Prochain cours » toujours actif (bouton à contour tant qu'il reste des révisions, plein ensuite) ; cours à rattraper → carte du cours avec « Faire le rattrapage » ; module terminé → carte « Module Calculs terminé. Tous les cours sont validés. » + « S'entraîner » (doc 08 n° 19) ; fenêtre de 4 cours et barre du module.
  - Mes cours, les 4 situations : une ligne par cours (validé et étoiles, à faire, à rattraper, verrouillé avec « Valide le cours 3 pour l'ouvrir. ») ; toucher un cours ouvert déplie ses actions dont « Relire la leçon » et « Relire ne change ni tes étoiles ni tes révisions. » ; un cours verrouillé ne s'ouvre pas (doc 08 n° 2).
  - Entraînement, les 4 situations : « Tout mélangé » ou « Mes cours » avec cases à cocher (cours validés et à rattraper, doc 08 n° 1) ; « 2 cours retenus, 10 questions » ; aucun choisi → « Choisis au moins un cours » et bouton inactif ; rien à travailler → carte « Rien à travailler pour l'instant » ; une série terminée ne change aucune date de révision.
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : Revue téléphone** (toutes les situations des trois écrans).
- [ ] **Étape 6 : commit.**

### Task 26 (Tâche 26) : Révisions et bilan de séance (maquette `revisions.html` ; doc 01 §4 §6, doc 02 §3 §5, doc 08 n° 7 à 10)

**Files :** Create `apps/web/src/screens/{Review,ReviewSummary}.tsx` ; Test `apps/web/test/review.test.tsx`

**Interfaces :** Consumes `nextReviewSession`, `reviewItems`, `reviewSummary`, `ActivityScreen`. Produces la route `#/revisions`.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - `Révisions : uniquement qcm, vraifaux, classer`, sans nom de cours.
  - Bilan « Séance terminée », « 13 sur 15 justes du premier coup. », jauge du jour, une ligne par cours (« 3 sur 3, revient dans 1 semaine »), puis « Encore des révisions » (« 2 cours dus, 6 questions, environ 2 minutes. ») ou la carte « Révisions faites » + « S'entraîner » ; « Revenir à l'accueil ».
  - Séance quittée au milieu : les cours dont les 3 questions n'ont pas toutes une 1re réponse restent dus (Review Focus n° 3).
  - Aucun cours dû en arrivant sur `#/revisions` → retour à l'accueil.
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : Revue téléphone** (les 4 écrans et leurs situations, dont les réponses mal écrites).
- [ ] **Étape 6 : commit.**

### Task 27 (Tâche 27) : Page de suivi (maquette `suivi.html` ; doc 05, doc 07 n° 17 à 21, doc 08 n° 13 à 15)

**Files :** Create `apps/web/src/screens/{Dashboard,DashModule,DashCourse}.tsx`, `apps/web/src/store/follow.ts` ; Test `apps/web/test/dashboard.test.tsx`

**Interfaces :** Consumes `getStudents`, `getStudentEvents`, `computeDashboard`, `Sheet`. Produces `useStudents()`, `useStudentEvents(id)` (cache IndexedDB par élève, lisible hors ligne) et les routes `#/suivi`, `#/suivi/:eleve/module/:id`, `#/suivi/:eleve/cours/:id`.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - Accueil, les 2 situations : prénom + chevron et « Lecture seule » ; calendrier de 28 points (L à D), toucher un jour → détail « Dimanche 22 novembre (aujourd'hui), 9 min. Révisions 4 min, cours 4 min, entraînement 1 min. » ; « Objectif atteint 18 jours sur 28 » ; État (Aujourd'hui, Série, une ligne par module en cours) ; Révisions pas faites (dépliable) ou « Révisions à jour » (texte de la maquette) ; Erreurs les plus communes (dépliables, 10 derniers calculs, « passé ») ; À retravailler (3 au plus) ou « Rien à retravailler en ce moment » (texte de la maquette, sans emoji).
  - 2 élèves → le prénom ouvre un volet en bas avec la liste (doc 08 n° 15), dernier élève mémorisé ; 1 élève → pas de chevron.
  - Module : une ligne par cours, « à rattraper » distinct, ⚠ seulement sur un cours validé (doc 08 n° 14), « 🔒 pas commencé », module terminé.
  - Cours : état, révisions ✓ / ✗, erreurs sur 28 jours, dernières erreurs ; cours à rattraper → « Pas encore validé : 3 sur 5 aux exercices de fin, le 21 novembre », « Le rattrapage lui est proposé ».
  - Lecture seule : aucun bouton d'action hors navigation.
- [ ] **Étape 2 :** `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Si un chiffre de la maquette n'existe pas dans `computeDashboard` (ex. la date et le score de l'échec de fin de cours), l'ajouter dans `dashboard.ts` avec son test.
- [ ] **Étape 4 :** `npm test`. Attendu : SUCCÈS.
- [ ] **Étape 5 : Revue téléphone** (3 écrans, 2 situations, volet ouvert).
- [ ] **Étape 6 : commit.**

### Task 28 (Tâche 28) : Parcours complets sur téléphone (E2E, hors ligne)

**Files :** Create `e2e/eleve.spec.ts`, `e2e/suivi.spec.ts`, `e2e/offline.spec.ts`

- [ ] **Étape 1 : écrire les tests** (Playwright, appareil « iPhone 13 », API locale `wrangler dev` avec une base D1 locale, comptes créés par `scripts/create-user.ts`) :
  1. connexion ; Cours 0 puis Cours 1, avec une erreur volontaire → explication, repassage en fin d'activité ; validation ; l'accueil montre la jauge et « 2 cours sur 8 validés » ;
  2. suiveur : connexion, accueil du suivi, ouverture du module puis du cours 1 ;
  3. hors ligne : `setOffline(true)`, 3 réponses, `setOffline(false)` → la file se vide, chaque événement une seule fois sur le serveur (Review Focus n° 1) ; téléphone vidé puis reconnexion → même accueil (Review Focus n° 4).
- [ ] **Étape 2 :** `npm run e2e -- --trace off`. Attendu : SUCCÈS (corriger les écrans si besoin).
- [ ] **Étape 3 : Revue téléphone d'ensemble** : `ui-design-review:ui-review` sur le parcours complet (accueil → cours → résultat → révisions → suivi).
- [ ] **Étape 4 : commit.**

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
