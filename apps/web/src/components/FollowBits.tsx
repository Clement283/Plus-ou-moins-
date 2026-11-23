import { useState, type ReactNode } from 'react';
import { getCourse, type WrongCalcul } from '@pom/engine';
import { Icon } from '../ui/Icon';
import { Math as Tex } from '../ui/Math';

/** Textes et petits composants communs aux trois écrans de la page de suivi. */

export const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;
const noon = (day: string) => new Date(`${day}T12:00:00Z`);
const fmt = (day: string, o: Intl.DateTimeFormatOptions) => noon(day).toLocaleDateString('fr-FR', { ...o, timeZone: 'UTC' });

/** « mercredi 25 novembre » */
export const longDate = (day: string) => fmt(day, { weekday: 'long', day: 'numeric', month: 'long' });
/** « 3 novembre », « 1er novembre » */
export const shortDate = (day: string) => fmt(day, { day: 'numeric', month: 'long' });
/** « 21/11 » */
export const ddmm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
export const upperFirst = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
export const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

const daysBetween = (from: string, to: string) => Math.round((noon(to).getTime() - noon(from).getTime()) / 86_400_000);

/** « aujourd'hui », « hier », « jeudi » (moins d'une semaine), sinon « le 12 novembre ». */
export function when(day: string, today: string): string {
  const d = daysBetween(day, today);
  if (d <= 0) return "aujourd'hui";
  if (d === 1) return 'hier';
  if (d < 7) return fmt(day, { weekday: 'long' });
  return `le ${shortDate(day)}`;
}

/** Libellé court d'une révision attendue : « prochaine révision mercredi 25 novembre », « en attente depuis jeudi ». */
export function nextReviewShort(due: string, today: string): string {
  if (due < today) return `en attente depuis ${when(due, today)}`;
  if (due === today) return "à faire aujourd'hui";
  return `prochaine révision ${longDate(due)}`;
}

/** Même chose pour l'écran du cours, avec la date complète. */
export function nextReviewLong(due: string, today: string): string {
  if (due < today) return `en attente depuis ${longDate(due)}`;
  if (due === today) return "à faire aujourd'hui";
  return longDate(due);
}

const WEEKDAY_LETTER = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
export const weekdayLetter = (day: string) => WEEKDAY_LETTER[noon(day).getUTCDay()]!;

export const ERROR_LABELS: Record<string, string> = {
  'signe-inverse': 'Signe inversé',
  'oppose-oublie': 'Opposé oublié',
  'signe-oublie': 'Signe oublié',
  'signe-du-mauvais-nombre': 'Signe du mauvais nombre',
  'soustraction-au-lieu-addition': 'Soustraction au lieu d’une addition',
  'addition-au-lieu-soustraction': 'Addition au lieu d’une soustraction',
  'addition-au-lieu-multiplication': 'Addition au lieu d’une multiplication',
  'multiplication-au-lieu-division': 'Multiplication au lieu d’une division',
  'tout-additionne': 'Tout additionné',
  'terme-oublie': 'Terme oublié',
  'regle-signes': 'Règle des signes',
  'parite-signes': 'Parité des signes',
  'erreur-table': 'Erreur de table',
  'moins-apres': 'Moins après le nombre',
  'signes-colles': 'Deux signes collés',
  'double-signe': 'Deux signes à la suite',
  parenthese: 'Parenthèse mal fermée',
  'ecriture-invalide': 'Écriture invalide',
  autre: 'Autre',
};
export const errorLabel = (type: string) => ERROR_LABELS[type] ?? upperFirst(type.replace(/-/g, ' '));

/** « 3 », « 3 et 4 », « 1, 3 et 4 » */
export function listOrders(ids: string[]): string {
  const n = ids.map((id) => String(getCourse(id).order));
  return n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} et ${n[n.length - 1]}`;
}

/** Détail repliable (un seul toucher sur la ligne). */
export function Acc({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="acc" open={open}>
      <summary
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
      >
        {summary}
        <Icon name="chevron-right" size="sm" className="chev" />
      </summary>
      {open && <div className="acc__body">{children}</div>}
    </details>
  );
}

function Mark({ latex }: { latex: string }) {
  return <Tex latex={latex} />;
}

/** Une ligne d'erreur : le calcul, ce qu'elle a répondu, la bonne réponse, « raté 3 fois, passé ». */
export function ErrItem({ e }: { e: WrongCalcul }) {
  const order = getCourse(e.courseId).order;
  const note = e.failures >= 2 ? `raté ${e.failures} fois${e.passed ? ', passé' : ''}` : e.passed ? 'passé' : '';
  return (
    <li className="err">
      <div className="err__top">
        <span className="err__expr">
          <Mark latex={e.prompt} />
        </span>
        <span className="t-caption">
          {ddmm(e.day)}, cours {order}
        </span>
      </div>
      <p>
        {e.given === '' ? (
          'Elle n’a pas répondu'
        ) : (
          <>
            Elle a répondu{' '}
            <b className="is-wrong">
              <Mark latex={e.given} />
            </b>
          </>
        )}
        , la bonne réponse est{' '}
        <b className="is-good">
          <Mark latex={e.expected} />
        </b>
        .
      </p>
      {note && <span className="chip chip--neutral">{note}</span>}
    </li>
  );
}
