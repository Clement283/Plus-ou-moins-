# Étape 1 « Relatifs » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** Livrer une PWA mobile utilisable de bout en bout (cours, entraînement, révisions espacées, hors-ligne, page de suivi) avec les 7 cours « Relatifs » du module 1 « Calculs ».

**Architecture :** Monorepo npm workspaces. Un paquet TypeScript pur `@pom/engine` (le « cerveau » : maths, cours, répétition espacée, dosage, QCM, diagnostic d'erreurs, statistiques de suivi) est utilisé par l'appli web React (PWA, IndexedDB) et par le Worker Cloudflare. Le serveur ne stocke qu'un **journal d'événements en ajout seul** ; tout état (progression, révisions dues, tableau de bord) est recalculé par `foldProgress` / `computeDashboard` à partir de ce journal.

**Tech Stack :** TypeScript strict, Vite, React 18, vite-plugin-pwa (Workbox), idb, KaTeX (affichage des calculs « comme sur une copie »), Hono sur Cloudflare Workers (Static Assets + API), D1, Vitest (+ @cloudflare/vitest-pool-workers, @testing-library/react, fake-indexeddb), Playwright (Chromium préinstallé).

**Spec :** `docs/superpowers/specs/2026-11-22-plus-ou-moins-v1-design.md`

## Organisation : trois phases et un portail de validation

Le porteur du projet **valide toute la logique avant qu'elle soit codée** (spec §11). Le plan est donc découpé ainsi :

- **Phase A, tâches 1 et 2 :** rédiger les documents de logique, puis les faire valider. Aucun code ici. Chaque document contient un **tableau d'exemples chiffrés**. Une fois validés, ces exemples deviennent **les cas de test** des tâches de la phase C. Les phases C ne citent donc aucune valeur inventée : elles testent *exactement* les tableaux validés.
- **Phase B, tâches 3 à 7 :** l'infrastructure qui ne dépend d'aucune règle à valider (maths exactes, journal, serveur, synchro hors-ligne, composants QCM et étiquettes). Elle peut avancer **pendant** que le porteur du projet relit la phase A.
- **Phase C, tâches 8 à 15 :** la logique validée, les écrans, le tableau de bord, puis le déploiement. ⛔ **Aucune tâche C ne démarre tant que son document de référence n'est pas marqué « Validé » par le porteur du projet.**

## Global Constraints

- Toute l'interface est en **français**.
- Exercices, entraînement et révisions s'affichent **comme sur une copie de contrôle** : notation mathématique normale rendue par KaTeX, signes de taille normale, **aucune couleur ni aide visuelle sur les calculs**. Les couleurs et repères visuels sont réservés aux mini-leçons, aux exemples guidés et aux explications d'erreur (spec §3).
- Le « jour » est toujours calculé en **Europe/Paris**, quel que soit le fuseau du téléphone.
- Le serveur est la source de vérité. Le stockage local ne sert que de cache et de file d'attente. Chaque événement a un `id` (UUID v4) généré côté client, et l'insertion côté serveur est idempotente.
- Correction et explication des erreurs se font **localement, sans appel serveur** (spec §8).
- Données personnelles : uniquement un prénom ou pseudo et un code de connexion haché. Pas d'email.
- Hébergement Cloudflare, offre gratuite : un seul Worker (assets statiques + `/api/*`) et une base D1.
- Mobile d'abord : iPhone (Safari) et Android (Chrome), installable sur l'écran d'accueil.
- Pas de notifications, pas d'admin graphique, pas d'écriture au doigt, pas d'inscription publique (spec §2).
- Styles **sobres et centralisés** (variables CSS dans un seul fichier `apps/web/src/theme.css`), pour qu'on puisse rhabiller l'appli à l'étape design.
- Commits : messages en anglais, terminés par les lignes d'attribution fournies par le harnais.

## Review Focus

1. **Réponses envoyées deux fois.** Une réponse donnée hors ligne, puis un réseau qui revient, coupe et revient pendant l'envoi : chaque réponse doit apparaître une seule fois sur le serveur et sur la page de suivi. Tests dans les tâches 5 et 6.
2. **Passage de minuit, à Paris ou ailleurs.** Une réponse à 23 h 59 puis une à 0 h 01, heure de Paris (y compris le jour du changement d'heure), ou un téléphone réglé sur un autre fuseau : les jours sont ceux de Paris. Test dans la tâche 4.
3. **Retour après plusieurs jours d'absence.** Le lot de révisions reste plafonné : jamais « 45 minutes de révisions » pour un rythme normal, et le reste est reporté, pas perdu. Test dans la tâche 9 (cas « 10 jours d'absence »).
4. **Téléphone vidé ou nouveau téléphone.** Après une reconnexion avec le même code, l'état de progression est identique à celui d'avant. Test dans la tâche 6.
5. **Calculs générés impossibles ou faux.** Aucun générateur ne doit produire de division par zéro, de quotient non entier là où le cours attend un entier, ni de distracteur QCM égal à la bonne réponse ou en double. Tests de propriété dans les tâches 10 et 12 (1 000 tirages par cours et par niveau).

Cas additionnels épinglés :
- **Étiquettes identiques.** Les étiquettes à ordonner peuvent porter le même texte (deux « 3 ») : la vérification compare les textes, pas les positions. Test dans la tâche 7.
- **Saisie vide ou incomplète.** Elle ne peut pas être validée et ne fait jamais planter l'appli. Test dans la tâche 11.

---

## Structure des fichiers

```
package.json                      workspaces: packages/*, apps/*
tsconfig.base.json
packages/engine/
  src/math/rational.ts            fractions exactes
  src/math/expr.ts                arbre d'expression, évaluation, rendu LaTeX
  src/time.ts                     parisDay()
  src/rng.ts                      seededRng()
  src/events.ts                   type AppEvent
  src/questions/types.ts          Question (saisie | qcm | ordre)
  src/questions/build.ts          buildQuestion() + distracteurs (tâche 10)
  src/answers.ts                  parseAnswer(), acceptAnswer() (tâche 11)
  src/courses/types.ts            CourseDef, Exercise, LessonPart, Explanation
  src/courses/calculs/relatifs/c01-…c07-*.ts   un fichier par cours (tâche 12)
  src/courses/index.ts            registre des modules/cours
  src/srs.ts                      foldProgress() (tâche 8)
  src/daily.ts                    dailyGoal(), todaysReviews() (tâche 9)
  src/dashboard.ts                computeDashboard() (tâche 14)
  src/index.ts                    exports publics
apps/api/
  src/index.ts                    app Hono + assets
  src/auth.ts, src/routes/*.ts
  migrations/0001_init.sql
  wrangler.toml
scripts/create-user.ts            création de comptes (admin en ligne de commande)
apps/web/
  src/theme.css
  src/api.ts                      client HTTP
  src/store/db.ts                 IndexedDB (events, outbox, session)
  src/store/sync.ts               synchronisation
  src/components/Math.tsx         rendu KaTeX
  src/components/questions/{Qcm,Ordre,Saisie,Keypad}.tsx
  src/screens/{Login,Home,Course,Practice,Review,Feedback,Dashboard}.tsx
docs/validation/01…06-*.md        documents de la phase A
e2e/*.spec.ts                     Playwright
```

---

## Phase A : documents de logique à valider

### Tâche 1 : Documents de logique de l'application

**Files :**
- Create: `docs/validation/01-repetition-espacee.md`
- Create: `docs/validation/02-objectif-et-dosage.md`
- Create: `docs/validation/03-clavier-et-reponses.md`
- Create: `docs/validation/04-qcm.md`
- Create: `docs/validation/05-page-de-suivi.md`

Chaque document est en français simple, sans jargon, au plus 2 pages. En tête : `Statut : à valider`. En fin : une section **« Exemples »** sous forme de tableau(x) chiffré(s), d'au moins 8 lignes, couvrant les cas limites. Chaque proposition est formulée comme un choix de Claude, avec sa raison.

- [ ] **Étape 1 : rédiger `01-repetition-espacée.md`.** Il doit fixer :
  - ce qui est suivi (spec §12 : l'unité est le cours, avec son niveau 1 à 3, ses étoiles et sa prochaine date de révision ; le type d'erreur sert à choisir les calculs) ;
  - les intervalles en jours, par palier ;
  - ce qui fait monter et descendre le niveau ;
  - combien d'erreurs le font redescendre ;
  - le critère de maîtrise du niveau 1, qui débloque le cours suivant ;
  - ce qui compte comme une révision réussie ou ratée (un seul calcul, ou un petit lot ?) ;
  - comment le type d'erreur oriente les calculs proposés ;
  - le retour du calcul raté plus loin dans l'activité en cours (spec §4.5).

  Exemples : des suites de réponses jour par jour, avec à chaque ligne le niveau, les étoiles et la prochaine date.
- [ ] **Étape 2 : rédiger `02-objectif-et-dosage.md`.** Il doit fixer :
  - comment on compte le temps (quels écrans comptent, et ce qui se passe quand elle est inactive) ;
  - la jauge des 15 minutes, avec la répartition de référence de 5 minutes de révisions et 10 minutes de cours ;
  - la formule du lot de révisions proportionnel à ce qu'elle a appris ;
  - le plafond ;
  - l'ordre de priorité des révisions reportées (urgence, puis ce qu'elle rate le plus) ;
  - les « révisions bonus » au-delà du lot ;
  - ce que l'écran d'accueil met en avant, avec un croquis texte.

  Exemples : « minutes de cours la veille / révisions dues → taille du lot ». Inclure 15 minutes par jour, 2 heures de cours et 10 jours d'absence.
