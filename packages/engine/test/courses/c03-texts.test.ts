import { describe, expect, it } from 'vitest';
import { c03 } from '../../src/courses/calculs/c03-additionner-plusieurs';
import { checkAnswer, courseRunItems, createActivity, current, answer, explanationDone, isDone, seededRng } from '../../src';
import type { ActivityState } from '../../src';
import type { Answer, Question } from '../../src/exercises/types';
import type { EtapeStep, LessonPart } from '../../src/courses/types';
import { feedbackFor } from '../../src/feedback';
import { exOf } from './helpers';

const part = (i: number): LessonPart => c03.parts[i] as LessonPart;
const stepsOf = (i: number): EtapeStep[] => (part(i) as Extract<LessonPart, { type: 'etapes' }>).steps;
const actionOf = (i: number, k: number) => stepsOf(i)[k]?.action;
const pratiqueQ = (k: number): Question => (part(9) as Extract<LessonPart, { type: 'pratique' }>).questions[k]!.question;
const qOf = (i: number): Question => (part(i) as Extract<LessonPart, { type: 'question' }>).question;

/** Texte affiché pour une réponse tapée ou touchée, par feedbackText. */
function say(q: Question, a: Answer): string | null {
  const o = checkAnswer(c03, q, a);
  return c03.feedbackText?.(q, o) ?? null;
}
const typed = (n: number): Answer => ({
  raw: { tokens: [...(n < 0 ? `-${-n}` : String(n))].map((c) => ({ t: 'c' as const, c: c as '-' })), cursor: 'root' as const },
});

const SIGN = "Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe).";
const inv = (p: number, n: number) => `Regarde qui gagne : le total des positifs (${p}) ou celui des négatifs (${n}) ? Le résultat prend le signe du plus grand.`;
const TOUT = "Un positif et un négatif ne s'ajoutent pas comme deux nombres de même signe. Regroupe d'abord les positifs et les négatifs, puis soustrais les deux totaux (sans leur signe).";
const OUBLI = "Il manque un nombre : coche chaque nombre quand tu l'as utilisé.";

