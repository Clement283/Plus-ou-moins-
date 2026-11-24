import { useState, type ReactNode } from 'react';
import { checkAnswer } from '@pom/engine';
import { Bold } from '../Bold';
import { Math as MathView } from '../../ui/Math';
import { writingLatex } from './calc';
import { Comparer } from './Comparer';
import { LessonHeading, Mention, QFrame, type QProps } from './Frame';

export const DECOUVERTE_NOTE = 'Question pour découvrir : elle ne compte pas dans la note.';

/** Le calcul d'une petite question, dans un cadre (écriture du cours 0 : le « − » mal placé reste où il est). */
function CalcBox({ latex, md }: { latex: string; md?: boolean }) {
  return (
    <div className={`q-calc${md ? ' q-calc--md' : ''}`} data-copie>
      <p className="t-math-xl">
        <MathView latex={writingLatex(latex)} />
      </p>
    </div>
  );
}

/** « Ta réponse : À soustraire ✓ » : la question d'avant, résumée en haut de l'écran de la suivante. */
function Summary({ previous: p }: { previous: NonNullable<QProps<'choix'>['previous']> }) {
  return (
    <div className="q-summary">
      {p.question.calcLatex && <CalcBox latex={p.question.calcLatex} md />}
      <p className="q-ask">{p.question.prompt}</p>
      <p className="t-body2">
        Ta réponse : {p.question.options[p.choice]?.label} {p.correct ? '✓' : '✗'}
      </p>
    </div>
  );
}

const paragraphs = (texts: string[] | undefined): ReactNode =>
  texts?.map((t, i) => (
    <p key={i} className="t-body1">
      <Bold text={t} />
    </p>
  ));

/** Les options tiennent sur une ligne (2 ou 3 colonnes) si elles sont courtes, sinon l'une sous l'autre ; très courtes : plus grandes. */
function layoutOf(labels: string[]): { cls: string; cols: number } {
  const max = Math.max(...labels.map((l) => l.length));
  if (labels.length <= 3 && max <= 3) return { cls: 'choix-opts choix-opts--row choix-opts--big', cols: labels.length };
  if (labels.length <= 3 && max <= 14) return { cls: 'choix-opts choix-opts--row', cols: labels.length };
  return { cls: 'choix-opts', cols: 1 };
}

/**
 * Petite question à un toucher (doc 08 n° 10, 20, 21) : le calcul et la question en haut, les options en bas ; la réponse
 * part au toucher. `intro` au-dessus, `outro` et `outroRule` une fois répondu ; `decouverte` : la question ne compte pas.
 */
export function Choix({ q, course, locked, onAnswer, header, footer, texts, activity, previous }: QProps<'choix'>) {
  const [picked, setPicked] = useState<number | null>(null);
  const pick = (i: number) => {
    if (locked || picked !== null) return;
    setPicked(i);
    onAnswer({ choice: i }, checkAnswer(course, q, { choice: i }));
  };
  const guess = activity === 'decouverte';
  const mark = (i: number): string => {
    if (picked === null && !locked) return '';
    if (i === q.correctIndex) return ' is-correct';
    return i === picked && !guess ? ' is-wrong' : i === picked ? ' is-selected' : '';
  };
  const { cls, cols } = layoutOf(q.options.map((o) => o.label));
  const answered = locked || picked !== null;
  const compare = texts?.compare;
  return (
    <QFrame
      header={header}
      footer={footer}
      locked={locked}
      answer={
        <>
          <Mention text={texts?.mention ?? (guess ? DECOUVERTE_NOTE : undefined)} />
          <div className={cls} style={{ ['--cols' as string]: cols }} data-copie>
            {q.options.map((o, i) => (
              <button key={i} className={`choice${mark(i)}`} type="button" disabled={answered} onClick={() => pick(i)}>
                {o.label}
              </button>
            ))}
          </div>
        </>
      }
    >
      {texts?.title && <LessonHeading title={texts.title} subtitle={texts.subtitle} />}
      {paragraphs(texts?.intro)}
      {compare && <Comparer compare={compare} answered={answered} choice={picked ?? (locked ? q.correctIndex : null)} q={q} />}
      {previous && <Summary previous={previous} />}
      {!compare && q.calcLatex && <CalcBox latex={q.calcLatex} />}
      <p className="q-ask">{q.prompt}</p>
      {answered && (
        <>
          {paragraphs(texts?.outro)}
          {texts?.outroRule && (
            <div className="rule-box">
              <span className="rule-box__n">Règle {texts.outroRule.n}</span>
              <span className="rule-box__t">
                <Bold text={texts.outroRule.text} />
              </span>
            </div>
          )}
        </>
      )}
    </QFrame>
  );
}
