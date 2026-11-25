import { describe, expect, it } from 'vitest';
import { c04 } from '../../src/courses/calculs/c04-soustraire';
import { checkAnswer, courseRunItems, createActivity, current, answer, explanationDone, isDone, seededRng } from '../../src';
import type { ActivityState } from '../../src';
import type { Answer, Question } from '../../src/exercises/types';
import type { EtapeStep, LessonPart } from '../../src/courses/types';
import { feedbackFor } from '../../src/feedback';
import { buildQuestion } from '../../src/exercises/build';
import { exOf } from './helpers';

// Textes de la maquette validée docs/design/ecrans/cours-4-v2.html, mot pour mot.

const part = (i: number): LessonPart => c04.parts[i] as LessonPart;
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

/** Texte affiché pour une réponse tapée ou touchée, par feedbackText. */
function say(q: Question, a: Answer): string | null {
  const o = checkAnswer(c04, q, a);
  return c04.feedbackText?.(q, o) ?? null;
}
const typed = (n: number): Answer => ({
  raw: { tokens: [...(n < 0 ? `-${-n}` : String(n))].map((c) => ({ t: 'c' as const, c: c as '-' })), cursor: 'root' as const },
});
const saisieOf = (display: string, level: 1 | 2 | 3 = 1): Question => ({ kind: 'saisie', ex: exOf(c04, display, level), promptLatex: '' }) as Question;

const OPP = (calc: string, right: string, wrong: string) =>
  `Soustraire, c'est **ajouter l'opposé** : le − devient +, et le nombre change de signe. ${calc} devient ${right}, et non ${wrong}.`;
const INV = (added: string) =>
  `Transforme d'abord en addition : ${added}. Puis regarde les signes : le résultat prend le signe du nombre le plus grand (sans son signe).`;
const OUBLI = "Il manque un nombre : coche chaque nombre quand tu l'as utilisé.";

