/**
 * Cours 4 (doc 06, maquette `cours.html`) : le « − (− » de 5 − (−3) est entouré, une flèche descend vers
 * 5 + 3, où le « + » est entouré à son tour.
 */
export function MoinsMoinsDevientPlus() {
  return (
    <div className="paper anim anim--stack" data-anim="moins-moins-devient-plus" role="img" aria-label="Le « − (− » de 5 − (−3) devient un « + » : 5 + 3">
      <p className="t-math" aria-hidden="true">
        <span>5</span>{' '}
        <span className="enclosed anim-enc anim-enc--a">
          −&nbsp;(<span className="neg">−</span>
        </span>
        <span className="neg">3</span>)
      </p>
      <span className="anim-arrow" aria-hidden="true" />
      <p className="t-math anim-after" aria-hidden="true">
        <span>5</span> <span className="enclosed anim-enc anim-enc--b">+</span> <span className="pos">3</span>
      </p>
      <p className="t-body2 anim-after anim-after--late">Le « − (− » devient un « + ».</p>
    </div>
  );
}
