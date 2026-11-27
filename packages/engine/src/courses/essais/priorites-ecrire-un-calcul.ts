// Cours 6 du module Priorités (déroulé guidé) : écrire en un seul calcul une phrase, un programme de calcul ou un petit problème.
// Fiche : docs/modules/03-priorites/priorites-ecrire-un-calcul.md
// Les exercices utilisent la question `ecrire` (mode calcul, maquette docs/design/ecrans/priorites-ecrire-un-calcul.html) : le calcul tapé est jugé
// sur sa structure ; seuls les problèmes se calculent ensuite ligne par ligne (décision du 2026-11-27). Entiers seulement.
// Les phrases et les calculs attendus viennent d'un même arbre (`N`) : la phrase est écrite depuis l'arbre, les écritures justes
// (somme et produit dans les deux ordres) en sont déduites.
import type { Rng } from '../../rng';
import type { Question } from '../../exercises/types';
import type { QuestionKind } from '../../events';
import type { BuildCtx } from '../../exercises/types';
import { type EcrireQuestion, type EcrireStep, ecrireText } from '../../exercises/ecrire';
import type { CourseDef, EtapeStep, ErrorDef, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, choix, decouverte, etapes, exemple, explanation, hl, lecon, linesScene, options3,
  redraw, smallChoix, step, texted, toks, trouOf,
} from '../calculs/shared';
import { mkEx, pick, resolutionOf, rnd } from './priorites-commun';

const ID = 'priorites-ecrire-un-calcul';
const RULE = 'Je traduis la phrase mot à mot, et je mets chaque bloc « la somme de… », « la différence de… » entre parenthèses quand on le retranche, le multiplie ou le divise.';

// ——— Un calcul sous forme d'arbre : le texte du calcul, la phrase, les écritures justes ———
type Op = '+' | '-' | '*' | '/';
type N = { t: 'n'; v: number } | { t: 'b'; o: Op; a: N; b: N };
const num = (v: number): N => ({ t: 'n', v });
const bin = (o: Op, a: N, b: N): N => ({ t: 'b', o, a, b });
const PREC: Record<Op, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

/** La valeur, ou null si un morceau n'est pas un entier de 1 à 200 (le calcul sort des nombres du cours). */
function value(n: N): number | null {
  if (n.t === 'n') return n.v;
  const a = value(n.a);
  const b = value(n.b);
  if (a === null || b === null) return null;
  const v = n.o === '+' ? a + b : n.o === '-' ? a - b : n.o === '*' ? a * b : a % b === 0 ? a / b : -1;
  return Number.isInteger(v) && v >= 1 && v <= 200 ? v : null;
}
/** Un fils a besoin de parenthèses (priorité plus faible, ou même priorité à droite). */
const needsParens = (c: N, parent: Op, side: 'a' | 'b'): boolean => c.t === 'b' && (PREC[c.o] < PREC[parent] || (PREC[c.o] === PREC[parent] && side === 'b'));
/** Le calcul au clavier, parenthèses seulement quand il le faut : « 30 - (2 + 7) ». */
function ascii(n: N): string {
  if (n.t === 'n') return String(n.v);
  const side = (c: N, s: 'a' | 'b'): string => (needsParens(c, n.o, s) ? `(${ascii(c)})` : ascii(c));
  return `${side(n.a, 'a')} ${n.o} ${side(n.b, 'b')}`;
}
/** Toutes les écritures justes : somme et produit dans les deux ordres, à chaque niveau. */
function variants(n: N): N[] {
  if (n.t === 'n') return [n];
  const out: N[] = [];
  for (const a of variants(n.a))
    for (const b of variants(n.b)) {
      out.push(bin(n.o, a, b));
      if (n.o === '+' || n.o === '*') out.push(bin(n.o, b, a));
    }
  return out;
}
const acceptedOf = (...trees: N[]): string[] => [...new Set(trees.flatMap(variants).map(ascii))];

