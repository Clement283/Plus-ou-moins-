import { describe, expect, it } from 'vitest';
import { c01 } from '../../src/courses/calculs/c01-additionner-meme-signe';
import { checkAnswer, courseRunItems, createActivity, current, answer, explanationDone, isDone, seededRng } from '../../src';
import type { ActivityState } from '../../src';
import type { Answer, Question } from '../../src/exercises/types';
import type { EtapeStep, LessonPart } from '../../src/courses/types';
import { droiteExercise } from '../../src/exercises/build/droite';
import { rat } from '../../src/math/rational';
import { seededRng as rng } from '../../src/rng';
import { feedbackFor } from '../../src/feedback';
import { exOf, ints } from './helpers';

const part = (i: number): LessonPart => c01.parts[i] as LessonPart;
const stepsOf = (i: number): EtapeStep[] => (part(i) as Extract<LessonPart, { type: 'etapes' }>).steps;
const actionOf = (i: number, k: number) => stepsOf(i)[k]?.action;
const pratiqueQ = (k: number): Question => (part(7) as Extract<LessonPart, { type: 'pratique' }>).questions[k]!.question;
const qOf = (i: number): Question => (part(i) as Extract<LessonPart, { type: 'question' }>).question;

/** Texte affiché pour une réponse tapée ou touchée, par feedbackText. */
function say(q: Question, a: Answer): string | null {
  const o = checkAnswer(c01, q, a);
  return c01.feedbackText?.(q, o) ?? null;
}
const typed = (_q: Question, n: number): Answer => ({
  raw: { tokens: [...String(n)].map((c) => ({ t: 'c' as const, c: c as '-' })), cursor: 'root' as const },
});

describe('Cours 1 v2 — structure', () => {
  it('13 parties, types dans l\'ordre du plan', () => {
    expect(c01.parts.map((p) => (p.type === 'question' ? `${p.activity}:${p.question.kind}` : p.type))).toEqual([
      'decouverte:choix', 'etapes', 'etapes', 'decouverte:choix', 'etapes', 'etapes', 'etapes', 'pratique',
      'etapes', 'exemple:trou', 'decouverte:trou', 'exemple:trou', 'etapes',
    ]);
    expect(c01.lessonLength).toBe(7);
  });

  it('11 questions notées : série (4), exemple 1 (1), exemple 2 (1), fins (5)', () => {
    const items = courseRunItems(c01, seededRng(3));
    const counted = items.filter((i) => i.type === 'question' && i.activity !== 'decouverte');
    expect(counted).toHaveLength(11);
    expect(counted.map((i) => i.type === 'question' && i.activity)).toEqual([
      'lecon', 'lecon', 'lecon', 'lecon', 'exemple', 'exemple', 'fin', 'fin', 'fin', 'fin', 'fin',
    ]);
    const q = (id: string) => items.find((i) => i.itemId === id);
    expect(q('partie-0')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-3')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-10')).toMatchObject({ activity: 'decouverte' }); // case 1 de l'exemple 2 : non notée
    expect(q('partie-11')).toMatchObject({ activity: 'exemple' });
    expect(q('partie-7-2')).toMatchObject({ texts: { series: { n: 3, of: 4 } } });
  });

  it('les actions des étapes interactives ne sont notées nulle part (aucune question)', () => {
    for (const i of [1, 2, 4, 5, 8]) expect(stepsOf(i).some((s) => s.action)).toBe(true);
  });

  it('droites : cibles dans la droite, 8 graduations au plus', () => {
    for (const i of [1, 2, 4, 5]) {
      for (const s of stepsOf(i)) {
        const l = s.scene?.line;
        const a = s.action;
        if (a?.type === 'graduation' && l) {
          expect(a.target).toBeGreaterThanOrEqual(l.from);
          expect(a.target).toBeLessThanOrEqual(l.to);
          expect(l.to - l.from + 1).toBeLessThanOrEqual(8);
          for (const e of a.errors) for (const at of e.at) expect(at >= l.from && at <= l.to).toBe(true);
        }
      }
    }
    const q = pratiqueQ(0);
    expect(q.kind === 'droite' && q.line.to - q.line.from + 1).toBeLessThanOrEqual(8);
  });

  it('chaque règle d\'erreur pointe l\'encadré du même numéro', () => {
    for (const e of c01.errors) {
      const p = c01.parts[e.rule!.partIndex];
      expect(p?.type).toBe('etapes');
      expect(p?.type === 'etapes' && p.steps.find((s) => s.rule)?.rule?.n).toBe(e.rule!.n);
    }
  });

  it('textes des écrans', () => {
    expect(part(1).type === 'etapes' && part(1).title).toBe('La droite graduée et les bonds');
    expect(stepsOf(1)[2]?.text).toBe('**Ajouter un nombre positif**, c\'est faire un bond vers la **droite**. On part de 0 et on ajoute 3.');
    expect(stepsOf(4)[2]?.rule?.text).toBe("**Deux nombres de même signe : j'additionne les nombres sans leur signe.**");
    expect(stepsOf(5)[3]?.rule?.text).toBe('**Je garde le signe des deux nombres.**');
    expect(stepsOf(12).map((s) => s.text).join(' ')).toContain('4 exercices de fin justes sur 5');
  });
});

