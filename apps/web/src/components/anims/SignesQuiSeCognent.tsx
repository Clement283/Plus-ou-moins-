import { staticClass } from './static';
import { Icon } from '../../ui/Icon';

/**
 * Cours 0 (doc 06) : « 4 × −3 » apparaît, le × et le − se cognent (petit choc, croix rouge). Les parenthèses
 * viennent ensuite, dans le bloc suivant de la leçon. Durée : voir `ANIMS`.
 */
export function SignesQuiSeCognent() {
  return (
    <div className={`paper anim${staticClass()}`} data-anim="signes-qui-se-cognent" role="img" aria-label="Le signe × et le signe − se cognent : deux signes ne se suivent jamais">
      <p className="t-math-xl anim-row anim-row--burst" aria-hidden="true">
        <span>4</span>
        <span className="anim-clash anim-clash--l">×</span>
        <span className="anim-clash anim-clash--r neg">−</span>
        <span>3</span>
        <span className="anim-burst">
          <Icon name="x-circle" size="lg" />
        </span>
      </p>
    </div>
  );
}