const NATURE: Record<Op, { article: string; sym: string }> = {
  '+': { article: 'une somme', sym: '+' },
  '-': { article: 'une différence', sym: '−' },
  '*': { article: 'un produit', sym: '×' },
  '/': { article: 'un quotient', sym: '÷' },
};
/** « de 7 », « de la somme de… », « du produit de… » (après « et »). */
function de(n: N): string {
  if (n.t === 'n') return `de ${n.v}`;
  return n.o === '+' || n.o === '-' ? `de ${phrase(n)}` : `d${phrase(n).replace(/^le /, 'u ')}`;
}
/** « la somme de 2 et de 7 », « le produit de la somme de 3 et de 4 par 2 ». */
function phrase(n: N): string {
  if (n.t === 'n') return String(n.v);
  switch (n.o) {
    case '+': return `la somme de ${phrase(n.a)} et ${de(n.b)}`;
    case '-': return `la différence de ${phrase(n.a)} et ${de(n.b)}`;
    case '*': return `le produit de ${phrase(n.a)} par ${phrase(n.b)}`;
    case '/': return `le quotient de ${phrase(n.a)} par ${phrase(n.b)}`;
  }
}
/** Le premier bloc qui doit être entre parenthèses (un fils de la racine). */
function blockOf(n: N): N | null {
  if (n.t === 'n') return null;
  if (needsParens(n.a, n.o, 'a')) return n.a;
  if (needsParens(n.b, n.o, 'b')) return n.b;
  return null;
}
const readable = (t: string): string => ecrireText(t);

// ——— Tirages : un arbre par modèle de phrase ———
const R = (g: Rng, lo: number, hi: number): number => rnd(g, [lo, hi]);
type Draw = (g: Rng) => N;
/** 30 moins la somme de 2 et de 7. */
const diffSomme: Draw = (g) => {
  const a = R(g, 2, 9);
  const b = R(g, 2, 9);
  return bin('-', num(a + b + R(g, 1, 15)), bin('+', num(a), num(b)));
};
/** Le produit de la somme de 3 et de 4 par 2. */
const produitSomme: Draw = (g) => bin('*', bin('+', num(R(g, 2, 9)), num(R(g, 2, 9))), num(R(g, 2, 6)));
/** Le produit de 3 par la différence de 9 et de 4. */
const produitDiff: Draw = (g) => {
  const b = R(g, 2, 8);
  return bin('*', num(R(g, 2, 6)), bin('-', num(b + R(g, 2, 7)), num(b)));
};
/** Le quotient de la différence de 20 et de 8 par 3. */
const quotientDiff: Draw = (g) => {
  const c = R(g, 2, 5);
  const b = R(g, 2, 9);
  return bin('/', bin('-', num(b + c * R(g, 2, 6)), num(b)), num(c));
};
/** Le quotient de la somme de 5 et de 7 par 3. */
const quotientSomme: Draw = (g) => {
  const c = R(g, 2, 5);
  const s = c * R(g, 2, 5);
  const a = R(g, 1, s - 1);
  return bin('/', bin('+', num(a), num(s - a)), num(c));
};
/** 30 moins le produit de 4 par 5 : pas de parenthèses nécessaires. */
const diffProduit: Draw = (g) => {
  const a = R(g, 2, 9);
  const b = R(g, 2, 9);
  return bin('-', num(a * b + R(g, 1, 20)), bin('*', num(a), num(b)));
};
const sommeProduit: Draw = (g) => bin('+', num(R(g, 2, 20)), bin('*', num(R(g, 2, 9)), num(R(g, 2, 9))));
/** Le produit de la somme de 3 et de 4 par la différence de 9 et de 5. */
const produitDeux: Draw = (g) => {
  const d = R(g, 2, 6);
  return bin('*', bin('+', num(R(g, 2, 9)), num(R(g, 2, 9))), bin('-', num(d + R(g, 2, 5)), num(d)));
};
/** Le quotient de la somme de 7 et de 5 par la différence de 9 et de 6. */
const quotientDeux: Draw = (g) => {
  const e = R(g, 2, 4);
  const s = e * R(g, 2, 5);
  const a = R(g, 1, s - 1);
  const c = R(g, 1, 8);
  return bin('/', bin('+', num(a), num(s - a)), bin('-', num(c + e), num(c)));
};
/** 60 moins la somme de 5 et du produit de 3 par 4. */
const diffSommeProduit: Draw = (g) => {
  const p = bin('*', num(R(g, 2, 6)), num(R(g, 2, 6)));
  const s = bin('+', num(R(g, 2, 9)), p);
  return bin('-', num((value(s) ?? 20) + R(g, 1, 25)), s);
};
/** 60 moins le produit de la somme de 3 et de 4 par 5. */
const diffProduitSomme: Draw = (g) => {
  const p = bin('*', bin('+', num(R(g, 2, 6)), num(R(g, 2, 6))), num(R(g, 2, 5)));
  return bin('-', num((value(p) ?? 20) + R(g, 1, 25)), p);
};
/** 5 plus le quotient de la différence de 20 et de 8 par 3. */
const sommeQuotient: Draw = (g) => bin('+', num(R(g, 2, 20)), quotientDiff(g));