describe('Cours 4 v2 — textes des écrans', () => {
  it('accroche : titre, deux phrases, 3 choix et leurs messages', () => {
    const t = part(0);
    expect(t.type === 'question' && t.title).toBe('Soustraire un nombre relatif');
    expect(t.type === 'question' && t.intro).toEqual([
      "Jusqu'ici, tu as **additionné** des nombres relatifs. Maintenant, tu vas aussi les **soustraire**, par exemple 5 − (−3) ou 3 − 8.",
      'Le piège : un signe − peut en **cacher un autre**. Tu vas apprendre une méthode qui marche à chaque fois.',
    ]);
    expect(t.type === 'question' && t.mention).toBe('Question pour découvrir : elle ne compte pas dans la note.');
    const q = choixAt(0);
    expect(q.prompt).toBe("Pour commencer, à ton avis : ton solde est de 5 €. Il comptait une dette de 3 €, et ton ami l'efface. Quel est ton nouveau solde ?");
    expect(q.options.map((o) => o.label)).toEqual(['8 €', '2 €', '5 €']);
    expect(q.correctIndex).toBe(0);
    expect(q.options.map((o) => o.why)).toEqual([
      "Ta dette de 3 € ne pèse plus : tu es plus riche de 3 €, donc 5 + 3 = 8 €. Le cours va t'expliquer comment l'écrire avec des nombres relatifs : 5 − (−3).",
      '2 €, ce serait si tu avais une dette de plus. Ici, on enlève une dette : ton solde monte, il ne baisse pas.',
      "Si rien ne changeait, ton solde resterait à 5 €. Mais effacer une dette de 3 €, c'est comme recevoir 3 € : ton solde monte.",
    ]);
  });

  it('retrancher une dette : deux lectures, puis la phrase à trous', () => {
    const p = part(1);
    expect(p.type === 'etapes' && p.title).toBe('Retrancher une dette');
    const s = stepsOf(1);
    expect(s).toHaveLength(3);
    expect(s[0]?.text).toBe("Ton solde est de **5 €**. Il comptait une **dette de 3 €**, c'est le nombre −3. Ton ami l'efface : on **soustrait** cette dette, ce qui s'écrit 5 − (−3).");
    expect(s[1]?.text).toBe('Quand on **enlève une dette**, on devient **plus riche** : le solde passe de 5 € à 8 €. Sur la droite, le bond va vers la **droite**.');
    expect(s[1]?.scene?.line?.jumps).toEqual([{ from: 5, by: 3 }]);
    const a = trouAt(1, 2);
    expect([a.open, a.choices, a.correct, a.errors]).toEqual([
      'Ajouter −3 fait aller vers la gauche. Soustraire −3, c\'est le contraire : on va vers la [ ? ].',
      ['droite', 'gauche'],
      0,
      { 1: "Enlever une dette, c'est gagner de l'argent : le solde monte, donc on va vers la droite, vers les plus grands nombres." },
    ]);
    expect(s[2]?.text).toBe('Ajouter −3 fait aller vers la gauche. Soustraire −3, c\'est le contraire : on va vers la **droite**. Donc 5 − (−3) = **8**. **Soustraire une dette**, c\'est comme **ajouter** 3.');
    expect(s[2]?.scene?.line?.tone).toBe('neutral');
  });

  it('comparer : A (ce cours) et B (Cours 2), le bon choix est le signe devant la parenthèse', () => {
    const t = part(2);
    if (t.type !== 'question') throw new Error('question');
    expect([t.compare?.a.latex, t.compare?.b.latex]).toEqual(['5 - (-3)', '5 + (-3)']);
    expect(t.compare?.line?.jumps.map((j) => [j.from, j.by, j.label])).toEqual([[5, 3, 'A'], [5, -3, 'B']]);
    expect(t.compare?.after[2]).toBe('Un seul signe change, et on arrive à des endroits **opposés** : 8 et 2. Dans B, tu sais faire (Cours 2). Pour A, il faut une méthode : la **transformer en addition**.');
    expect(t.mention).toBe('Question pour comprendre : elle ne compte pas dans la note.');
    const q = choixAt(2);
    expect(q.options.map((o) => o.label)).toEqual(['Le premier nombre', 'Le signe devant la parenthèse', 'Le nombre dans la parenthèse']);
    expect(q.correctIndex).toBe(1);
    expect(q.options.map((o) => o.why)).toEqual([
      'Les deux calculs commencent par 5 : le premier nombre ne change pas.',
      'Dans A, le signe devant la parenthèse est un − : on **soustrait** −3. Dans B, c\'est un + : on **ajoute** −3.',
      'Dans les deux calculs, la parenthèse contient (−3) : ce nombre ne change pas.',
    ]);
  });

  it('règle 1 : deux signes −, l’opposé, deux phrases à trous, l’encadré', () => {
    const s = stepsOf(3);
    expect(s).toHaveLength(5);
    expect(s[0]?.text).toBe('Dans 5 − (−3), il y a **deux signes −**. Le premier est une **soustraction**. Le second, dans la parenthèse, est le **signe du nombre** −3.');
    expect(s[0]?.scene?.calcs[0]?.tokens).toEqual([{ t: '5 ' }, { t: '−', hl: true }, { t: ' (−3)' }]);
    expect(s[1]?.text).toBe("Soustraire un nombre, c'est **ajouter son opposé**. L'opposé d'un nombre est celui qui est **de l'autre côté de 0**, à la même distance : l'opposé de −3 est 3.");
    const a = trouAt(3, 2);
    expect([a.open, a.choices, a.errors]).toEqual([
      '5 − (−3) = 5 + [ ? ].',
      ['3', '(−3)'],
      { 1: 'On a changé le − en +, mais le nombre est resté −3. Il faut aussi changer son signe : l\'opposé de −3 est 3.' },
    ]);
    expect(s[2]?.text).toBe('5 − (−3) = 5 + **3**. Le − est devenu un +, et le nombre a changé de signe. 5 + 3 = **8**.');
    const b = trouAt(3, 3);
    expect([b.open, b.choices, b.errors]).toEqual([
      '3 − 7 = 3 + [ ? ].',
      ['(−7)', '7'],
      { 1: 'On a changé le − en +, mais le nombre est resté 7. Il faut prendre son opposé : −7, écrit entre parenthèses.' },
    ]);
    expect(s[3]?.text).toBe('3 − 7 = 3 + **(−7)**. Soustraire 7, c\'est ajouter −7. Les parenthèses montrent que le − est le **signe du nombre** : 3 + (−7).');
    expect(s[4]?.rule).toEqual({
      n: 1,
      text: "**Soustraire un nombre, c'est ajouter son opposé : je remplace le − par un +, et je change le signe du nombre qui suit.**",
    });
  });

  it('règle 2 : une lecture, deux phrases à trous (droite grise), l’encadré', () => {
    const s = stepsOf(4);
    expect(s).toHaveLength(4);
    expect(s[0]?.text).toBe('Une fois transformée, **c\'est une addition**, et tu sais la faire (Cours 1 et 2). Ici, 3 et −7 ont des **signes contraires**.');
    const a = trouAt(4, 1);
    expect([a.open, a.choices, a.errors]).toEqual([
      '3 + (−7) : le plus grand des deux, sans signe, est 7, donc le résultat est [ ? ].',
      ['négatif', 'positif'],
      { 1: "Le plus grand des deux nombres sans signe est 7, et il est négatif : le résultat prend son signe. C'est la règle du Cours 2." },
    ]);
    expect(s[1]?.scene?.line?.tone).toBe('neutral');
    expect(s[1]?.after?.line?.jumps).toEqual([{ from: 0, by: 3 }, { from: 3, by: -7 }]);
    expect(s[1]?.text).toBe('3 + (−7) : le plus grand des deux, sans signe, est 7, donc le résultat est **négatif**. 7 − 3 = 4, avec le signe − : on arrive à **−4**.');
    const b = trouAt(4, 2);
    expect([b.open, b.choices, b.errors]).toEqual([
      '−4 − 6 = −4 + (−6) = [ ? ].',
      ['−10', '2', '10'],
      {
        1: '−4 et −6 ont le même signe : on ne les soustrait pas. On **additionne** 4 + 6 = 10, et on garde le signe −.',
        2: 'Les deux nombres ont le même signe : on **additionne** les nombres sans leur signe, et on garde ce signe.',
      },
    ]);
    expect(s[3]?.rule).toEqual({
      n: 2,
      text: "**Puis j'additionne : même signe, j'additionne ; signes contraires, je soustrais et je prends le signe du plus grand.**",
    });
  });

  it('exemple 1 : la ligne expliquée, puis « Je comprends »', () => {
    const s = stepsOf(9);
    expect(s[0]?.text).toBe('Voici la résolution. Lis la première ligne, puis touche « Je comprends ».');
    expect(s[1]?.text).toBe('Le − devient +, et le nombre −10 devient son opposé, 10. Le −6 du début ne change pas.');
    expect(s.filter((x) => x.action?.type === 'comprends')).toHaveLength(1);
    const t = part(10);
    expect(t.type === 'question' && [t.consigne, t.above, t.help]).toEqual([
      'Tape ce qui manque dans la case, avec les touches du clavier.',
      ['= -6 + 10'],
      "Dernière ligne. Écris le résultat, avec son signe. Tu peux t'aider de la ligne du dessus.",
    ]);
  });

  it('exemple 2 : deux cases, la transformation puis le résultat', () => {
    const c1 = part(11);
    expect(c1.type === 'question' && [c1.consigne, c1.intro, c1.question.kind === 'trou' && c1.question.promptLatex]).toEqual([
      "Complète, une case après l'autre.",
      ['Cette fois, deux cases sont à toi. Transforme la soustraction en addition, puis calcule.'],
      '= 3 + (\\square)',
    ]);
    const c2 = part(12);
    expect(c2.type === 'question' && c2.above).toEqual(['= 3 + (-11)']);
  });

  it('annonce de la fin : même texte que les Cours 0 à 3', () => {
    expect(stepsOf(13).map((s) => s.text)).toEqual([
      "Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle.",
      'Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.',
      "Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon.",
    ]);
  });

  it('jamais plus de 2 étapes de lecture d’affilée sans action', () => {
    for (const i of [1, 3, 4, 9]) {
      let run = 0;
      for (const s of stepsOf(i)) {
        run = s.action || s.rule ? 0 : run + 1;
        expect(run, `partie ${i}`).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('Cours 4 v2 — petites questions des règles', () => {
  it('règle 1 : la réécriture de 6 − (−4)', () => {
    const q = choixAt(5);
    expect(q.small).toBe(true);
    expect(q.calcLatex).toBe('6 - (-4)');
    expect(q.prompt).toBe('Quelle réécriture en addition est juste ?');
    expect(q.options.map((o) => o.label)).toEqual(['6 + 4', '6 + (−4)', '6 − 4']);
    expect(q.correctIndex).toBe(0);
    expect(q.options.map((o) => o.why)).toEqual([
      'Le − devient +, et −4 devient son opposé, 4 : 6 + 4. Puis 6 + 4 = 10.',
      "Tu as changé le − en +, mais pas le signe du nombre : (−4) est resté (−4). L'opposé de −4 est 4.",
      '6 − 4 est encore une soustraction, et le signe − du nombre a disparu. Une réécriture en addition commence par 6 +.',
    ]);
  });
  it('règle 2 : le résultat de −4 − 6', () => {
    const q = choixAt(6);
    expect(q.small).toBe(true);
    expect(q.options.map((o) => o.label)).toEqual(['−10', '2', '10']);
    expect(q.correctIndex).toBe(0);
    expect(q.options.map((o) => o.why)).toEqual([
      '−4 − 6 = −4 + (−6). Même signe : 4 + 6 = 10, et je garde le signe − : −10.',
      "Tu as ajouté 6 au lieu de son opposé : −4 + 6 = 2. Soustraire 6, c'est ajouter −6.",
      "Transforme d'abord : −4 + (−6). Les deux nombres sont négatifs : le résultat est négatif aussi.",
    ]);
  });
});

describe('Cours 4 v2 — « Autres façons de faire »', () => {
  const p = part(7);
  if (p.type !== 'autres') throw new Error('autres');
  it('le rappel des 2 règles en haut, puis deux techniques', () => {
    expect(p.recap).toEqual({
      title: 'Les 2 règles à retenir',
      rules: [
        { title: '1. Je remplace le − par un +, et je change le signe du nombre.', ok: '6 − (−4) = 6 + 4', ko: '6 − (−4) = 6 + (−4)' },
        { title: "2. Puis j'additionne, avec les règles des Cours 1 et 2.", ok: '3 − 7 = 3 + (−7) = −4', ko: '3 − 7 = 3 + (−7) = 4' },
      ],
      sentence: "Soustraire, c'est ajouter l'opposé : je remplace le − par un +, je change le signe du nombre, puis j'additionne.",
    });
    expect(p.techniques.map((t) => [t.name, t.example])).toEqual([
      ['Petit moins grand : on retourne', '3 − 8 : je calcule 8 − 3 = 5, et le résultat est négatif : −5'],
      ["Vérifier par l'opération inverse", '5 − (−3) = 8 car 8 + (−3) = 5'],
    ]);
    expect(p.outro).toBe("Ensuite, tu t'entraînes avec quatre questions.");
  });
  it('essais libres : bonne réponse et un message par erreur', () => {
    const [a, b] = p.techniques.map((t) => t.essai);
    expect(a).toMatchObject({ kind: 'saisie', calc: '4 − 9', answer: -5, yes: '9 − 4 = 5, et on retranche 9 à 4, un nombre plus petit : le résultat est négatif, −5.' });
    expect(a?.kind === 'saisie' && a.errors).toEqual([
      { values: [5], message: 'Tu as le bon nombre, mais pas le bon signe : on retranche 9 à 4, plus petit que 9, donc le résultat est négatif.' },
      { values: [13], message: "13, c'est 4 + 9. Soustraire 9, ce n'est pas l'ajouter : 9 − 4 = 5, puis le signe −." },
    ]);
    expect(a?.kind === 'saisie' && a.fallback).toBe('9 − 4 = 5, puis le signe − : −5.');
    expect(b).toMatchObject({
      kind: 'choix',
      options: ['−2', '6', '−6'],
      correct: 0,
      yes: '2 + (−4) = −2, et non 6 : le résultat 2 est faux. La bonne réponse est 10, car 10 + (−4) = 6.',
      no: 'Signes contraires : 4 − 2 = 2, et le plus grand, 4, est négatif : 2 + (−4) = −2. On ne retrouve pas 6, donc 2 est faux.',
    });
  });
});

describe('Cours 4 v2 — série de pratique (feedbackText)', () => {
  it('Q1 : toucher l’arrivée de 2 − (−3), bonds dessinés', () => {
    const q = pratiqueQ(0);
    expect(pratiqueTexts(0)?.consigne).toBe('Les bonds sont dessinés : +2, puis la soustraction de −3. Où arrive-t-on ?');
    expect(q.kind === 'droite' && [q.line, q.jumps, q.answer]).toEqual([{ from: -1, to: 6 }, [{ from: 0, by: 2 }, { from: 2, by: 3 }], 5]);
    expect(say(q, { point: 5 })).toBe('2 − (−3) = 2 + 3 = 5. Soustraire −3 fait aller vers la droite : on arrive à 5.');
    expect(say(q, { point: -1 })).toBe("−1, c'est 2 + (−3) : tu as ajouté −3. Soustraire −3, c'est le contraire : le bond va vers la droite.");
    expect(say(q, { point: 0 })).toBe("Tu es resté au départ. Le premier bond va jusqu'à 2, le second fait 3 graduations vers la droite.");
    expect(say(q, { point: 2 })).toBe("2, c'est l'arrivée du premier bond seulement. Le bond de la soustraction part de 2 et va vers la droite.");
    expect(say(q, { point: 4 })).toBe('Le deuxième bond part de 2 et fait 3 graduations vers la droite : 3, 4, 5. On arrive à 5.');
  });
  it('Q2 : le signe de 3 − 8', () => {
    const q = pratiqueQ(1);
    expect(pratiqueTexts(1)).toEqual({ consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] });
    expect(say(q, { choice: 1 })).toBe('3 − 8 = 3 + (−8). Le plus grand, 8, est négatif : le résultat est négatif. 8 − 3 = 5, donc −5.');
    expect(say(q, { choice: 0 })).toBe("Transforme d'abord : 3 + (−8). Le plus grand des deux nombres, 8, est négatif : le résultat prend son signe.");
    expect(checkAnswer(c04, q, { choice: 0 }).errorType).toBe('signe-inverse');
  });
  it('Q3 : une question du Cours 3, 6 + (−2) + 4', () => {
    const q = pratiqueQ(2);
    expect(pratiqueTexts(2)?.consigne).toBe('Regarde bien le calcul, puis touche le résultat.');
    if (q.kind !== 'choix') throw new Error('choix');
    expect(q.calcLatex).toBe('6 + (-2) + 4');
    expect(q.options.map((o) => o.label)).toEqual(['8', '12', '4']);
    expect(q.options.map((o) => o.why)).toEqual([
      'Ce calcul est une addition (Cours 3). Positifs : 6 + 4 = 10. Négatif : −2. 10 + (−2) = 8.',
      "Le −2 est négatif : il se retranche des positifs, on ne l'ajoute pas. Regroupe les positifs (10) et le négatif (−2), puis 10 − 2 = 8.",
      OUBLI,
    ]);
    expect(checkAnswer(c04, q, { choice: 0 }).correct).toBe(true);
  });
  it('Q4 : taper −3 − (−8)', () => {
    const q = pratiqueQ(3);
    expect(pratiqueTexts(3)?.consigne).toBe('Calcule. **Tape le résultat.**');
    expect(say(q, typed(5))).toBe('−3 − (−8) devient −3 + 8. Signes contraires : 8 − 3 = 5. Le plus grand, 8, est positif : 5.');
    expect(say(q, typed(-5))).toBe(INV('−3 + 8'));
    expect(say(q, typed(-11))).toBe(OPP('−3 − (−8)', '−3 + 8', '−3 + (−8)'));
    expect(say(q, typed(11))).toBe("Transforme d'abord : −3 − (−8) devient −3 + 8. Puis additionne : 5.");
  });
  it('feedbackFor : le texte du cours remplace le message du moteur', () => {
    const q = pratiqueQ(3);
    const a = typed(-11);
    expect(feedbackFor(c04, q, a, checkAnswer(c04, q, a))).toMatchObject({ tone: 'faux', message: OPP('−3 − (−8)', '−3 + 8', '−3 + (−8)') });
  });
});

describe('Cours 4 v2 — exemples guidés (feedbackText)', () => {
  it('exemple 1, dernière ligne de −6 − (−10)', () => {
    const q = qOf(10);
    expect(say(q, typed(4))).toBe('Signes contraires : 10 − 6 = 4. Le plus grand, 10, est positif : 4.');
    expect(say(q, typed(-4))).toBe(INV('−6 + 10'));
    expect(say(q, typed(-16))).toBe(OPP('−6 − (−10)', '−6 + 10', '−6 + (−10)'));
    expect(say(q, typed(16))).toBe("Transforme d'abord : −6 − (−10) devient −6 + 10. Puis additionne : 4.");
  });
  it('exemple 2, case 1 (non notée) : l’opposé de 11', () => {
    const q = qOf(11);
    expect(say(q, typed(-11))).toBe("Soustraire 11, c'est ajouter son opposé, −11.");
    expect(say(q, typed(11))).toBe("11 est le nombre de départ. Il doit changer de signe : l'opposé de 11 est −11.");
    expect(say(q, typed(8))).toBe('Le nombre retranché est 11 : on ajoute son opposé, −11.');
  });
  it('exemple 2, case 2 : le résultat de 3 − 11', () => {
    const q = qOf(12);
    expect(say(q, typed(-8))).toBe('3 − 11 devient 3 + (−11). Signes contraires : 11 − 3 = 8. Le plus grand, 11, est négatif : −8.');
    expect(say(q, typed(8))).toBe(INV('3 + (−11)'));
    expect(say(q, typed(14))).toBe(OPP('3 − 11', '3 + (−11)', '3 + 11'));
    expect(say(q, typed(-14))).toBe("Transforme d'abord : 3 − 11 devient 3 + (−11). Puis additionne : −8.");
  });
});

describe('Cours 4 v2 — exercices de fin et révisions (feedbackText)', () => {
  it('45 − (−27) et 18 − 63 (maquette)', () => {
    const e1 = saisieOf('45 − (−27)', 2);
    expect(say(e1, typed(72))).toBe('45 − (−27) devient 45 + 27. Même signe : 45 + 27 = 72, et je garde le signe + : 72.');
    expect(say(e1, typed(18))).toBe(OPP('45 − (−27)', '45 + 27', '45 + (−27)'));
    expect(say(e1, typed(-72))).toBe(INV('45 + 27'));
    const e2 = saisieOf('18 − 63', 2);
    expect(say(e2, typed(-45))).toBe('18 − 63 devient 18 + (−63). Signes contraires : 63 − 18 = 45. Le plus grand, 63, est négatif : −45.');
    expect(say(e2, typed(81))).toBe(OPP('18 − 63', '18 + (−63)', '18 + 63'));
    expect(say(e2, typed(45))).toBe(INV('18 + (−63)'));
  });
  it('un résultat nul : deux opposés s’annulent', () => {
    expect(say(saisieOf('−4 − (−4)'), typed(0))).toBe("−4 − (−4) devient −4 + 4. −4 et 4 sont opposés : ils s'annulent, le résultat est 0.");
  });
  it('niveau 3, deux soustractions : on regroupe (Cours 3)', () => {
    const e = saisieOf('248 − (−175) − 90', 3);
    expect(say(e, typed(333))).toBe('248 − (−175) − 90 devient 248 + 175 + (−90). Positifs : 248 + 175 = 423. Négatif : −90. Puis 423 + (−90) : 423 − 90 = 333, le plus grand, 423, est positif : 333.');
    expect(say(e, typed(-333))).toBe("Transforme d'abord en addition : 248 + 175 + (−90). Puis regroupe les positifs et les négatifs (Cours 3) : le résultat prend le signe du total le plus grand (sans son signe).");
    for (const n of [-17, 513, 333 - 350 + 180]) expect(say(e, typed(n))).toBe(OPP('248 − (−175) − 90', '248 + 175 + (−90)', '248 + (−175) + 90'));
    expect(say(saisieOf('−5 − 3 − (−2)', 3), typed(-6))).toBe('−5 − 3 − (−2) devient −5 + (−3) + 2. Positif : 2. Négatifs : (−5) + (−3) = −8. Puis 2 + (−8) : 8 − 2 = 6, le plus grand, 8, est négatif : −6.');
    expect(say(saisieOf('5 − (−3) − (−2)', 3), typed(10))).toBe('5 − (−3) − (−2) devient 5 + 3 + 2. Même signe : 5 + 3 + 2 = 10, et je garde le signe + : 10.');
  });
  it('révision « signe » et « droite » : les mêmes messages, sur un calcul tiré', () => {
    const sign = { kind: 'qcm', ex: exOf(c04, '−4 − 6'), choices: [{ latex: '+' }, { latex: '-' }], correctIndex: 1 } as unknown as Question;
    expect(c04.feedbackText?.(sign, { correct: true, unfinished: false, errorType: null, errorFamily: null, given: '−', expected: '−' })).toBe(
      '−4 − 6 = −4 + (−6). Même signe : 4 + 6 = 10, et je garde le signe − : −10.',
    );
    const rng = seededRng(7);
    for (let i = 0; i < 50; i++) {
      const q = buildQuestion(c04, 'droite', { rng, level: 1, timesSeen: 0 });
      if (q.kind !== 'droite') throw new Error('droite');
      const [a, b] = [q.jumps[0]!.by, -q.jumps[1]!.by];
      expect(q.ex.expr.k === 'op' && q.ex.expr.op).toBe('-');
      expect(q.jumps[1]!.from).toBe(a);
      expect(a - b).toBe(q.answer);
      expect(q.line.to - q.line.from).toBeLessThanOrEqual(7);
      expect(say(q, { point: q.answer })).toContain(`on arrive à ${q.answer < 0 ? `−${-q.answer}` : q.answer}.`);
    }
  });
});

describe('Cours 4 v2 — repassage et fiche mémo', () => {
  const play = (outcomes: Record<string, boolean[]>) => {
    let s: ActivityState = createActivity('cours', courseRunItems(c04, seededRng(4)), { activityId: 'a', rng: seededRng(4) });
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
    const seen = play({ 'partie-5:original': [false] });
    expect(seen.indexOf('partie-5:repetition')).toBeGreaterThan(seen.indexOf('partie-5:original'));
    expect(seen.indexOf('partie-5:repetition')).toBeLessThan(seen.indexOf('fin-0:original'));
  });
  it('la case 1 de l’exemple 2 ratée ne repasse pas', () => {
    expect(play({ 'partie-11:original': [false] }).some((k) => k.startsWith('partie-11') && k.endsWith('repetition'))).toBe(false);
  });
  it('fiche mémo : la règle, un exemple, l’erreur à éviter, la technique principale', () => {
    const m = c04.memo!;
    expect(m.rule).toBe(c04.rule);
    expect(m.examples).toEqual(['5 − (−3) = 5 + 3 = **8**']);
    expect(m.mistake).toEqual({
      wrong: '5 − (−3) = 5 + (−3)',
      why: "Changer le − en + ne suffit pas : le nombre doit aussi **changer de signe**. Avant de calculer, je vérifie que j'ai bien écrit l'opposé.",
    });
    expect(m.tip).toBe("Soustraire, c'est ajouter l'opposé : 5 − (−3) = 5 + 3 = 8 ; 5 − 3 = 5 + (−3) = 2.");
  });
});
