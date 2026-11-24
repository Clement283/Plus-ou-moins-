import type { Compare, Question } from '@pom/engine';
import { Bold } from '../Bold';
import { LineView } from '../NumberLine';
import { Math as MathView } from '../../ui/Math';
import { writingLatex } from './calc';

/**
 * « Comparer deux cas » (doc 06, maquette `compareScreen`) : deux calculs côte à côte, une note, la question à choix (posée par
 * `Choix`). Après la réponse : « Juste. » ou « Pas tout à fait, et c'est normal. » avec le message de l'option, la droite des
 * deux trajets (ou, sans droite, les deux calculs avec leurs morceaux surlignés), puis les phrases `after`. Rien n'est noté : aucune couleur de réussite sur les calculs.
 */
export function Comparer({ compare, answered, choice, q }: { compare: Compare; answered: boolean; choice: number | null; q: Extract<Question, { kind: 'choix' }> }) {
  const right = choice === q.correctIndex;
  const why = choice !== null ? q.options[choice]?.why : undefined;
  return (
    <div className="compare">
      <div className="compare__pair" data-copie>
        {[compare.a, compare.b].map((c) => (
          <div key={c.label} className="compare__case">
            <span className="compare__tag">{c.label}</span>
            <p className="t-math-xl">
              <MathView latex={writingLatex(c.latex)} />
            </p>
          </div>
        ))}
      </div>
      <p className="t-caption compare__note">{compare.note}</p>
      {answered && choice !== null && (
        <div className="compare-feedback">
          <div className={`alert ${right ? 'alert--success' : 'alert--info'}`} role="status">
            <div className="alert__title">{right ? 'Juste.' : "Pas tout à fait, et c'est normal."}</div>
            {why && (
              <div>
                <Bold text={why} />
              </div>
            )}
          </div>
          {compare.line && <LineView line={compare.line} mode="lesson" revealed />}
          {compare.highlight && (
            <div className="compare__pair compare__highlight" data-copie>
              {([compare.a, compare.b] as const).map((c, i) => (
                <div key={c.label} className="compare__case">
                  <span className="compare__tag">{c.label}</span>
                  <p className="t-math-xl">
                    {(i === 0 ? compare.highlight!.a : compare.highlight!.b).map((t, k) =>
                      t.hl ? (
                        <span key={k} className="scene-hl">
                          {t.t}
                        </span>
                      ) : (
                        <span key={k}>{t.t}</span>
                      ),
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
          {compare.after.map((t, i) => (
            <p key={i} className="t-body1">
              <Bold text={t} />
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
