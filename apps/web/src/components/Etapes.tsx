import { useEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from './reducedMotion';
import type { EtapeStep, Scene, SceneToken } from '@pom/engine';
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
function SceneView({ scene, isNew }: { scene: Scene; isNew: boolean }) {
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
        : scene.calcs.map((c, i) => (
            <span key={i} className="stage__calc">
              {c.tag && <span className="scene-tag">{c.tag}</span>}
              <Calc tokens={c.tokens} />
              {c.label && <span className="scene-label">{c.label}</span>}
            </span>
          ))}
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
  const shown = steps.slice(0, k);
  let sceneAt = -1;
  shown.forEach((s, i) => {
    if (s.scene) sceneAt = i;
  });
  const scene = sceneAt >= 0 ? shown[sceneAt]!.scene! : null;
  const last = k >= steps.length;
  const newest = useRef<HTMLDivElement>(null);
  // la phrase qui vient d'apparaître reste visible, même quand les phrases empilées dépassent l'écran
  useEffect(() => {
    if (k > 1) newest.current?.scrollIntoView?.({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [k]);
  return (
    <div className="lesson-screen lesson-screen--etapes">
      <div className="c-body">
        {header && <div className="row">{header}</div>}
        <LessonHeading title={title} />
        {scene && <SceneView key={`${sceneAt}-${replay}`} scene={scene} isNew={sceneAt === k - 1} />}
        {steps.length > 1 && (
          <div className="dots" role="img" aria-label={`Étape ${k} sur ${steps.length}`}>
            {steps.map((_, i) => (
              <i key={i} className={i < k ? 'is-on' : ''} />
            ))}
          </div>
        )}
        <div className="etape-texts" aria-live="polite">
          {shown.map((s, i) => {
            const isNew = i === k - 1;
            return (
              <div key={isNew ? `${i}-${replay}` : i} ref={isNew ? newest : undefined} className={`etape${isNew ? ' is-new' : ''}`}>
                <StepBody step={s} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="c-foot">
        <button className="btn btn--contained btn--block" type="button" onClick={() => (last ? onDone() : setK(k + 1))}>
          {last ? 'Suivant' : 'Suite'}
        </button>
        <button className="btn btn--text" type="button" onClick={() => setReplay(replay + 1)}>
          Revoir
        </button>
      </div>
    </div>
  );
}
