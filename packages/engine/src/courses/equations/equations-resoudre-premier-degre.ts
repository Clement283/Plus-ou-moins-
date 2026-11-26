// Cours 4 — Résoudre ax + b = c. Fiche : docs/modules/02-equations-inequations/equations-resoudre-premier-degre.md.
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  M, NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, autres, buildErrors, chance, choix, decouverte,
  draw, etapes, exemple, explanation, hl, intOf, is, lecon, linesScene, options3, pratique, redraw, small, step, texted,
  toks, trou, trouOf,
} from '../calculs/shared';
import {
  EQ_MODULE_ID, coefText, latexOfEx, lin, lineQuestions, paramsOf, paren, parenL, resoudreQ, saisieX, sgn, textOfEx,
} from './lineaire';

const ID = 'equations-resoudre-premier-degre';
const RULE = "Pour résoudre ax + b = c, j'enlève d'abord b des deux côtés, puis je divise les deux membres par a.";

// ——— Générateur : ax + b = c, x entier non nul, c jamais 0 ; le niveau agrandit a, b et x ———
type Range = [number, number];
const SPEC: Record<Level, { a: Range; b: Range; x: Range }> = {
  1: { a: [2, 5], b: [1, 9], x: [1, 9] },
  2: { a: [2, 9], b: [1, 20], x: [1, 12] },
  3: { a: [2, 12], b: [1, 30], x: [1, 15] },
};
function generate(level: Level, rng: Rng): Exercise {
  const s = SPEC[level];
  return redraw(
    () => {
      const a = (chance(rng, 0.25) ? -1 : 1) * draw(rng, s.a);
      const b = (chance(rng, 0.5) ? -1 : 1) * draw(rng, s.b);
      const x = (chance(rng, 0.5) ? -1 : 1) * draw(rng, s.x);
      return lin(ID, level, a, b, a * x + b);
    },
    (ex) => paramsOf(ex).c !== 0,
  );
}
/** ax + b = c avec a, b et x choisis : l'exemple d'un écran. */
const eq4 = (a: number, b: number, x: number): Exercise => lin(ID, 1, a, b, a * x + b);

const xOf = (ex: Exercise): number => intOf(ex.answer);
/** « on retire 3 » ou « on ajoute 4 » : ce qu'on fait pour enlever b. */
const removeText = (b: number): string => (b > 0 ? `on retire ${b}` : `on ajoute ${-b}`);
const opSign = (b: number): string => (b > 0 ? '-' : '+');

function resolution(ex: Exercise): string[] {
  const { a, b, c } = paramsOf(ex);
  const bb = Math.abs(b);
  return [
    latexOfEx(ex),
    `${a}x ${b > 0 ? '+' : '-'} ${bb} ${opSign(b)} ${bb} = ${c} ${opSign(b)} ${bb}`,
    `${a}x = ${c - b}`,
    `${a}x \\div ${parenL(a)} = ${c - b} \\div ${parenL(a)}`,
    `x = ${xOf(ex)}`,
  ];
}
const steps = (ex: Exercise): string => {
  const { a, b, c } = paramsOf(ex);
  return `${removeText(b)} des deux côtés : ${coefText(a)} = ${sgn(c - b)}, puis on divise les deux membres par ${paren(a)} : x = ${sgn(xOf(ex))}`;
};