const POOLS: Record<Level, Draw[]> = {
  1: [diffSomme, produitSomme, produitDiff, quotientDiff, quotientSomme],
  2: [diffSomme, produitSomme, produitDiff, quotientDiff, quotientSomme, diffProduit, sommeProduit, produitDeux, quotientDeux, diffSommeProduit],
  3: [diffProduit, sommeProduit, produitDeux, quotientDeux, diffSommeProduit, diffProduitSomme, sommeQuotient],
};
const fits = (n: N): boolean => value(n) !== null && ascii(n).length <= 26;
/** Un arbre de phrase : `from` restreint les modèles, `want` impose une propriété (calcul-piège). */
function drawTree(g: Rng, level: Level, from: Draw[] = POOLS[level], want: (n: N) => boolean = () => true): N {
  return redraw(() => pick(g, from)(g), (n) => fits(n) && want(n));
}
const hasBlock = (n: N): boolean => blockOf(n) !== null;
const ordreSensible = (n: N): boolean => n.t === 'b' && (n.o === '-' || n.o === '/');

// ——— Les trois sortes de contextes ———
const NAMES = ['A', 'B', 'C', 'D', 'E'];
const hintPhrase = (n: N): string => {
  const o = n.t === 'b' ? NATURE[n.o] : NATURE['+'];
  return `La phrase commence par ${o.article} : c’est la dernière opération (${o.sym}). Chaque bloc « la somme de… », « la différence de… » qu’on retranche, multiplie ou divise va entre parenthèses.`;
};
const forgotOf = (n: N): string | undefined => {
  const blk = blockOf(n);
  return blk ? `« ${phrase(blk)} » est un seul nombre : mets ${readable(ascii(blk))} entre parenthèses.` : undefined;
};
const wrongOf = (n: N): string => {
  const o = n.t === 'b' ? NATURE[n.o] : NATURE['+'];
  return `Repère la dernière opération : c’est ${o.article}. Écris les deux morceaux et le signe ${o.sym} qui les relie.`;
};

function phraseQ(level: Level, g: Rng, tree: N): EcrireQuestion {
  const name = pick(g, NAMES);
  const f = forgotOf(tree);
  return {
    kind: 'ecrire',
    ex: mkEx(ID, level, ascii(tree)),
    mode: 'calcul',
    context: { kind: 'phrase', text: `${name} est ${phrase(tree)}.` },
    name,
    steps: [{ instr: null, accepted: acceptedOf(tree), ...(f ? { forgot: f } : {}), wrong: wrongOf(tree) }],
    hint: hintPhrase(tree),
  };
}

