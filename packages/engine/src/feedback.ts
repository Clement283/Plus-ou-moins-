/**
 * The feedback after an answer (doc 03 §3, doc 07 #1, #3, #5, doc 06, doc 08, mockups
 * `docs/design/ecrans/exercices.html` and `revisions.html`). Texts are plain strings (« − » U+2212);
 * `rightLatex`, `steps` are LaTeX. Bold markup in explanations stays as the courses store it.
 *
 * Choices (see the task report):
 * - A wrong answer's title follows the mockup of the screens: « La bonne réponse est 9. » for a
 *   number, « C'était faux. » for a vrai-ou-faux, « La première erreur est à la ligne 2. » and
 *   « 7 × (−1) va dans Résultat −. » as in the « corrigé » mockups; « Voici le bon ordre. » /
 *   « Voici les bonnes paires. » / « Tout était juste. » are not in the mockups.
 * - « Calcul pas fini »: title « Le calcul n'est pas fini : simplifie. » when the calcul is itself a
 *   division, « Simplifie. » otherwise (doc 03 shows both, without saying when); message from the
 *   mockup: « Pas compté faux : corrige et valide encore. »
 * - Writing errors are not course errors: no explanation, no steps.
 */
import { diagnoseWriting } from './feedback-writing';
import { errorOf } from './courses/errors-util';
import type { CourseDef, Explanation, Exercise } from './courses/types';
import { readRaw } from './input/raw';
import { toLatex } from './math/expr';
import type { Rational } from './math/rational';
import type { Answer, Outcome, Question } from './exercises/types';
import { courseMethod } from './exercises/resoudre';

export type Feedback =
  | { tone: 'juste'; title: string; note: string | null }
  | { tone: 'pas-fini'; title: string; message: string }
  | {
      tone: 'faux';
      title: string;
      message: string;
      rightLatex: string;
      explanation: Explanation | null;
      steps: string[];
    };

export const WRITING_TITLE = 'Réponse mal écrite';
const MINUS = '−';

const plain = (s: string): string => s.replace(/-/g, MINUS);
/** LaTeX d'un choix vers texte simple : times, div, frac, accolades retirées, « − » U+2212. */
export function latexToText(latex: string): string {
  let s = latex;
  for (let prev = ''; prev !== s; ) {
    prev = s;
    s = s.replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '$1/$2');
  }
  s = s
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\(?:left|right)/g, '')
    .replace(/\\[,;:! ]|\\quad|\\qquad/g, ' ')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain(s);
}

const ratText = (r: Rational): string => plain(r.d === 1 ? `${r.n}` : `${r.n}/${r.d}`);
const ratLatex = (r: Rational): string => (r.d === 1 ? `${r.n}` : `${r.n < 0 ? '-' : ''}\\frac{${Math.abs(r.n)}}{${r.d}}`);
const exText = (ex: Exercise): string => plain(toLatex(ex.expr)).replace(/\\times/g, '×').replace(/\\div/g, '÷');
/** « 6×(−2) » texte vers LaTeX. */
const latexOfCalc = (s: string): string => s.replace(/×/g, '\\times ').replace(/÷/g, '\\div ');
const text = (s: string): string => `\\text{${s}}`;

function exerciseOf(q: Question): Exercise {
  return 'ex' in q ? q.ex : q.exs[0]!;
}

/** Title and right answer of a wrong, non-writing answer. */
function wrongParts(q: Question, a: Answer, o: Outcome): { title: string; rightLatex: string } {
  switch (q.kind) {
    case 'saisie':
    case 'trou': {
      const v = q.kind === 'saisie' ? q.ex.answer : q.hidden;
      return { title: `La bonne réponse est ${ratText(v)}.`, rightLatex: ratLatex(v) };
    }
    case 'qcm': {
      const right = q.choices[q.correctIndex]!;
      return { title: `La bonne réponse est ${latexToText(right.latex)}.`, rightLatex: right.latex };
    }
    case 'choix': {
      const right = q.options[q.correctIndex]?.label ?? o.expected;
      return { title: 'Pas tout à fait.', rightLatex: text(right) };
    }
    case 'reecrire':
      return { title: 'Pas tout à fait.', rightLatex: latexOfCalc(q.expected) };
    case 'resoudre':
      return { title: 'Tu as fini, mais avec une erreur en route.', rightLatex: text(o.expected) };
    case 'droite':
      return { title: `La bonne réponse est ${plain(`${q.answer}`)}.`, rightLatex: `${q.answer}` };
    case 'vraifaux':
      return { title: q.isTrue ? "C'était vrai." : "C'était faux.", rightLatex: text(q.isTrue ? 'Vrai' : 'Faux') };
    case 'erreur':
      return q.wrongLine === null
        ? { title: 'Tout était juste.', rightLatex: text('Tout est juste') }
        : { title: `La première erreur est à la ligne ${q.wrongLine + 1}.`, rightLatex: q.lines[q.wrongLine] ?? '' };
    case 'ordre':
      return { title: 'Voici le bon ordre.', rightLatex: q.solution.map((id) => q.tiles.find((t) => t.id === id)?.latex ?? '').join(' \\quad ') };
    case 'paires':
      return {
        title: 'Voici les bonnes paires.',
        rightLatex: q.exs.map((e, l) => `${q.left[l] ?? ''} = ${ratLatex(e.answer)}`).join(' \\quad '),
      };
    case 'classer': {
      const classes = 'classes' in a ? a.classes : [];
      const i = Math.max(0, q.expected.findIndex((id, k) => classes[k] !== id));
      const label = q.classes.find((c) => c.id === q.expected[i])?.label ?? o.expected;
      return { title: `${exText(q.exs[i]!)} va dans ${label}.`, rightLatex: text(label) };
    }
  }
}

