import { describe, expect, it } from 'vitest';
import { c02 } from '../../src/courses/calculs/c02-additionner-signes-contraires';
import { checkAnswer, courseRunItems, createActivity, current, answer, explanationDone, isDone, seededRng } from '../../src';
import type { ActivityState } from '../../src';
import type { Answer, Question } from '../../src/exercises/types';
import type { EtapeStep, LessonPart } from '../../src/courses/types';
import { feedbackFor } from '../../src/feedback';
import { exOf, ints } from './helpers';

const part = (i: number): LessonPart => c02.parts[i] as LessonPart;
const stepsOf = (i: number): EtapeStep[] => (part(i) as Extract<LessonPart, { type: 'etapes' }>).steps;
const actionOf = (i: number, k: number) => stepsOf(i)[k]?.action;
const pratiqueQ = (k: number): Question => (part(10) as Extract<LessonPart, { type: 'pratique' }>).questions[k]!.question;
const qOf = (i: number): Question => (part(i) as Extract<LessonPart, { type: 'question' }>).question;

/** Texte affiché pour une réponse tapée ou touchée, par feedbackText. */
function say(q: Question, a: Answer): string | null {
  const o = checkAnswer(c02, q, a);
  return c02.feedbackText?.(q, o) ?? null;
}
const typed = (n: number): Answer => ({
  raw: { tokens: [...String(n)].map((c) => ({ t: 'c' as const, c: c as '-' })), cursor: 'root' as const },
});

const SIGN = "Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe).";
const sub = (big: number, small: number) => `Signes contraires : on **soustrait**. ${big} − ${small} = ${big - small}.`;

describe('Cours 2 v2 — textes des écrans', () => {
  it('encadrés des règles', () => {
    expect(stepsOf(3)[2]?.rule).toEqual({ n: 1, text: '**Deux nombres de signes contraires : je soustrais les nombres sans leur signe.**' });
    expect(stepsOf(6)[5]?.rule).toEqual({ n: 2, text: '**Le nombre sans signe le plus grand décide : le résultat a son signe.**' });
  });

  it('écran 2 : un bond qui en défait un autre', () => {
    expect(stepsOf(1)[0]?.text).toBe('Tu dois **7 €** : un bond de 7 graduations vers la **gauche**. Tu es à −7.');
    expect(stepsOf(1)[1]?.action).toMatchObject({ type: 'graduation', target: -5 });
    const t = actionOf(1, 2);
    expect(t?.type === 'trou' && [t.choices[t.correct], t.errors[1]]).toEqual(['court', 'Compare les deux arcs sur la droite : 2 graduations contre 7.']);
  });

  it('règle 2 : le cas −6 + 6 est une étape à toucher, avant l’encadré', () => {
    const s = stepsOf(6)[4];
    expect(s?.action).toMatchObject({ type: 'graduation', target: 0 });
    expect(s?.text).toContain('−6 + 6 = **0**');
    expect(s?.after?.line?.jumps.every((j) => !j.after)).toBe(true);
    expect(s?.after?.line?.tone).toBe('color');
  });
});

describe('Cours 2 v2 — messages des étapes interactives (doc 06)', () => {
  const grad = (i: number, k: number) => {
    const a = actionOf(i, k);
    if (a?.type !== 'graduation') throw new Error('graduation attendue');
    return a;
  };
  const msg = (i: number, k: number, at: number) => grad(i, k).errors.find((e) => e.at.includes(at))?.message ?? grad(i, k).fallback;
  it.each([
    [-7, 'Tu es resté au départ du bond : il fait 2 graduations vers la droite.'],
    [-6, 'Il manque des graduations : le bond en fait 2. Compte-les une par une à partir de −7.'],
    [-4, 'Une graduation de trop : le bond fait exactement 2 graduations.'],
    [0, 'Une graduation de trop : le bond fait exactement 2 graduations.'],
  ])('écran 2, étape 2 : toucher %i', (at, m) => expect(msg(1, 1, at)).toBe(m));
  it.each([
    [-6, 'Tu es resté au départ du bond : il fait 6 graduations vers la droite.'],
    [-3, 'Il manque des graduations : le bond en fait 6. Compte-les une par une à partir de −6.'],
    [1, 'Une graduation de trop : le bond fait exactement 6 graduations.'],
  ])('règle 2, étape 5 : toucher %i', (at, m) => expect(msg(6, 4, at)).toBe(m));

  const trou = (i: number, k: number) => {
    const a = actionOf(i, k);
    if (a?.type !== 'trou') throw new Error('trou attendu');
    return a;
  };
  it('phrases à trous : choix attendus et messages', () => {
    const t = trou(3, 1);
    expect(t.choices).toEqual(['5', '9', '14']);
    expect(t.choices[t.correct]).toBe('5');
    expect(t.errors[1]).toBe("9, c'est 7 + 2 : on additionnerait des bonds de même sens. Ici le petit bond défait une partie du grand : on soustrait.");
    expect(t.errors[2]).toBe('On soustrait les longueurs, on ne les multiplie pas : 7 − 2.');
    const g = trou(6, 1);
    expect([g.choices[g.correct], g.errors[0]]).toEqual(['négatif', "Le bond de −7 est plus long que celui de +2 : c'est lui qui décide du côté. −7 est négatif."]);
    const r = trou(6, 2);
    expect(r.choices).toEqual(['−5', '5', '−9']);
    expect(r.choices[r.correct]).toBe('−5');
    expect(r.errors[1]).toBe('Il reste bien 5 graduations, mais on arrive à gauche de 0 : il faut garder le signe −, celui du plus grand nombre (7).');
    expect(r.errors[2]).toBe('−9 viendrait de 7 + 2. Ici les bonds sont de sens contraires : 7 − 2 = 5, avec le signe −.');
  });

  it('exemple 1 : 2 actions « Je comprends »', () => {
    expect(stepsOf(11).filter((s) => s.action?.type === 'comprends')).toHaveLength(2);
  });
});