/** Un programme de calcul : « Pars du nombre 4 et ajoute-lui 3. » puis « Multiplie le résultat par 5. »… */
function programmeQ(level: Level, g: Rng, wantBlock = false): EcrireQuestion {
  const draw = (): { instr: string; node: N; prev: N | null; op: Op }[] => {
    const n0 = R(g, 2, 9);
    const sub = n0 > 3 && g() < 0.4;
    const p = sub ? R(g, 1, n0 - 1) : R(g, 2, 9);
    let cur: N = bin(sub ? '-' : '+', num(n0), num(p));
    const out = [{ instr: `Pars du nombre ${n0} et ${sub ? 'retire' : 'ajoute'}-lui ${p}.`, node: cur, prev: null as N | null, op: (sub ? '-' : '+') as Op }];
    const count = level === 1 ? 2 : 3;
    for (let k = 1; k < count; k++) {
      const v = value(cur) ?? 1;
      const must = k === 1; // la 2e étape multiplie ou divise : le résultat va entre parenthèses
      const kinds: Op[] = must ? ['*', '/'] : ['+', '-', '*', '/'];
      const o = pick(g, kinds);
      let arg = 0;
      if (o === '/') {
        const ds = [2, 3, 4, 5, 6].filter((d) => v % d === 0 && v / d >= 1);
        arg = ds.length > 0 ? pick(g, ds) : 0;
      } else if (o === '*') arg = R(g, 2, 5);
      else if (o === '+') arg = R(g, 2, 9);
      else arg = R(g, 1, Math.max(1, v - 1));
      if (arg === 0) arg = 2;
      const next = bin(o, cur, num(arg));
      const instr = { '+': `Ajoute ${arg} au résultat.`, '-': `Retire ${arg} au résultat.`, '*': `Multiplie le résultat par ${arg}.`, '/': `Divise le résultat par ${arg}.` }[o];
      out.push({ instr, node: next, prev: cur, op: o });
      cur = next;
    }
    return out;
  };
  const prog = redraw(draw, (s) => s.every((x) => fits(x.node)) && (!wantBlock || s.some((x) => x.prev && needsParens(x.prev, x.op, 'a'))));
  const steps: EcrireStep[] = prog.map((s, i) => {
    const accepted = acceptedOf(s.node);
    if (i === 0) {
      const n = s.node as Extract<N, { t: 'b' }>;
      return { instr: s.instr, accepted, wrong: `On part de ${ascii(n.a)}, puis on fait ${n.o === '+' ? '+' : '−'} ${ascii(n.b)}.` };
    }
    const prev = s.prev as N;
    const forgot = needsParens(prev, s.op, 'a')
      ? `« Le résultat » est tout le calcul d’avant : mets ${readable(ascii(prev))} entre parenthèses.`
      : `Remplace « le résultat » par le calcul qui l’a donné : ${readable(ascii(prev))}.`;
    return { instr: s.instr, accepted, forgot, wrong: `Reprends le calcul d’avant, ${readable(ascii(prev))}, et fais ce que dit la consigne.` };
  });
  const last = prog.at(-1)!.node;
  return {
    kind: 'ecrire',
    ex: mkEx(ID, level, ascii(last)),
    mode: 'calcul',
    context: { kind: 'programme' },
    name: null,
    steps,
    hint: 'Une étape à la fois. « Le résultat » est le calcul de l’étape d’avant, en entier : on le met entre parenthèses quand on le multiplie ou le divise.',
  };
}

