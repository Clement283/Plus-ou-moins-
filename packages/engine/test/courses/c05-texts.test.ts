import { describe, expect, it } from 'vitest';
import { c05 } from '../../src/courses/calculs/c05-multiplier-deux';
import { checkAnswer, courseRunItems, createActivity, current, answer, explanationDone, isDone, seededRng } from '../../src';
import type { ActivityState } from '../../src';
import type { Answer, Question } from '../../src/exercises/types';
import type { EtapeStep, LessonPart } from '../../src/courses/types';
import { feedbackFor } from '../../src/feedback';
import { buildQuestion, buildSlot } from '../../src/exercises/build';
import { exOf } from './helpers';

// Textes du Cours 5 v2 (mode autonome, fiche courte du doc 06), mot pour mot.

const part = (i: number): LessonPart => c05.parts[i] as LessonPart;
const stepsOf = (i: number): EtapeStep[] => (part(i) as Extract<LessonPart, { type: 'etapes' }>).steps;
const pratiqueQ = (k: number): Question => (part(8) as Extract<LessonPart, { type: 'pratique' }>).questions[k]!.question;
const pratiqueTexts = (k: number) => (part(8) as Extract<LessonPart, { type: 'pratique' }>).questions[k]!.texts;
const qOf = (i: number): Question => (part(i) as Extract<LessonPart, { type: 'question' }>).question;
const trouAt = (i: number, k: number) => {
  const a = stepsOf(i)[k]?.action;
  if (a?.type !== 'trou') throw new Error('trou attendu');
  return a;
};
const choixAt = (i: number) => {
  const q = qOf(i);
  if (q.kind !== 'choix') throw new Error('choix');
  return q;
};

function say(q: Question, a: Answer): string | null {
  const o = checkAnswer(c05, q, a);
  return c05.feedbackText?.(q, o) ?? null;
}
const typed = (n: number): Answer => ({
  raw: { tokens: [...(n < 0 ? `-${-n}` : String(n))].map((c) => ({ t: 'c' as const, c: c as '-' })), cursor: 'root' as const },
});
const saisieOf = (display: string, level: 1 | 2 | 3 = 1): Question => ({ kind: 'saisie', ex: exOf(c05, display, level), promptLatex: '' }) as Question;

const MOINS_MOINS = (calc: string, sum: string, r: string) =>
  `Deux nombres négatifs multipliés donnent un **positif**. Ce n'est pas comme l'addition, où ${sum} reste négatif : ici, ${calc} = ${r}.`;
const PLUS_GRAND = (calc: string, r: string) =>
  `« Le signe du plus grand », c'est la règle de l'**addition**. Pour multiplier, des signes contraires donnent toujours un **négatif** : ${calc} = ${r}.`;
const OUBLI = (a: string, b: string, calc: string, r: string) =>
  `Il manque le signe : ${a} et ${b} ont des signes contraires, le résultat est **négatif** : ${calc} = ${r}.`;
const ADD = (a: number, b: number) => `Ici, c'est une **multiplication** : × et pas +. ${a} × ${b} = ${a * b}, et non ${a} + ${b} = ${a + b}.`;
const TABLE = (a: number, b: number) => `Le signe est bon ! Vérifie la multiplication : ${a} × ${b} = ${a * b}.`;

