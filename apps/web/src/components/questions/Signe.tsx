import { Qcm } from './Qcm';
import type { QProps } from './Frame';

/** Case « signe du résultat » : deux gros boutons « + » et « − ». C'est un QCM à deux choix, rendu par `Qcm`. */
export function Signe(props: QProps<'qcm'>) {
  return <Qcm {...props} />;
}
