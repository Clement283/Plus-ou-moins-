// « À toi de résoudre » (maquette docs/design/ecrans/equations-resolution-ligne.html, écran 7, validée le 2026-11-26) :
// l'élève écrit chaque ligne en entier, avec sa méthode. Ici : le retour de chaque ligne (affiché pendant la résolution)
// et la note de la question entière (la question est juste si aucune ligne n'a été fausse en route).
import { type Equation, equationLatex } from '../math/equation';
import { parseEquation, type ParseError } from '../math/parse-equation';
import {
  type DoneOp,
  type StepErrorId,
  doneOpLatex,
  hasReducibleFraction,
  isFinal,
  isReduced,
  judgeLine,
  nextStep,
  opLatex,
  resolve,
  solutionSet,
} from '../math/solve';
import { ratToString } from '../math/rational';

/** Messages des erreurs reconnues (titre, puis la règle). */
export const STEP_ERROR_TEXT: Record<StepErrorId, { title: string; message: string }> = {
  'un-seul-cote': { title: 'Tu as changé un seul membre.', message: 'Ce que tu fais à un membre, fais-le à l’autre.' },
  'signe-garde': {
    title: 'Un terme a changé de côté sans changer de signe.',
    message: 'Quand un terme disparaît d’un côté, il apparaît de l’autre avec le signe contraire.',
  },
  reduction: { title: 'Erreur en regroupant.', message: 'Regroupe les x entre eux et les nombres entre eux : par exemple 4x − x = 3x.' },
  'sens-change-a-tort': {
    title: 'Le sens ne change pas ici.',
    message: 'On change le sens seulement quand on multiplie ou divise par un nombre négatif.',
  },
  'soustraire-coef': {
    title: 'Tu as soustrait au lieu de diviser.',
    message: 'Le nombre devant x multiplie : on divise les deux membres par ce nombre.',
  },
  'signe-perdu-division': { title: 'Le signe s’est perdu.', message: 'Tu divises par un nombre négatif : le résultat change de signe.' },
  'sens-non-change': { title: 'Le sens doit changer.', message: 'Tu as divisé par un nombre négatif : < devient >, ⩽ devient ⩾.' },
};

const PARSE_TEXT: Record<ParseError, string> = {
  vide: 'Tape une ligne avant de valider.',
  'sans-signe': 'Il manque le signe du milieu (=, <, >, ⩽ ou ⩾).',
  'deux-signes': 'Une ligne a un seul signe du milieu.',
  'membre-vide': 'Il faut un membre de chaque côté du signe.',
  'mal-ecrit': 'Cette ligne est mal écrite. Exemple : 3x + 1 = 7, ou x = 12 ÷ 3.',
};

const UNKNOWN = {
  title: 'Cette ligne n’a plus les mêmes solutions.',
  message: 'Reprends la ligne d’avant : ce que tu fais à un membre, fais-le à l’autre.',
};

export type LineResult =
  /** Illisible : rien n'est jugé, la ligne reste à corriger (ne compte pas comme une erreur). */
  | { kind: 'illisible'; title: string; message: string }
  /** Juste mais recopiée : ne compte pas comme une erreur, ne s'ajoute pas. */
  | { kind: 'recopiee'; title: string; message: string }
  | { kind: 'juste'; eq: Equation; done: DoneOp; opLatex: string | null; final: boolean; title: string; message: string }
  | { kind: 'fausse'; errorId: StepErrorId | null; title: string; message: string };

