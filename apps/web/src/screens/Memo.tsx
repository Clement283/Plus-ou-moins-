import { useRef } from 'react';
import { getCourse } from '@pom/engine';
import { Bold } from '../components/Bold';
import { ListenButton } from '../components/ListenButton';
import { go } from '../router';
import { AppBar } from '../ui/AppBar';

/**
 * Fiche mémo d'un cours (maquette `cours-0-v3.html`, écran « Fiche mémo », version A plein écran).
 * Un écran de leçon : les couleurs y sont permises. Aucun réseau : tout vient du moteur.
 */
export default function Memo({ courseId }: { courseId: string }) {
  const bodyRef = useRef<HTMLElement>(null);
  let course: ReturnType<typeof getCourse> | null = null;
  try {
    course = getCourse(courseId);
  } catch {
    course = null; // fiche inconnue (adresse modifiée à la main) : on affiche « pas de fiche »
  }
  const memo = course?.memo;
  const back = () => go('#/cours');
  return (
    <>
      <AppBar onClose={back} closeLabel="Fermer" trailing={<ListenButton rootRef={bodyRef} />} />
      <main className="app-body" data-screen="fiche" ref={bodyRef}>
        {memo && course ? (
          <>
            <h1 className="t-h3">{`Fiche mémo · Cours ${course.order}`}</h1>
            <div className="fiche">
              <section className="fiche__blk">
                <h2 className="fiche__k">La règle</h2>
                <p className="t-body1">
                  <Bold text={memo.rule} />
                </p>
                {memo.ruleBullets && (
                  <ul>
                    {memo.ruleBullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="fiche__blk">
                <h2 className="fiche__k">Exemples</h2>
                <p className="fiche__ex">
                  {memo.examples.map((e) => (
                    <span key={e}>{e}</span>
                  ))}
                </p>
              </section>
              <section className="fiche__blk fiche__blk--bad">
                <h2 className="fiche__k">L'erreur à éviter</h2>
                <p className="fiche__ex">
                  <span>{memo.mistake.wrong}</span>
                  <span aria-hidden="true"> ✗</span>
                </p>
                <p className="t-body1">{memo.mistake.why}</p>
              </section>
              <section className="fiche__blk">
                <h2 className="fiche__k">L'astuce</h2>
                <p className="t-body1">{memo.tip}</p>
              </section>
            </div>
          </>
        ) : (
          <p className="t-body1">Ce cours n'a pas encore de fiche mémo.</p>
        )}
      </main>
      <div className="app-foot">
        <button className="btn btn--contained btn--block" type="button" onClick={back}>
          Retour
        </button>
      </div>
    </>
  );
}