/** Un petit problème : on écrit le calcul, puis on le calcule ligne par ligne. */
interface Probleme {
  text: string;
  node: N;
  also?: N[];
}
const PERSONS: [string, string][] = [['Léo', 'Il'], ['Sam', 'Il'], ['Lina', 'Elle'], ['Maya', 'Elle']];
/** Le modèle « œufs » est construit à part : le produit puis le retrait, sans parenthèses. */
function oeufs(g: Rng): Probleme {
  const r = R(g, 3, 6);
  const c = R(g, 4, 8);
  const b = R(g, 2, 5);
  return { text: `Une boîte contient ${r} rangées de ${c} œufs. On en casse ${b}. Combien reste-t-il d’œufs ?`, node: bin('-', bin('*', num(r), num(c)), num(b)) };
}
const PROBLEMS: ((g: Rng) => Probleme)[] = [
  // rendu de monnaie
  (g) => {
    const [who, il] = pick(g, PERSONS);
    const p = R(g, 3, 9);
    const k = R(g, 2, 4);
    const q = R(g, 2, 5);
    const total = p + k * q;
    const M = total < 20 ? 20 : 50;
    const sum = bin('+', num(p), bin('*', num(k), num(q)));
    return {
      text: `${who} achète un livre à ${p} € et ${k} stylos à ${q} € chacun. ${il} paie avec un billet de ${M} €. Combien lui rend-on ?`,
      node: bin('-', num(M), sum),
      also: [bin('-', bin('-', num(M), num(p)), bin('*', num(k), num(q))), bin('-', bin('-', num(M), bin('*', num(k), num(q))), num(p))],
    };
  },
  // œufs : pas de parenthèses nécessaires
  oeufs,
  // sandwichs et boissons
  (g) => {
    const n = R(g, 3, 6);
    const p = R(g, 3, 6);
    const q = R(g, 1, 3);
    return {
      text: `${n} amis achètent chacun un sandwich à ${p} € et une boisson à ${q} €. Combien paient-ils en tout ?`,
      node: bin('*', num(n), bin('+', num(p), num(q))),
      also: [bin('+', bin('*', num(n), num(p)), bin('*', num(n), num(q)))],
    };
  },
  // bonbons partagés
  (g) => {
    const n = R(g, 3, 6);
    const t = n * R(g, 3, 8);
    const e = R(g, 1, Math.max(1, t / n - 1));
    return { text: `Un paquet de ${t} bonbons est partagé entre ${n} enfants. Chaque enfant en mange ${e}. Combien en reste-t-il à chacun ?`, node: bin('-', bin('/', num(t), num(n)), num(e)) };
  },
  // argent restant
  (g) => {
    const k = R(g, 2, 4);
    const p = R(g, 3, 6);
    const q = R(g, 5, 12);
    const M = k * p + q + R(g, 3, 20);
    const dep = bin('+', bin('*', num(k), num(p)), num(q));
    return {
      text: `Inès a ${M} €. Elle achète ${k} cahiers à ${p} € et une trousse à ${q} €. Combien lui reste-t-il ?`,
      node: bin('-', num(M), dep),
      also: [bin('-', bin('-', num(M), bin('*', num(k), num(p))), num(q)), bin('-', bin('-', num(M), num(q)), bin('*', num(k), num(p)))],
    };
  },
  // pizza partagée
  (g) => {
    const k = R(g, 2, 4);
    const q = R(g, 2, 3);
    const p = R(g, 6, 14);
    const total = p + k * q;
    const parts = [2, 3, 4, 5].filter((d) => total % d === 0);
    const d = parts.length > 0 ? pick(g, parts) : 1;
    return {
      text: `${d} amis se partagent à parts égales une pizza à ${p} € et ${k} boissons à ${q} € chacune. Combien paie chacun ?`,
      node: bin('/', bin('+', num(p), bin('*', num(k), num(q))), num(d)),
    };
  },
];
function problemeQ(level: Level, g: Rng): EcrireQuestion {
  const drawP = (): Probleme => pick(g, PROBLEMS)(g);
  const pb = redraw(drawP, (p) => fits(p.node) && (value(p.node) ?? 0) >= 1 && (p.also ?? []).every(fits));
  const blk = blockOf(pb.node);
  return {
    kind: 'ecrire',
    ex: mkEx(ID, level, ascii(pb.node)),
    mode: 'calcul',
    context: { kind: 'phrase', text: pb.text },
    name: 'A',
    steps: [
      {
        instr: null,
        accepted: acceptedOf(pb.node, ...(pb.also ?? [])),
        ...(blk ? { forgot: `${blk.t === 'b' && blk.o === '/' ? 'Ce calcul' : 'Ce bloc'} ${readable(ascii(blk))} est un seul nombre : mets-le entre parenthèses.` } : {}),
        wrong: 'Ce n’est pas le calcul du problème. Repère ce qu’on cherche : c’est la dernière opération.',
      },
    ],
    compute: true,
    hint: 'Repère ce qu’on cherche : c’est la dernière opération. Ce qu’on retire ou qu’on divise en entier est un bloc : on le met entre parenthèses.',
  };
}