/** Le retour d'une ligne tapée après `prev`. */
export function judgeTypedLine(prev: Equation, typed: string): LineResult {
  if (/[÷/][−-]?0+(?!\d)/.test(typed.replace(/\s+/g, '')))
    return { kind: 'illisible', title: 'Je ne peux pas lire cette ligne.', message: 'On ne divise jamais par 0.' };
  const p = parseEquation(typed);
  if (!p.ok) return { kind: 'illisible', title: 'Je ne peux pas lire cette ligne.', message: PARSE_TEXT[p.error] };
  const v = judgeLine(prev, p.eq);
  if (v.correct && v.unchanged)
    return {
      kind: 'recopiee',
      title: 'C’est la même ligne.',
      message: 'Elle est juste, mais tu l’as recopiée. Fais une opération des deux côtés, ou regroupe des termes.',
    };
  if (v.correct) {
    const done = v.done ?? { k: 'several' as const };
    const message = v.final
      ? ''
      : hasReducibleFraction(p.eq)
        ? 'Simplifie la fraction pour avoir x tout seul.'
        : done.k === 'reduce'
          ? 'Tu as regroupé les termes. Continue.'
          : done.k === 'several'
            ? 'Tu as fait plusieurs étapes d’un coup : c’est juste.'
            : 'Continue jusqu’à avoir x tout seul.';
    return { kind: 'juste', eq: p.eq, done, opLatex: doneOpLatex(done), final: v.final, title: 'Ligne juste.', message };
  }
  const t = v.errorId ? STEP_ERROR_TEXT[v.errorId] : UNKNOWN;
  return { kind: 'fausse', errorId: v.errorId, ...t };
}

/** L'indice : l'étape suivante de la méthode du cours, en une phrase (LaTeX de l'opération à part). */
export function hintFor(cur: Equation): { text: string; opLatex: string | null } {
  if (hasReducibleFraction(cur)) return { text: 'Méthode du cours : simplifie la fraction (par exemple 12 ÷ 3 = 4).', opLatex: null };
  if (!isReduced(cur)) return { text: 'Méthode du cours : regroupe d’abord les x entre eux et les nombres entre eux, dans chaque membre.', opLatex: null };
  const op = nextStep(cur);
  if (!op) return { text: 'Méthode du cours : x est tout seul, la résolution est finie.', opLatex: null };
  if (op.k === 'swap')
    return { text: `Méthode du cours : échange les deux membres pour avoir x à gauche${cur.rel === '=' ? '' : ' (le sens change)'}.`, opLatex: null };
  return { text: 'Méthode du cours : fais cette opération des deux côtés.', opLatex: opLatex(op) };
}

/** La méthode du cours depuis l'énoncé : lignes réduites, chacune avec l'opération faite (null pour un échange). */
export function courseMethod(start: Equation): { eq: Equation; latex: string; opLatex: string | null }[] {
  const { lines } = resolve(start);
  const out: { eq: Equation; latex: string; opLatex: string | null }[] = [];
  let pending: string | null = null;
  for (const l of lines.slice(1)) {
    if (l.note === 'operation' && l.op?.k !== 'swap') {
      pending = opLatex(l.op!);
      continue;
    }
    out.push({ eq: l.eq, latex: equationLatex(l.eq), opLatex: pending });
    pending = null;
  }
  return out;
}

/** Ce que l'élève doit trouver, en texte : « x = 4 », « x < 3 », « aucune solution »… */
export function solutionText(start: Equation): string {
  const s = solutionSet(start);
  const m = (r: string) => r.replace(/-/g, '−');
  switch (s.kind) {
    case 'one': return `x = ${m(ratToString(s.x))}`;
    case 'ray': return `x ${{ '<': '<', '<=': '⩽', '>': '>', '>=': '⩾' }[s.rel]} ${m(ratToString(s.bound))}`;
    case 'none': return 'aucune solution';
    case 'all': return 'tous les nombres';
  }
}

/**
 * La note de la question : on rejoue toutes les lignes validées (fausses comprises, dans l'ordre).
 * Juste : la dernière ligne est finale et aucune ligne n'a été fausse. La 1re erreur est celle qu'on garde.
 */
export function gradeResolution(start: Equation, lines: string[]): {
  finished: boolean;
  firstError: StepErrorId | 'autre' | null;
  firstErrorText: { title: string; message: string } | null;
} {
  let cur = start;
  let finished = isFinal(start);
  let firstError: StepErrorId | 'autre' | null = null;
  let firstErrorText: { title: string; message: string } | null = null;
  for (const typed of lines) {
    const r = judgeTypedLine(cur, typed);
    if (r.kind === 'juste') {
      cur = r.eq;
      finished = r.final;
    } else if (r.kind === 'fausse' && firstError === null) {
      firstError = r.errorId ?? 'autre';
      firstErrorText = { title: r.title, message: r.message };
    }
  }
  return { finished, firstError, firstErrorText };
}
