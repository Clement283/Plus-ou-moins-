import type { ReactNode } from 'react';
import { WRITING_TITLE, type Feedback } from '@pom/engine';
import { Icon } from '../ui/Icon';
import { Math } from '../ui/Math';
import { Bold } from './Bold';

/**
 * Le retour après une réponse (maquettes `exercices.html` « Trois états corrigés » et `revisions.html`) :
 * bandeau vert (juste), indigo (pas fini, pas compté faux) ou rouge (faux), puis le bloc « Étape par étape »
 * dont les nombres sont en couleur (explication : les couleurs y sont permises, doc 06).
 * `note` : légende de révision sous le bloc (« Un calcul du même genre reviendra plus loin… »).
 * « Continuer » est posé par l'écran appelant.
 */
export function FeedbackPanel({ feedback: f, note, colorSigns = true }: { feedback: Feedback; note?: string; /** false : pas de couleur de signe dans les calculs corrigés (Cours 0). */ colorSigns?: boolean }) {
  let body: ReactNode;
  switch (f.tone) {
    case 'juste':
      body = (
        <div className="alert alert--success" role="status">
          <Icon name="check-circle" />
          {/* une note qui dit déjà « Juste ! » : elle seule (décision du contrôleur) ; sinon (message d'un choix, d'un « Réécris ») : « Juste ! » puis le message */}
          {f.note && !/^Juste/.test(f.note) ? (
            <>
              <div className="alert__title">{f.title}</div>
              <div>
                <Bold text={f.note} />
              </div>
            </>
          ) : (
            <div className="alert__title">{f.note ?? f.title}</div>
          )}
        </div>
      );
      break;
    case 'pas-fini':
      body = (
        <div className="alert alert--info" role="status">
          <Icon name="info" />
          <div className="alert__title">{f.title}</div>
          <div>{f.message}</div>
        </div>
      );
      break;
    case 'faux': {
      const writing = f.title === WRITING_TITLE;
      const steps = f.explanation?.steps;
      body = (
        <>
          <div className="alert alert--error" role="status">
            <Icon name="x-circle" />
            <div className="alert__title">{f.title}</div>
            <div>
              <Bold text={f.message} />
              {writing && (
                <>
                  <br />
                  <b>
                    La bonne réponse est <Math latex={f.rightLatex} />.
                  </b>
                </>
              )}
            </div>
          </div>
          {steps && steps.length > 0 ? (
            <>
              <div className="resolution-label">Étape par étape</div>
              <div className={steps.every((b) => b.t === 'text') ? 'resolution resolution--text' : 'resolution'} aria-label="Résolution">
                {steps.map((b, i) => (
                  <div key={i} className={i === steps.length - 1 ? 'is-last' : undefined}>
                    {b.t === 'math' ? <Math latex={b.latex} colorize={colorSigns && b.colorize} /> : b.t === 'text' ? <Bold text={b.text} /> : null}
                  </div>
                ))}
              </div>
            </>
          ) : (
            f.steps.length > 0 && (
              <>
                <div className="resolution-label">Étape par étape</div>
                <div className="resolution" aria-label="Résolution">
                  {f.steps.map((l, i) => (
                    <div key={i} className={i === f.steps.length - 1 ? 'is-last' : undefined}>
                      <Math latex={l} />
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </>
      );
      break;
    }
  }
  return (
    <div className="feedback">
      {body}
      {note && <p className="t-caption">{note}</p>}
    </div>
  );
}
