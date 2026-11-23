import type { ReactNode } from 'react';
import type { LessonBlock, LessonPart } from '@pom/engine';
import { Math } from '../ui/Math';
import { Bold } from './Bold';
import { LessonHeading } from './questions/Frame';
import { NumberLine } from './NumberLine';
import { ANIMS } from './anims';
import { prefersReducedMotion } from './reducedMotion';

type Mark = '✓' | '✗' | '~';
const TONE_CLASS = { ok: 'ok', ko: 'ko', neutre: 'neutral' } as const;
const TONE_MARK = { ok: '✓', ko: '✗', neutre: '~' } as const;
const MARKS: Record<string, 'ok' | 'ko'> = { '✓': 'ok', '✗': 'ko' };

interface Line {
  cls: 'ok' | 'ko' | 'neutral';
  mark: Mark;
  main: string;
  note: string | null;
}

/** Un bloc de texte devient des lignes ✓ / ✗ / ~ (ton ou marque en tête, plusieurs ✗ séparés par « · »), ou un paragraphe. */
function linesOf(b: Extract<LessonBlock, { t: 'text' }>): Line[] | null {
  const parts = b.text.split(/ · (?=[✓✗])/);
  const out: Line[] = [];
  for (const p of parts) {
    const lead = p[0];
    const markTone = lead !== undefined ? MARKS[lead] : undefined;
    const tone = markTone ?? b.tone;
    if (!tone) return null;
    const body = markTone ? p.slice(1).trim() : p;
    out.push({ cls: TONE_CLASS[tone], mark: TONE_MARK[tone], main: body, note: null });
  }
  const last = out[out.length - 1];
  if (b.note && last) last.note = b.note; // « Fais attention » : l'explication sous la ligne
  return out;
}

function LessonLines({ lines, className, style }: { lines: Line[]; className: string; style?: object }) {
  return (
    <div className={className} {...(style ? { style } : {})}>
      {lines.map((l, k) => (
        <div key={k} className={`lesson-line lesson-line--${l.cls}${l.note ? ' lesson-line--stack' : ''}`}>
          <span className="lesson-line__mark">{l.mark}</span>
          <span>
            <Bold text={l.main} />
          </span>
          {l.note && <span className="lesson-line__note">{l.note}</span>}
        </div>
      ))}
    </div>
  );
}

/**
 * Les blocs d'une partie de leçon ; `colorize` : négatifs rouges, positifs bleus dans les calculs qui le demandent.
 * Les lignes ✓ / ✗ / ~ qui se suivent forment une seule pile (maquette : écart de 8).
 */
export function LessonBlocks({ blocks, colorize }: { blocks: LessonBlock[]; colorize: boolean }) {
  const out: ReactNode[] = [];
  const reduced = prefersReducedMotion();
  let delay = 0; // les blocs après une animation attendent la fin de celle-ci
  let pile: Line[] | null = null; // la pile de lignes en cours, si le bloc précédent en était une
  blocks.forEach((b, i) => {
    const reveal = delay > 0 && !reduced ? { style: { animationDelay: `${delay}ms` } } : undefined;
    const rv = delay > 0 && !reduced ? ' lesson-reveal' : '';
    const lines = b.t === 'text' ? linesOf(b) : null;
    if (lines && pile) {
      pile.push(...lines);
      return;
    }
    pile = null;
    switch (b.t) {
      case 'text':
        if (lines) {
          pile = lines;
          out.push(<LessonLines key={i} lines={pile} className={`stack lesson-lines${rv}`} {...(reveal ? { style: reveal.style } : {})} />);
        } else {
          out.push(
            <p key={i} className={`t-body1${rv}`} {...reveal}>
              <Bold text={b.text} />
            </p>,
          );
        }
        break;
      case 'heading':
        out.push(
          <h2 key={i} className={`t-h6 lesson-attention${rv}`} {...reveal}>
            {b.text}
          </h2>,
        );
        break;
      case 'math':
        out.push(
          <div key={i} className={`paper lesson-math${rv}`} {...reveal}>
            <span className="t-math">
              <Math latex={b.latex} colorize={colorize && !!b.colorize} />
            </span>
          </div>,
        );
        break;
      case 'number-line':
        out.push(
          <div key={i} className={`paper lesson-nl${rv}`} {...reveal}>
            <NumberLine from={b.from} to={b.to} jumps={b.jumps} />
          </div>,
        );
        break;
      case 'anim': {
        const a = ANIMS[b.name];
        if (!a) break; // animation inconnue : ignorée
        out.push(<a.Component key={i} />);
        delay += a.ms;
        break;
      }
    }
  });
  return <>{out}</>;
}

type Explication = Extract<LessonPart, { type: 'explication' }>;

/**
 * Une idée par écran (maquette `cours.html`, « La leçon ») : pastille du cours en tête (`header`), titre = titre de l'écran (doc 09, `part.title`) ou, à défaut, titre du
 * cours (`title`), sous-titre dessous, blocs du moteur tels quels et dans l'ordre, puis « Suivant ». L'AppBar et sa barre d'étapes sont
 * posées par l'écran appelant.
 */
export function LessonPartScreen({ part, onNext, header, title }: { part: Explication; onNext: () => void; header?: ReactNode; title?: string }) {
  const heading = part.title ?? title;
  return (
    <div className="lesson-screen">
      <div className="c-body">
        {header && <div className="row">{header}</div>}
        {heading && <LessonHeading title={heading} subtitle={part.subtitle} />}
        <LessonBlocks blocks={part.blocks} colorize />
      </div>
      <div className="c-foot">
        <button className="btn btn--contained btn--block" type="button" onClick={onNext}>
          Suivant
        </button>
      </div>
    </div>
  );
}