// ——— Erreurs reconnues ———
const R1 = "D'abord, enlever b";
const R2 = 'Ensuite, diviser par a';
const R3 = 'Une ligne par opération';
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'oublier-diviser': { n: 2, label: R2, partIndex: 4 },
  'signe-b-garde': { n: 1, label: R1, partIndex: 1 },
  'diviser-avant': { n: 1, label: R1, partIndex: 1 },
  'signe-oublie': { n: 2, label: R2, partIndex: 4 },
};
/** Aucune réponse ne vaut ça : l'erreur ne s'applique pas à cette équation (division qui ne tombe pas juste). */
const NO = 1e9;
const whole = (n: number, d: number): number => (Number.isInteger(n / d) ? n / d : NO);
const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'oublier-diviser',
      family: 'calcul',
      detect: (ex, given) => is(given, paramsOf(ex).c - paramsOf(ex).b),
      text: (ex) => {
        const { a, b, c } = paramsOf(ex);
        return `Tu t'es arrêté à ${coefText(a)} = ${sgn(c - b)} : il reste à diviser les deux membres par ${paren(a)}. x = ${sgn(c - b)} ÷ ${paren(a)} = ${sgn(xOf(ex))}.`;
      },
      draw: (level, rng) => generate(level, rng),
      sample: (ex) => paramsOf(ex).c - paramsOf(ex).b,
    },
    {
      id: 'signe-b-garde',
      family: 'calcul',
      detect: (ex, given) => is(given, whole(paramsOf(ex).c + paramsOf(ex).b, paramsOf(ex).a)),
      text: (ex) => {
        const { a, b, c } = paramsOf(ex);
        return `On ${removeText(b).replace('on ', '')} des deux côtés : à droite, on calcule ${sgn(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} = ${sgn(c - b)}, et non ${sgn(c)} ${b > 0 ? '+' : '−'} ${Math.abs(b)}. Puis on divise par ${paren(a)} : x = ${sgn(xOf(ex))}.`;
      },
      draw: (level, rng) =>
        redraw(() => generate(level, rng), (ex) => whole(paramsOf(ex).c + paramsOf(ex).b, paramsOf(ex).a) !== NO),
      sample: (ex) => whole(paramsOf(ex).c + paramsOf(ex).b, paramsOf(ex).a),
    },
    {
      id: 'diviser-avant',
      family: 'calcul',
      detect: (ex, given) => is(given, whole(paramsOf(ex).c, paramsOf(ex).a) === NO ? NO : whole(paramsOf(ex).c, paramsOf(ex).a) - paramsOf(ex).b),
      text: (ex) => {
        const { a, b, c } = paramsOf(ex);
        return `On ne divise pas un seul terme. D'abord on enlève ${sgn(b)} : ${coefText(a)} = ${sgn(c - b)}. Ensuite on divise tout le membre par ${paren(a)} : x = ${sgn(xOf(ex))}.`;
      },
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => whole(paramsOf(ex).c, paramsOf(ex).a) !== NO),
      sample: (ex) => (whole(paramsOf(ex).c, paramsOf(ex).a) === NO ? NO : whole(paramsOf(ex).c, paramsOf(ex).a) - paramsOf(ex).b),
    },
    {
      id: 'signe-oublie',
      family: 'signe',
      detect: (ex, given) => is(given, -xOf(ex)),
      text: (ex) => {
        const { a, b, c } = paramsOf(ex);
        const same = c - b < 0 === a < 0;
        return `Après avoir enlevé ${sgn(b)}, on divise ${sgn(c - b)} par ${paren(a)} : ${same ? 'les deux nombres ont le même signe, donc x est positif' : 'les signes sont contraires, donc x est négatif'}. Le bon résultat est x = ${sgn(xOf(ex))}.`;
      },
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => paramsOf(ex).a < 0 || paramsOf(ex).c - paramsOf(ex).b < 0),
      sample: (ex) => -xOf(ex),
    },
  ],
  resolution,
).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Retours d'erreur des questions qui comptent (saisie de x, cases « x = ▢ » et « ax = ▢ ») ———
const OTHER = (ex: Exercise): string => `Pour résoudre ${textOfEx(ex)} : ${steps(ex)}.`;

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture' || o.correct) return null;
  if (q.kind === 'trou' && q.promptLatex !== 'x = \\square') {
    const { a, b, c } = paramsOf(q.ex);
    // la case « ax = ▢ » : le membre de droite après avoir enlevé b
    if (q.promptLatex !== `${a}x = \\square`) return null;
    return `On ${removeText(b).replace('on ', '')} des deux côtés. À droite : ${sgn(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} = ${sgn(c - b)}.`;
  }
  if (q.kind !== 'saisie' && q.kind !== 'trou') return null;
  const g = Number(o.given.replace(/−/g, '-'));
  const e = Number.isInteger(g) ? errors.find((x) => x.detect(q.ex, rat(g))) : undefined;
  return e ? e.explain(q.ex).rule : OTHER(q.ex);
}