describe('Cours 1 v2 — messages des étapes interactives (doc 06)', () => {
  const grad = (i: number, k: number) => {
    const a = actionOf(i, k);
    if (a?.type !== 'graduation') throw new Error('graduation attendue');
    return a;
  };
  const msg = (i: number, k: number, at: number) => grad(i, k).errors.find((e) => e.at.includes(at))?.message ?? grad(i, k).fallback;
  it.each([
    [3, 0, 'Tu es resté au départ : le bond fait 3 graduations.'],
    [3, -2, 'Ajouter un nombre positif, c\'est avancer vers la droite. Tu es parti vers la gauche.'],
    [3, 4, 'Une graduation de trop : le bond fait exactement 3 graduations.'],
    [3, 1, 'Il manque des graduations : le bond en fait 3. Compte-les une par une à partir de 0.'],
    [3, 2, 'Il manque des graduations : le bond en fait 3. Compte-les une par une à partir de 0.'],
  ])('écran 2, étape 3 : toucher %i → message', (_k, at, m) => expect(msg(1, 2, at)).toBe(m));
  it.each([
    [0, 'Tu es resté au départ : le bond fait 3 graduations.'],
    [2, 'Ajouter un nombre négatif, c\'est reculer vers la gauche. Tu es parti vers la droite.'],
    [-4, 'Une graduation de trop : le bond fait exactement 3 graduations.'],
    [-1, 'Il manque des graduations : le bond en fait 3. Compte-les une par une à partir de 0.'],
    [-2, 'Il manque des graduations : le bond en fait 3. Compte-les une par une à partir de 0.'],
  ])('écran 2, étape 4 : toucher %i → message', (at, m) => expect(msg(1, 4, at)).toBe(m));

  const trou = (i: number, k: number) => {
    const a = actionOf(i, k);
    if (a?.type !== 'trou') throw new Error('trou attendu');
    return a;
  };
  it('phrases à trous : choix attendus et messages', () => {
    const t25 = trou(1, 5);
    expect([t25.choices[t25.correct], t25.errors[0]]).toEqual(['gauche', "Ajouter un nombre négatif, c'est reculer : vers la gauche."]);
    const t33 = trou(2, 2);
    expect([t33.choices[t33.correct], t33.errors[1]]).toEqual(['gauche', 'Regarde la droite : les deux bonds reculent, comme une dette qui grandit.']);
    const t52 = trou(4, 1);
    expect(t52.choices).toEqual(['2', '8', '15']);
    expect(t52.choices[t52.correct]).toBe('8');
    expect(t52.errors[0]).toBe("Soustraire, ce serait pour des bonds de sens contraires. Ici les deux bonds vont dans le même sens : ils s'ajoutent.");
    expect(t52.errors[2]).toBe('On additionne les longueurs, on ne les multiplie pas : 3 + 5.');
    const t62 = trou(5, 1);
    expect(t62.choices).toEqual(['8', '−8', '−2']);
    expect(t62.choices[t62.correct]).toBe('−8');
    expect(t62.errors[0]).toBe('Le trajet fait bien 8 graduations, mais on arrive à gauche de 0 : il faut garder le signe.');
    expect(t62.errors[2]).toBe('−2 viendrait de 5 − 3. Ici les bonds s\'ajoutent : 3 + 5 = 8, avec le signe −.');
  });

  it('exemple 1 : 2 actions « Je comprends »', () => {
    expect(stepsOf(8).filter((s) => s.action?.type === 'comprends')).toHaveLength(2);
  });
});