describe('Cours 2 v2 — questions pour deviner et comprendre', () => {
  const why = (q: Question, i: number) => (q.kind === 'choix' ? q.options[i]?.why : undefined);
  it('écran 1', () => {
    const q = qOf(0);
    expect(q.kind === 'choix' && q.options.map((o) => o.label)).toEqual(['5 €', '9 €', '2 €']);
    expect(q.kind === 'choix' && q.correctIndex).toBe(0);
    expect(why(q, 1)).toBe("Rendre de l'argent fait baisser ta dette, elle ne grandit pas. Tu dois 7 € moins les 2 € rendus : 5 €.");
    expect(why(q, 2)).toBe("2 €, c'est ce que tu as rendu. Il reste à rendre ce que tu dois moins ce que tu as déjà rendu : 7 − 2 = 5 €.");
  });
  it('écran 3', () => {
    const q = qOf(2);
    expect(q.kind === 'choix' && q.correctIndex).toBe(2);
    expect(why(q, 0)).toBe('Le premier nombre est −7 dans les deux calculs : il ne change pas.');
    expect(why(q, 1)).toBe("Le deuxième bond fait 2 graduations dans les deux calculs : ce n'est pas sa longueur qui change, c'est son sens.");
    expect(why(q, 2)).toBe('Le deuxième nombre est positif dans le calcul A, négatif dans le calcul B : le signe change, donc le sens du bond change.');
    const t = part(2);
    expect(t.type === 'question' && t.compare?.a.latex).toBe('-7 + 2');
    expect(t.type === 'question' && t.compare?.b.latex).toBe('-7 + (-2)');
    expect(t.type === 'question' && t.compare?.line).toMatchObject({ from: -10, to: 1 });
  });
});

describe('Cours 2 v2 — petites questions (choix) des règles', () => {
  const opts = (i: number) => {
    const q = qOf(i);
    if (q.kind !== 'choix') throw new Error('choix');
    return q;
  };
  it('règle 1', () => {
    const a = opts(4);
    expect(a.options.map((o) => o.label)).toEqual(['Je les additionne', 'Je les soustrais', 'Je les multiplie']);
    expect(a.correctIndex).toBe(1);
    expect(a.small).toBe(true);
    expect(a.options[0]?.why).toBe(sub(8, 3));
    expect(a.options[2]?.why).toBe('On ne multiplie pas : pour deux signes contraires, on soustrait les nombres sans leur signe. 8 − 3 = 5.');
    const b = opts(5);
    expect(b.options.map((o) => o.label)).toEqual(['5', '13', '36']);
    expect(b.options[1]?.why).toBe(sub(9, 4));
    expect(b.options[2]?.why).toBe('On ne multiplie pas : 9 − 4 = 5.');
  });
  it('règle 2', () => {
    const a = opts(7);
    expect(a.options.map((o) => o.label)).toEqual(['positif', 'négatif']);
    expect(a.correctIndex).toBe(1);
    expect(a.options[0]?.why).toBe(`${SIGN} Ici, c'est 8, et il est négatif.`);
    const b = opts(8);
    expect(b.options.map((o) => o.label)).toEqual(['3', '−3', '−13']);
    expect(b.options[1]?.why).toBe(`${SIGN} Ici, c'est 8, et il est positif.`);
    expect(b.options[2]?.why).toBe(sub(8, 5));
  });
});