// ——— Leçon ———
const REGLE1 = "**Je commence par enlever b des deux côtés : ax + b = c devient ax = c − b.**";
const REGLE2 = '**Ensuite, je divise les deux membres par a, avec son signe : x = (c − b) ÷ a.**';
const REGLE3 = '**Je fais une seule opération par ligne, puis je vérifie en remplaçant x.**';

// 0 — Accroche : une question pour deviner (ne compte pas)
const guess = choix(
  eq4(2, 3, 2),
  'Pour commencer, à ton avis : si 2x + 3 = 7, combien vaut x ?',
  options3(
    ['2', 'Bonne intuition : 2 × 2 + 3 = 7. Le cours va te montrer comment le trouver à coup sûr, même avec des nombres plus grands.'],
    ['5', "5, c'est 7 − 2. Mais 2x veut dire 2 × x, et 2 × 5 + 3 = 13. Le cours va t'expliquer quoi faire des deux côtés."],
    ['4', "4, c'est 7 − 3 : il reste une étape. 2 × 4 + 3 = 11, pas 7. Le cours va t'expliquer l'étape qui manque."],
  ),
  0,
  '2x + 3 = 7',
);

// 1 — L'idée de départ : la balance, d'abord les jetons (règle 1)
const idee: EtapeStep[] = [
  step('Sur la balance, 2x + 3 = 7 veut dire : **2 paquets de x et 3 jetons** pèsent 7.', {
    scene: linesScene(['2x ', hl('+ 3'), ' = 7']),
  }),
  step('Pour isoler les paquets, on enlève d’abord les 3 jetons. On le fait **des deux côtés**, sinon la balance penche.', {
    scene: linesScene(['2x + 3 = 7']),
    after: linesScene(['2x + 3 = 7'], [hl('2x + 3 − 3 = 7 − 3')]),
    action: trouOf('On enlève les 3 jetons [ ? ].', ['des deux côtés', 'à gauche seulement', 'à droite seulement'], 0, {
      1: 'Si on enlève 3 à gauche seulement, la gauche devient plus légère : la balance penche. Ce qu’on fait d’un côté, on le fait de l’autre.',
      2: 'Si on enlève 3 à droite seulement, la droite devient plus légère : la balance penche. Ce qu’on fait d’un côté, on le fait de l’autre.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['2x + 3 = 7'], ['2x + 3 − 3 = 7 − 3'], ['2x = 4']),
    rule: { n: 1, text: REGLE1 },
  }),
];

// 2 — Règle 2 : ensuite, on divise par a
const regle2: EtapeStep[] = [
  step('Après la première ligne, il reste **2x = 4**. C’est une équation du cours « Diviser des deux côtés ».', {
    scene: linesScene(['2x + 3 − 3 = 7 − 3'], ['2x = 4']),
  }),
  step('Pour trouver un seul x, on divise les deux membres par **le nombre devant x**.', {
    scene: linesScene(['2x = 4']),
    after: linesScene(['2x = 4'], [hl('2x ÷ 2 = 4 ÷ 2')]),
    action: trouOf('2x = 4 : on divise les deux membres par [ ? ].', ['2', '4', '3'], 0, {
      1: '4 est le nombre de droite. On divise par le nombre qui multiplie x : dans 2x, c’est 2.',
      2: '3 est le nombre qu’on a déjà enlevé à la première ligne. On divise par le nombre qui multiplie x : dans 2x, c’est 2.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['2x + 3 = 7'], ['2x = 4'], ['2x ÷ 2 = 4 ÷ 2'], ['x = 2']),
    rule: { n: 2, text: REGLE2 },
  }),
];

// 3 — Règle 3 : une opération par ligne, puis on vérifie
const regle3: EtapeStep[] = [
  step('Voici 3x − 4 = 11. Première opération : on enlève −4, c’est-à-dire qu’on **ajoute 4** des deux côtés.', {
    scene: linesScene(['3x − 4 = 11'], ['3x − 4 + 4 = 11 + 4']),
    after: linesScene(['3x − 4 = 11'], ['3x − 4 + 4 = 11 + 4'], ['3x = ', hl('15')]),
    action: trouOf('À droite, 11 + 4 = [ ? ].', ['15', '7', '44'], 0, {
      1: '7, c’est 11 − 4 : tu as retiré 4. Pour enlever −4, on ajoute 4 des deux côtés : 11 + 4 = 15.',
      2: '44 s’obtient en écrivant 11 et 4 côte à côte. On additionne : 11 + 4 = 15.',
    }),
  }),
  step('Deuxième opération, sur une nouvelle ligne : on divise par 3. On trouve x = 5.', {
    scene: linesScene(['3x = 15'], ['3x ÷ 3 = 15 ÷ 3']),
    after: linesScene(['3x = 15'], ['3x ÷ 3 = 15 ÷ 3'], ['x = ', hl('5')]),
    action: trouOf('15 ÷ 3 = [ ? ].', ['5', '12', '45'], 0, {
      1: '12, c’est 15 − 3 : tu as soustrait. On divise : 15 ÷ 3 = 5, car 3 × 5 = 15.',
      2: '45, c’est 15 × 3 : tu as multiplié. On divise : 15 ÷ 3 = 5, car 3 × 5 = 15.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['3x − 4 = 11'], ['3x = 15'], ['x = 5'], ['3 × 5 − 4 = 11']),
    rule: { n: 3, text: REGLE3 },
  }),
];

const compareQ = choix(
  eq4(2, 3, 3),
  'Combien d’opérations faut-il dans chaque équation ?',
  options3(
    ['A : deux, B : une', 'Oui. Dans A, on retire 3 puis on divise par 2. Dans B, il n’y a rien à retirer : on divise seulement par 2.'],
    ['A : une, B : deux', 'C’est l’inverse. A a un nombre en plus de 2x, donc deux opérations. B est 2x = 6 : une seule.'],
    ['Une seule dans les deux', 'Pour B, oui. Mais dans A, il faut d’abord retirer 3, ensuite diviser par 2 : deux opérations.'],
  ),
  0,
);

const exemple1: EtapeStep[] = [
  step('Voici la résolution de 5x − 3 = 22. Lis la première ligne, puis touche « Je comprends ».', {
    scene: linesScene(['5x − 3 = 22']),
  }),
  step('On enlève −3, c’est-à-dire qu’on **ajoute 3** des deux côtés. C’est la première opération.', {
    scene: linesScene(['5x − 3 = 22'], [hl('5x − 3 + 3 = 22 + 3')]),
    action: { type: 'comprends' },
  }),
];

// ——— Autres façons de faire ———
const AUTRES: LessonPart = autres({
  title: 'Autres façons de faire',
  recap: {
    title: 'Les 3 règles à retenir',
    rules: [
      { title: '1. J’enlève b des deux côtés.', ok: '2x + 3 = 7 : 7 − 3 = 4, donc 2x = 4', ko: '2x + 3 = 7 : 7 + 3 = 10, donc 2x = 10' },
      { title: '2. Je divise les deux membres par a.', ok: '2x = 4, donc x = 4 ÷ 2 = 2', ko: '2x = 4, donc x = 4' },
      { title: '3. Une opération par ligne, puis je vérifie.', ok: '2 × 2 + 3 = 7', ko: '2x + 3 = 7, donc x = 7 ÷ 2 − 3' },
    ],
    sentence: 'J’enlève b des deux côtés, puis je divise les deux membres par a, une ligne par opération.',
  },
  intro: 'La méthode marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**.',
  techniques: [
    {
      name: 'Essayer des valeurs',
      quand: 'Quand tu ne vois pas par où commencer.',
      example: '3x + 2 = 11 : avec x = 1, on trouve 5 ; avec x = 2, 8 ; avec x = 3, 11. Donc x = 3.',
      how: 'Tu remplaces x par 1, puis 2, puis 3… et tu t’arrêtes quand le membre de gauche vaut celui de droite. C’est plus long : la méthode du cours est plus sûre quand les nombres grandissent.',
      essai: {
        kind: 'saisie',
        consigne: 'Dans 2x + 1 = 9, **essaie 1, 2, 3, 4… Tape la valeur de x qui marche.**',
        calc: '2x + 1 = 9',
        answer: 4,
        yes: '2 × 4 + 1 = 9 : x = 4 marche.',
        errors: [
          { values: [8], message: '8, c’est 9 − 1 : il reste à diviser par 2. Avec x = 8, 2 × 8 + 1 = 17, pas 9.' },
          { values: [5], message: 'Avec x = 5, 2 × 5 + 1 = 11, pas 9. Essaie un nombre plus petit.' },
        ],
        fallback: 'Remplace x par ton nombre : 2 × x + 1 doit donner 9. Essaie 1, puis 2, puis 3…',
      },
    },
    {
      name: 'Vérifier sa réponse',
      quand: 'Une fois x trouvé, ou quand tu hésites entre deux réponses.',
      example: '2x − 1 = 9 et x = 5 : 2 × 5 − 1 = 9, c’est juste.',
      how: 'Tu remplaces x par ton nombre, tu calcules le membre de gauche, et tu regardes si tu retrouves le membre de droite.',
      essai: {
        kind: 'choix',
        consigne: 'Un élève a trouvé x = 4 pour 2x − 1 = 9. **Touche ce qu’on obtient en remplaçant x par 4.**',
        calc: '2x − 1 = 9',
        options: ['2 × 4 − 1 = 7, donc x = 4 est faux', '2 × 4 − 1 = 9, donc x = 4 est juste', '2 × 4 − 1 = 5, donc x = 4 est faux'],
        correct: 0,
        yes: '2 × 4 − 1 = 7, et 7 n’est pas 9 : x = 4 est faux. Le bon résultat est x = 5.',
        no: '2 × 4 − 1 = 7. On ne retrouve pas 9, donc x = 4 est faux. Le bon résultat est x = 5.',
      },
    },
  ],
  outro: "Ensuite, tu t'entraînes avec quatre questions.",
});

// ——— Série de pratique : l'aide diminue ; la 1re question vient du cours précédent ———
const PRATIQUE = pratique(
  'Pratique',
  [
    {
      question: choix(
        lin(ID, 1, 6, 0, -42),
        'Quelle est la valeur de x ?',
        options3(
          [`x = ${M}7`, `6x = ${M}42 : on divise les deux membres par 6. Les signes sont contraires, donc x est négatif : ${M}7.`],
          ['x = 7', `7 a le bon chiffre, mais ${M}42 ÷ 6 est négatif : les signes sont contraires.`],
          [`x = ${M}36`, `${M}36, c'est ${M}42 + 6 : tu as additionné. On divise les deux membres par 6.`],
        ),
        0,
        `6x = ${M}42`,
      ),
      texts: { consigne: 'Cette équation vient du cours précédent. **Touche la valeur de x.**' },
    },
    {
      question: trou(eq4(3, 5, 5), '3x = \\square', 15),
      texts: { consigne: 'La ligne « − 5 » est déjà écrite. **Tape ce qui reste à droite, dans la case.**', above: ['3x + 5 - 5 = 20 - 5'] },
    },
    { question: saisieX(eq4(2, -3, 5)), texts: { consigne: "Résous l'équation. **Tape la valeur de x.**" } },
    {
      question: resoudreQ(eq4(-3, 2, 3)),
      texts: { consigne: 'Résous en entier. **Écris chaque ligne, avec ta méthode, jusqu’à x = …** Le bouton « Un indice » peut t’aider.' },
    },
  ],
  "Maintenant, deux exemples pour t'aider à les résoudre en entier.",
);

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Résoudre ax + b = c',
    intro: ['Dans 2x + 3 = 7, il y a **deux choses** du côté de x : 2x et + 3.', 'Dans ce cours, tu apprends dans quel ordre les enlever, **une ligne pour chaque opération**.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(R1, idee),
  lecon(small(eq4(5, 2, 3), '5x + 2 = 17', 'Dans 5x + 2 = 17, que fait-on en premier, des deux côtés ?', [
    ['On retire 2', 'Oui : on enlève d’abord le nombre seul, 2. À droite, 17 − 2 = 15, et 5x = 15.'],
    ['On divise par 5', 'Pas encore : 5 divise seulement 5x, pas le + 2. On enlève d’abord le 2, ensuite on divise.'],
    ['On retire 5', '5 multiplie x, il ne s’enlève pas. On enlève le nombre seul, 2, puis on divise par 5.'],
  ], 0)),
  texted(lecon(small(eq4(3, -4, 5), '3x − 4 = 11', 'Dans 3x − 4 = 11, que fait-on en premier, des deux côtés ?', [
    ['On ajoute 4', 'Oui : pour enlever −4, on ajoute 4 des deux côtés. À droite, 11 + 4 = 15.'],
    ['On retire 4', 'Retirer 4 donnerait 3x − 8 : le −4 serait encore plus loin. Pour enlever −4, on ajoute 4.'],
    ['On divise par 3', 'Pas encore : 3 divise seulement 3x, pas le − 4. On ajoute d’abord 4, ensuite on divise.'],
  ], 0)), { joinPrevious: true }),
  etapes(R2, regle2),
  lecon(small(eq4(2, 3, 2), '2x + 3 = 7', 'Un élève écrit 2x + 3 = 7, puis 2x = 4, puis x = 4. Que lui manque-t-il ?', [
    ['Diviser par 2 les deux membres : x = 2', 'Oui : 2x = 4, il reste à diviser les deux membres par 2. 4 ÷ 2 = 2.'],
    ['Retirer encore 3', 'Le 3 est déjà enlevé : 2x = 4 est la ligne qui suit. Il reste le 2 devant x, qu’on enlève en divisant.'],
    ['Rien, c’est juste', 'Si x = 4, alors 2 × 4 + 3 = 11, pas 7. Il manque une division par 2.'],
  ], 0)),
  texted(lecon(small(eq4(-2, 4, -3), `${M}2x + 4 = 10`, `Dans ${M}2x + 4 = 10, on trouve ${M}2x = 6. Que vaut x ?`, [
    [`x = ${M}3`, `6 ÷ (${M}2) : les signes sont contraires, donc x est négatif : ${M}3.`],
    ['x = 3', `3 a le bon chiffre, mais on divise par ${M}2 : les signes sont contraires, donc x est négatif.`],
    ['x = 6', `${M}2x = 6 : il reste à diviser les deux membres par ${M}2.`],
  ], 0)), { joinPrevious: true }),
  etapes(R3, regle3),
  lecon(small(eq4(2, 3, 2), '2x + 3 = 7', 'Un élève a trouvé x = 4. On remplace : 2 × 4 + 3 = 11. Que conclut-on ?', [
    ['x = 4 est faux, car 11 n’est pas 7', 'Oui : en remplaçant, on devrait retrouver 7. Or 2 × 4 + 3 = 11. Le bon résultat est x = 2.'],
    ['x = 4 est juste', '2 × 4 + 3 = 11, et le membre de droite est 7. Les deux nombres sont différents : x = 4 est faux.'],
    ['On ne peut pas savoir', 'Si : on remplace x, on calcule, et on compare avec le membre de droite. Ici 11 n’est pas 7.'],
  ], 0)),
  // Comparer deux cas : A de ce cours, B du cours précédent (Diviser des deux côtés)
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ['Voici deux équations qui se ressemblent. Regarde bien ce qu’il y a à côté de 2x.'],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Équation A', latex: '2x + 3 = 9' },
      b: { label: 'Équation B', latex: '2x = 6' },
      note: 'L’équation B vient du cours précédent : tu sais déjà la résoudre. Ici, tu observes seulement ce qui change.',
      highlight: { a: toks('2x ', hl('+ 3'), ' = 9'), b: toks(hl('2x'), ' = 6') },
      after: [
        'A : on retire 3 des deux côtés, 2x = 6. Puis on divise par 2 : x = 3.',
        'B : il n’y a rien à retirer. On divise tout de suite par 2 : x = 3.',
        'Ce qui change : A a une opération de plus, qu’on fait toujours en premier.',
      ],
    },
  }),
  AUTRES,
  PRATIQUE,
  etapes('Exemple 1 sur 2', exemple1),
  texted(exemple(trou(eq4(5, -3, 5), 'x = \\square', 5)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: ['5x - 3 + 3 = 22 + 3', '5x = 25', '5x \\div 5 = 25 \\div 5'],
    help: 'Calcule 25 ÷ 5.',
  }),
  texted(exemple(trou(eq4(2, 7, -3), '2x = \\square', -6)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    intro: [`Cette fois, deux cases sont à toi. Pour 2x + 7 = 1, trouve d'abord la ligne « 2x = … », puis x.`],
    above: ['2x + 7 - 7 = 1 - 7'],
    help: `Calcule 1 − 7 : le résultat est négatif.`,
  }),
  texted(exemple(trou(eq4(2, 7, -3), 'x = \\square', -3)), {
    above: ['2x + 7 - 7 = 1 - 7', '2x = -6', '2x \\div 2 = -6 \\div 2'],
    mention: '',
  }),
  annonceFin(),
];

export const equationsResoudrePremierDegre: CourseDef = {
  id: ID,
  moduleId: EQ_MODULE_ID,
  order: 4,
  title: 'Résoudre ax + b = c',
  shortTitle: 'ax + b = c',
  rule: RULE,
  parts,
  lessonLength: parts.findIndex((p) => p.type === 'pratique'),
  unePhrase: true,
  // la résolution complète dans 2 exercices de fin sur 5 (décision du 2026-11-26), les 3 autres : x = ▢
  endExercises: { count: 5, kind: 'saisie', mix: ['saisie', 'resoudre', 'saisie', 'resoudre', 'saisie'] },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
  // « saisie » (x = ▢) et « resoudre » (À toi de résoudre) en révision et en entraînement ; 3 formats pour que la révision garde 3 questions
  formats: ['saisie', 'resoudre', 'resoudre'],
  customQuestion: lineQuestions(generate, () => errors),
  feedbackText,
  memo: {
    rule: RULE,
    ruleBullets: [
      "J'enlève b des deux côtés : ax + b = c devient ax = c − b.",
      'Je divise les deux membres par a, avec son signe.',
      'Une opération par ligne, puis je vérifie en remplaçant x.',
    ],
    examples: [
      `3x ${M} 4 = 11 : 3x ${M} 4 + 4 = 11 + 4, puis 3x = 15, donc x = 5`,
      '2x + 3 = 7 : 2x + 3 − 3 = 7 − 3, puis 2x = 4, donc x = 2',
    ],
    mistake: {
      wrong: '2x + 3 = 7, donc 2x = 7 + 3 = 10',
      why: '**Enlever 3 des deux côtés**, c’est faire 7 − 3 à droite, pas 7 + 3 : ce qu’on fait à gauche, on le fait à droite.',
    },
    tip: 'Une opération par ligne : d’abord enlever b, ensuite diviser par a.',
  },
};
