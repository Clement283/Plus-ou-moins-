// Cours 3 du module Priorités (déroulé guidé) : on calcule d'abord entre parenthèses, puis les priorités habituelles.
// Fiche : docs/modules/03-priorites/priorites-parentheses.md
import type { Rng } from '../../rng';
import type { CourseDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, choix, decouverte, etapes, exemple, hl, lecon, linesScene,
  options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';
import {
  type ErrDef, calculerGuided, coin, customOf, explainOf, feedbackOf, makeErrors, mkEx, positiveSteps, readable, resolutionOf, rnd, sgn,
  sumText, textOf, wrongOf,
} from './priorites-commun';

const ID = 'priorites-parentheses';
const RULE = 'Je calcule d’abord ce qui est entre parenthèses, puis j’applique les priorités : × et ÷, puis + et − de gauche à droite.';

// ——— Exercice : une ou deux parenthèses de calcul ———
/** Une parenthèse qui vaut s : (7 + 2), (11 − 2), au niveau 3 aussi (−3 + 5). */
function grp(rng: Rng, s: number, level: Level): string {
  if (level === 3 && coin(rng, 0.35)) {
    const a = rnd(rng, [2, 9]);
    const b = s + a;
    return b >= 0 ? `(-${a} + ${b})` : `(-${a} - ${-b})`;
  }
  return `(${sumText(rng, s, level === 1 ? 9 : 12)})`;
}
const target = (rng: Rng, level: Level): number => (level === 1 ? rnd(rng, [2, 12]) : (coin(rng, 0.45) ? -1 : 1) * rnd(rng, [2, 9]));
const fact = (rng: Rng, level: Level): string => {
  const v = rnd(rng, [2, 9]);
  return level === 3 && coin(rng, 0.3) ? `(-${v})` : `${v}`;
};
function drawText(level: Level, rng: Rng): string {
  const t = rnd(rng, [1, level === 1 ? 4 : 7]);
  const s = target(rng, level);
  switch (t) {
    case 1: return `${fact(rng, level)} * ${grp(rng, s, level)}`;
    case 2: return `${grp(rng, s, level)} * ${fact(rng, level)}`;
    case 3: {
      const c = rnd(rng, [2, 9]);
      return `${grp(rng, c * rnd(rng, [1, 6]) * (level > 1 && coin(rng) ? -1 : 1), level)} / ${c}`;
    }
    case 4: {
      const c = rnd(rng, [2, 6]);
      return `${c * rnd(rng, [2, 9])} / ${grp(rng, c, level)}`;
    }
    case 5: return `${grp(rng, s, level)} * ${grp(rng, target(rng, level), level)}`;
    case 6: return `${rnd(rng, [2, 15])} ${sgn(rng)} ${fact(rng, level)} * ${grp(rng, s, level)}`;
    default: return `${grp(rng, s, level)} * ${fact(rng, level)} ${sgn(rng)} ${rnd(rng, [2, 15])}`;
  }
}
const fits = (ex: Exercise): boolean => textOf(ex).length <= 28 && Math.abs(ex.answer.n) <= 150 && (ex.level > 1 || positiveSteps(textOf(ex)));
function generate(level: Level, rng: Rng): Exercise {
  return redraw(() => mkEx(ID, level, drawText(level, rng)), (ex) => fits(ex) && wrongOf(ex, 'parenthese').length > 0);
}
/** Piège « priorité oubliée » : un nombre, un produit et une parenthèse (3 + 2 × (8 − 5)). */
function prioTrap(level: Level, rng: Rng): Exercise {
  return redraw(
    () =>
      mkEx(ID, level, `${rnd(rng, [2, 15])} ${sgn(rng)} ${fact(rng, level)} * ${grp(rng, target(rng, level), level)}`),
    (ex) => fits(ex) && wrongOf(ex, 'priorite').length > 0,
  );
}

// ——— Erreurs reconnues ———
const RULE_1 = { n: 1, label: 'Les parenthèses d’abord', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Une parenthèse devient un nombre', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Puis les priorités', partIndex: 5 };
const defs: ErrDef[] = [
  {
    id: 'priorite',
    family: 'calcul',
    rule: RULE_3,
    draw: prioTrap,
    text: (ex) => `Dans ${readable(textOf(ex))}, une fois la parenthèse calculée, la multiplication passe avant l’addition ou la soustraction.`,
  },
  {
    id: 'parenthese',
    family: 'calcul',
    rule: RULE_1,
    text: (ex) => `Dans ${readable(textOf(ex))}, on calcule d’abord ce qui est entre parenthèses, puis on fait l’opération qui l’entoure.`,
  },
  {
    id: 'moins-parenthese',
    family: 'signe',
    draw: (level, rng) => mkEx(ID, level, `${rnd(rng, [10, 30])} - (${rnd(rng, [2, 9])} ${sgn(rng)} ${rnd(rng, [2, 9])})`),
    rule: RULE_1,
    text: (ex) => `Dans ${readable(textOf(ex))}, on calcule d’abord la parenthèse. Si on l’enlève, le − devant change le signe de chaque terme qui est dedans.`,
  },
  {
    id: 'signe',
    family: 'signe',
    rule: RULE_2,
    text: (ex) => `Dans ${readable(textOf(ex))}, regarde le signe du résultat de la parenthèse : s’il est négatif, il reste négatif dans la suite du calcul.`,
  },
];
const errors = makeErrors(defs, generate);

// ——— Leçon ———
const REGLE1 = '**Je calcule d’abord ce qui est entre parenthèses.** La parenthèse est un paquet fermé : je l’ouvre et je la calcule en premier.';
const REGLE2 = '**Quand une parenthèse est calculée, elle devient un nombre.** S’il est négatif, il s’écrit entre parenthèses, comme dans le cours sur les relatifs.';
const REGLE3 = '**Après les parenthèses, j’applique les priorités :** les × et les ÷, puis les + et − de gauche à droite.';
const ex = (text: string): Exercise => mkEx(ID, 1, text);

const guess = choix(
  ex('2 * (3 + 4)'),
  'À ton avis, combien vaut ce calcul ?',
  options3(
    ['14', 'Oui : la parenthèse d’abord, 3 + 4 = 7, puis 2 × 7 = 14.'],
    ['10', 'C’est 2 × 3 + 4. Mais la parenthèse enferme 3 + 4 : on la calcule d’abord, 7, puis 2 × 7 = 14.'],
    ['9', 'Il y a une multiplication par 2, pas une addition de 2 : 3 + 4 = 7, puis 2 × 7 = 14.'],
  ),
  0,
  '2 \\times (3 + 4)',
);

const regle1: EtapeStep[] = [
  step('Dans **2 × (3 + 4)**, les parenthèses entourent 3 + 4. C’est un paquet fermé : on le calcule **en premier**.', {
    scene: linesScene(['A = 2 × ', hl('(3 + 4)')]),
  }),
  step('3 + 4 fait 7. La parenthèse devient le nombre 7, et il reste 2 × 7.', {
    scene: linesScene(['A = 2 × (3 + 4)']),
    after: linesScene(['A = 2 × (3 + 4)'], ['A = 2 × ', hl('7')]),
    action: trouOf('Après la parenthèse, il reste [ ? ].', ['2 × 7', '2 × 3 + 4'], 0, {
      1: 'Ce serait ignorer la parenthèse. Elle enferme 3 + 4 : on la remplace par son résultat, 7.',
    }),
  }),
  step(undefined, { scene: linesScene(['A = 2 × (3 + 4)'], ['A = 2 × 7'], ['A = ', hl('14')]), rule: { n: 1, text: REGLE1 } }),
];

const regle2: EtapeStep[] = [
  step('Dans **2 × (3 − 5)**, la parenthèse vaut 3 − 5 = −2. Attention : ces parenthèses sont **de calcul**, pas celles d’un nombre négatif.', {
    scene: linesScene(['B = 2 × ', hl('(3 − 5)')]),
  }),
  step('Le résultat est négatif : la parenthèse devient **(−2)**, avec ses parenthèses.', {
    scene: linesScene(['B = 2 × (3 − 5)']),
    after: linesScene(['B = 2 × (3 − 5)'], ['B = 2 × ', hl('(−2)')]),
    action: trouOf('3 − 5 est plus petit que 0 : le résultat est [ ? ].', ['négatif', 'positif'], 0, {
      1: 'On part de 3 et on retire 5 : on passe de l’autre côté de 0, le résultat est négatif.',
    }),
  }),
  step(undefined, { scene: linesScene(['B = 2 × (3 − 5)'], ['B = 2 × (−2)'], ['B = ', hl('−4')]), rule: { n: 2, text: REGLE2 } }),
];

const regle3: EtapeStep[] = [
  step('Dans **3 + 2 × (8 − 5)**, il y a une parenthèse, un produit et une addition. La parenthèse passe en **premier**.', {
    scene: linesScene(['C = 3 + 2 × ', hl('(8 − 5)')]),
    after: linesScene(['C = 3 + 2 × (8 − 5)'], ['C = 3 + 2 × ', hl('3')]),
  }),
  step('Il reste **3 + 2 × 3**. Comme au cours précédent, on fait le produit avant l’addition.', {
    scene: linesScene(['C = 3 + 2 × (8 − 5)'], ['C = 3 + 2 × 3']),
    after: linesScene(['C = 3 + 2 × (8 − 5)'], ['C = 3 + 2 × 3'], ['C = 3 + ', hl('6')]),
    action: trouOf('Dans 3 + 2 × 3, on calcule d’abord [ ? ].', ['2 × 3', '3 + 2'], 0, {
      1: 'Additionner 3 et 2 d’abord donnerait 5 × 3 = 15 : c’est faux. Le produit passe avant l’addition.',
    }),
  }),
  step(undefined, { scene: linesScene(['C = 3 + 2 × (8 − 5)'], ['C = 3 + 2 × 3'], ['C = 3 + 6'], ['C = ', hl('9')]), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = ex('5 + 3 * (4 - 9)');

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Que font les parenthèses ?',
    intro: ['Des parenthèses dans un calcul changent l’ordre des opérations.', 'Ici, tu apprends à les calculer en premier, sans perdre un signe.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, regle1),
  lecon(
    small(ex('(8 - 3) * 4'), '(8 - 3) \\times 4', 'Dans (8 − 3) × 4, que fait-on en premier ?', [
      ['8 − 3', 'Oui : la parenthèse d’abord. Huit moins trois fait cinq, puis cinq fois quatre fait vingt.'],
      ['3 × 4', 'Cela donnerait 8 − 12 = −4. Mais la parenthèse enferme 8 − 3 : on la calcule d’abord.'],
      ['8 × 4', 'Le 8 est dans la parenthèse avec le 3 : on calcule 8 − 3, puis on multiplie par 4.'],
    ], 0),
  ),
  etapes(RULE_2.label, regle2),
  lecon(
    small(ex('4 * (2 - 6)'), '4 \\times (2 - 6)', 'Combien vaut 4 × (2 − 6) ?', [
      ['−16', 'Oui : 2 − 6 = −4, puis 4 × (−4) = −16 (un positif fois un négatif donne un négatif).'],
      ['16', '2 − 6 vaut −4, un résultat négatif. Quatre fois moins quatre fait moins seize.'],
      ['−4', 'Tu as calculé la parenthèse seulement. Il reste à multiplier par 4 : 4 × (−4) = −16.'],
    ], 0),
  ),
  etapes(RULE_3.label, regle3),
  texted(
    decouverte(
      choix(
        ex('(3 + 4) * 2'),
        'Lequel de ces deux calculs vaut 14 ?',
        options3(
          ['Le calcul B, (3 + 4) × 2', 'Oui : dans B, 3 + 4 = 7 puis 7 × 2 = 14. Dans A, 4 × 2 = 8 puis 3 + 8 = 11.'],
          ['Le calcul A, 3 + 4 × 2', 'Dans A, le produit passe avant : 4 × 2 = 8, puis 3 + 8 = 11.'],
          ['Les deux', 'Les parenthèses changent l’ordre : B donne 14 et A donne 11.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde les parenthèses.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A', latex: '3 + 4 \\times 2' },
        b: { label: 'Calcul B', latex: '(3 + 4) \\times 2' },
        note: '',
        inPlace: true,
        highlight: { a: toks('3 + ', hl('4 × 2')), b: toks(hl('(3 + 4)'), ' × 2') },
        after: ['Dans A, on calcule 4 × 2 = 8, puis 3 + 8 = 11.', 'Dans B, on calcule (3 + 4) = 7, puis 7 × 2 = 14.'],
      },
    },
  ),
  texted(exemple(calculerGuided(exGuide)), {
    title: 'On le fait ensemble',
    subtitle: 'Calcule 5 + 3 × (4 − 9), une opération par ligne. À chaque ligne, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

const course: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 3,
  title: 'Les parenthèses d’abord',
  shortTitle: 'Parenthèses',
  rule: RULE,
  parts,
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  endExercises: { count: 5, kind: 'saisie', mix: ['calculer', 'calculer', 'calculer', 'calculer', 'calculer'] },
  formats: ['saisie', 'calculer', 'calculer'],
  generate,
  errors,
  generalExplanation: explainOf(RULE),
  resolution: resolutionOf,
  classes: SIGN_CLASSES,
  expectInteger: true,
  customQuestion: customOf(() => course),
  feedbackText: feedbackOf(
    () => course.errors,
    (e) => `Calcule d’abord les parenthèses, puis les × et les ÷, puis les + et − : ${readable(textOf(e))}.`,
  ),
  memo: {
    rule: RULE,
    ruleBullets: [
      'Je calcule d’abord ce qui est entre parenthèses.',
      'Une parenthèse calculée devient un nombre, négatif s’il le faut : 2 × (−2).',
      'Ensuite : × et ÷, puis + et − de gauche à droite.',
    ],
    examples: ['2 × (3 + 4) ; 2 × 7 ; 14', '3 + 2 × (8 − 5) ; 3 + 2 × 3 ; 3 + 6 ; 9'],
    mistake: { wrong: '2 × (3 − 5) = 4', why: 'La parenthèse vaut 3 − 5 = **−2**, un nombre négatif : 2 × (−2) = −4.' },
    tip: 'J’entoure la parenthèse, je la calcule, puis je recopie le reste.',
  },
};

export const priorites3 = course;