type Sort = 'phrase' | 'programme' | 'probleme';
/** La question `ecrire` : la sorte dépend du rang de l'exercice de fin (0 à 4), ou du hasard en révision. */
function ecrireQuestion(ctx: BuildCtx): EcrireQuestion {
  const { rng: g, level } = ctx;
  const trap = ctx.trapErrorType;
  if (trap === 'ordre') return phraseQ(level, g, drawTree(g, level, POOLS[level], ordreSensible));
  if (trap === 'parentheses-oubliees') return g() < 0.5 ? programmeQ(level, g, true) : phraseQ(level, g, drawTree(g, level, POOLS[level], hasBlock));
  const sorts: Sort[] = ['phrase', 'programme', 'phrase', 'probleme', 'programme'];
  const sort: Sort = ctx.index !== undefined ? sorts[ctx.index % 5]! : pick(g, ['phrase', 'programme', 'probleme'] as Sort[]);
  if (sort === 'programme') return programmeQ(level, g, true);
  if (sort === 'probleme') return problemeQ(level, g);
  // rang 0 : un bloc entre parenthèses évident (somme retranchée ou multipliée) ; rang 2 : les autres modèles
  const from = ctx.index === 0 ? POOLS[level].filter((d) => d === diffSomme || d === produitSomme || level > 1) : POOLS[level];
  return phraseQ(level, g, drawTree(g, level, from, hasBlock));
}
function generate(level: Level, rng: Rng): Exercise {
  return ecrireQuestion({ rng, level, timesSeen: 0 }).ex;
}
function customQuestion(kind: QuestionKind, ctx: BuildCtx): Question | null {
  if (kind !== 'ecrire' && kind !== 'saisie') return null;
  return ecrireQuestion(ctx);
}

// ——— Erreurs : jugées par la question `ecrire` (pas de valeur numérique) ; elles servent à relire la bonne règle ———
const RULE_1 = { n: 1, label: 'Traduire mot à mot', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Un bloc entre parenthèses', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Un problème en mots', partIndex: 5 };
const err = (id: string, rule: NonNullable<ErrorDef['rule']>, text: string, family: ErrorDef['family'] = 'ecriture'): ErrorDef => ({
  id,
  family,
  detect: () => false,
  explain: (ex) => explanation(text, resolutionOf(ex)),
  trap: (level, rng) => generate(level, rng),
  wrongValues: () => [],
  rule,
});
const errors: ErrorDef[] = [
  err('parentheses-oubliees', RULE_2, 'Un bloc comme « la somme de 2 et de 7 » est un seul nombre : quand on le retranche ou le multiplie, il va entre parenthèses.'),
  err('ordre', RULE_1, 'Dans « la différence de a et de b » ou « le quotient de a par b », le premier nombre nommé s’écrit en premier.'),
];

// ——— Leçon ———
const REGLE1 = '**Je traduis la phrase mot à mot, dans l’ordre : le premier nombre nommé s’écrit en premier.** « La différence de 30 et de 7 » donne 30 − 7 ; « le quotient de 20 par 4 » donne 20 ÷ 4.';
const REGLE2 = '**« La somme de… », « la différence de… » forment un seul nombre : je le mets entre parenthèses quand on le retranche, le multiplie ou le divise.** 30 − (2 + 7), et non 30 − 2 + 7.';
const REGLE3 = '**Dans un problème, je trouve ce qu’on cherche, j’écris le calcul d’un seul coup, puis je le calcule ligne par ligne.**';
const ex = (text: string): Exercise => mkEx(ID, 1, text);

const guess = choix(
  ex('(4 + 3) * 5'),
  'Un programme de calcul dit : « Pars du nombre 4 et ajoute-lui 3. Multiplie le résultat par 5. » Quel calcul écrit tout cela d’un seul coup ?',
  options3(
    ['(4 + 3) × 5', 'Oui : le résultat de 4 + 3 est multiplié en entier par 5, donc 4 + 3 est entre parenthèses.'],
    ['4 + 3 × 5', 'Ici seul le 3 est multiplié par 5 : 4 + 15 = 19. Le programme multiplie le résultat, qui est 7.'],
    ['4 × 5 + 3', 'Le programme ajoute 3 à 4 avant de multiplier. Ici on multiplie 4 d’abord : ce n’est pas le même ordre.'],
  ),
  0,
);

