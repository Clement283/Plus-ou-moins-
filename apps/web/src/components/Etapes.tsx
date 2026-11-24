import { useEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from './reducedMotion';
import type { EtapeStep, Scene, SceneToken } from '@pom/engine';
import { LineView } from './NumberLine';
import { Trou, TrouPhrase } from './etapes/Trou';
import { Graduation } from './etapes/Graduation';
import { Morceau } from './etapes/Morceau';
import { Comprends } from './etapes/Comprends';
import { Icon } from '../ui/Icon';
import { Bold } from './Bold';
import { LessonHeading } from './questions/Frame';

/** Un morceau de calcul de la scène : surligneur (`hl`, « regarde ici »), animation (`anim`), estompé (`dim`). */
function Token({ t }: { t: SceneToken }) {
  const cls = [t.hl ? 'scene-hl' : '', t.anim ? `anim-${t.anim}` : '', t.dim ? 'scene-dim' : ''].filter(Boolean).join(' ');
  return cls ? <span className={cls}>{t.t}</span> : <>{t.t}</>;
}

function Calc({ tokens }: { tokens: SceneToken[] }) {
  return (
    <span>
      {tokens.map((t, i) => (
        <Token key={i} t={t} />
      ))}
    </span>
  );
}

/** La grande zone de calcul : un calcul, plusieurs côte à côte (`row`) ou des paires mal écrit → bien écrit (`pairs`). */
function SceneView({
  scene,
  isNew,
  lineNode,
  calcOverride,
  grey,
  revealed,
  replay,
}: {
  scene: Scene;
  isNew: boolean;
  lineNode?: ReactNode;
  calcOverride?: { index: number; node: ReactNode };
  grey?: boolean;
  revealed?: boolean;
  replay?: number;
}) {
  const pairs: Scene['calcs'][] = [];
  if (scene.layout === 'pairs') for (let i = 0; i < scene.calcs.length; i += 2) pairs.push(scene.calcs.slice(i, i + 2));
  // un seul signe (« − ») : on le montre en très grand
  const glyph = scene.layout === 'one' && scene.calcs.length === 1 && scene.calcs[0]!.tokens.map((t) => t.t).join('').trim().length <= 2;
  return (
    <div className={`stage stage--${scene.layout}${glyph ? ' stage--glyph' : ''}${isNew ? ' is-new' : ''}`} data-scene>
      {scene.layout === 'pairs'
        ? pairs.map((pair, i) => (
            <div key={i} className="stage__pair">
              {pair.map((c, k) => (
                <span key={k} style={{ display: 'contents' }}>
                  {k === 1 && (
                    <span className="stage__arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                  <span className="stage__calc">
                    {c.tag && <span className="scene-tag">{c.tag}</span>}
                    <Calc tokens={c.tokens} />
                  </span>
                </span>
              ))}
            </div>
          ))
        : scene.calcs.map((c, i) =>
            calcOverride?.index === i ? (
              <span key={i} className="stage__calc">
                {calcOverride.node}
              </span>
            ) : (
              <span key={i} className={`stage__calc${scene.layout === 'lines' && i === scene.calcs.length - 1 ? ' stage__calc--last' : ''}`}>
                {c.tag && <span className="scene-tag">{c.tag}</span>}
                <Calc tokens={c.tokens} />
                {c.label && <span className="scene-label">{c.label}</span>}
              </span>
            ),
          )}
      {scene.line && (lineNode ?? <LineView line={grey ? { ...scene.line, tone: 'neutral' } : scene.line} revealed={revealed} replay={replay} />)}
      {scene.caption && <span className="scene-cap">{scene.caption}</span>}
    </div>
  );
}

function StepBody({ step }: { step: EtapeStep }) {
  return (
    <>
      {step.text && (
        <p className="t-body1">
          <Bold text={step.text} />
        </p>
      )}
      {step.rule && (
        <div className="rule-box">
          <span className="rule-box__n">Règle {step.rule.n}</span>
          <span className="rule-box__t">
            <Bold text={step.rule.text} />
          </span>
        </div>
      )}
      {step.recap && (
        <ul className="recap">
          {step.recap.map((r, i) => (
            <li key={i}>
              <b className="t-h6">{r.title}</b>
              <span className="recap__ex">
                <span className="recap__item">
                  <Icon name="check" size="sm" />
                  <span className="sr-only">Bien écrit : </span>
                  {r.ok}
                </span>
                <span className="recap__item">
                  {!r.koLabel && <Icon name="close" size="sm" />}
                  <span className="sr-only">Mal écrit : </span>
                  {r.ko}
                  {r.koLabel && <span className="recap__label">{r.koLabel}</span>}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * Une explication pas à pas (doc 08 n° 20, maquette cours-0-v2) : la scène reste en haut et se transforme, les phrases
 * s'empilent dessous (les anciennes en gris), « Suite » montre l'étape suivante puis devient « Suivant ». « Revoir »
 * rejoue l'animation de l'étape affichée (remontage par `key`).
 */
export function Etapes({ title, steps, onDone, header }: { title: string; steps: EtapeStep[]; onDone: () => void; header?: ReactNode }) {
  const [k, setK] = useState(1);
  const [replay, setReplay] = useState(0);
  const [solved, setSolved] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(false);
  const shown = steps.slice(0, k);
  let sceneAt = -1;
  shown.forEach((s, i) => {
    if (s.scene) sceneAt = i;
  });
  const scene = sceneAt >= 0 ? shown[sceneAt]!.scene! : null;
  const last = k >= steps.length;
  const cur = steps[k - 1]!;
  const action = cur.action;
  const open = action !== undefined && !solved.includes(k - 1);
  const firstGrad = steps.findIndex((s) => s.action?.type === 'graduation');
  const solve = (i: number) => setSolved((s) => (s.includes(i) ? s : [...s, i]));
  const next = () => (last ? onDone() : setK(k + 1));
  // la phrase de l'étape : celle du trou ouvert, le texte rempli une fois résolu ; les actions de toucher cachent le texte jusqu'au bon geste
  const hasSentence = (s: EtapeStep, i: number) => (s.action?.type === 'trou' && !solved.includes(i) ? true : !!s.text && (!s.action || s.action.type === 'comprends' || s.action.type === 'trou' || solved.includes(i)));
  const sentenceIdx = shown.map((s, i) => (hasSentence(s, i) ? i : -1)).filter((i) => i >= 0);
  const foldedIdx = new Set(expanded ? [] : sentenceIdx.slice(0, Math.max(0, sentenceIdx.length - 2)));
  const canFold = sentenceIdx.length > 2;
  const newest = useRef<HTMLDivElement>(null);
  // la phrase qui vient d'apparaître reste visible, même quand les phrases empilées dépassent l'écran
  useEffect(() => {
    if (k > 1) newest.current?.scrollIntoView?.({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [k]);

  const greyed = open && (action?.type === 'trou' || action?.type === 'graduation');
  let lineNode: ReactNode;
  let calcOverride: { index: number; node: ReactNode } | undefined;
  if (open && scene && action?.type === 'graduation' && scene.line) {
    lineNode = <Graduation key={k} line={scene.line} action={action} hand={firstGrad === k - 1} replay={replay} onSolved={() => solve(k - 1)} />;
  } else if (open && scene && (action?.type === 'morceau' || action?.type === 'endroit') && scene.calcs[action.calc]) {
    calcOverride = { index: action.calc, node: <Morceau key={k} tokens={scene.calcs[action.calc]!.tokens} action={action} onSolved={() => solve(k - 1)} /> };
  }
  const solvedHere = solved.includes(k - 1) || !open;
  return (
    <div className="lesson-screen lesson-screen--etapes">
      <div className="c-body">
        {header && <div className="row">{header}</div>}
        <LessonHeading title={title} />
        {scene && (
          <SceneView
            key={`${sceneAt}-${replay}`}
            scene={scene}
            isNew={sceneAt === k - 1}
            lineNode={lineNode}
            calcOverride={calcOverride}
            grey={greyed}
            revealed={solvedHere}
            replay={replay}
          />
        )}
        {steps.length > 1 && (
          <div className="dots" role="img" aria-label={`Étape ${k} sur ${steps.length}`}>
            {steps.map((_, i) => (
              <i key={i} className={i < k ? 'is-on' : ''} />
            ))}
          </div>
        )}
        {canFold && (
          <button className="btn btn--text etape-fold" type="button" data-speak-skip aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Replier le début' : 'Relire le début'}
          </button>
        )}
        <div className="etape-texts" aria-live="polite">
          {shown.map((s, i) => {
            const isNew = i === k - 1;
            const folded = foldedIdx.has(i);
            const isOpenTrou = s.action?.type === 'trou' && !solved.includes(i);
            const body = isOpenTrou ? (
              <p className="t-body1">
                <TrouPhrase open={(s.action as Extract<NonNullable<EtapeStep['action']>, { type: 'trou' }>).open} />
              </p>
            ) : hasSentence(s, i) || (!s.text && (s.rule || s.recap)) ? (
              <StepBody step={s} />
            ) : null;
            if (!body) return null;
            return (
              <div
                key={isNew ? `${i}-${replay}` : i}
                ref={isNew ? newest : undefined}
                className={`etape${isNew ? ' is-new' : ''}${folded ? ' is-folded' : ''}`}
                hidden={folded}
                {...(folded ? { 'data-speak-skip': '' } : {})}
              >
                {body}
              </div>
            );
          })}
        </div>
      </div>
      <div className="c-foot">
        {open && action?.type === 'trou' ? (
          <Trou key={k} action={action} onSolved={() => solve(k - 1)} />
        ) : open && action?.type === 'comprends' ? (
          <Comprends
            label={action.label}
            onClick={() => {
              solve(k - 1);
              next();
            }}
          />
        ) : open ? null : (
          <button className="btn btn--contained btn--block" type="button" onClick={next}>
            {last ? 'Suivant' : 'Suite'}
          </button>
        )}
        <button className="btn btn--text" type="button" aria-label="Revoir cette étape" data-speak-skip onClick={() => setReplay(replay + 1)}>
          Revoir
        </button>
      </div>
    </div>
  );
}