describe('Cours 1 v2 — questions pour deviner et comprendre', () => {
  const why = (q: Question, i: number) => (q.kind === 'choix' ? q.options[i]?.why : undefined);
  it('écran 1', () => {
    const q = qOf(0);
    expect(q.kind === 'choix' && q.options.map((o) => o.label)).toEqual(['2 €', '8 €', '15 €']);
    expect(q.kind === 'choix' && q.correctIndex).toBe(1);
    expect(why(q, 0)).toBe('Tu dois déjà 3 €, puis tu dois encore 5 € de plus : ta dette grandit, elle ne diminue pas. Tu dois 8 €.');
    expect(why(q, 1)).toBe("Deux dettes qui s'ajoutent font une dette plus grande. Le cours va t'expliquer comment l'écrire avec des nombres négatifs.");
    expect(why(q, 2)).toBe('On additionne les deux dettes : 3 + 5 = 8, pas 3 × 5. Tu dois 8 €.');
  });
  it('écran 4', () => {
    const q = qOf(3);
    expect(q.kind === 'choix' && q.correctIndex).toBe(2);
    expect(why(q, 0)).toBe('Le premier nombre est −3 dans les deux calculs : il ne change pas.');
    expect(why(q, 1)).toBe("Le deuxième bond fait 5 graduations dans les deux calculs : ce n'est pas sa longueur qui change, c'est son sens.");
    expect(why(q, 2)).toBe('Le deuxième nombre est négatif dans le calcul A, positif dans le calcul B : un signe change, donc le sens du bond change.');
    const t = part(3);
    expect(t.type === 'question' && t.compare?.a.latex).toBe('-3 + (-5)');
    expect(t.type === 'question' && t.compare?.line).toMatchObject({ from: -9, to: 3 });
  });
});

describe('Cours 1 v2 — questions qui comptent (feedbackText)', () => {
  const SIGN = 'Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !';
  it('Q1 droite', () => {
    const q = pratiqueQ(0);
    expect(say(q, { point: -7 })).toBe('Les deux bonds vont vers la gauche, bout à bout : 2 + 5 = 7, on arrive à −7.');
    for (const p of [-6, 7, 0, -2]) expect(say(q, { point: p })).toBe('Le deuxième bond part de −2 et fait 5 graduations vers la gauche : −3, −4, −5, −6, −7. On arrive à −7.');
  });
  it('Q2 signe', () => {
    const q = pratiqueQ(1);
    expect(say(q, { choice: 1 })).toBe('Les deux nombres sont négatifs : on garde le signe −. Le résultat est négatif.');
    expect(say(q, { choice: 0 })).toBe(SIGN);
  });
  it('Q3 vrai ou faux', () => {
    const q = pratiqueQ(2);
    expect(say(q, { bool: false })).toBe('Faux : 4 + 3 = 7, mais on garde le signe −. Le bon résultat est −7.');
    expect(say(q, { bool: true })).toBe('On a bien additionné 4 et 3, mais les deux nombres sont négatifs : le résultat est négatif aussi. −4 + (−3) = −7.');
  });
  it('Q4 saisie', () => {
    const q = pratiqueQ(3);
    expect(say(q, typed(q, -17))).toBe('8 + 9 = 17, et on garde le signe − : −17.');
    expect(say(q, typed(q, 17))).toBe(SIGN);
    for (const n of [-1, 1]) expect(say(q, typed(q, n))).toBe('Même signe : on **additionne** les nombres, on ne les soustrait pas. 8 + 9 = 17, donc −17.');
    expect(say(q, typed(q, 5))).toBe('Additionne 8 et 9 sans les signes, puis garde le signe −. Le résultat est −17.');
  });
  it('exemple 1, dernière ligne', () => {
    const q = qOf(9);
    expect(say(q, typed(q, -13))).toBe('On garde le signe − : −13.');
    expect(say(q, typed(q, 13))).toBe(SIGN);
    expect(say(q, typed(q, 5))).toBe("Le résultat de la ligne du dessus est −(13), c'est-à-dire −13.");
  });
  it('exemple 2, case 1 (non notée) et case 2', () => {
    const c1 = qOf(10);
    expect(say(c1, typed(c1, -1))).toBe('On écrit le nombre sans son signe : 1. Le signe − est déjà devant la parenthèse.');
    expect(say(c1, typed(c1, 4))).toBe("Dans −(6 + ▢), on remet le deuxième nombre du calcul sans son signe : 1.");
    const c2 = qOf(11);
    expect(say(c2, typed(c2, 7))).toBe(SIGN);
    for (const n of [-5, 5]) expect(say(c2, typed(c2, n))).toBe('Même signe : on **additionne** les nombres, on ne les soustrait pas. 6 + 1 = 7, donc −7.');
    expect(say(c2, typed(c2, 3))).toBe('Additionne 6 et 1, puis garde le signe − devant le résultat.');
  });
  it('exercices de fin : négatifs et positifs', () => {
    const neg = { kind: 'saisie', ex: exOf(c01, '−8 + (−7)'), promptLatex: '' } as Question;
    expect(say(neg, typed(neg, -15))).toBe('8 + 7 = 15, et on garde le signe − : −15.');
    expect(say(neg, typed(neg, 15))).toBe(SIGN);
    for (const n of [-1, 1]) expect(say(neg, typed(neg, n))).toBe('Même signe : on **additionne** les nombres, on ne les soustrait pas. 8 + 7 = 15, donc −15.');
    expect(say(neg, typed(neg, 3))).toBe('Additionne 8 et 7 sans les signes, puis garde le signe −.');
    const pos = { kind: 'saisie', ex: exOf(c01, '7 + 6'), promptLatex: '' } as Question;
    expect(say(pos, typed(pos, 13))).toBe('7 + 6 = 13, et le résultat reste positif.');
    expect(say(pos, typed(pos, -13))).toBe('Les deux nombres sont positifs : le résultat est positif aussi.');
    for (const n of [-1, 1]) expect(say(pos, typed(pos, n))).toBe('Même signe : on **additionne** les nombres, on ne les soustrait pas. 7 + 6 = 13, donc 13.');
    expect(say(pos, typed(pos, 4))).toBe('Additionne 7 et 6 : le résultat reste positif.');
  });
  it('feedbackFor : le texte du cours remplace le message du moteur', () => {
    const q = pratiqueQ(3);
    const a = typed(q, 17);
    const o = checkAnswer(c01, q, a);
    expect(feedbackFor(c01, q, a, o)).toMatchObject({ tone: 'faux', message: SIGN });
  });
});

