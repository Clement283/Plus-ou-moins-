import { useState, type ReactNode } from 'react';
import { canSubmit, emptyRaw, pressKey, readRaw, type Autres, type AutresEssai, type Key, type RawInput } from '@pom/engine';
import { Icon } from '../ui/Icon';
import { Bold } from './Bold';
import { Keypad } from './Keypad';
import { RawInputView } from './RawInputView';
import { LessonHeading } from './questions/Frame';

interface Result {
  ok: boolean;
  msg: string;
}

/** Le jugement d'un essai libre : seul le résultat est corrigé, jamais la méthode. */
function judgeSaisie(essai: Extract<AutresEssai, { kind: 'saisie' }>, input: RawInput): Result {
  const r = readRaw(input, true);
  if (r.kind !== 'value' || r.value.d !== 1) return { ok: false, msg: 'Ta réponse doit être un seul nombre.' };
  const n = r.value.n;
  if (n === essai.answer) return { ok: true, msg: essai.yes };
  return { ok: false, msg: essai.errors.find((e) => e.values.includes(n))?.message ?? essai.fallback };
}

function Verdict({ result }: { result: Result }) {
  return (
    <div className={`alert ${result.ok ? 'alert--success' : 'alert--error'}`} role="status">
      <Icon name={result.ok ? 'check-circle' : 'x-circle'} />
      <div className="alert__title">{result.ok ? 'Juste !' : 'Pas tout à fait.'}</div>
      <div>
        <Bold text={result.msg} />
      </div>
    </div>
  );
}

/**
 * « Autres façons de faire » (doc 06, Cours 2) : le rappel des règles, puis des techniques en cartes (nom, quand, exemple chiffré,
 * explication). Le choix de la technique se fait avec les boutons du bas (pas en touchant les cartes), un essai libre non noté suit,
 * et on peut continuer sans rien essayer.
 */
export function AutresFacons({ screen, onDone, header }: { screen: Autres; onDone: () => void; header?: ReactNode }) {
  const [sel, setSel] = useState<number | null>(null);
  const [input, setInput] = useState<RawInput>(emptyRaw);
  const [res, setRes] = useState<Result | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const choose = (i: number) => {
    setSel(i);
    setInput(emptyRaw());
    setRes(null);
    setPicked(null);
  };
  const essai = sel === null ? null : screen.techniques[sel]!.essai;

  const foot: ReactNode =
    essai === null ? (
      <div className="autres-actions" data-speak-skip>
        {screen.techniques.map((t, i) => (
          <button key={t.name} type="button" className="btn btn--outlined btn--block" onClick={() => choose(i)}>
            Essayer : {t.name.charAt(0).toLowerCase() + t.name.slice(1)}
          </button>
        ))}
        <button type="button" className="btn btn--contained btn--block" onClick={onDone}>
          Continuer
        </button>
      </div>
    ) : res !== null ? (
      <div className="autres-actions" data-speak-skip>
        {screen.techniques.length > 1 && (
          <button type="button" className="btn btn--outlined btn--block" onClick={() => choose((sel! + 1) % screen.techniques.length)}>
            Essayer l'autre façon
          </button>
        )}
        <button type="button" className="btn btn--contained btn--block" onClick={onDone}>
          Continuer
        </button>
      </div>
    ) : essai.kind === 'saisie' ? (
      <div data-speak-skip>
        <Keypad
          onKey={(k: Key) => setInput((i) => pressKey(i, k))}
          onSubmit={() => canSubmit(input) && setRes(judgeSaisie(essai, input))}
          canSubmit={canSubmit(input)}
        />
      </div>
    ) : (
      <div className="choice-grid" data-speak-skip>
        {essai.options.map((o, i) => (
          <button
            key={o}
            type="button"
            className="choice"
            onClick={() => {
              setPicked(i);
              setRes(i === essai.correct ? { ok: true, msg: essai.yes } : { ok: false, msg: essai.no });
            }}
          >
            {o}
          </button>
        ))}
      </div>
    );

  return (
    <div className="lesson-screen lesson-screen--autres">
      <div className="c-body is-scroll">
        {header && <div className="row">{header}</div>}
        <LessonHeading title={screen.title} />
        {screen.recap && (
          <section className="autres-recap" aria-label={screen.recap.title}>
            <h2 className="t-h6">{screen.recap.title}</h2>
            <ul className="recap">
              {screen.recap.rules.map((r) => (
                <li key={r.title}>
                  <b className="t-h6">{r.title}</b>
                  <span className="recap__ex">
                    <span className="recap__item">
                      <Icon name="check" size="sm" />
                      <span className="sr-only">Juste : </span>
                      {r.ok}
                    </span>
                    <span className="recap__item">
                      <Icon name="close" size="sm" />
                      <span className="sr-only">Faux : </span>
                      {r.ko}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="rule-box">
              <span className="rule-box__n">En une phrase</span>
              <span className="rule-box__t">{screen.recap.sentence}</span>
            </div>
          </section>
        )}
        <p className="t-body1">
          <Bold text={screen.intro} />
        </p>
        <div className="autres-cards">
          {screen.techniques.map((t, i) => (
            <article key={t.name} className={`autres-card${sel === i ? ' is-sel' : ''}`}>
              <h3 className="t-h6">
                {i + 1}. {t.name}
              </h3>
              <p className="t-body2 autres-card__quand">{t.quand}</p>
              <p className="autres-card__ex" data-copie>
                {t.example}
              </p>
              <p className="t-body1">{t.how}</p>
            </article>
          ))}
        </div>
        {essai === null ? (
          <p className="t-caption">Tu peux aussi continuer sans essayer : aucune n'est obligatoire.</p>
        ) : (
          <div className="autres-essai">
            <p className="t-body1">
              <Bold text={essai.consigne} />
            </p>
            <p className="autres-card__ex" data-copie>
              {essai.calc}
            </p>
            {essai.kind === 'saisie' && <RawInputView input={input} state={res ? (res.ok ? 'juste' : 'faux') : 'neutre'} />}
            {essai.kind === 'choix' && picked !== null && <p className="t-body2">Ta réponse : {essai.options[picked]}</p>}
            {res && <Verdict result={res} />}
            <p className="t-caption">Essai libre : il ne compte pas dans la note.</p>
          </div>
        )}
        {screen.outro && (
          <p className="t-body1">
            <Bold text={screen.outro} />
          </p>
        )}
      </div>
      <div className="c-foot">{foot}</div>
    </div>
  );
}
