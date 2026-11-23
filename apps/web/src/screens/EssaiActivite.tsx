import { useMemo } from 'react';
import { num, op, rat, seededRng, type ActivityItem, type Exercise, type Question } from '@pom/engine';
import { ActivityScreen } from './Activity';
import { useRoute } from '../router';

/**
 * Page d'essai du déroulé d'une activité (développement et captures seulement) : une séance de révisions
 * à calculs fixes, tirage du « même genre » figé.
 *   #/essai/activite?cas=revision|simplifie|ecriture
 */
const C05 = 'c05-multiplier-deux';
const C01 = 'c01-additionner-meme-signe';
const ex = (a: number, b: number, answer: number, courseId = C05, o: '*' | '+' | '/' = '*'): Exercise => ({ courseId, level: 1, expr: op(o, num(a), num(b)), answer: rat(answer) });

/** QCM : l'ordre des choix est fixe (le plus à gauche en premier), `right` = rang de la bonne réponse. */
function qcm(i: number, a: number, b: number, values: number[], wrongTrap: number | null): ActivityItem {
  const answer = a * b;
  const question: Question = {
    kind: 'qcm',
    ex: ex(a, b, answer),
    choices: values.map((v) => ({ value: rat(v), latex: String(v), errorType: v === answer ? null : v === wrongTrap ? 'regle-signes' : 'autre' })),
    correctIndex: values.indexOf(answer),
    formula: 'debut',
  };
  return { type: 'question', itemId: `revision-${i}`, courseId: C05, activity: 'revision', question };
}

function items(cas: string): ActivityItem[] {
  if (cas === 'simplifie') {
    const e = ex(-12, 4, -3, C05, '/');
    return [{ type: 'question', itemId: 'revision-0', courseId: C05, activity: 'revision', question: { kind: 'saisie', ex: e, promptLatex: '\\frac{-12}{4}' } }];
  }
  if (cas === 'ecriture') {
    const e = ex(-3, -5, -8, C01, '+');
    return [{ type: 'question', itemId: 'revision-0', courseId: C01, activity: 'revision', question: { kind: 'saisie', ex: e, promptLatex: '-3 + (-5)' } }];
  }
  return [qcm(0, -3, -4, [-7, 12, 11, -12], -12), qcm(1, 2, 3, [5, 6, -6, 8], null), qcm(2, 4, 2, [6, 8, -8, 2], null), qcm(3, 5, 3, [8, 15, -15, 2], null)];
}

export default function EssaiActivite() {
  const route = useRoute();
  const cas = new URLSearchParams((route.name === 'essai' ? route.what : '').split('?')[1] ?? '').get('cas') ?? 'revision';
  const list = useMemo(() => items(cas), [cas]);
  return (
    <ActivityScreen
      key={cas}
      kind="revision"
      items={list}
      chip={(_, p) => `Révisions, question ${p.n} sur ${p.total}`}
      record={false}
      rng={seededRng(7)}
      activityId="essai"
      confirmQuit={{ title: 'Quitter la séance ?', body: 'Ce que tu as déjà fait est gardé.' }}
      onEnd={() => history.back()}
    />
  );
}