- [ ] **Étape 3 : rédiger `03-clavier-et-reponses.md`.** Il doit fixer :
  - la disposition du clavier maths, en croquis texte (chiffres, touche « − » pour le signe, touche fraction, effacer, valider) ;
  - comment on tape un nombre négatif et une fraction négative ;
  - la grammaire de la chaîne produite (par exemple `-12/5`) ;
  - les écritures acceptées (−2/3, 2/(−3), fraction non simplifiée selon le cours, −0, zéros en tête) ;
  - la saisie vide ou incomplète ;
  - le comportement pour les étiquettes à ordonner (glisser ou toucher).

  Exemples : « touches tapées → chaîne → accepté ou refusé ».
- [ ] **Étape 4 : rédiger `04-qcm.md`.** Il doit fixer :
  - le nombre de choix ;
  - quand les erreurs typiques dominent (premières fois, niveau 1) ;
  - comment on fabrique les valeurs « non typiques » plausibles (même ordre de grandeur, même signe ou signe opposé…) ;
  - comment le mélange évolue ;
  - l'ordre d'affichage aléatoire ;
  - l'interdiction des doublons et de la bonne réponse parmi les distracteurs ;
  - comment le choix fait renseigne le type d'erreur.

  Exemples : « calcul, nombre de fois vu → les 4 choix et l'erreur associée à chacun ».
