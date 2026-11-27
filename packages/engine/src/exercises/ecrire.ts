// « Écris le calcul » (module Priorités, maquette docs/design/ecrans/priorites-ecrire-un-calcul.html, validée le 2026-11-27).
// Un seul écran, deux façons de juger :
//  - `calcul` (cours 6) : l'élève traduit une phrase, un programme de calcul (pas à pas) ou un petit problème en UN calcul ;
//    le calcul est jugé sur sa structure (30 − 2 − 7 n'est pas 30 − (2 + 7)), les parenthèses inutiles sont acceptées.
//  - `reecrire` (fin du cours 7) : l'élève écrit 5 − (x − 3) sans parenthèses ; juste si même expression a x + b et plus de
//    parenthèse ; 5 − x + 3 est juste, et le message montre la forme réduite 8 − x.
// Un message « gris » (même valeur mais pas le calcul demandé, résultat au lieu du calcul, parenthèse restante) ne compte pas :
// l'élève corrige. Les autres réponses comptent : une phrase = une seule réponse jugée ; un programme = une réponse par étape,
// une étape fausse se corrige (l'erreur est notée) ; un problème = le calcul écrit, puis calculé ligne par ligne.
import type { Exercise } from '../courses/types';
import { type CNode, parseCalc } from '../math/calcul';
import { collect } from '../math/equation';
import { parseEquation } from '../math/parse-equation';
import { type Rational, eqRat, ratToString } from '../math/rational';
import { calculerCalcul, gradeCalcul } from './calculer';

/** Une étape : la consigne (programme pas à pas) et les écritures justes (texte ASCII : « 30 - (2 + 7) »). */
export interface EcrireStep {
  instr: string | null;
  accepted: string[];
  /** Messages propres à l'étape, écrits par le cours (le défaut est générique). */
  forgot?: string;
  wrong?: string;
}

export interface EcrireQuestion {
  kind: 'ecrire';
  ex: Exercise;
  mode: 'calcul' | 'reecrire';
  /** Ce qu'on traduit : une phrase, ou un calcul à réécrire (LaTeX). */
  context: { kind: 'phrase'; text: string } | { kind: 'latex'; latex: string } | { kind: 'programme' };
  /** « D », « A »… (null : pas de nom, mode `reecrire`). */
  name: string | null;
  steps: EcrireStep[];
  /** Problème : après le calcul écrit, on le calcule ligne par ligne. */
  compute?: true;
  /** `reecrire` : la forme attendue a x + b, et les morceaux de départ k ± (p x + q) pour reconnaître les erreurs. */
  linear?: { a: number; b: number; k: number; op: '+' | '-'; p: number; q: number };
  hint: string;
  guided?: true;
}

export type EcrireVerdict =
  | { kind: 'juste'; title: string; message: string }
  | { kind: 'gris'; title: string; message: string }
  | { kind: 'faux'; errorId: EcrireErrorId; title: string; message: string };

export type EcrireErrorId = 'parentheses-oubliees' | 'ordre' | 'un-seul-signe' | 'moins-oublie' | 'signe' | 'autre';

// ——— Structure d'un calcul ———

