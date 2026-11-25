// Largeur du téléphone : chaque calcul d'un cours doit tenir dans l'écran, sans être coupé (skill « écrire un cours »).
// Estimation sans navigateur : largeur moyenne des signes de la police des calculs (Lexend, chiffres tabulaires),
// tailles de police des classes CSS (theme.css) calculées pour un téléphone étroit.
import { toLatex, type CourseDef, type LessonPart, type Level, type Scene } from '@pom/engine';
import { seededRng } from '@pom/engine';
import { stageSize } from '../src/components/Etapes';
import { lengthClass } from '../src/ui/Math';

/** Un téléphone étroit (CSS px), la marge de chaque côté de l'écran (16 px) et le retrait intérieur d'une scène (8 px). */
export const PHONE = 360;
const GUTTER = 16;
const STAGE_PADDING = 8;

/** Largeur d'un signe, en em (un peu large, pour rester prudent). */
const advance = (c: string): number => (c === ' ' ? 0.3 : c === '(' || c === ')' ? 0.38 : c === '?' ? 0.55 : 0.64);
export const textWidth = (s: string, fontPx: number): number => [...s].reduce((w, c) => w + advance(c) * fontPx, 0);

const clamp = (lo: number, vw: number, hi: number, width: number): number => Math.min(hi, Math.max(lo, (vw * width) / 100));

/** Taille de police d'un calcul de scène (`.stage`, `.stage--n1` à `--n3`). */
export function stageFont(scene: Scene, width = PHONE): number {
  switch (stageSize(scene)) {
    case ' stage--n3':
      return clamp(16, 4.6, 22, width);
    case ' stage--n2':
      return clamp(20, 5.8, 28, width);
    case ' stage--n1':
      return clamp(26, 8, 34, width);
    default:
      return clamp(30, 10.5, 42, width);
  }
}

/** Ce qui dépasse dans une scène (les scènes ne passent jamais à la ligne : `white-space: pre`). */
export function sceneOverflows(scene: Scene, width = PHONE): string[] {
  if (scene.layout === 'row' || scene.layout === 'pairs') return [];
  const room = width - 2 * GUTTER - 2 * STAGE_PADDING;
  const font = stageFont(scene, width);
  return scene.calcs
    .map((c) => c.tokens.map((t) => t.t).join(''))
    .filter((s) => textWidth(s, font) > room)
    .map((s) => `« ${s} » : ${Math.round(textWidth(s, font))} px pour ${room} px`);
}

/** LaTeX → texte lu (une commande = un signe). */
const plain = (latex: string): string =>
  latex.replace(/\\square/g, '▢').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}]/g, '').replace(/-/g, '−');

/**
 * Nombre de lignes d'un calcul KaTeX (questions, résolutions) : il peut passer à la ligne après un signe
 * (« Un grand calcul de question peut passer à la ligne après un signe », theme.css), jamais au milieu d'un nombre.
 */
export function mathLines(latex: string, fontPx: number, width = PHONE): number {
  const room = width - 2 * GUTTER - 2 * STAGE_PADDING;
  const factor = lengthClass(latex) === ' math--xlong' ? 0.72 : lengthClass(latex) === ' math--long' ? 0.85 : 1;
  const pieces = plain(latex).split(/(?<=[+−×÷=] )/);
  let lines = 1;
  let used = 0;
  for (const p of pieces) {
    const w = textWidth(p, fontPx * factor);
    if (w > room) return Infinity;
    if (used + w > room) {
      lines++;
      used = w;
    } else used += w;
  }
  return lines;
}

/** Les scènes de toutes les étapes d'une leçon (scène et scène après l'action). */
export const scenesOf = (parts: LessonPart[]): Scene[] =>
  parts.flatMap((p) => (p.type === 'etapes' ? p.steps.flatMap((s) => [s.scene, s.after].filter((x): x is Scene => x !== undefined)) : []));

/** Les calculs KaTeX d'une leçon : calcul des questions, lignes déjà posées, calculs comparés. */
export function lessonMaths(parts: LessonPart[]): string[] {
  const out: string[] = [];
  for (const p of parts) {
    const qs = p.type === 'question' ? [{ question: p.question, texts: p }] : p.type === 'pratique' ? p.questions : [];
    for (const { question, texts } of qs) {
      if ('promptLatex' in question && typeof question.promptLatex === 'string') out.push(question.promptLatex);
      if (question.kind === 'choix' && question.calcLatex) out.push(question.calcLatex);
      if ('ex' in question) out.push(toLatex(question.ex.expr));
      out.push(...(texts?.above ?? []));
    }
    if (p.type === 'question' && p.compare) out.push(p.compare.a.latex, p.compare.b.latex);
  }
  return out;
}

/** Calculs tirés à chaque niveau (exercices de fin, révisions) : le calcul à taper et chaque ligne de la résolution type. */
export function drawnMaths(course: CourseDef, draws = 200, seed = 1): string[] {
  const rng = seededRng(seed);
  const out: string[] = [];
  for (const level of [1, 2, 3] as Level[])
    for (let i = 0; i < draws; i++) {
      const ex = course.generate(level, rng);
      out.push(`${toLatex(ex.expr)} = \\square`, ...course.resolution(ex));
    }
  return out;
}

/** Taille des calculs de question (`.q-expr .t-math-xl`) sur un téléphone étroit. */
export const QUESTION_FONT = clamp(28, 9.5, 40, PHONE);
/** Taille des lignes de résolution (`.resolution`). */
export const RESOLUTION_FONT = 22;