- [ ] **Étape 5 : rédiger `05-page-de-suivi.md`.** Il doit fixer, avec un croquis texte de la page :
  - les indicateurs de la spec §7, et comment chacun est calculé : objectif atteint, temps par jour selon l'activité, série de jours, calendrier, taux par cours, étoiles, tendance des erreurs de signe par semaine, dernières erreurs avec la réponse donnée ;
  - le choix de l'élève quand on en suit plusieurs.

  Exemples : un petit journal fictif, et les indicateurs attendus.
- [ ] **Étape 6 : commit et push**, puis présenter les 5 documents au porteur du projet, un résumé par document. **Portail :** chaque document passe à `Statut : Validé (date)` seulement après son accord explicite. Les corrections demandées sont intégrées et re-présentées.

```bash
git add docs/validation && git commit -m "docs: logic proposals for owner validation" && git push origin main
```

### Tâche 2 : Contenu des 7 cours « Relatifs »

**Files :**
- Create: `docs/validation/06-cours-relatifs.md`

- [ ] **Étape 1 : rédiger, pour chacun des cours 1 à 7 de la spec §5, une fiche** contenant :
  - le titre et la règle unique du cours ;
  - **les parties de la mini-leçon**, dans l'ordre, avec le texte exact (court) et les aides visuelles prévues : couleurs, schémas, droite graduée… Il faut au moins une partie « étiquettes à ordonner » et une partie « réponse à écrire » ;
  - les exemples guidés à compléter ;
  - **le générateur par niveau 1, 2 et 3** : la forme des calculs, les plages de nombres et les contraintes (pas de division par zéro, quotients entiers pour le cours 6). Chaque niveau garde la même méthode (spec §4.1) ;
  - le nombre d'exercices de fin de cours ;
  - **les erreurs typiques reconnues**, avec pour chacune un identifiant (`signe-inverse`, `addition-au-lieu-de-soustraction`…), la règle de détection et le texte exact de l'explication.

  La fiche se termine par 3 calculs d'exemple par niveau, avec leurs réponses, et par des exemples « réponse donnée → erreur détectée ».
- [ ] **Étape 2 : commit, push et présentation au porteur du projet, avec le même portail** que la tâche 1 (`Statut : Validé`). Il peut valider cours par cours.

---

## Phase B : infrastructure (indépendante des règles à valider)

### Tâche 3 : Monorepo et maths exactes

**Files :**
- Create: `package.json`, `tsconfig.base.json`, `packages/engine/{package.json,tsconfig.json,vitest.config.ts}`
- Create: `packages/engine/src/math/rational.ts`, `packages/engine/src/math/expr.ts`, `packages/engine/src/rng.ts`, `packages/engine/src/index.ts`
- Test: `packages/engine/test/rational.test.ts`, `packages/engine/test/expr.test.ts`

**Interfaces :**
- Produces :
  - `type Rational = { n: number; d: number }`, normalisé : `d > 0` et `pgcd(|n|, d) = 1`.
  - `rat(n: number, d = 1): Rational`, qui lève une erreur si `d === 0`.
  - `add`, `sub`, `mul`, `div`, de type `(a: Rational, b: Rational) => Rational` (`div` lève une erreur sur une division par 0).
  - `eqRat(a, b): boolean`, `ratToString(r): string` (`"-12/5"`, `"3"`).
  - `type Expr = { k: 'num'; v: Rational } | { k: 'op'; op: '+' | '-' | '*' | '/'; a: Expr; b: Expr } | { k: 'pow'; a: Expr; e: number }`.
  - `evaluate(e: Expr): Rational`.
  - `toLatex(e: Expr): string`.
  - `type Rng = () => number`, `seededRng(seed: number): Rng` (mulberry32), `randInt(rng, min, max): number`.

- [ ] **Étape 1 : écrire les tests qui échouent.**