describe('Cours 3 v2 — textes des écrans', () => {
  it('encadrés des règles', () => {
    expect(stepsOf(3)[3]?.rule).toEqual({
      n: 1,
      text: '**Je regroupe les positifs ensemble et les négatifs ensemble. Chaque nombre garde son signe, et je les utilise tous.**',
    });
    expect(stepsOf(4)[3]?.rule).toEqual({ n: 2, text: "**Je calcule chaque groupe, puis j'additionne les deux totaux.**" });
  });

  it('accroche : 3 choix, la bonne réponse et deux messages', () => {
    const q = qOf(0);
    expect(q.kind === 'choix' && q.options.map((o) => o.label)).toEqual(['Il me manque 2 €', 'Il me reste 2 €', 'Il me manque 18 €']);
    expect(q.kind === 'choix' && q.correctIndex).toBe(0);
    expect(q.kind === 'choix' && q.options[1]?.why).toBe("En tout, tu as 8 € mais tu dois 10 € : tu dois plus que tu n'as. Il te manque donc 2 €.");
    expect(q.kind === 'choix' && q.options[2]?.why).toBe("18, c'est tout mélangé : ce que tu as et ce que tu dois ne s'additionnent pas ensemble. Compte d'abord ce que tu as (8 €), puis ce que tu dois (10 €), puis compare.");
    const t = part(0);
    expect(t.type === 'question' && t.title).toBe('Additionner plusieurs nombres relatifs');
    expect(t.type === 'question' && t.mention).toBe('Question pour découvrir : elle ne compte pas dans la note.');
  });

  it('idée : 4 bonds, un autre ordre, puis la phrase à trous', () => {
    const s = stepsOf(1);
    expect(s).toHaveLength(3);
    expect(s[0]?.scene?.line?.jumps).toHaveLength(4);
    expect(s[1]?.scene?.line?.jumps.map((j) => j.by)).toEqual([5, 3, -8, -2]);
    const a = s[2]?.action;
    expect(a?.type === 'trou' && [a.open, a.choices[a.correct], a.errors[1]]).toEqual([
      "En changeant l'ordre des bonds, on arrive [ ? ].",
      'au même endroit',
      "Regarde où arrive le dernier bond : c'est le même point que sur le dessin d'avant, −2. Les bonds sont les mêmes, seul l'ordre change.",
    ]);
  });

  it('comparer : A (ce cours) et B (Cours 2), le bon choix est « un bond de plus »', () => {
    const t = part(2);
    expect(t.type === 'question' && [t.compare?.a.latex, t.compare?.b.latex]).toEqual(['-2 + 5 + (-4)', '-2 + 5']);
    const q = qOf(2);
    expect(q.kind === 'choix' && q.options.map((o) => o.label)).toEqual(['Le premier nombre', 'Il y a un bond de plus', 'Le signe du deuxième nombre']);
    expect(q.kind === 'choix' && q.correctIndex).toBe(1);
    expect(q.kind === 'choix' && q.options[0]?.why).toBe('Les deux calculs commencent par −2 : le premier nombre ne change pas.');
    expect(q.kind === 'choix' && q.options[2]?.why).toBe('Le deuxième nombre est 5 dans les deux calculs : son signe ne change pas.');
  });

  it('règle 2 : trois actions, la droite grise et le résultat −2', () => {
    const t = (k: number) => {
      const a = actionOf(4, k);
      if (a?.type !== 'trou') throw new Error('trou attendu');
      return a;
    };
    expect(t(1).choices).toEqual(['−10', '10', '−6']);
    expect(t(1).errors[1]).toBe('Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !');
    expect(t(1).errors[2]).toBe('Même signe : on **additionne** les nombres, on ne les soustrait pas. 8 + 2 = 10, donc −10.');
    expect(t(2).choices).toEqual(['négatif', 'positif']);
    expect(t(2).errors[1]).toBe("Le plus grand des deux nombres sans signe est 10, et il est négatif : le résultat prend son signe. C'est la règle du Cours 2.");
    expect(stepsOf(4)[2]?.scene?.line?.tone).toBe('neutral');
  });

  it('exemple 1 : 2 actions « Je comprends »', () => {
    expect(stepsOf(10).filter((s) => s.action?.type === 'comprends')).toHaveLength(2);
  });

  it('jamais plus de 2 étapes de lecture d’affilée sans action', () => {
    for (const i of [1, 3, 4, 7, 10]) {
      let run = 0;
      for (const s of stepsOf(i)) {
        run = s.action || s.rule ? 0 : run + 1;
        expect(run, `partie ${i}`).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('Cours 3 v2 — messages des étapes interactives (doc 06)', () => {
  const trou = (i: number, k: number) => {
    const a = actionOf(i, k);
    if (a?.type !== 'trou') throw new Error('trou attendu');
    return a;
  };
  it('règle 1 : les négatifs de la somme', () => {
    const t = trou(3, 1);
    expect(t.choices).toEqual(['−8 et −2', '5 et 3', '−8 et 3']);
    expect(t.correct).toBe(0);
    expect(t.errors[1]).toBe("5 et 3 sont positifs : ils n'ont pas de signe −. Cherche les nombres écrits avec un −.");
    expect(t.errors[2]).toBe("3 est positif : il n'a pas de signe −. Il y a deux nombres écrits avec un −.");
  });
  it('de gauche à droite : 5 + (−8), puis −3 + 3', () => {
    const a = trou(7, 1);
    expect(a.choices).toEqual(['−3', '3', '−13']);
    expect(a.errors[1]).toBe(`${SIGN} Ici, c'est 8, et il est négatif.`);
    expect(a.errors[2]).toBe('Signes contraires : on **soustrait**. 8 − 5 = 3, avec le signe − : −3.');
    const b = trou(7, 2);
    expect(b.choices).toEqual(['0', '6', '−6']);
    expect(b.errors[1]).toBe("6, c'est 3 + 3 sans le signe. Ici les signes sont contraires : on soustrait, 3 − 3 = 0.");
    expect(b.errors[2]).toBe("Deux nombres **opposés** s'annulent : −3 et 3 se compensent. Le résultat est 0.");
    expect(stepsOf(7)[3]?.text).toContain('Choisis celle qui te rassure.');
  });
});

describe('Cours 3 v2 — petites questions des règles', () => {
  const opts = (i: number) => {
    const q = qOf(i);
    if (q.kind !== 'choix') throw new Error('choix');
    return q;
  };
  it('règle 1 : la réécriture', () => {
    const q = opts(5);
    expect(q.options.map((o) => o.label)).toEqual(['5 + (−2) + (−4)', '5 + 2 + 4', '5 + (−4)']);
    expect(q.correctIndex).toBe(0);
    expect(q.small).toBe(true);
    expect(q.options[0]?.why).toBe('Les trois nombres sont là, chacun avec son signe : 5, puis (−2) et (−4).');
    expect(q.options[1]?.why).toBe('Ici les signes ont disparu : 2 et 4 sont devenus positifs. Chaque nombre garde son signe quand il change de place.');
    expect(q.options[2]?.why).toBe(`Il manque un nombre : −2 a disparu. Il y avait trois nombres au départ, il n'y en a plus que deux. ${OUBLI}`);
  });
  it('règle 2 : le résultat de 7 + (−1) + (−8)', () => {
    const q = opts(6);
    expect(q.options.map((o) => o.label)).toEqual(['−2', '2', '−16']);
    expect(q.correctIndex).toBe(0);
    expect(q.options[0]?.why).toBe('Positifs : 7. Négatifs : (−1) + (−8) = −9. Puis 7 + (−9) : 9 − 7 = 2, le plus grand, 9, est négatif : −2.');
    expect(q.options[1]?.why).toBe(inv(7, 9));
    expect(q.options[2]?.why).toBe(TOUT);
  });
});

describe('Cours 3 v2 — « Autres façons de faire »', () => {
  const p = part(8);
  if (p.type !== 'autres') throw new Error('autres');
  it('le rappel des règles en haut, puis deux techniques', () => {
    expect(p.recap?.rules.map((r) => r.title)).toEqual([
      '1. Je regroupe les positifs ensemble et les négatifs ensemble.',
      "2. Je calcule chaque groupe, puis j'additionne les deux totaux.",
    ]);
    expect(p.recap?.sentence).toBe("Je regroupe les positifs et les négatifs, je calcule chaque groupe, puis j'additionne les deux totaux.");
    expect(p.techniques.map((t) => t.name)).toEqual(['Chercher les opposés et les nombres ronds', 'Cocher chaque nombre utilisé']);
    expect(p.outro).toBe("Ensuite, tu t'entraînes avec quatre questions.");
  });
  it('essais libres : bonne réponse et messages', () => {
    const [a, b] = p.techniques.map((t) => t.essai);
    expect(a).toMatchObject({ kind: 'saisie', answer: 1 });
    expect(a?.kind === 'saisie' && a.errors).toEqual([{ values: [-1], message: `${SIGN} Ici, c'est 4, et il est positif.` }]);
    expect(a?.kind === 'saisie' && a.fallback).toBe('9 et (−9) s\'annulent. Il reste (−3) + 4 : 4 − 3 = 1.');
    expect(b).toMatchObject({ kind: 'choix', options: ['−3', '2', '−6'], correct: 2 });
  });
});

describe('Cours 3 v2 — questions qui comptent (feedbackText)', () => {
  it('série Q1 : droite à trois bonds', () => {
    const q = pratiqueQ(0);
    expect(say(q, { point: 1 })).toBe('Les bonds : +4, puis −6, puis +3. Positifs : 4 + 3 = 7. Négatif : −6. 7 + (−6) : on arrive à 1.');
    expect(say(q, { point: 0 })).toBe('Tu es resté au départ : il y a trois bonds à suivre, le premier fait 4 graduations vers la droite.');
    expect(say(q, { point: -2 })).toBe("Tu t'es arrêtée après deux bonds, en −2 : il reste le troisième bond, +3, vers la droite.");
    expect(say(q, { point: 4 })).toBe("4, c'est l'arrivée du premier bond seulement. Il reste deux bonds à faire.");
    expect(say(q, { point: 3 })).toBe('Le troisième bond part de −2 et fait 3 graduations vers la droite : −1, 0, 1. On arrive à 1.');
  });
  it('série Q2 : le signe', () => {
    const q = pratiqueQ(1);
    expect(say(q, { choice: 1 })).toBe('Positifs : 3 + 4 = 7. Négatif : −9. Le plus grand, 9, est négatif : le résultat est négatif. 9 − 7 = 2, donc −2.');
    expect(say(q, { choice: 0 })).toBe(inv(7, 9));
  });
  it('série Q3 : une question du Cours 2', () => {
    const q = pratiqueQ(2);
    expect(q.kind === 'choix' && q.options.map((o) => o.label)).toEqual(['2', '−2', '8']);
    expect(q.kind === 'choix' && q.correctIndex).toBe(0);
    expect(q.kind === 'choix' && q.options[1]?.why).toBe(`${SIGN} Ici, c'est 5, et il est positif.`);
    expect(q.kind === 'choix' && q.options[2]?.why).toBe('Les signes sont contraires : on **soustrait** les nombres sans leur signe, on ne les additionne pas. 5 − 3 = 2.');
    expect(checkAnswer(c03, q, { choice: 0 }).correct).toBe(true);
  });
  it('série Q4 : taper 5 + (−9) + 2 + (−4)', () => {
    const q = pratiqueQ(3);
    expect(say(q, typed(-6))).toBe('Positifs : 5 + 2 = 7. Négatifs : (−9) + (−4) = −13. Puis 7 + (−13) : 13 − 7 = 6, le plus grand, 13, est négatif : −6.');
    expect(say(q, typed(6))).toBe(inv(7, 13));
    for (const n of [20, -20]) expect(say(q, typed(n))).toBe(TOUT);
    for (const n of [-11, 3, -8, -2]) expect(say(q, typed(n))).toBe(OUBLI); // un nombre oublié
    expect(say(q, typed(-1))).toBe('Regroupe les positifs (7) et les négatifs (−13), puis additionne les deux totaux : −6.');
  });
  it('exemple 1, dernière ligne', () => {
    const q = qOf(11);
    expect(say(q, typed(1))).toBe('Signes contraires : 9 − 8 = 1. Le plus grand, 9, est positif : 1.');
    expect(say(q, typed(-1))).toBe(inv(9, 8));
    for (const n of [17, -17]) expect(say(q, typed(n))).toBe(TOUT);
    expect(say(q, typed(5))).toBe('Le résultat de la ligne du dessus est 9 + (−8) : 9 − 8 = 1, avec le signe du plus grand, 9.');
  });
  it('exemple 2, case 1 (non notée) et case 2', () => {
    const c1 = qOf(12);
    expect(say(c1, typed(5))).toBe('Positifs : 3 + 2 = 5. Les négatifs, (−5) + (−4), font −9 : même signe, 5 + 4 = 9, et on garde le signe −.');
    expect(say(c1, typed(-5))).toBe('Le total des positifs est positif : on écrit 5, sans signe −.');
    expect(say(c1, typed(4))).toBe('Le groupe des positifs est 3 et 2 : on les additionne, 3 + 2 = 5.');
    const c2 = qOf(13);
    expect(say(c2, typed(-4))).toBe('Signes contraires : 9 − 5 = 4. Le plus grand, 9, est négatif : −4.');
    expect(say(c2, typed(4))).toBe(inv(5, 9));
    for (const n of [14, -14]) expect(say(c2, typed(n))).toBe(TOUT);
    expect(say(c2, typed(2))).toBe('Soustrais 5 de 9 (sans les signes), puis prends le signe du plus grand, 9 : −4.');
  });
  it('exercices de fin : 4 nombres, 3 nombres, deux totaux opposés', () => {
    const e4 = { kind: 'saisie', ex: exOf(c03, '−15 + 8 + (−3) + 11'), promptLatex: '' } as Question;
    expect(say(e4, typed(1))).toBe('Positifs : 8 + 11 = 19. Négatifs : (−15) + (−3) = −18. Puis 19 + (−18) : 19 − 18 = 1, le plus grand, 19, est positif : 1.');
    expect(say(e4, typed(-1))).toBe(inv(19, 18));
    for (const n of [37, -37]) expect(say(e4, typed(n))).toBe(TOUT);
    for (const n of [16, -7, 4, -10]) expect(say(e4, typed(n))).toBe(OUBLI);
    expect(say(e4, typed(0))).toBe('Regroupe les positifs (19) et les négatifs (−18), puis additionne les deux totaux : 1.');
    const e3 = { kind: 'saisie', ex: exOf(c03, '7 + (−1) + (−8)'), promptLatex: '' } as Question;
    expect(say(e3, typed(-2))).toBe('Positif : 7. Négatifs : (−1) + (−8) = −9. Puis 7 + (−9) : 9 − 7 = 2, le plus grand, 9, est négatif : −2.');
    const zero = { kind: 'saisie', ex: exOf(c03, '5 + (−2) + (−3)'), promptLatex: '' } as Question;
    expect(say(zero, typed(0))).toBe("Positif : 5. Négatifs : (−2) + (−3) = −5. Puis 5 + (−5) : deux nombres opposés s'annulent : 0.");
    expect(say(zero, typed(10))).toBe(TOUT);
  });
  it('un calcul de 6 termes : correction avec ses deux totaux', () => {
    const e6 = { kind: 'saisie', ex: exOf(c03, '−47 + 29 + (−83) + 15 + (−62) + 38', 3), promptLatex: '' } as Question;
    expect(say(e6, typed(-110))).toBe('Positifs : 29 + 15 + 38 = 82. Négatifs : (−47) + (−83) + (−62) = −192. Puis 82 + (−192) : 192 − 82 = 110, le plus grand, 192, est négatif : −110.');
    expect(say(e6, typed(110))).toBe(inv(82, 192));
    for (const n of [274, -274]) expect(say(e6, typed(n))).toBe(TOUT);
  });
  it('feedbackFor : le texte du cours remplace le message du moteur', () => {
    const q = pratiqueQ(3);
    const a = typed(6);
    const o = checkAnswer(c03, q, a);
    expect(feedbackFor(c03, q, a, o)).toMatchObject({ tone: 'faux', message: inv(7, 13) });
  });
});

describe('Cours 3 v2 — repassage, fiche et propriété', () => {
  const play = (outcomes: Record<string, boolean[]>) => {
    let s: ActivityState = createActivity('cours', courseRunItems(c03, seededRng(4)), { activityId: 'a', rng: seededRng(4) });
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
    const seen = play({ 'partie-9-1:original': [false] });
    const rep = seen.indexOf('partie-9-1:repetition');
    expect(rep).toBeGreaterThan(seen.indexOf('partie-9-3:original'));
    expect(rep).toBeLessThan(seen.indexOf('fin-0:original'));
  });
  it('une petite question ratée repasse avant les fins', () => {
    const seen = play({ 'partie-5:original': [false] });
    expect(seen.indexOf('partie-5:repetition')).toBeGreaterThan(seen.indexOf('partie-5:original'));
    expect(seen.indexOf('partie-5:repetition')).toBeLessThan(seen.indexOf('fin-0:original'));
  });
  it('la case 1 de l’exemple 2 ratée ne repasse pas', () => {
    expect(play({ 'partie-12:original': [false] }).some((k) => k.startsWith('partie-12') && k.endsWith('repetition'))).toBe(false);
  });
  it('fiche mémo', () => {
    const m = c03.memo!;
    expect(m.examples).toEqual(['5 + (−8) + 3 + (−2) = 5 + 3 + (−8) + (−2) = 8 + (−10) = **−2**']);
    expect(m.mistake.wrong).toBe('5 + (−8) + 3 + (−2) = 5 + 3 + 8 + 2');
    expect(m.tip).toBe("Regrouper les positifs, puis les négatifs. On peut réécrire l'addition dans l'ordre qu'on veut (par exemple d'abord les négatifs, puis les positifs) : chaque nombre garde son signe.");
  });
});
