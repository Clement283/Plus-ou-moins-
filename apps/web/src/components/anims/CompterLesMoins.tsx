import { staticClass } from './static';
/**
 * Cours 7 (doc 06) : dans −2 × 3 × (−4), les signes « − » sont entourés en rouge et comptés, l'un après l'autre.
 */
export function CompterLesMoins() {
  return (
    <div className={`paper anim${staticClass()}`} data-anim="compter-les-moins" role="img" aria-label="Les signes moins de −2 × 3 × (−4) sont entourés et comptés : 1, 2">
      <p className="t-math anim-row anim-row--count" aria-hidden="true">
        <span className="anim-neg anim-neg--1">
          <span className="circled">−</span>
          <i className="count">1</i>
          <span>2</span>
        </span>
        <span>×</span>
        <span>3</span>
        <span>×</span>
        <span className="anim-par">
          (
          <span className="anim-neg anim-neg--2">
            <span className="circled">−</span>
            <i className="count">2</i>
            <span>4</span>
          </span>
          )
        </span>
      </p>
    </div>
  );
}