/** `course.feedbackText` (texte propre au cours) passe en premier, pour tout type de question. */
/** Texte brut d'un retour (titre puis message), sans mise en forme : ce qu'on envoie à Clément comme « correction ». */
export function feedbackText(f: Feedback): string {
  if (f.tone === 'juste') return f.note ? `${f.title} ${f.note}` : f.title;
  return f.message ? `${f.title} ${f.message}` : f.title;
}

export function feedbackFor(course: CourseDef, q: Question, a: Answer, o: Outcome, opts?: { guess?: boolean }): Feedback {
  const f = engineFeedback(course, q, a, o, opts);
  const own = course.feedbackText?.(q, o) ?? null;
  if (own === null) return f;
  return f.tone === 'juste' ? { ...f, note: own } : { ...f, message: own };
}

function engineFeedback(course: CourseDef, q: Question, a: Answer, o: Outcome, opts?: { guess?: boolean }): Feedback {
  const raw = 'raw' in a ? a.raw : null;

  if (q.kind === 'resoudre') {
    if (o.correct) return { tone: 'juste', title: 'Juste !', note: o.helped ? 'Résolu avec l’indice : c’est noté « avec aide ».' : null };
    if (o.unfinished) return { tone: 'pas-fini', title: 'Pas encore fini.', message: 'Continue jusqu’à avoir x tout seul.' };
    const right = wrongParts(q, a, o);
    return {
      tone: 'faux',
      title: right.title,
      message: o.message ?? '',
      rightLatex: right.rightLatex,
      explanation: {
        rule: 'La méthode du cours, ligne par ligne :',
        steps: courseMethod(q.start).map((l) => ({ t: 'math' as const, latex: l.opLatex ? `${l.latex} \\quad (${l.opLatex})` : l.latex })),
      },
      steps: [],
    };
  }

  if (q.kind === 'choix' || q.kind === 'reecrire') {
    if (o.correct) return { tone: 'juste', title: 'Juste !', note: o.message || null };
    const message = o.message ?? '';
    if (opts?.guess) return { tone: 'pas-fini', title: (q.kind === 'choix' && q.guessTitle) || 'Pas tout à fait, et c\'est normal.', message };
    const right = wrongParts(q, a, o);
    return {
      tone: 'faux',
      title: right.title,
      message,
      rightLatex: right.rightLatex,
      explanation: q.kind === 'reecrire' ? { rule: message, steps: q.steps.map((t) => ({ t: 'text' as const, text: t })) } : null,
      steps: [],
    };
  }

  if (o.correct) {
    const read = raw ? readRaw(raw, course.expectInteger) : null;
    const note = read?.kind === 'value' && read.note ? `Juste ! On écrit simplement ${plain(o.expected)}.` : null;
    return { tone: 'juste', title: 'Juste !', note };
  }

  if (o.unfinished) {
    const expr = exerciseOf(q).expr;
    const division = expr.k === 'op' && expr.op === '/';
    return {
      tone: 'pas-fini',
      title: division ? "Le calcul n'est pas fini : simplifie." : 'Simplifie.',
      message: 'Pas compté faux : corrige et valide encore.',
    };
  }

  const ex = exerciseOf(q);
  const typedRight = q.kind === 'saisie' ? q.ex.answer : q.kind === 'trou' ? q.hidden : null;
  const right = wrongParts(q, a, o);

  if (o.errorFamily === 'ecriture' && raw) {
    return {
      tone: 'faux',
      title: WRITING_TITLE,
      message: diagnoseWriting(raw, course.expectInteger, o.errorType),
      rightLatex: typedRight ? ratLatex(typedRight) : right.rightLatex,
      explanation: null,
      steps: [],
    };
  }

  const err = errorOf(course, o.errorType);
  const explanation = err ? err.explain(ex) : course.generalExplanation(ex);
  return {
    tone: 'faux',
    title: right.title,
    message: explanation.rule,
    rightLatex: right.rightLatex,
    explanation,
    steps: course.resolution(ex),
  };
}