describe('Cours 2 v2 — « Autres façons de faire »', () => {
  const p = part(9);
  if (p.type !== 'autres') throw new Error('autres');
  it('le rappel des règles en haut, puis deux techniques', () => {
    expect(p.recap?.rules.map((r) => r.title)).toEqual([
      '1. Je soustrais les nombres sans leur signe.',
      '2. Le plus grand (sans signe) décide du signe.',
      'Deux nombres opposés donnent 0.',
    ]);
    expect(p.recap?.sentence).toBe('Signes contraires : je soustrais le plus petit du plus grand (sans signe), et je prends le signe du plus grand.');
    expect(p.techniques.map((t) => t.name)).toEqual(['Commencer par le positif', 'Deviner le signe']);
    expect(p.outro).toBe("Maintenant, tu t'entraînes avec quatre questions.");
  });
  it('essais libres : bonne réponse et messages', () => {
    const [a, b] = p.techniques.map((t) => t.essai);
    expect(a).toMatchObject({ kind: 'saisie', answer: -3 });
    expect(a?.kind === 'saisie' && a.errors).toEqual([
      { values: [3], message: `${SIGN} Ici, c'est 8, et il est négatif.` },
      { values: [13, -13], message: sub(8, 5) },
    ]);
    expect(b).toMatchObject({ kind: 'choix', options: ['positif', 'négatif'], correct: 0 });
  });
});

describe('Cours 2 v2 — questions qui comptent (feedbackText)', () => {
  it('Q1 droite', () => {
    const q = pratiqueQ(0);
    expect(say(q, { point: -4 })).toBe('Les deux bonds vont en sens contraires : 6 − 2 = 4. Le grand bond va vers la gauche : on arrive à −4.');
    expect(say(q, { point: -6 })).toBe('Tu es resté au départ du deuxième bond : il fait 2 graduations vers la droite.');
    expect(say(q, { point: -5 })).toBe('Il manque une graduation : le deuxième bond en fait 2.');
    for (const p of [0, -2, 1]) expect(say(q, { point: p })).toBe('Le deuxième bond part de −6 et fait 2 graduations vers la droite : −5, −4. On arrive à −4.');
  });
  it('Q2 signe', () => {
    const q = pratiqueQ(1);
    expect(say(q, { choice: 1 })).toBe('Le plus grand nombre sans signe est 8, et il est négatif : le résultat est négatif. 8 − 3 = 5, donc −5.');
    expect(say(q, { choice: 0 })).toBe(`${SIGN} Ici, c'est 8, et il est négatif.`);
  });
  it('Q3 : une question du Cours 1', () => {
    const q = pratiqueQ(2);
    expect(q.kind === 'choix' && q.options.map((o) => o.label)).toEqual(['−7', '−1', '7']);
    expect(q.kind === 'choix' && q.correctIndex).toBe(0);
    expect(q.kind === 'choix' && q.options[1]?.why).toBe("Les deux nombres sont négatifs : même signe. On additionne (4 + 3 = 7), on ne soustrait pas. Soustraire, c'est pour des signes contraires.");
    expect(q.kind === 'choix' && q.options[2]?.why).toBe('Les deux nombres sont négatifs : le résultat est négatif aussi. On garde le signe − !');
    expect(checkAnswer(c02, q, { choice: 0 }).correct).toBe(true);
  });
  it('Q4 saisie', () => {
    const q = pratiqueQ(3);
    expect(say(q, typed(-7))).toBe('Signes contraires : 11 − 4 = 7. Le plus grand, 11, est négatif : −7.');
    expect(say(q, typed(7))).toBe(`${SIGN} Ici, c'est 11, et il est négatif.`);
    for (const n of [15, -15]) expect(say(q, typed(n))).toBe(sub(11, 4));
    expect(say(q, typed(3))).toBe('Soustrais 4 de 11 (sans les signes), puis prends le signe du plus grand, 11 : −7.');
  });
  it('exemple 1, dernière ligne', () => {
    const q = qOf(12);
    expect(say(q, typed(-5))).toBe('On prend le signe du plus grand, 8 : −5.');
    expect(say(q, typed(5))).toBe(SIGN);
    expect(say(q, typed(2))).toBe("Le résultat de la ligne du dessus est −(5), c'est-à-dire −5.");
  });
  it('exemple 2, case 1 (non notée) et case 2', () => {
    const c1 = qOf(13);
    expect(say(c1, typed(3))).toBe("Dans −(▢ − 3), on écrit d'abord le plus grand des deux nombres sans signe : 7. On lui retire le plus petit, 3.");
    expect(say(c1, typed(-7))).toBe('On écrit le nombre sans son signe : 7. Le signe − est déjà devant la parenthèse.');
    expect(say(c1, typed(4))).toBe('Dans −(▢ − 3), on met le plus grand des deux nombres, sans son signe : 7.');
    const c2 = qOf(14);
    expect(say(c2, typed(-4))).toBe('7 − 3 = 4, et 7 est négatif : −4.');
    expect(say(c2, typed(4))).toBe(`${SIGN} Ici, c'est 7, et il est négatif.`);
    for (const n of [10, -10]) expect(say(c2, typed(n))).toBe(sub(7, 3));
    expect(say(c2, typed(2))).toBe('Soustrais 3 de 7, puis garde le signe − devant le résultat.');
  });
  it('exercices de fin : négatif en premier, positif en premier, deux opposés', () => {
    const neg = { kind: 'saisie', ex: exOf(c02, '−47 + 29'), promptLatex: '' } as Question;
    expect(say(neg, typed(-18))).toBe('Signes contraires : 47 − 29 = 18. Le plus grand, 47, est négatif : −18.');
    expect(say(neg, typed(18))).toBe(`${SIGN} Ici, c'est 47, et il est négatif.`);
    for (const n of [76, -76]) expect(say(neg, typed(n))).toBe(sub(47, 29));
    expect(say(neg, typed(5))).toBe('Soustrais 29 de 47 (sans les signes), puis prends le signe du plus grand, 47 : −18.');
    const pos = { kind: 'saisie', ex: exOf(c02, '63 + (−18)'), promptLatex: '' } as Question;
    expect(say(pos, typed(45))).toBe('Signes contraires : 63 − 18 = 45. Le plus grand, 63, est positif : 45.');
    expect(say(pos, typed(-45))).toBe(`${SIGN} Ici, c'est 63, et il est positif.`);
    for (const n of [81, -81]) expect(say(pos, typed(n))).toBe(sub(63, 18));
    const zero = { kind: 'saisie', ex: exOf(c02, '−6 + 6'), promptLatex: '' } as Question;
    expect(say(zero, typed(0))).toBe("Deux nombres opposés s'annulent : −6 + 6 = 0.");
    expect(say(zero, typed(12))).toBe(sub(6, 6));
    expect(say(zero, typed(3))).toBe("Deux nombres opposés s'annulent : le résultat est 0.");
  });
  it('feedbackFor : le texte du cours remplace le message du moteur', () => {
    const q = pratiqueQ(3);
    const a = typed(7);
    const o = checkAnswer(c02, q, a);
    expect(feedbackFor(c02, q, a, o)).toMatchObject({ tone: 'faux', message: `${SIGN} Ici, c'est 11, et il est négatif.` });
  });
});