const regle1: EtapeStep[] = [
  step('Pour écrire une phrase en calcul, **le mot du début donne l’opération** : une différence est un −, un produit un ×, une somme un +, un quotient un ÷.', {
    scene: linesScene(['D = ', hl('la différence'), ' de 30 et de 7']),
  }),
  step('Ensuite, on garde **l’ordre des nombres** de la phrase : « la différence de 30 et de 7 », donc 30 d’abord.', {
    scene: linesScene(['D = la différence de ', hl('30'), ' et de 7']),
    after: linesScene(['D = la différence de 30 et de 7'], ['D = ', hl('30'), ' − 7']),
    action: trouOf('Dans « la différence de 30 et de 7 », on écrit d’abord [ ? ].', ['le 30, nommé en premier', 'le 7, qui est plus petit'], 0, {
      1: 'Le 7 est nommé en second : il vient après le signe −. 7 − 30 serait la différence de 7 et de 30.',
    }),
  }),
  step(undefined, { scene: linesScene(['D = la différence de 30 et de 7'], ['D = ', hl('30 − 7')]), rule: { n: 1, text: REGLE1 } }),
];

const regle2: EtapeStep[] = [
  step('Dans « D est la différence de 30 et de **la somme de 2 et de 7** », la somme de 2 et de 7 est **un seul nombre** : on retire 2 + 7 en entier.', {
    scene: linesScene(['D = 30 − ', hl('2 + 7')]),
  }),
  step('Sans parenthèses, 30 − 2 + 7 retire 2 puis ajoute 7 : ce n’est pas la phrase. Pour retirer toute la somme, on la met entre parenthèses.', {
    scene: linesScene(['D = 30 − 2 + 7']),
    after: linesScene(['D = 30 − ', hl('(2 + 7)')]),
    action: trouOf('Pour retirer toute la somme 2 + 7, on l’écrit [ ? ].', ['entre parenthèses', 'sans parenthèses'], 0, {
      1: 'Sans parenthèses, seul le 2 est retiré, puis le 7 est ajouté. La somme doit rester un seul bloc.',
    }),
  }),
  step(undefined, { scene: linesScene(['D = 30 − ', hl('(2 + 7)')]), rule: { n: 2, text: REGLE2 } }),
];