```ts
expect(add(rat(3,4), rat(1,6))).toEqual({ n: 11, d: 12 });
expect(rat(2,-4)).toEqual({ n: -1, d: 2 });
expect(mul(rat(-3), rat(-3))).toEqual({ n: 9, d: 1 });
expect(() => div(rat(1), rat(0))).toThrow();
expect(ratToString(rat(-12,5))).toBe('-12/5');
// toLatex : un négatif en opérande droite est parenthésé, signe moins typographique
expect(toLatex(op('+', num(3), num(-3)))).toBe('3 + (-3)');
expect(toLatex(op('*', num(-3), num(-3)))).toBe('-3 \\times (-3)');
expect(toLatex(op('/', num(1), num(2)))).toBe('1 \\div 2');
expect(toLatex(pow(num(-3), 2))).toBe('(-3)^{2}');
expect(evaluate(op('-', num(3), op('*', num(2), num(-4))))).toEqual(rat(11));
// seededRng est déterministe
expect(seededRng(42)()).toBe(seededRng(42)());
```

(`num`, `op` et `pow` sont des petites fonctions d'aide de construction, exportées depuis `expr.ts`.)

- [ ] **Étape 2 :** lancer `npm test -w @pom/engine`. Attendu : ÉCHEC, modules introuvables.
- [ ] **Étape 3 : implémenter.** Le parenthésage de `toLatex` suit l'usage d'une copie de lycée : un nombre négatif en opérande droite est toujours entre parenthèses, et un opérande gauche négatif en tête d'expression ne l'est pas. Les sous-expressions sont parenthésées selon les priorités.
- [ ] **Étape 4 :** lancer `npm test -w @pom/engine`. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Tâche 4 : Journal d'événements et jour de Paris

**Files :**
- Create: `packages/engine/src/time.ts`, `packages/engine/src/events.ts`
- Test: `packages/engine/test/time.test.ts`

**Interfaces :**
- Produces :
  - `parisDay(ms: number): string`, au format `'YYYY-MM-DD'` dans le fuseau Europe/Paris (via `Intl.DateTimeFormat`).
  - Le type d'événement :

```ts
type Mode = 'lecon' | 'exemple' | 'cours' | 'entrainement' | 'revision';
type QuestionKind = 'saisie' | 'qcm' | 'ordre';
type AppEvent = { id: string; userId: string; at: number; day: string } & (
  | { kind: 'answer'; courseId: string; level: 1 | 2 | 3; mode: Mode; questionKind: QuestionKind;
      prompt: string; given: string; expected: string; correct: boolean;
      errorType: string | null; durationMs: number }
  | { kind: 'lesson_part_done'; courseId: string; partIndex: number; durationMs: number }
);
```

  - `isAppEvent(x: unknown): x is AppEvent`, utilisé par le serveur pour valider les entrées.

- [ ] **Étape 1 : écrire les tests qui échouent** (Review Focus n° 2).

```ts
expect(parisDay(Date.parse('2026-11-22T22:59:00Z'))).toBe('2026-11-22'); // 23:59 Paris (UTC+1)
expect(parisDay(Date.parse('2026-11-22T23:01:00Z'))).toBe('2026-11-23'); // 00:01 Paris
expect(parisDay(Date.parse('2026-07-01T21:59:00Z'))).toBe('2026-07-01'); // 23:59 heure d'été
expect(parisDay(Date.parse('2026-07-01T22:01:00Z'))).toBe('2026-07-02');
expect(parisDay(Date.parse('2026-10-25T00:30:00Z'))).toBe('2026-10-25'); // nuit du changement d'heure
expect(isAppEvent({ kind: 'answer' })).toBe(false);
```

- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS, y compris avec `TZ=America/New_York npm test -w @pom/engine`.
- [ ] **Étape 5 : commit.**

### Tâche 5 : Serveur (Worker, D1, connexion, journal)

**Files :**
- Create: `apps/api/{package.json,wrangler.toml,vitest.config.ts}`, `apps/api/migrations/0001_init.sql`
- Create: `apps/api/src/index.ts`, `apps/api/src/auth.ts`, `apps/api/src/routes/events.ts`, `apps/api/src/routes/students.ts`
- Create: `scripts/create-user.ts`
- Test: `apps/api/test/api.test.ts`

**Interfaces :**
- Consumes : `AppEvent`, `isAppEvent` (tâche 4).
- Produces (HTTP, JSON, en-tête `Authorization: Bearer <token>`) :
  - `POST /api/login` `{ code }` → `200 { token, user: { id, name, role: 'eleve' | 'suiveur' } }`, ou `401`.
  - `POST /api/events` `{ events: AppEvent[] }` (élève, `userId` doit être le sien, 500 événements au maximum) → `200 { accepted: string[] }` (les ids, y compris ceux déjà présents).
  - `GET /api/events` → `200 { events: AppEvent[] }`, tous les événements de l'utilisateur connecté, triés par `at`.
  - `GET /api/students` (suiveur) → `200 { students: { id, name }[] }`.
  - `GET /api/students/:id/events` (suiveur qui suit cet élève) → `200 { events }`, sinon `403`.
- Schéma : `users(id TEXT PK, name TEXT, role TEXT, code_hash TEXT UNIQUE, created_at INT)`, `follows(suiveur_id, eleve_id, PK(suiveur_id, eleve_id))`, `tokens(token_hash TEXT PK, user_id TEXT, created_at INT)`, `events(id TEXT PK, user_id TEXT, at INT, day TEXT, kind TEXT, payload TEXT)` avec un index `(user_id, at)`.
- Codes et jetons : les codes font 8 caractères, tirés d'un alphabet sans caractères ambigus (pas de 0, O, 1, I, l). Codes et jetons sont stockés en SHA-256. Le jeton ne s'expire pas (la session reste ouverte, spec §6).
- `scripts/create-user.ts --name <nom> --role eleve|suiveur [--follows <eleveId>] [--remote]` affiche le code une seule fois et exécute l'insertion via `wrangler d1 execute`.

- [ ] **Étape 1 : écrire les tests qui échouent** (pool Workers, D1 local, migrations appliquées dans `beforeAll`).
  - `login: bon code → token; mauvais code → 401`
  - `POST /api/events: le même lot envoyé deux fois → 1 seule ligne par id, les deux réponses listent tous les ids` (Review Focus n° 1)
  - `POST /api/events: un événement avec le userId d'un autre → 403; un objet invalide → 400`
  - `GET /api/events: retourne uniquement mes événements, triés par at`
  - `GET /api/students/:id/events: suiveur lié → 200; suiveur non lié → 403; élève → 403`
- [ ] **Étape 2 :** lancer `npm test -w api`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter** avec Hono. L'insertion utilise `INSERT OR IGNORE` dans un `db.batch`. Les fichiers statiques sont servis par la liaison Static Assets (`[assets] directory = "../web/dist"`), avec le routage SPA.
- [ ] **Étape 4 :** lancer `npm test -w api`. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Tâche 6 : Appli web, connexion, stockage local et synchronisation

**Files :**
- Create: `apps/web/` (Vite + React + TS, `vite-plugin-pwa` avec `registerType: 'autoUpdate'`, manifeste en français, `display: standalone`), `apps/web/src/theme.css`
- Create: `apps/web/src/api.ts`, `apps/web/src/store/db.ts`, `apps/web/src/store/sync.ts`, `apps/web/src/screens/Login.tsx`, `apps/web/src/App.tsx`
- Test: `apps/web/test/sync.test.ts`

**Interfaces :**
- Consumes : l'API de la tâche 5, `AppEvent` et `parisDay`.
- Produces :
  - `recordEvent(e: Omit<AppEvent, 'id' | 'userId' | 'at' | 'day'>): Promise<AppEvent>` : complète l'événement (`crypto.randomUUID()`, `Date.now()`, `parisDay`), l'écrit dans les magasins `events` et `outbox`, puis lance `flush()` sans attendre la fin.
  - `flush(): Promise<void>` : envoie la file d'attente par lots de 500 et retire les ids `accepted`. Une seule exécution à la fois. Elle est relancée sur `online`, `visibilitychange` et au démarrage.
  - `loadAll(): Promise<AppEvent[]>` : le cache local fusionné avec `GET /api/events` (dédoublonné par `id`, trié par `at`).
  - `useEvents(): AppEvent[]` : hook React.
  - `session` : `{ token, user }`, conservé dans IndexedDB.

- [ ] **Étape 1 : écrire les tests qui échouent** (fake-indexeddb, `fetch` simulé).
  - `hors ligne: recordEvent ×3 → outbox=3, aucun appel réseau réussi`
  - `retour réseau: flush → POST contient les 3, outbox=0`
  - `coupure pendant l'envoi puis renvoi: le serveur simulé reçoit 2 fois le lot, loadAll ne contient chaque id qu'une fois` (Review Focus n° 1)
  - `deux flush simultanés → un seul POST`
  - `téléphone vidé: base locale vide + login + loadAll → mêmes événements que le serveur` (Review Focus n° 4)
- [ ] **Étape 2 :** lancer `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** L'écran de connexion contient un seul champ « Ton code », en majuscules automatiques, avec un message d'erreur court. Une fois connecté, l'appli redirige vers `Home` (élève) ou `Dashboard` (suiveur), qui pour l'instant ne sont que des écrans vides. Le service worker met en cache tout le shell de l'appli, ce qui suffit au hors-ligne puisque tout le cerveau tourne en local.
- [ ] **Étape 4 :** lancer `npm test -w web`, puis `npm run build -w web`. Attendu : SUCCÈS, et `dist/sw.js` est présent.
- [ ] **Étape 5 : commit.**

### Tâche 7 : Composants de question (QCM, étiquettes) et rendu des calculs

**Files :**
- Create: `packages/engine/src/questions/types.ts`
- Create: `apps/web/src/components/Math.tsx`, `apps/web/src/components/questions/Qcm.tsx`, `apps/web/src/components/questions/Ordre.tsx`, `apps/web/src/components/questions/QuestionView.tsx`
- Test: `apps/web/test/questions.test.tsx`

**Interfaces :**
- Produces :

```ts
type Question =
  | { kind: 'saisie'; promptLatex: string; expected: string }
  | { kind: 'qcm'; promptLatex: string; choices: { latex: string; value: string; errorType: string | null }[]; correctIndex: number }
  | { kind: 'ordre'; instruction: string; tiles: { id: string; label: string }[]; solution: string[] /* labels dans l'ordre */ };
type QuestionResult = { given: string; correct: boolean; errorType: string | null; durationMs: number };
```

  - `<QuestionView question onAnswer={(r: QuestionResult) => void} />` : choisit le composant selon `kind`. Pour `saisie`, il affiche un emplacement réservé jusqu'à la tâche 11.
  - `<Math latex inline? />` : rendu KaTeX, dans le style « copie » (aucune couleur).
  - `checkOrder(tiles, orderedIds, solution): boolean`, exporté depuis `Ordre.tsx`.

- [ ] **Étape 1 : écrire les tests qui échouent** (@testing-library/react).
  - `Qcm: toucher le bon choix → onAnswer({correct:true, errorType:null})`
  - `Qcm: toucher un choix typique → onAnswer({correct:false, errorType:'signe-inverse'})`
  - `checkOrder: tuiles ['3','−','3'] avec deux « 3 » d'ids différents → vrai quel que soit le « 3 » placé en premier` (étiquettes identiques)
  - `Ordre: valider avant d'avoir placé toutes les tuiles est impossible (bouton désactivé)`
  - `Math: le DOM rendu ne contient aucun style color`
- [ ] **Étape 2 :** lancer `npm test -w web`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Pour les étiquettes, on touche une tuile pour la placer dans la ligne réponse, et on la touche de nouveau pour la retirer. C'est l'interaction par défaut ; elle sera ajustée selon `03-clavier-et-reponses.md` à la tâche 11 si le document validé en décide autrement.
- [ ] **Étape 4 :** lancer `npm test -w web`. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

---

## Phase C : logique validée, écrans, déploiement

> ⚠ **Révision après la relecture de la phase A :** les documents validés font foi sur ce plan. Changements connus : plus de « paliers » mais une échelle de temps A–H (doc 01) ; 5 exercices de fin (doc 06) ; 8 types de questions au lieu de 3 (doc 03 §5) — le type `Question` de la tâche 7 et `buildQuestion` de la tâche 10 doivent couvrir `saisie | trou | ordre | erreur | paires | classer | qcm | vraifaux`. Les interfaces des tâches 7, 8, 10, 12 et 13 seront ajustées en conséquence avant de lancer la phase C.
>
> ⛔ Avant chaque tâche, vérifier que le document cité porte `Statut : Validé`. Les tests de la tâche sont **les lignes du tableau « Exemples » de ce document**, recopiées telles quelles, une ligne = un cas `it.each`.

### Tâche 8 : Répétition espacée et progression (réf. `01-repetition-espacee.md`)

**Files :**
- Create: `packages/engine/src/srs.ts`
- Test: `packages/engine/test/srs.test.ts`

**Interfaces :**
- Consumes : `AppEvent` et `CourseDef` (ce dernier n'utilise ici que `id` et `order`, défini à la tâche 12, mais le type est créé dès maintenant dans `courses/types.ts`).
- Produces :

```ts
type Level = 1 | 2 | 3;
interface CourseProgress {
  courseId: string; unlocked: boolean; lessonDone: boolean; level1Mastered: boolean;
  level: Level; stars: 0 | 1 | 2 | 3; nextDue: string | null; // 'YYYY-MM-DD'
  recentErrorTypes: Record<string, number>;
}
interface ProgressState { courses: Record<string, CourseProgress>; nextCourseId: string | null }
foldProgress(events: AppEvent[], courses: CourseDef[]): ProgressState
```

- [ ] **Étape 1 : écrire les tests qui échouent.** Chaque ligne du tableau « Exemples » validé devient un journal d'événements construit par une fonction d'aide `answers(courseId, [{day, correct, mode, level}...])`, avec l'état attendu en sortie. On ajoute deux tests fixes : `premier cours débloqué sans aucun événement` et `cours N+1 verrouillé tant que le niveau 1 du cours N n'est pas maîtrisé`.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter `foldProgress`** exactement selon les règles validées. La fonction est pure, et ne dépend que du contenu du journal et des jours, jamais de l'ordre de réception des événements.
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Tâche 9 : Objectif du jour et dosage des révisions (réf. `02-objectif-et-dosage.md`)

**Files :**
- Create: `packages/engine/src/daily.ts`
- Test: `packages/engine/test/daily.test.ts`

**Interfaces :**
- Consumes : `foldProgress`, `ProgressState`.
- Produces :

```ts
interface DailyGoal { goalMinutes: 15; minutes: number; reviewMinutes: number; courseMinutes: number; trainingMinutes: number; reached: boolean }
dailyGoal(events: AppEvent[], day: string): DailyGoal
interface ReviewItem { courseId: string; level: Level; focusErrorType: string | null }
todaysReviews(state: ProgressState, events: AppEvent[], today: string): { batch: ReviewItem[]; postponed: number }
```

- [ ] **Étape 1 : écrire les tests qui échouent** à partir du tableau validé. On y retrouve obligatoirement les cas « 15 min par jour », « 2 h de cours la veille » et « 10 jours d'absence » (Review Focus n° 3 : le lot ne dépasse pas le plafond validé et `postponed > 0`), plus un test qui vérifie que les révisions faites en bonus au-delà du lot ne sont jamais refusées.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Tâche 10 : Construction des questions et distracteurs QCM (réf. `04-qcm.md`)

**Files :**
- Create: `packages/engine/src/questions/build.ts`
- Test: `packages/engine/test/build.test.ts`

**Interfaces :**
- Consumes : `Exercise` (tâche 12, dont le type est créé dans `courses/types.ts` : `{ courseId; level; expr: Expr; answer: Rational; typicalWrong: { value: Rational; errorType: string }[] }`), `Question`, `toLatex`.
- Produces : `buildQuestion(ex: Exercise, kind: 'saisie' | 'qcm', ctx: { timesSeen: number; rng: Rng }): Question`

- [ ] **Étape 1 : écrire les tests qui échouent.** Les lignes du tableau validé servent de tests (avec un `rng` à graine fixe). On ajoute un test de propriété (Review Focus n° 5) : sur 1 000 exercices aléatoires, les choix sont distincts, contiennent exactement une fois la bonne réponse, et leur nombre correspond au document validé.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Tâche 11 : Clavier maths et réponses acceptées (réf. `03-clavier-et-reponses.md`)

**Files :**
- Create: `packages/engine/src/answers.ts`, `apps/web/src/components/questions/Keypad.tsx`, `apps/web/src/components/questions/Saisie.tsx`
- Modify: `apps/web/src/components/questions/QuestionView.tsx` (remplace l'emplacement réservé `saisie`), et `Ordre.tsx` si le document en décide autrement
- Test: `packages/engine/test/answers.test.ts`, `apps/web/test/keypad.test.tsx`

**Interfaces :**
- Produces :
  - `parseAnswer(text: string): Rational | null` (grammaire du document validé ; `null` si l'entrée est vide ou incomplète).
  - `acceptAnswer(text: string, ex: Exercise, rules: { requireSimplified: boolean }): boolean`.
  - `<Keypad value onChange onSubmit />`.

- [ ] **Étape 1 : écrire les tests qui échouent.** Le tableau « touches → chaîne → accepté ou refusé » donne à la fois des tests moteur et des tests de composant : on tape la séquence de touches et on vérifie la chaîne obtenue. On ajoute `saisie vide → bouton Valider désactivé, aucun appel onAnswer`.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Le clavier remplace le clavier du téléphone : le champ réponse est en `inputMode="none"`, sans focus sur un champ natif.
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Tâche 12 : Les 7 cours « Relatifs » (réf. `06-cours-relatifs.md`)

**Files :**
- Create: `packages/engine/src/courses/types.ts` (complété), `packages/engine/src/courses/index.ts`
- Create: `packages/engine/src/courses/calculs/relatifs/c01-addition-meme-signe.ts` … `c07-multiplier-plusieurs.ts`
- Test: `packages/engine/test/courses/relatifs.test.ts`

**Interfaces :**
- Produces :

```ts
type LessonPart =
  | { type: 'explication'; blocks: LessonBlock[] }        // texte court + aides visuelles (couleurs autorisées ici)
  | { type: 'question'; question: Question; mode: 'lecon' | 'exemple' };
interface Explanation { rule: string; steps: LessonBlock[] }  // couleurs autorisées
interface CourseDef {
  id: string; moduleId: 'calculs'; order: number; title: string;
  lesson: LessonPart[]; examples: LessonPart[]; endExerciseCount: number;
  answerRules: { requireSimplified: boolean };
  generate(level: Level, rng: Rng): Exercise;
  diagnose(ex: Exercise, given: Rational): string | null;   // id d'erreur typique ou null
  explain(ex: Exercise, errorType: string | null): Explanation;
}
COURSES: CourseDef[]; getCourse(id: string): CourseDef
```

`LessonBlock` = `{ t: 'text'; text: string } | { t: 'math'; latex: string; highlight?: string[] } | { t: 'number-line'; from: number; to: number; jumps: { from: number; by: number }[] }`.

- [ ] **Étape 1 : écrire les tests qui échouent**, pour chaque cours :
  - les calculs d'exemple de la fiche validée, avec leurs réponses ;
  - chaque ligne « réponse donnée → erreur détectée » via `diagnose` ;
  - un test de propriété (Review Focus n° 5) : 1 000 tirages par niveau → `evaluate(expr)` égale `answer`, aucune exception, les plages et contraintes de la fiche sont respectées (entiers au cours 6), et chaque `typicalWrong` est différent de la réponse.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter les 7 fichiers**, en recopiant exactement les textes validés (leçons, explications).
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Tâche 13 : Écrans élève (accueil, cours, révisions, entraînement, retour sur erreur)

**Files :**
- Create: `apps/web/src/screens/Home.tsx`, `Course.tsx`, `Review.tsx`, `Practice.tsx`, `Feedback.tsx`, `apps/web/src/components/LessonBlocks.tsx`, `apps/web/src/activity.ts`
- Test: `apps/web/test/screens.test.tsx`, `e2e/eleve.spec.ts`

**Interfaces :**
- Consumes : `useEvents`, `recordEvent`, `foldProgress`, `dailyGoal`, `todaysReviews`, `buildQuestion`, `COURSES`, `QuestionView`, `acceptAnswer`.
- Produces : `runActivity(items, onEvent)` dans `activity.ts`. Cette file de questions remet un calcul du même type plus loin après une erreur (selon `01-repetition-espacee.md`) et mesure `durationMs` selon les règles de temps de `02-objectif-et-dosage.md`.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - `Home: avec des révisions dues → carte Révisions affichée en premier, bouton Prochain cours toujours actif`
  - `Home: jauge = dailyGoal(...).minutes / 15`
  - `Course: enchaîne leçon → exemples → endExerciseCount exercices en saisie; chaque réponse produit un événement answer avec mode correct`
  - `Review: n'utilise que des QCM`
  - `Feedback: après une erreur → bonne réponse + explain(...) affichés; le même type de calcul revient plus loin dans l'activité`
  - `Exercices (mode cours/entrainement/revision): aucun élément de calcul n'a de couleur` (contrainte « copie »)
  - E2E Playwright en viewport iPhone : se connecter → faire la leçon du cours 1 → répondre faux une fois → voir l'explication → terminer → l'accueil montre la jauge non nulle.
- [ ] **Étape 2 :** lancer `npm test -w web` et `npx playwright test e2e/eleve.spec.ts --trace off`. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.** Le style reste sobre, via les variables de `theme.css`. Le texte est court, sans consignes longues.
- [ ] **Étape 4 :** relancer les deux commandes. Attendu : SUCCÈS.
- [ ] **Étape 5 : test hors ligne (E2E).** `context.setOffline(true)` → faire 3 réponses → `setOffline(false)` → la file d'attente se vide, et le serveur local contient les 3 événements une seule fois. Attendu : SUCCÈS.
- [ ] **Étape 6 : commit.**

### Tâche 14 : Page de suivi (réf. `05-page-de-suivi.md`)

**Files :**
- Create: `packages/engine/src/dashboard.ts`, `apps/web/src/screens/Dashboard.tsx`
- Test: `packages/engine/test/dashboard.test.ts`, `apps/web/test/dashboard.test.tsx`

**Interfaces :**
- Consumes : `GET /api/students`, `GET /api/students/:id/events`, `foldProgress`, `dailyGoal`, `COURSES`.
- Produces : `computeDashboard(events: AppEvent[], courses: CourseDef[], today: string): Dashboard`. Les champs suivent exactement les indicateurs du document validé. Le calcul se fait dans le navigateur du suiveur, avec le même moteur.

- [ ] **Étape 1 : écrire les tests qui échouent.** Le journal fictif du document et ses indicateurs attendus servent de tests moteur. On ajoute un test d'écran : `suiveur avec 2 élèves → sélecteur; lecture seule (aucun bouton d'action)`.
- [ ] **Étape 2 :** lancer les tests. Attendu : ÉCHEC.
- [ ] **Étape 3 : implémenter.**
- [ ] **Étape 4 :** lancer les tests. Attendu : SUCCÈS.
- [ ] **Étape 5 : commit.**

### Tâche 15 : Déploiement Cloudflare et comptes réels

**Files :**
- Modify: `apps/api/wrangler.toml` (`database_id` réel), `package.json` (script `deploy` : `npm run build -w web && wrangler deploy -c apps/api/wrangler.toml`)
- Create: `docs/deploiement.md` (les étapes en français pour le porteur du projet)

- [ ] **Étape 1 : authentification Cloudflare.** Le porteur du projet fournit l'accès à son compte : jeton d'API demandé via l'outil de secrets de l'environnement, jamais collé dans le chat. Sinon, il lance lui-même les commandes de `docs/deploiement.md`.
- [ ] **Étape 2 : créer la base de production.** `wrangler d1 create plus-ou-moins`, puis `wrangler d1 migrations apply plus-ou-moins --remote`. Attendu : la migration 0001 est appliquée.
- [ ] **Étape 3 : déployer.** `npm run deploy`. Attendu : une URL `*.workers.dev`, la page de connexion s'affiche sur un téléphone, et l'appli s'installe sur l'écran d'accueil d'un iPhone et d'un Android.
- [ ] **Étape 4 : créer les comptes réels.** Créer le compte de l'élève, puis celui du suiveur qui la suit (`scripts/create-user.ts --remote`). Remettre les codes au porteur du projet, en privé.
- [ ] **Étape 5 : vérification finale.** Lancer `npm test` partout, puis la suite E2E contre l'URL déployée. Attendu : tout passe. Annoncer au porteur du projet les choix techniques faits pendant la construction (règle §11).
- [ ] **Étape 6 : commit et push.**