describe('Cours 5 v2 — textes des écrans', () => {
  it('accroche : titre, deux phrases, 3 choix et leurs messages', () => {
    const t = part(0);
    expect(t.type === 'question' && t.title).toBe('Multiplier deux nombres relatifs');
    expect(t.type === 'question' && t.intro).toEqual([
      'Tu sais **additionner** et **soustraire** des nombres relatifs. Maintenant, tu vas les **multiplier**, par exemple 3 × (−2) ou −3 × (−4).',
      "Bonne nouvelle : la règle des signes est **plus simple** que pour l'addition. Mais elle n'est **pas la même** : c'est là qu'est le piège.",
    ]);
    expect(t.type === 'question' && t.mention).toBe('Question pour découvrir : elle ne compte pas dans la note.');
    const q = choixAt(0);
    expect(q.calcLatex).toBe('-3 \\times (-4)');
    expect(q.prompt).toBe('Pour commencer, à ton avis : combien vaut ce produit ?');
    expect(q.options.map((o) => o.label)).toEqual(['12', '−12', '−7']);
    expect(q.correctIndex).toBe(0);
    expect(q.options.map((o) => o.why)).toEqual([
      "Bonne intuition : deux nombres négatifs multipliés donnent un positif. Le cours va t'expliquer pourquoi.",
      "Beaucoup d'élèves le pensent, car en addition −3 + (−4) reste négatif. Pour la multiplication, c'est différent : le cours va t'expliquer pourquoi.",
      "−7, c'est −3 + (−4) : une addition. Ici, on multiplie : 3 × 4 = 12, et le cours va t'expliquer quel signe mettre.",
    ]);
  });

  it('l’idée de départ : multiplier, c’est répéter ; la suite qui monte de 2', () => {
    const p = part(1);
    expect(p.type === 'etapes' && p.title).toBe("Multiplier, c'est répéter");
    const s = stepsOf(1);
    expect(s).toHaveLength(5);
    expect(s[0]?.text).toBe("3 × 2, c'est 2 + 2 + 2 = 6 : multiplier par 3, c'est **ajouter 3 fois** le même nombre.");
    expect(s[1]?.text).toBe("De même, 3 × (−2), c'est **3 dettes de 2 €** : (−2) + (−2) + (−2).");
    const a = trouAt(1, 2);
    expect([a.open, a.choices, a.correct, a.errors]).toEqual([
      "Trois dettes de 2 €, c'est une dette de 6 € : 3 × (−2) = [ ? ].",
      ['−6', '6', '1'],
      0,
      {
        1: "6, ce serait un gain de 6 €. Ici, on ajoute trois dettes : on doit 6 €, c'est −6.",
        2: "1, c'est 3 + (−2) : tu as additionné les deux nombres. Ici, on ajoute trois fois −2 : (−2) + (−2) + (−2) = −6.",
      },
    ]);
    expect(s[2]?.text).toBe("Trois dettes de 2 €, c'est une **dette de 6 €** : 3 × (−2) = **−6**. Un positif fois un négatif donne un **négatif**.");
    expect(s[3]?.text).toBe('Et −1 × (−2) ? On ne peut pas ajouter « −1 fois ». Regarde plutôt la suite : quand le premier nombre baisse de 1, le résultat **monte de 2**.');
    expect(s[3]?.scene?.calcs.map((c) => c.tokens.map((t) => t.t).join(''))).toEqual(['3 × (−2) = −6', '2 × (−2) = −4', '1 × (−2) = −2']);
    const b = trouAt(1, 4);
    expect([b.open, b.choices, b.correct, b.errors]).toEqual([
      'Après 1 × (−2) = −2 vient 0 × (−2) = 0. Le résultat monte encore de 2 : −1 × (−2) = [ ? ].',
      ['2', '−2', '0'],
      0,
      {
        1: '−2, c\'est le résultat de 1 × (−2), deux lignes plus haut. Le résultat monte de 2 à chaque ligne : après 0 vient 2.',
        2: "0, c'est 0 × (−2). Une ligne plus bas, le résultat monte encore de 2 : 0 + 2 = 2.",
      },
    ]);
    expect(s[4]?.text).toBe('Après 1 × (−2) = −2 vient 0 × (−2) = 0. Le résultat monte encore de 2 : −1 × (−2) = **2**. Deux négatifs donnent un **positif**.');
    expect(s[4]?.after?.calcs[2]?.tokens).toEqual([{ t: '−1 × (−2) = ' }, { t: '2', hl: true }]);
  });

  it('règle 1 « Le signe du produit » : deux phrases à trous, le tableau des signes, l’encadré', () => {
    const p = part(2);
    expect(p.type === 'etapes' && p.title).toBe('Le signe du produit');
    const s = stepsOf(2);
    expect(s).toHaveLength(5);
    expect(s[0]?.text).toBe('Tu l\'as vu : 3 × (−2) = −6 et −1 × (−2) = 2. Le signe du résultat dépend seulement des **signes des deux nombres**.');
    const a = trouAt(2, 1);
    expect([a.open, a.choices, a.errors]).toEqual([
      '−4 × (−5) : les deux nombres ont le même signe, donc le résultat est [ ? ].',
      ['positif', 'négatif'],
      { 1: "Deux négatifs multipliés donnent un positif, comme −1 × (−2) = 2. Attention : c'est le contraire de l'addition, où −4 + (−5) reste négatif." },
    ]);
    expect(s[1]?.text).toBe('−4 × (−5) : les deux nombres ont le **même signe**, donc le résultat est **positif** : −4 × (−5) = 20.');
    expect(s[2]?.text).toBe('6 × (−7) : les signes sont **contraires**, donc le résultat est **négatif** : 6 × (−7) = −42.');
    const b = trouAt(2, 3);
    expect([b.open, b.choices, b.errors]).toEqual([
      '7 × (−2) : les signes sont contraires. 7 est le plus grand, mais le résultat est [ ? ].',
      ['négatif', 'positif'],
      { 1: "« Le signe du plus grand », c'est la règle de l'addition (Cours 2). Pour multiplier, des signes contraires donnent toujours un négatif : 7 × (−2) = −14." },
    ]);
    expect(s[3]?.text).toBe('7 × (−2) : les signes sont contraires. 7 est le plus grand, mais le résultat est **négatif** : −14. Ici, le plus grand ne compte pas.');
    expect(s[4]?.scene?.calcs.map((c) => c.tokens.map((t) => t.t).join(''))).toEqual(['+ × + = +', '− × − = +', '+ × − = −', '− × + = −']);
    expect(s[4]?.rule).toEqual({ n: 1, text: '**Même signe : le produit est positif. Signes contraires : le produit est négatif.**' });
  });

  it('règle 2 « Les nombres d’abord, le signe ensuite » (technique 2 du plan)', () => {
    const p = part(3);
    expect(p.type === 'etapes' && p.title).toBe("Les nombres d'abord, le signe ensuite");
    const s = stepsOf(3);
    expect(s).toHaveLength(4);
    expect(s[0]?.text).toBe("Pour ne faire **qu'une chose à la fois**, on coupe le calcul en deux : d'abord les nombres **sans leur signe**, ensuite le signe.");
    const a = trouAt(3, 1);
    expect([a.open, a.choices, a.errors]).toEqual([
      'Les nombres sans leur signe : 8 × 5 = [ ? ].',
      ['40', '13', '45'],
      { 1: "13, c'est 8 + 5 : tu as additionné. Ici, on multiplie : 8 × 5 = 40.", 2: "45, c'est 9 × 5. Revois la table de 5 : 8 × 5 = 40." },
    ]);
    expect(s[1]?.text).toBe('Les nombres sans leur signe : 8 × 5 = **40**.');
    const b = trouAt(3, 2);
    expect([b.open, b.choices, b.errors]).toEqual([
      'Le signe ensuite : −8 et 5 ont des signes contraires, donc −8 × 5 = [ ? ].',
      ['−40', '40'],
      { 1: '40 est le bon nombre, mais il manque le signe : −8 et 5 ont des signes contraires, le résultat est négatif.' },
    ]);
    expect(s[2]?.text).toBe('Le signe ensuite : −8 et 5 ont des signes contraires, donc −8 × 5 = **−40**.');
    expect(s[3]?.rule).toEqual({ n: 2, text: '**Je multiplie les nombres sans leur signe, puis je mets le signe du produit.**' });
  });

  it('comparer : A (ce cours) et B (Cours 4), la règle des signes de l’addition n’est pas celle de la multiplication', () => {
    const t = part(6);
    if (t.type !== 'question') throw new Error('question');
    expect(t.title).toBe('Comparer deux cas');
    expect(t.intro).toEqual(["Voici deux calculs qui se ressemblent. Regarde bien l'opération."]);
    expect([t.compare?.a.latex, t.compare?.b.latex]).toEqual(['-3 \\times (-4)', '-3 - 4']);
    expect(t.compare?.line).toBeUndefined();
    expect(t.compare?.highlight?.a.filter((x) => x.hl).map((x) => x.t)).toEqual(['×']);
    expect(t.compare?.highlight?.b.filter((x) => x.hl).map((x) => x.t)).toEqual(['−']);
    expect(t.compare?.after).toEqual([
      'A : −3 × (−4) = 12. Deux négatifs **multipliés** donnent un **positif**.',
      'B : −3 − 4 = −3 + (−4) = −7. Deux négatifs **additionnés** donnent un **négatif** (Cours 1 et 4).',
      "Le piège : la règle des signes de l'**addition** n'est pas celle de la **multiplication**. Avant de chercher le signe, regarde bien l'opération.",
    ]);
    expect(t.mention).toBe('Question pour comprendre : elle ne compte pas dans la note.');
    const q = choixAt(6);
    expect(q.prompt).toBe('Quel est le signe de chaque résultat ?');
    expect(q.options.map((o) => o.label)).toEqual(['A positif, B négatif', 'Les deux négatifs', 'Les deux positifs']);
    expect(q.correctIndex).toBe(0);
    expect(q.options.map((o) => o.why)).toEqual([
      '−3 × (−4) = 12 : deux négatifs multipliés donnent un positif. −3 − 4 = −3 + (−4) = −7 : deux négatifs additionnés restent négatifs.',
      'Pour B, oui : −3 − 4 = −3 + (−4) = −7. Mais A est une multiplication : deux négatifs multipliés donnent un positif, 12.',
      'Pour A, oui : −3 × (−4) = 12. Mais B est une soustraction : −3 − 4 = −3 + (−4) = −7, un négatif.',
    ]);
  });

  it('exemple 1 : la ligne expliquée, puis « Je comprends », puis la case du résultat', () => {
    const s = stepsOf(9);
    expect(s[0]?.text).toBe('Voici la résolution. Lis la première ligne, puis touche « Je comprends ».');
    expect(s[1]?.text).toBe("Même signe : le résultat est **positif**. On écrit d'abord ce signe, puis le produit des nombres sans leur signe.");
    expect(s.filter((x) => x.action?.type === 'comprends')).toHaveLength(1);
    const t = part(10);
    expect(t.type === 'question' && [t.consigne, t.above, t.help]).toEqual([
      'Tape ce qui manque dans la case, avec les touches du clavier.',
      ['= +(5 \\times 8)'],
      "Dernière ligne. Calcule 5 × 8, avec le signe trouvé. Tu peux t'aider de la ligne du dessus.",
    ]);
  });

  it('exemple 2 : deux cases, le signe (non noté) puis le résultat', () => {
    const c1 = part(11);
    expect(c1.type === 'question' && [c1.consigne, c1.intro, c1.question.kind]).toEqual([
      'Touche le signe du résultat.',
      ["Cette fois, deux cases sont à toi. Trouve d'abord le signe du résultat, puis calcule."],
      'qcm',
    ]);
    const c2 = part(12);
    expect(c2.type === 'question' && c2.above).toEqual(['= -(9 \\times 6)']);
  });

  it('annonce de la fin : même texte que les Cours 0 à 4', () => {
    expect(stepsOf(13).map((s) => s.text)).toEqual([
      "Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle.",
      'Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.',
      "Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon.",
    ]);
  });

  it('jamais plus de 2 étapes de lecture d’affilée sans action', () => {
    for (const i of [1, 2, 3, 9]) {
      let run = 0;
      for (const s of stepsOf(i)) {
        run = s.action || s.rule ? 0 : run + 1;
        expect(run, `partie ${i}`).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('Cours 5 v2 — petites questions des règles', () => {
  it('règle 1 : le signe de −6 × (−3)', () => {
    const q = choixAt(4);
    expect(q.small).toBe(true);
    expect(q.calcLatex).toBe('-6 \\times (-3)');
    expect(q.prompt).toBe('Quel est le signe du résultat ?');
    expect(q.options.map((o) => o.label)).toEqual(['Positif', 'Négatif', 'On ne peut pas savoir']);
    expect(q.correctIndex).toBe(0);
    expect(q.options.map((o) => o.why)).toEqual([
      'Même signe : deux négatifs donnent un positif. 6 × 3 = 18, donc −6 × (−3) = 18.',
      "C'est la règle de l'addition : −6 + (−3) reste négatif. Pour multiplier, le même signe donne un positif : 18.",
      'On peut savoir sans calculer : il suffit de regarder les deux signes. Ici, ils sont pareils : le résultat est positif.',
    ]);
  });
  it('règle 2 : le résultat de 4 × (−9)', () => {
    const q = choixAt(5);
    expect(q.small).toBe(true);
    expect(q.calcLatex).toBe('4 \\times (-9)');
    expect(q.options.map((o) => o.label)).toEqual(['−36', '36', '−13']);
    expect(q.correctIndex).toBe(0);
    expect(q.options.map((o) => o.why)).toEqual([
      "Les nombres d'abord : 4 × 9 = 36. Puis le signe : signes contraires, le résultat est négatif : −36.",
      "4 × 9 = 36, c'est juste, mais il manque le signe : 4 et −9 ont des signes contraires, le résultat est négatif.",
      "−13, c'est −(4 + 9) : tu as additionné les nombres. Ici, on multiplie : 4 × 9 = 36, puis le signe −.",
    ]);
  });
});

describe('Cours 5 v2 — « Autres façons de faire »', () => {
  const p = part(7);
  if (p.type !== 'autres') throw new Error('autres');
  it('le rappel des 2 règles en haut, puis deux techniques (3 et 4 du plan)', () => {
    expect(p.recap).toEqual({
      title: 'Les 2 règles à retenir',
      rules: [
        { title: '1. Même signe : positif. Signes contraires : négatif.', ok: '−3 × (−4) = 12', ko: '−3 × (−4) = −12' },
        { title: '2. Je multiplie les nombres sans leur signe, puis je mets le signe.', ok: '6 × (−7) = −42', ko: '6 × (−7) = −13' },
      ],
      sentence: 'Je multiplie les nombres sans leur signe, puis je mets le signe : même signe, positif ; signes contraires, négatif.',
    });
    expect(p.intro).toBe('La méthode marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**.');
    expect(p.techniques.map((t) => [t.name, t.quand, t.example])).toEqual([
      ["Calcul mental d'un produit", 'Quand un des nombres a deux chiffres.', '7 × (−12) : 7 × 10 = 70 et 7 × 2 = 14, donc 7 × 12 = 84 ; le résultat est −84'],
      ["Multiplier par −1, c'est prendre l'opposé", 'Quand un des nombres est −1.', '−1 × 7 = −7 ; −1 × (−5) = 5'],
    ]);
    expect(p.techniques.map((t) => t.how)).toEqual([
      "On coupe le nombre à deux chiffres en dizaines et unités : 12 = 10 + 2. On multiplie chaque morceau, puis on additionne. Le signe se met à la fin, comme d'habitude.",
      "Multiplier par 1 ne change rien. Multiplier par −1 change seulement le signe : on obtient l'opposé du nombre.",
    ]);
    expect(p.outro).toBe("Ensuite, tu t'entraînes avec quatre questions.");
  });
  it('essais libres : bonne réponse et un message par erreur', () => {
    const [a, b] = p.techniques.map((t) => t.essai);
    expect(a).toMatchObject({
      kind: 'saisie',
      consigne: 'Essaie avec −6 × 13 : calcule 6 × 10 et 6 × 3, additionne, puis mets le signe. **Tape le résultat.**',
      calc: '−6 × 13',
      answer: -78,
      yes: '6 × 10 = 60 et 6 × 3 = 18 : 60 + 18 = 78. Signes contraires : −78.',
      fallback: '6 × 13 = 60 + 18 = 78, puis le signe − : −78.',
    });
    expect(a?.kind === 'saisie' && a.errors).toEqual([
      { values: [78], message: 'Le nombre est bon, mais pas le signe : −6 et 13 ont des signes contraires, le résultat est négatif.' },
      { values: [19, -19], message: "19, c'est 6 + 13 : tu as additionné. Ici, on multiplie : 6 × 13 = 60 + 18 = 78, puis le signe −." },
      { values: [63, -63], message: 'Tu as fait 6 × 10 + 3. Il faut multiplier les deux morceaux : 6 × 10 = 60 et 6 × 3 = 18, puis additionner.' },
    ]);
    expect(b).toEqual({
      kind: 'choix',
      consigne: 'Calcule −1 × (−8). **Touche ce que tu trouves.**',
      calc: '−1 × (−8)',
      options: ['8', '−8', '−9'],
      correct: 0,
      yes: "Multiplier par −1 donne l'opposé : l'opposé de −8 est 8. Et deux négatifs donnent bien un positif.",
      no: "Multiplier par −1, c'est prendre l'opposé : −8 devient 8. Deux nombres négatifs donnent un positif.",
    });
  });
});

describe('Cours 5 v2 — série de pratique (feedbackText)', () => {
  it('Q1 : le signe est déjà écrit, taper le résultat de −7 × (−3)', () => {
    const q = pratiqueQ(0);
    expect(pratiqueTexts(0)).toEqual({ consigne: 'Le signe est déjà trouvé. **Tape le résultat dans la case.**', above: ['= +(7 \\times 3)'] });
    expect(q.kind === 'trou' && [q.promptLatex, q.hidden.n]).toEqual(['= \\square', 21]);
    expect(say(q, typed(21))).toBe('7 × 3 = 21, et le signe + est déjà écrit : 21.');
    expect(say(q, typed(-21))).toBe('Le signe est déjà trouvé, sur la ligne du dessus : même signe, le résultat est positif. 7 × 3 = 21, donc 21.');
    expect(say(q, typed(10))).toBe(ADD(7, 3));
    expect(say(q, typed(24))).toBe(TABLE(7, 3));
    expect(say(q, typed(22))).toBe("D'abord les nombres sans leur signe : 7 × 3 = 21. Puis le signe : même signe, le résultat est positif. Donc 21.");
  });
  it('Q2 : le signe de 8 × (−6), sans calculer', () => {
    const q = pratiqueQ(1);
    expect(pratiqueTexts(1)).toEqual({ consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] });
    expect(say(q, { choice: 1 })).toBe('8 × (−6) : signes contraires, le résultat est négatif. 8 × 6 = 48, donc −48.');
    expect(say(q, { choice: 0 })).toBe(PLUS_GRAND('8 × (−6)', '−48'));
    expect(checkAnswer(c05, q, { choice: 0 }).errorType).toBe('regle-signes');
  });
  it('Q3 : une question du Cours 4, −4 − 3', () => {
    const q = pratiqueQ(2);
    expect(pratiqueTexts(2)?.consigne).toBe("Regarde bien l'opération, puis touche le résultat.");
    if (q.kind !== 'choix') throw new Error('choix');
    expect(q.calcLatex).toBe('-4 - 3');
    expect(q.options.map((o) => o.label)).toEqual(['−7', '12', '−1']);
    expect(q.options.map((o) => o.why)).toEqual([
      'Ce calcul est une soustraction (Cours 4) : −4 − 3 = −4 + (−3). Même signe : 4 + 3 = 7, et je garde le signe − : −7.',
      "12, c'est −4 × (−3) : tu as multiplié. Regarde bien l'opération : c'est une soustraction. −4 − 3 = −4 + (−3) = −7.",
      'Soustraire 3, c\'est ajouter −3, pas 3 : −4 − 3 = −4 + (−3) = −7.',
    ]);
    expect(checkAnswer(c05, q, { choice: 0 }).correct).toBe(true);
  });
  it('Q4 : taper −6 × (−7), sans aide', () => {
    const q = pratiqueQ(3);
    expect(pratiqueTexts(3)?.consigne).toBe('Calcule. **Tape le résultat.**');
    expect(say(q, typed(42))).toBe('−6 × (−7) : même signe, le résultat est positif. 6 × 7 = 42, donc 42.');
    expect(say(q, typed(-42))).toBe(MOINS_MOINS('−6 × (−7)', '−6 + (−7)', '42'));
    expect(say(q, typed(-13))).toBe(ADD(6, 7));
    expect(say(q, typed(13))).toBe(ADD(6, 7));
    expect(say(q, typed(48))).toBe(TABLE(6, 7));
    expect(say(q, typed(40))).toBe("D'abord les nombres sans leur signe : 6 × 7 = 42. Puis le signe : même signe, le résultat est positif. Donc 42.");
  });
  it('feedbackFor : le texte du cours remplace le message du moteur', () => {
    const q = pratiqueQ(3);
    const a = typed(-42);
    expect(feedbackFor(c05, q, a, checkAnswer(c05, q, a))).toMatchObject({ tone: 'faux', message: MOINS_MOINS('−6 × (−7)', '−6 + (−7)', '42') });
  });
});

describe('Cours 5 v2 — exemples guidés (feedbackText)', () => {
  it('exemple 1, dernière ligne de −5 × (−8)', () => {
    const q = qOf(10);
    expect(say(q, typed(40))).toBe('−5 × (−8) : même signe, le résultat est positif. 5 × 8 = 40, donc 40.');
    expect(say(q, typed(-40))).toBe(MOINS_MOINS('−5 × (−8)', '−5 + (−8)', '40'));
    expect(say(q, typed(13))).toBe(ADD(5, 8));
    expect(say(q, typed(45))).toBe(TABLE(5, 8));
  });
  it('exemple 2, case 1 (non notée) : le signe de 9 × (−6)', () => {
    const q = qOf(11);
    expect(say(q, { choice: 1 })).toBe('9 × (−6) : signes contraires, le résultat est négatif. 9 × 6 = 54, donc −54.');
    expect(say(q, { choice: 0 })).toBe(PLUS_GRAND('9 × (−6)', '−54'));
  });
  it('exemple 2, case 2 : le résultat de 9 × (−6)', () => {
    const q = qOf(12);
    expect(say(q, typed(-54))).toBe('9 × (−6) : signes contraires, le résultat est négatif. 9 × 6 = 54, donc −54.');
    expect(say(q, typed(54))).toBe(PLUS_GRAND('9 × (−6)', '−54'));
    expect(say(q, typed(-15))).toBe(ADD(9, 6));
    expect(say(q, typed(3))).toBe(ADD(9, 6));
    expect(say(q, typed(-45))).toBe(TABLE(9, 6));
  });
});

describe('Cours 5 v2 — exercices de fin et révisions (feedbackText)', () => {
  it('un message par erreur prévisible, à chaque niveau', () => {
    expect(say(saisieOf('−8 × 3'), typed(24))).toBe(OUBLI('−8', '3', '−8 × 3', '−24'));
    expect(say(saisieOf('2 × (−9)'), typed(18))).toBe(OUBLI('2', '−9', '2 × (−9)', '−18'));
    expect(say(saisieOf('9 × (−2)'), typed(18))).toBe(PLUS_GRAND('9 × (−2)', '−18'));
    expect(say(saisieOf('−12 × 7', 2), typed(84))).toBe(OUBLI('−12', '7', '−12 × 7', '−84'));
    expect(say(saisieOf('−11 × (−12)', 2), typed(-132))).toBe(MOINS_MOINS('−11 × (−12)', '−11 + (−12)', '132'));
    expect(say(saisieOf('35 × (−17)', 3), typed(595))).toBe(PLUS_GRAND('35 × (−17)', '−595'));
    expect(say(saisieOf('35 × (−17)', 3), typed(-52))).toBe(ADD(35, 17));
    expect(say(saisieOf('35 × (−17)', 3), typed(-630))).toBe(TABLE(35, 17));
    expect(say(saisieOf('3 × 4'), typed(-12))).toBe('Deux nombres positifs donnent un résultat **positif** : 3 × 4 = 12.');
  });
  it('révision « signe » : les mêmes messages, sur un calcul tiré', () => {
    const rng = seededRng(7);
    for (let i = 0; i < 50; i++) {
      const q = buildSlot(c05, 'signe', { rng, level: 1, timesSeen: 0 });
      if (q.kind !== 'qcm') throw new Error('qcm');
      const right = say(q, { choice: q.correctIndex })!;
      expect(right).toMatch(/^.+ : (même signe, le résultat est positif|signes contraires, le résultat est négatif)\. \d+ × \d+ = \d+, donc −?\d+\.$/);
      expect(checkAnswer(c05, q, { choice: 1 - q.correctIndex }).errorType).toBe('regle-signes');
    }
  });
  it('les autres formats de révision se construisent (vrai ou faux, trouver l’erreur, saisie)', () => {
    const rng = seededRng(8);
    for (const kind of ['vraifaux', 'erreur', 'saisie'] as const)
      for (let i = 0; i < 20; i++) expect(buildQuestion(c05, kind, { rng, level: (1 + (i % 3)) as 1 | 2 | 3, timesSeen: 0 }).kind).toBe(kind);
  });
});

describe('Cours 5 v2 — repassage et fiche mémo', () => {
  const play = (outcomes: Record<string, boolean[]>) => {
    let s: ActivityState = createActivity('cours', courseRunItems(c05, seededRng(4)), { activityId: 'a', rng: seededRng(4) });
    const seen: string[] = [];
    const used: Record<string, number> = {};
    for (let g = 0; g < 250 && !isDone(s); g++) {
      const c = current(s)!;
      if (c.type === 'explication') {
        s = explanationDone(s, 1).state;
        continue;
      }
      const key = `${c.item.itemId}:${c.role}`;
      seen.push(key);
      const n = (used[key] = (used[key] ?? 0) + 1) - 1;
      const right = (outcomes[key] ?? [])[n] ?? true;
      s = answer(s, { correct: right, unfinished: false, errorType: right ? null : 'autre', errorFamily: right ? null : 'autre', given: 'g', expected: 'e' }, 1).state;
    }
    return seen;
  };
  it('une question de la série ratée repasse avant les fins', () => {
    const seen = play({ 'partie-8-1:original': [false] });
    const rep = seen.indexOf('partie-8-1:repetition');
    expect(rep).toBeGreaterThan(seen.indexOf('partie-8-3:original'));
    expect(rep).toBeLessThan(seen.indexOf('fin-0:original'));
  });
  it('une petite question ratée repasse avant les fins', () => {
    const seen = play({ 'partie-4:original': [false] });
    expect(seen.indexOf('partie-4:repetition')).toBeGreaterThan(seen.indexOf('partie-4:original'));
    expect(seen.indexOf('partie-4:repetition')).toBeLessThan(seen.indexOf('fin-0:original'));
  });
  it('la case 1 de l’exemple 2 ratée ne repasse pas', () => {
    expect(play({ 'partie-11:original': [false] }).some((k) => k.startsWith('partie-11') && k.endsWith('repetition'))).toBe(false);
  });
  it('fiche mémo : la règle, deux exemples, l’erreur à éviter, la technique principale (règle des signes)', () => {
    const m = c05.memo!;
    expect(m.rule).toBe(c05.rule);
    expect(m.ruleBullets).toEqual(['Même signe : le résultat est positif.', 'Signes contraires : le résultat est négatif.']);
    expect(m.examples).toEqual(['−3 × (−4) = +(3 × 4) = **12**', '6 × (−7) = −(6 × 7) = **−42**']);
    expect(m.mistake).toEqual({
      wrong: '−3 × (−4) = −12',
      why: "C'est la règle de l'**addition** qui garde le signe −. Pour multiplier, deux nombres négatifs donnent un **positif**.",
    });
    expect(m.tip).toBe('Règle des signes : signes identiques, + ; signes contraires, −. −3 × (−4) = 12 ; 6 × (−7) = −42.');
  });
});