describe('Cours 2 v2 — repassage, fiche et propriété', () => {
  const play = (outcomes: Record<string, boolean[]>) => {
    let s: ActivityState = createActivity('cours', courseRunItems(c02, seededRng(4)), { activityId: 'a', rng: seededRng(4) });
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
    const seen = play({ 'partie-10-1:original': [false] });
    const rep = seen.indexOf('partie-10-1:repetition');
    expect(rep).toBeGreaterThan(seen.indexOf('partie-10-3:original'));
    expect(rep).toBeLessThan(seen.indexOf('fin-0:original'));
  });
  it('une petite question ratée repasse 2 écrans plus loin', () => {
    const seen = play({ 'partie-4:original': [false] });
    expect(seen.indexOf('partie-4:repetition')).toBeGreaterThan(seen.indexOf('partie-4:original'));
    expect(seen.indexOf('partie-4:repetition')).toBeLessThan(seen.indexOf('fin-0:original'));
  });
  it('la case 1 de l’exemple 2 ratée ne repasse pas', () => {
    expect(play({ 'partie-13:original': [false] }).some((k) => k.startsWith('partie-13') && k.endsWith('repetition'))).toBe(false);
  });
  it('fiche mémo', () => {
    const m = c02.memo!;
    expect(m.examples).toEqual(['−7 + 2 = **−5** · 3 + (−8) = **−5**', '−6 + 6 = **0**']);
    expect(m.mistake.wrong).toBe('3 + (−8) = 5');
    expect(m.tip).toBe('Le plus grand sans le signe gagne. −7 + 2 : 7 > 2, donc le résultat est négatif. 7 − 2 = 5. Résultat : −5.');
  });
  it('tirages : 500 par niveau, signes contraires, résolution cohérente, valeurs fausses jamais justes', () => {
    const r = seededRng(77);
    for (const level of [1, 2, 3] as const) {
      for (let i = 0; i < 500; i++) {
        const ex = c02.generate(level, r);
        const [a, b] = ints(ex);
        expect(a! * b!).toBeLessThan(0);
        expect(c02.resolution(ex)).toHaveLength(ex.answer.n === 0 ? 2 : 3);
        for (const e of c02.errors) for (const w of e.wrongValues(ex)) expect(w).not.toEqual(ex.answer);
      }
    }
  });
});