describe('Cours 1 v2 — repassage et propriété', () => {
  const play = (outcomes: Record<string, boolean[]>) => {
    let s: ActivityState = createActivity('cours', courseRunItems(c01, seededRng(4)), { activityId: 'a', rng: seededRng(4) });
    const seen: string[] = [];
    const used: Record<string, number> = {};
    for (let g = 0; g < 200 && !isDone(s); g++) {
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
  it('une question de la série ratée repasse avant les fins, une seule fois comptée', () => {
    const seen = play({ 'partie-7-1:original': [false] });
    const rep = seen.indexOf('partie-7-1:repetition');
    expect(rep).toBeGreaterThan(seen.indexOf('partie-7-3:original'));
    expect(rep).toBeLessThan(seen.indexOf('fin-0:original'));
  });
  it('la case 1 de l\'exemple 2 ratée ne repasse pas', () => {
    expect(play({ 'partie-10:original': [false] }).some((k) => k.startsWith('partie-10') && k.endsWith('repetition'))).toBe(false);
  });
  it('tirages : 500 par niveau, même signe, négatifs ≈ 70 %, résolution en 3 lignes', () => {
    const r = rng(77);
    for (const level of [1, 2, 3] as const) {
      let neg = 0;
      for (let i = 0; i < 500; i++) {
        const ex = c01.generate(level, r);
        const [a, b] = ints(ex);
        expect(Math.sign(a!)).toBe(Math.sign(b!));
        if (a! < 0) neg++;
        expect(c01.resolution(ex)).toHaveLength(3);
        for (const e of c01.errors) for (const w of e.wrongValues(ex)) expect(w).not.toEqual(ex.answer);
      }
      expect(neg / 500).toBeGreaterThan(0.6);
      expect(neg / 500).toBeLessThan(0.8);
    }
  });
  it('droiteExercise : 500 tirages tiennent dans 8 graduations', () => {
    const r = rng(5);
    for (let i = 0; i < 500; i++) {
      const ex = droiteExercise(c01, r);
      const [a, b] = ints(ex);
      const pts = [0, a!, a! + b!];
      expect(Math.max(...pts) - Math.min(...pts)).toBeLessThanOrEqual(7);
      expect(rat(ex.answer.n)).toEqual(ex.answer);
    }
  });
});