const regle3: EtapeStep[] = [
  step('Mia a 50 €. Elle achète 2 tickets à 9 € et un sac à 6 €. Ce qu’elle dépense en tout est **2 × 9 + 6**.', {
    scene: linesScene(['Dépense = ', hl('2 × 9 + 6')]),
  }),
  step('Il lui reste ce qu’elle avait **moins toute la dépense** : la dépense est un seul nombre, donc entre parenthèses.', {
    scene: linesScene(['Dépense = 2 × 9 + 6'], ['A = 50 − 2 × 9 + 6']),
    after: linesScene(['Dépense = 2 × 9 + 6'], ['A = 50 − ', hl('(2 × 9 + 6)')]),
    action: trouOf('On retire toute la dépense, donc on l’écrit [ ? ].', ['entre parenthèses', 'sans parenthèses'], 0, {
      1: 'Sans parenthèses, seul 2 × 9 serait retiré, et les 6 € seraient ajoutés. La dépense entière doit être retirée.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['A = 50 − (2 × 9 + 6)'], ['A = 50 − (18 + 6)'], ['A = 50 − 24'], ['A = ', hl('26')]),
    rule: { n: 3, text: REGLE3 },
  }),
];

const exGuide = ex('(3 + 4) * 2');
const guideQ: EcrireQuestion = {
  kind: 'ecrire',
  ex: exGuide,
  mode: 'calcul',
  context: { kind: 'phrase', text: 'D est le produit de la somme de 3 et de 4 par 2.' },
  name: 'D',
  steps: [{
    instr: null,
    accepted: acceptedOf(bin('*', bin('+', num(3), num(4)), num(2))),
    forgot: '« La somme de 3 et de 4 » est un seul nombre : mets 3 + 4 entre parenthèses.',
    wrong: 'Repère la dernière opération : c’est un produit. Écris la somme de 3 et de 4, puis × 2.',
  }],
  hint: 'La phrase commence par un produit : c’est la dernière opération (×). La somme de 3 et de 4 est un bloc, entre parenthèses.',
  guided: true,
};

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Un programme en un seul calcul',
    intro: ['Une phrase ou un programme de calcul peut s’écrire en un seul calcul.', 'Ici, tu apprends à l’écrire sans te tromper de parenthèses.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, regle1),
  lecon(
    smallChoix(
      ex('20 / 4'),
      'Quel calcul est « le quotient de 20 par 4 » ?',
      options3(
        ['20 ÷ 4', 'Oui : un quotient est un ÷, et le premier nombre nommé, 20, s’écrit en premier.'],
        ['4 ÷ 20', 'Le 4 est nommé après « par » : il s’écrit après le signe ÷.'],
        ['20 × 4', 'Un quotient est un ÷, pas un ×.'],
      ),
      0,
      null,
    ),
  ),
  etapes(RULE_2.label, regle2),
  texted(
    decouverte(
      choix(
        ex('30 - (2 + 7)'),
        'Lequel de ces deux calculs est « 30 moins la somme de 2 et de 7 » ?',
        options3(
          ['Le calcul A, 30 − (2 + 7)', 'Oui : la somme de 2 et de 7 est retirée en entier. Le calcul vaut 30 − 9 = 21.'],
          ['Le calcul B, 30 − 2 + 7', 'Dans B, on retire 2 puis on ajoute 7 : 28 + 7 = 35. Ce n’est pas retirer la somme.'],
          ['Les deux', 'Ils n’ont pas la même valeur : A donne 21 et B donne 35.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde où sont les parenthèses.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A', latex: '30 - (2 + 7)' },
        b: { label: 'Calcul B', latex: '30 - 2 + 7' },
        note: '',
        inPlace: true,
        highlight: { a: toks('30 − ', hl('(2 + 7)')), b: toks('30 ', hl('− 2 + 7')) },
        after: ['Dans A, on retire toute la somme : 30 − 9 = 21.', 'Dans B, on retire 2 puis on ajoute 7 : 28 + 7 = 35.'],
      },
    },
  ),
  etapes(RULE_3.label, regle3),
  lecon(
    smallChoix(
      ex('40 - 3 * 8'),
      'Jules a 40 €. Il achète 3 livres à 8 € chacun. Quel calcul donne ce qui lui reste ?',
      options3(
        ['40 − 3 × 8', 'Oui : il retire 3 × 8, un seul produit. Le × passe avant le −, donc ici pas de parenthèses.'],
        ['(40 − 3) × 8', 'On multiplierait 37 par 8 : ce n’est pas ce qu’il dépense. Il dépense 3 × 8.'],
        ['40 − 3 + 8', 'Ce calcul retire 3 et ajoute 8 : il n’y a ni le prix de 3 livres, ni la bonne opération.'],
      ),
      0,
      null,
    ),
  ),
  texted(exemple(guideQ), {
    title: 'On le fait ensemble',
    subtitle: 'Écris la phrase en un seul calcul, sans le calculer. Une aide te dit quoi faire.',
  }),
  annonceFin(),
];

export const priorites6: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 6,
  title: 'Écrire un calcul d’un seul coup',
  shortTitle: 'Écrire un calcul',
  rule: RULE,
  parts,
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  // phrase, programme, phrase, problème, programme (rang de l'exercice de fin)
  endExercises: { count: 5, kind: 'saisie', mix: ['ecrire', 'ecrire', 'ecrire', 'ecrire', 'ecrire'] },
  formats: ['ecrire', 'ecrire', 'ecrire'],
  generate,
  errors,
  generalExplanation: (e) => explanation(RULE, resolutionOf(e)),
  resolution: resolutionOf,
  classes: SIGN_CLASSES,
  expectInteger: true,
  customQuestion,
  memo: {
    rule: RULE,
    ruleBullets: [
      'Je traduis mot à mot : le premier nombre nommé s’écrit en premier.',
      '« La somme de… », « la différence de… » sont un seul bloc : entre parenthèses si on le retranche, le multiplie ou le divise.',
      'Un problème : j’écris le calcul d’un seul coup, puis je le calcule ligne par ligne.',
    ],
    examples: ['La différence de 30 et de la somme de 2 et de 7 : 30 − (2 + 7)', 'Pars de 4, ajoute 3, multiplie le résultat par 5 : (4 + 3) × 5'],
    mistake: { wrong: '30 − 2 + 7 pour « 30 moins la somme de 2 et de 7 »', why: 'La somme est **un seul bloc** : on la retire en entier, donc 30 − (2 + 7) = 21.' },
    tip: 'Je repère le mot du début (somme, différence, produit, quotient) : c’est la dernière opération.',
  },
};
