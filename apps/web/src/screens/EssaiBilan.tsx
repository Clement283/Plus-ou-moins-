import { useRoute } from '../router';
import { ReviewSummaryView, type BilanSummary } from './ReviewSummary';

/**
 * Page d'essai du bilan de séance (développement et captures seulement), données de la maquette revisions.html :
 *   #/essai/bilan?cas=encore|faites
 */
const line = (order: number, shortTitle: string, ok: number, label: string) => ({ courseId: `c0${order}`, order, title: shortTitle, shortTitle, ok, total: 3 as const, nextReview: '2026-11-23', label });
const ENCORE: BilanSummary = {
  lines: [line(1, 'Même signe', 3, 'revient dans 1 semaine'), line(2, 'Signes contraires', 3, 'revient dans 2 jours'), line(3, 'Plusieurs relatifs', 3, 'revient dans 1 mois'), line(4, 'Soustraire', 2, 'revient demain'), line(5, 'Multiplier', 2, 'revient demain')],
  firstOk: 13,
  firstTotal: 15,
};
const FAITES: BilanSummary = { lines: [line(6, 'Diviser', 3, 'revient dans 1 semaine'), line(7, 'Multiplier plusieurs', 2, 'revient demain')], firstOk: 5, firstTotal: 6 };
const noop = () => undefined;

export default function EssaiBilan() {
  const route = useRoute();
  const cas = new URLSearchParams((route.name === 'essai' ? route.what : '').split('?')[1] ?? '').get('cas') ?? 'encore';
  return cas === 'faites' ? (
    <ReviewSummaryView summary={FAITES} minutes={16} remaining={null} onMore={noop} onHome={noop} onTrain={noop} />
  ) : (
    <ReviewSummaryView summary={ENCORE} minutes={11} remaining={{ courses: 2, questions: 6, minutes: 2 }} onMore={noop} onHome={noop} onTrain={noop} />
  );
}