/** L'arbre sans les parenthèses (la structure seule) : deux écritures ont la même structure si cette clé est la même. */
function shape(n: CNode): string {
  switch (n.t) {
    case 'n': return ratToString(n.v);
    case 'g': return shape(n.e);
    case 'm': return `neg(${shape(n.e)})`;
    case 'b': return `(${shape(n.a)}${n.o}${shape(n.b)})`;
  }
}
/** Nombres et opérations dans l'ordre, sans les parenthèses : « 30-2+7 ». */
const flatKey = (s: string): string => s.replace(/\s+/g, '').replace(/[()[\]]/g, '').replace(/[−–]/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
const reversedOrder = (n: CNode): boolean => n.t === 'b' && (n.o === '-' || n.o === '/');

/** Le texte tapé (− × ÷ du clavier) en texte de calcul. */
const norm = (s: string): string => s.replace(/[−–]/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
/** Le texte d'un calcul pour un message : 30 − (2 + 7). */
export const ecrireText = (s: string): string =>
  norm(s)
    .replace(/\s+/g, '')
    .replace(/([+\-*/])/g, ' $1 ')
    .replace(/\( - /g, '(-')
    .replace(/^ - /, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/-/g, '−')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');

function judgeCalcul(step: EcrireStep, typed: string): EcrireVerdict {
  const p = parseCalc(norm(typed));
  if (!p.ok) return { kind: 'gris', title: 'Je ne peux pas lire ce calcul.', message: 'Vérifie les parenthèses et les signes.' };
  const good = step.accepted.map((t) => parseCalc(t)).filter((x): x is Extract<typeof x, { ok: true }> => x.ok);
  const target = good[0]!;
  if (good.some((g) => shape(g.tree) === shape(p.tree))) return { kind: 'juste', title: 'Juste.', message: '' };
  if (p.tree.t === 'n' && eqRat(p.value, target.value))
    return { kind: 'gris', title: 'C’est le résultat, pas le calcul.', message: `Ici, on écrit le calcul : ${ecrireText(step.accepted[0]!)} par exemple.` };
  if (step.accepted.some((t) => flatKey(t) === flatKey(typed)))
    return { kind: 'faux', errorId: 'parentheses-oubliees', title: 'Il manque des parenthèses.', message: step.forgot ?? 'Un bloc « la somme de… », « le résultat… » est un seul nombre : écris-le entre parenthèses.' };
  if (eqRat(p.value, target.value))
    return { kind: 'gris', title: 'Même résultat, mais pas le calcul demandé.', message: step.forgot ?? 'Écris le calcul tel qu’il est dit, avec ses blocs entre parenthèses.' };
  if (reversedOrder(target.tree) && reversedOrder(p.tree)) {
    const t = target.tree as Extract<CNode, { t: 'b' }>;
    const q = p.tree as Extract<CNode, { t: 'b' }>;
    if (t.o === q.o && shape(t.a) === shape(q.b) && shape(t.b) === shape(q.a))
      return { kind: 'faux', errorId: 'ordre', title: 'Ordre inversé.', message: 'Dans « la différence de a et de b » (ou « le quotient de a par b »), a vient en premier.' };
  }
  return { kind: 'faux', errorId: 'autre', title: 'Ce n’est pas le calcul demandé.', message: step.wrong ?? 'Repère la dernière opération, puis écris chaque bloc entre parenthèses.' };
}

// ——— Réécrire sans parenthèses (lettres) ———

const sgnTxt = (v: number, first: boolean): string => (v < 0 ? (first ? '−' : ' − ') : first ? '' : ' + ');
/** a x + b en texte, x d'abord seulement si b = 0 : 8 − x, −2x + 5. */
export function linearText(a: number, b: number): string {
  const xs = (c: number, first: boolean): string => `${sgnTxt(c, first)}${Math.abs(c) === 1 ? '' : Math.abs(c)}x`;
  if (b === 0) return xs(a, true);
  return `${b < 0 ? '−' : ''}${Math.abs(b)}${xs(a, false)}`;
}

function judgeReecrire(q: EcrireQuestion, typed: string): EcrireVerdict {
  const L = q.linear!;
  const s = typed.replace(/\s+/g, '');
  if (/[()]/.test(s)) return { kind: 'gris', title: 'Il reste une parenthèse.', message: 'Écris l’expression sans aucune parenthèse.' };
  const r = parseEquation(`${s}=0`);
  if (!r.ok) return { kind: 'gris', title: 'Je ne peux pas lire cette expression.', message: 'Exemple d’écriture : 8 − x.' };
  const m = r.eq.left;
  const { a, b } = collect(m);
  const is = (v: Rational, n: number): boolean => v.d === 1 && v.n === n;
  if (is(a, L.a) && is(b, L.b)) {
    const consts = m.filter((t) => t.k === 'num').length;
    if (consts > 1) return { kind: 'juste', title: 'Juste : chaque signe a changé.', message: `Tu peux encore réduire : ${linearText(L.a, L.b)}.` };
    return { kind: 'juste', title: 'Juste.', message: '' };
  }
  if (L.op === '-') {
    const n = Math.abs(L.q);
    if (is(a, -L.p) && is(b, L.k + L.q)) return { kind: 'faux', errorId: 'un-seul-signe', title: 'Seul le premier terme a changé de signe.', message: `Le − change le signe de chaque terme : ${L.q < 0 ? '−' : '+'} ${n} devient ${L.q < 0 ? '+' : '−'} ${n}.` };
    if (is(a, L.p) && is(b, L.k + L.q)) return { kind: 'faux', errorId: 'moins-oublie', title: 'Les signes n’ont pas changé.', message: 'Un − devant la parenthèse change le signe de chaque terme qui est dedans.' };
  }
  return { kind: 'faux', errorId: 'signe', title: 'Ce n’est pas la même expression.', message: q.hint };
}

/** Le verdict d'une réponse tapée à l'étape `k`. */
export function judgeEcrire(q: EcrireQuestion, k: number, typed: string): EcrireVerdict {
  return q.mode === 'reecrire' ? judgeReecrire(q, typed) : judgeCalcul(q.steps[k]!, typed);
}

/** Le calcul à faire ligne par ligne après l'écriture (problème). */
export const ecrireCalcul = (q: EcrireQuestion) => calculerCalcul(q.ex, q.steps.at(-1)!.accepted[0]!, q.name ?? 'A');

/** La réponse attendue, en texte. */
export function ecrireExpected(q: EcrireQuestion): string {
  if (q.mode === 'reecrire') return linearText(q.linear!.a, q.linear!.b);
  return `${q.name ? `${q.name} = ` : ''}${ecrireText(q.steps.at(-1)!.accepted[0]!)}`;
}

/** Jugement de la réponse entière : les écritures comptées (justes ou fausses, dans l'ordre), puis le calcul (problème). */
export function gradeEcrire(
  q: EcrireQuestion,
  written: string[],
  calcLines: string[] = [],
): { finished: boolean; correct: boolean; errorId: string | null; message: string; given: string; expected: string } {
  const expected = ecrireExpected(q);
  let k = 0;
  let first: Extract<EcrireVerdict, { kind: 'faux' }> | null = null;
  let note = '';
  for (const w of written) {
    if (k >= q.steps.length) break;
    const v = judgeEcrire(q, k, w);
    if (v.kind === 'juste') {
      k++;
      note = v.message;
    }
    else if (v.kind === 'faux') {
      first ??= v;
      if (q.steps.length === 1) break; // une phrase : une seule réponse jugée
    }
  }
  const given = written.at(-1) ? ecrireText(written.at(-1)!) : '';
  const wrote = k >= q.steps.length;
  if (first && q.steps.length === 1) return { finished: true, correct: false, errorId: first.errorId, message: `${first.title} ${first.message}`, given, expected };
  if (!wrote) return { finished: false, correct: false, errorId: null, message: '', given, expected };
  if (q.compute) {
    const g = gradeCalcul(ecrireCalcul(q), calcLines);
    if (!g.finished) return { finished: false, correct: false, errorId: null, message: '', given, expected };
    if (!first && g.firstError) return { finished: true, correct: false, errorId: g.firstError, message: g.firstErrorText ? `${g.firstErrorText.title} ${g.firstErrorText.message}` : '', given, expected };
  }
  if (first) return { finished: true, correct: false, errorId: first.errorId, message: `${first.title} ${first.message}`, given, expected };
  return { finished: true, correct: true, errorId: null, message: note, given, expected };
}
