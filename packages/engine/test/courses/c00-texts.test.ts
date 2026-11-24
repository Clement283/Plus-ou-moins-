// Cours 0 v3 : les textes du doc 06 (partie « Cours 0 », version 3), une ligne de table = un cas.
import { describe, expect, it } from 'vitest';
import { c00, joinPieces } from '../../src/courses/calculs/c00-bien-ecrire';
import type { EtapeStep, LessonPart, StepAction } from '../../src/courses/types';
import { checkAnswer } from '../../src/exercises/check';
import type { Answer, Outcome, Question } from '../../src/exercises/types';

type Q<K extends Question['kind']> = Extract<Question, { kind: K }>;
const part = (i: number): LessonPart => c00.parts[i] as LessonPart;
const etapes = (i: number): Extract<LessonPart, { type: 'etapes' }> => {
  const p = part(i);
  if (p.type !== 'etapes') throw new Error(`partie ${i} : pas une explication pas à pas`);
  return p;
};
const question = (i: number): Extract<LessonPart, { type: 'question' }> => {
  const p = part(i);
  if (p.type !== 'question') throw new Error(`partie ${i} : pas une question`);
  return p;
};
const choix = (i: number): Q<'choix'> => {
  const q = question(i).question;
  if (q.kind !== 'choix') throw new Error('choix');
  return q;
};
const practice = (k: number): { question: Question; texts?: NonNullable<Extract<LessonPart, { type: 'pratique' }>['questions'][number]['texts']> } => {
  const p = part(11);
  if (p.type !== 'pratique') throw new Error('pratique');
  return p.questions[k]!;
};
type Touch = Extract<StepAction, { type: 'morceau' | 'endroit' }>;
type ActionOf<T extends string> = T extends 'morceau' | 'endroit' ? Touch : Extract<StepAction, { type: T }>;
const action = <T extends StepAction['type']>(part_: number, step: number, type: T): ActionOf<T> => {
  const a = etapes(part_).steps[step]?.action;
  if (a?.type !== type) throw new Error(`partie ${part_}, étape ${step + 1} : pas de ${type}`);
  return a as ActionOf<T>;
};
const texts = (i: number): (string | undefined)[] => etapes(i).steps.map((s: EtapeStep) => s.text);

/** Le message d'un toucher : les erreurs ciblées d'abord, sinon le repli. */
const touched = (a: Touch, at: number): string => a.errors.find((f) => f.at.includes(at))?.message ?? a.fallback;

const M = '−';

describe('étapes : titres et phrases, mot pour mot', () => {
  it('écran 2 : « Le signe − a deux rôles »', () => {
    expect(etapes(1).title).toBe('Le signe − a deux rôles');
    expect(texts(1)).toEqual([
      'Le signe **−** a **deux rôles**. Le premier : **soustraire**. Dans 7 − 3, on enlève 3 à 7.',
      "Le deuxième : **dire qu'un nombre est négatif**. Dans −3, le signe fait partie du nombre : on lit « moins trois ».",
      'Ce − est entre 2 et 5 : on enlève 5. Le − du début est, lui, le signe de −6.',
      "Un − placé tout au début d'un calcul est le signe du nombre. Quand tu lis un calcul, demande-toi toujours **quel rôle joue chaque −**. Les 4 règles de ce cours servent à ça.",
    ]);
  });
  it('écran 3 : « Quand deux signes se touchent »', () => {
    expect(etapes(2).title).toBe('Quand deux signes se touchent');
    expect(texts(2)).toEqual([
      'Voici 4 × −3. Le **×** et le **−** sont **collés** : deux signes se touchent.',
      "Ce −, est-ce qu'il soustrait ? Ou est-ce le signe de 3 ? **On ne sait plus.**",
      "La parenthèse se ferme après le 3. Elles entourent −3 : c'est **un seul nombre**, le − ne soustrait plus rien.",
      undefined,
    ]);
    expect(etapes(2).steps[3]?.rule).toEqual({ n: 1, text: '**Deux signes ne se suivent jamais.** Après +, −, × ou ÷, un nombre négatif se met entre parenthèses.' });
    expect(action(2, 1, 'morceau').consigne).toBe('Touche le signe qui se colle au ×.');
    expect(action(2, 2, 'endroit').consigne).toBe("Touche l'endroit où la parenthèse ouvrante doit aller.");
  });
  it('écran 4 : « La règle 1, à toi »', () => {
    const p = question(3);
    expect(p.title).toBe('La règle 1, à toi');
    expect(p.intro).toEqual(['La règle marche aussi après un − et un ÷. Le nombre ne change pas, le résultat non plus.']);
    expect(p.above).toHaveLength(2);
    expect(choix(3).prompt).toBe('Comment écrire correctement ce calcul ?');
    expect(choix(3).options.map((o) => o.label)).toEqual(['(5 + −2)', '5 + (−2)', '5 (+ −2)']);
    expect(choix(3).correctIndex).toBe(1);
  });
  it('écran 5 : « Et au début du calcul ? »', () => {
    expect(question(4).title).toBe('Et au début du calcul ?');
    expect(choix(4).prompt).toBe('Ce calcul commence par un nombre négatif. Faut-il des parenthèses autour de −3 ?');
    expect(choix(4).options.map((o) => o.label)).toEqual(['Oui', 'Non']);
    expect(choix(4).correctIndex).toBe(1);
    expect(question(4).outroRule).toEqual({ n: 2, text: "**En tête d'un calcul, pas de parenthèses** pour un nombre négatif." });
    expect(question(4).outro).toEqual(['−3 + 5 ✓', '(−3) + 5 : pas faux, mais inutile']);
  });
  it('écran 6 : « Le moins se met avant le nombre »', () => {
    expect(etapes(5).title).toBe('Le moins se met avant le nombre');
    expect(texts(5)).toEqual([
      'Dans 3− + 4, le − est écrit **après** le 3, et juste après lui, il y a un +.',
      "On croit qu'on soustrait quelque chose au 3. Mais juste après, il y a un + : **il n'y a rien à soustraire**.",
      "Le signe d'un nombre négatif s'écrit **devant** le nombre : −3 + 4.",
      undefined,
    ]);
    expect(etapes(5).steps[3]?.rule).toEqual({ n: 3, text: "**Le signe − d'un nombre négatif s'écrit toujours avant le nombre :** −3, jamais 3−." });
    expect(action(5, 1, 'morceau').consigne).toBe('Touche le − qui est mal placé.');
    expect(action(5, 2, 'endroit').consigne).toBe("Le − quitte sa place. Touche l'endroit où il doit aller.");
  });
  it('écran 7 : « Une parenthèse ouverte se ferme »', () => {
    expect(etapes(6).title).toBe('Une parenthèse ouverte se ferme');
    expect(texts(6)).toEqual([
      "Dans 4 × (−3, une parenthèse **s'ouvre**. Rien ne la **ferme**.",
      "Sans parenthèse fermante, on ne sait pas où le nombre s'arrête. Les parenthèses vont toujours **par deux**, comme des guillemets.",
      "Maintenant, on voit où le nombre s'arrête : **−3** est bien entouré.",
      undefined,
    ]);
    expect(etapes(6).steps[3]?.rule).toEqual({ n: 4, text: '**Une parenthèse ouverte doit toujours être fermée.**' });
    expect(action(6, 1, 'trou').open).toBe('Sans parenthèse fermante, on ne sait pas où le nombre [ ? ].');
    expect(action(6, 2, 'endroit').consigne).toBe("Touche l'endroit où la parenthèse fermante doit aller.");
  });
  it('écran 8 : « Règles 3 et 4, à toi »', () => {
    expect(question(7).title).toBe('Règles 3 et 4, à toi');
    expect(choix(7).prompt).toBe('Lequel est bien écrit ?');
    expect(choix(7).options.map((o) => o.label)).toEqual(['7−', '−7']);
    expect(choix(8).prompt).toBe('Que manque-t-il à ce calcul ?');
    expect(choix(8).options.map((o) => o.label)).toEqual(['(', ')', '−']);
    expect(question(8).joinPrevious).toBe(true);
  });
  it('écran 9 : « Comparer deux cas »', () => {
    const p = question(9);
    expect(p.title).toBe('Comparer deux cas');
    expect(p.mention).toBe('Question pour comprendre : elle ne compte pas dans la note.');
    expect(p.compare?.note).toBe('Voici deux écritures du même calcul. Regarde-les bien.');
    expect(p.compare?.a).toEqual({ label: 'Calcul A', latex: '4 \\times (-3)' });
    expect(p.compare?.b).toEqual({ label: 'Calcul B', latex: '4 \\times -3' });
    expect(p.compare?.line).toBeUndefined();
    expect(p.compare?.after).toEqual([
      "Dans B, le × et le − se touchent : on ne sait plus si le − soustrait. Dans A, −3 est **un seul nombre**, entouré de parenthèses. Le calcul A se lit d'**une seule façon** : c'est le bien écrit.",
    ]);
    expect(choix(9).prompt).toBe("Qu'est-ce qui change entre A et B ?");
    expect(choix(9).options.map((o) => o.label)).toEqual(['Le résultat', "La façon de l'écrire", 'Le nombre 3']);
    expect(choix(9).correctIndex).toBe(1);
  });
  it('écran 10 : « Les 4 règles à retenir »', () => {
    expect(etapes(10).title).toBe('Les 4 règles à retenir');
    expect(etapes(10).steps[0]?.recap?.map((r) => r.title)).toEqual([
      '1. Deux signes ne se suivent jamais.',
      '2. En tête, pas de parenthèses.',
      '3. Le − se met avant le nombre.',
      '4. Une parenthèse ouverte se ferme.',
    ]);
    expect(etapes(10).steps[0]?.text).toBe('Maintenant, à toi de les utiliser.');
  });
  it('écran 1 : accroche, écran 14 : annonce', () => {
    expect(question(0).title).toBe('Bien écrire un calcul');
    expect(question(0).intro).toEqual([
      "En maths, un calcul doit se lire **d'une seule façon**. S'il est mal écrit, on peut se tromper même en connaissant la méthode.",
      "Dans ce cours, tu vas apprendre **4 règles d'écriture**.",
    ]);
    expect(choix(0).prompt).toBe('Pour commencer, à ton avis : ce calcul est-il bien écrit ?');
    expect(etapes(16).title).toBe('Place aux 5 exercices de fin');
    expect(texts(16).join(' ')).toContain('au moins **4 exercices de fin justes sur 5**');
  });
  it('écran 12 : exemple 1 résolu à l’écran', () => {
    expect(etapes(12).steps.map((s) => s.action?.type)).toEqual(['comprends', 'comprends']);
    expect(texts(12)).toEqual([
      "**Ligne 1** Le × et le − se touchent : c'est la règle 1 qui n'est pas respectée.",
      "**Ligne 2** −2 est un seul nombre : on l'entoure de parenthèses. Le nombre ne change pas, le résultat non plus.",
    ]);
  });
});

describe('étapes interactives : les 17 lignes du tableau', () => {
  const m = (p: number, s: number) => action(p, s, 'morceau');
  const e = (p: number, s: number) => action(p, s, 'endroit');
  const cases: [string, string, string][] = [
    ['2, étape 3, le − du début', touched(m(1, 2), 0), "Ce − est tout au début : il n'y a rien à soustraire. C'est le signe de −6."],
    ['2, étape 3, le 6', touched(m(1, 2), 1), "Ce n'est pas un −. Cherche les deux traits − du calcul."],
    ['2, étape 3, le +', touched(m(1, 2), 2), "Ce n'est pas un −. Cherche les deux traits − du calcul."],
    ['2, étape 3, le 2', touched(m(1, 2), 3), "Ce n'est pas un −. Cherche les deux traits − du calcul."],
    ['2, étape 3, le 5', touched(m(1, 2), 5), "Ce n'est pas un −. Cherche les deux traits − du calcul."],
    ['2, étape 4, une soustraction', action(1, 3, 'trou').errors[1] ?? '', "Au début, il n'y a rien avant le − : on ne peut rien soustraire."],
    ['3, étape 2, le ×', touched(m(2, 1), 1), "C'est le × lui-même. Cherche le signe qui le touche, juste à sa droite."],
    ['3, étape 2, le 4', touched(m(2, 1), 0), '4 est un nombre, pas un signe. Cherche le signe collé au ×.'],
    ['3, étape 2, le 3', touched(m(2, 1), 3), '3 est un nombre, pas un signe. Cherche le signe collé au ×.'],
    ['3, étape 3, entre 4 et ×', touched(e(2, 2), 1), 'Là, la parenthèse entourerait le × aussi. Mais le × est une opération : il reste dehors.'],
    ['3, étape 3, entre − et 3', touched(e(2, 2), 3), 'Là, elle couperait −3 en deux. Le − fait partie du nombre : il doit être dedans.'],
    ['6, étape 2, le 3', touched(m(5, 1), 0), 'Le 3 est un nombre, il est bien écrit. Cherche le signe − mal placé.'],
    ['6, étape 2, le +', touched(m(5, 1), 2), 'Le + est bien placé : il additionne 4. Cherche le −.'],
    ['6, étape 2, le 4', touched(m(5, 1), 3), 'Le 4 est bien écrit. Cherche le −.'],
    ['6, étape 3, entre 3 et +', touched(e(5, 2), 1), "Là, le − serait encore après le 3 : c'est la même faute. Le signe d'un nombre négatif se met avant le nombre."],
    ['6, étape 3, entre + et 4', touched(e(5, 2), 2), 'Là, il se collerait au + : deux signes se touchent (règle 1). Et il rendrait le 4 négatif, pas le 3.'],
    ['7, étape 2, commence', action(6, 1, 'trou').errors[1] ?? '', "Le nombre commence bien après la parenthèse ouverte. C'est la fin qu'on ne voit pas."],
    ['7, étape 3, entre − et 3', touched(e(6, 2), 4), "Là, elle couperait −3 en deux. Le nombre n'est fini qu'après le 3."],
    ['7, étape 3, entre ( et −', touched(e(6, 2), 3), "Là, elle se fermerait avant le nombre. Une parenthèse se ferme après ce qu'elle entoure."],
    ['7, étape 3, entre 4 et ×', touched(e(6, 2), 1), "Là, elle se fermerait avant d'avoir été ouverte. Elle doit venir après l'ouverture."],
    ['7, étape 3, entre × et (', touched(e(6, 2), 2), "Là, elle se fermerait avant d'avoir été ouverte. Elle doit venir après l'ouverture."],
  ];
  for (const [name, got, want] of cases) it(name, () => expect(got).toBe(want));

  it('les cibles : morceaux et espaces valides, trou : indice de choix', () => {
    const calcLen = (p: number, s: number, calc: number): number => {
      const scene = etapes(p).steps.slice(0, s + 1).reverse().find((st) => st.scene)!.scene!;
      return scene.calcs[calc]!.tokens.length;
    };
    const checks: [number, number][] = [[1, 2], [2, 1], [5, 1]];
    for (const [p, s] of checks) {
      const a = m(p, s);
      expect(a.target.every((t) => t >= 0 && t < calcLen(p, s, a.calc))).toBe(true);
    }
    for (const [p, s] of [[2, 2], [5, 2], [6, 2]] as [number, number][]) {
      const a = e(p, s);
      const n = calcLen(p, s, a.calc);
      expect(a.target.every((t) => t >= 0 && t <= n)).toBe(true);
      expect(a.gaps?.every((g) => g >= 0 && g <= n)).toBe(true);
      expect(a.gaps).toContain(a.target[0]);
    }
    // 3 emplacements aux écrans 3 et 6, 5 à l'écran 7
    expect(e(2, 2).gaps).toEqual([1, 2, 3]);
    expect(e(5, 2).gaps).toEqual([0, 1, 2]);
    expect(e(6, 2).gaps).toEqual([1, 2, 3, 4, 5]);
    for (const [p, s] of [[1, 3], [6, 1]] as [number, number][]) {
      const a = action(p, s, 'trou');
      expect(a.correct).toBeLessThan(a.choices.length);
    }
    // cibles précises
    expect(m(1, 2).target).toEqual([4]);
    expect(m(2, 1).target).toEqual([2]);
    expect(e(2, 2).target).toEqual([2]);
    expect(m(5, 1).target).toEqual([1]);
    expect(e(5, 2).target).toEqual([0]);
    expect(e(6, 2).target).toEqual([5]);
  });
});

describe('questions pour deviner et pour comprendre : les 7 lignes', () => {
  const why = (q: Q<'choix'>, label: string): string => q.options.find((o) => o.label === label)?.why ?? '';
  it('écran 1', () => {
    expect(why(choix(0), 'Non')).toBe('Il lui manque quelque chose. Tu vas voir quoi, et surtout pourquoi.');
    expect(why(choix(0), 'Oui')).toBe("Il est mal écrit. Ce n'est pas grave de ne pas le savoir encore : c'est justement ce que ce cours explique.");
  });
  it('écran 5', () => {
    expect(why(choix(4), 'Non')).toBe("Devant −3, il n'y a aucun signe. Rien ne se touche, donc pas besoin de parenthèses.");
    expect(why(choix(4), 'Oui')).toBe("Regarde devant −3 : il n'y a aucun signe. Rien ne se touche, donc pas besoin de parenthèses.");
  });
  it('écran 9', () => {
    expect(why(choix(9), 'Le résultat')).toBe('Le résultat est le même : 4 fois −3 donne −12 dans les deux cas. Ce n\'est pas le calcul qui change.');
    expect(why(choix(9), "La façon de l'écrire")).toBe("Le calcul et le résultat sont les mêmes. Seule l'écriture change : A a des parenthèses, B n'en a pas.");
    expect(why(choix(9), 'Le nombre 3')).toBe("Le nombre est −3 dans les deux calculs. Seule la façon de l'écrire change.");
  });
});

describe('questions qui comptent : feedbackText', () => {
  /** Le retour du cours pour une réponse à une question de leçon. */
  const fb = (q: Question, a: Answer): string | null => {
    const o: Outcome = checkAnswer(c00, q, a);
    return c00.feedbackText?.(q, o) ?? null;
  };
  const pick = (q: Q<'choix'>, label: string): string | null => fb(q, { choice: q.options.findIndex((o) => o.label === label) });
  const text = (q: Question, t: string): string | null => fb(q, { text: t });

  it('écran 4', () => {
    expect(pick(choix(3), '(5 + −2)')).toBe('Les parenthèses doivent entourer le nombre négatif, pas tout le calcul. Ici + et − se touchent encore.');
    expect(pick(choix(3), '5 + (−2)')).toBe('Les parenthèses entourent le nombre négatif −2. Le + et le − ne se touchent plus.');
    expect(pick(choix(3), '5 (+ −2)')).toBe('Le + est une opération : il reste en dehors. Seul le nombre négatif −2 va entre parenthèses.');
  });
  it('écran 8', () => {
    expect(pick(choix(7), '7−')).toBe('Le signe se met devant : −7. Écrit après, on croirait une soustraction.');
    expect(pick(choix(7), '−7')).toBe('Le signe est devant le nombre : −7, « moins sept ».');
    expect(pick(choix(8), '(')).toBe('Une parenthèse est déjà ouverte. Il manque celle qui la ferme : « ) ».');
    expect(pick(choix(8), '−')).toBe('Le − est déjà là, devant le 3. Il manque la parenthèse qui ferme : « ) ».');
    expect(pick(choix(8), ')')).toBe('La parenthèse ouverte est maintenant fermée : 4 × (−3).');
  });
  it('écran 11, Q1 : toucher l’endroit mal écrit', () => {
    const q = practice(0).question as Q<'erreur'>;
    expect(q.lines).toEqual(['5', '+', '-', '2']);
    expect(q.accept).toEqual([1, 2]);
    expect(fb(q, { line: 0 })).toBe('Les nombres sont bien écrits. Cherche les deux signes qui se touchent : + et −.');
    expect(fb(q, { line: 3 })).toBe('Les nombres sont bien écrits. Cherche les deux signes qui se touchent : + et −.');
    expect(fb(q, { line: 1 })).toBe('Le + et le − se touchent. On écrit 5 + (−2).');
    expect(fb(q, { line: 2 })).toBe('Le + et le − se touchent. On écrit 5 + (−2).');
    expect(practice(0).texts?.consigne).toBe("Rappel de la règle 1 : **deux signes ne se suivent jamais**. Touche l'endroit mal écrit de ce calcul.");
  });
  it('écran 11, Q2 : choisir la règle', () => {
    const q = practice(1).question as Q<'choix'>;
    expect(q.prompt).toBe("Ce calcul est mal écrit. **Touche la règle** qui n'est pas respectée.");
    expect(q.options.map((o) => o.label)).toEqual(['Deux signes se touchent', 'Le moins est après le nombre', "Une parenthèse n'est pas fermée"]);
    expect(q.correctIndex).toBe(2);
    expect(pick(q, 'Deux signes se touchent')).toBe("Il n'y a pas de signes collés ici : le × est suivi d'une parenthèse. Le problème est ailleurs.");
    expect(pick(q, 'Le moins est après le nombre')).toBe('Le − de −3 est bien devant le 3. Le problème : la parenthèse reste ouverte.');
    expect(pick(q, "Une parenthèse n'est pas fermée")).toBe('La parenthèse ouverte ne se ferme pas : 4 × (−3).');
  });
  it('écran 11, Q3 : vrai ou faux', () => {
    const q = practice(2).question as Q<'choix'>;
    expect(q.calcLatex).toBe('-6 - (-2) \\times 4');
    expect(q.prompt).toBe('Ce calcul est bien écrit.');
    expect(practice(2).texts?.intro).toEqual(['Touche Vrai ou Faux.']);
    expect(q.correctIndex).toBe(0);
    expect(pick(q, 'Faux')).toBe(
      'Cherche une faute : deux signes collés ? Non, −2 est entre parenthèses. Un − après un nombre ? Non. Une parenthèse ouverte ? Elle est fermée. Le calcul est bien écrit.',
    );
    expect(pick(q, 'Vrai')).toBe('Vrai : −6 est en tête sans parenthèses, et (−2) est entre parenthèses. Rien ne se touche.');
  });
  it('écran 11, Q4 : réécrire 9 + −4', () => {
    const q = practice(3).question as Q<'reecrire'>;
    expect(practice(3).texts?.consigne).toBe('Ce calcul est mal écrit. **Réécris-le** en entier.');
    expect(q.givenLatex).toBe('9 + -4');
    expect(text(q, '9 + (−4)')).toBe('Le + et le − ne se touchent plus : 9 + (−4).');
    expect(text(q, '9+(-4)')).toBe('Le + et le − ne se touchent plus : 9 + (−4).');
    expect(text(q, '9 + −4')).toBe('Le + et le − se touchent encore. Mets −4 entre parenthèses : 9 + (−4).');
    expect(text(q, '9 + (−4')).toBe('La parenthèse ouverte doit se fermer : 9 + (−4).');
    expect(text(q, '(9 + −4)')).toBe('Les parenthèses doivent entourer le nombre négatif, pas tout le calcul : 9 + (−4).');
    expect(text(q, '9 + (4−)')).toBe('Le signe − se met avant le 4 : 9 + (−4).');
    expect(text(q, '9 + 4−')).toBe('Le signe − se met avant le 4 : 9 + (−4).');
    expect(text(q, '9 + (−7)')).toBe("L'écriture est bonne, mais le nombre a changé. Garde −4.");
    expect(text(q, '9 + (−45)')).toBe("L'écriture est bonne, mais le nombre a changé. Garde −4.");
    expect(text(q, '12')).toBe('Garde le même calcul, et mets le nombre négatif entre parenthèses : 9 + (−4).');
  });
  it('écran 12, dernière ligne : 6 × −2', () => {
    const q = question(13).question as Q<'reecrire'>;
    expect(q.givenLatex).toBe('6 \\times -2');
    expect(text(q, '6 × (−2)')).toBe('Le × et le − ne se touchent plus.');
    expect(text(q, '6 × −2')).toBe('Le × et le − se touchent encore. Mets −2 entre parenthèses.');
    expect(text(q, '6 × (−2')).toBe('La parenthèse ouverte doit se fermer.');
    expect(text(q, '8')).toBe('Recopie la ligne du dessus : 6 × (−2).');
  });
  it('écran 13, case 1 (non notée)', () => {
    const q = question(14).question as Q<'reecrire'>;
    expect(text(q, '−3')).toBe('Le − est devant le 3, comme la règle 3 le demande.');
    expect(text(q, '3−')).toBe('Le − est toujours après le 3. Il doit aller devant.');
    expect(text(q, '(−3)')).toBe("En tête du calcul, on n'écrit pas de parenthèses : −3.");
    expect(text(q, '3')).toBe('Le 3 est négatif : garde son signe −, devant le nombre.');
    expect(text(q, '7')).toBe('Écris le nombre 3 avec son signe − devant.');
  });
  it('écran 13, case 2', () => {
    const q = question(15).question as Q<'reecrire'>;
    expect(q.givenLatex).toBe('3- + 4');
    expect(text(q, '−3 + 4')).toBe('Le − est devant le 3, et pas de parenthèses en tête.');
    expect(text(q, '(−3) + 4')).toBe("Pas tout à fait. En tête du calcul, on n'écrit pas de parenthèses : −3 + 4.");
    expect(text(q, '3− + 4')).toBe('Le − est toujours après le 3. Il doit aller devant.');
    expect(text(q, '3 + 4')).toBe('Le 3 est négatif : garde son signe −, devant le nombre.');
    expect(text(q, '+3 + 4')).toBe('Le 3 est négatif : garde son signe −, devant le nombre.');
    expect(text(q, '9')).toBe('Garde les mêmes nombres. Le signe − va devant le 3.');
  });
  it('les exercices de fin et les calculs tirés gardent le texte du moteur', () => {
    const q: Question = { kind: 'erreur', ex: (question(3).question as Q<'choix'>).ex, lines: ['5', '+', '-', '2', '×', '3'], wrongLine: 1, errorType: 'signes-colles', accept: [1, 2], shownLatex: '5 + -2 \\times 3' };
    expect(c00.feedbackText?.(q, checkAnswer(c00, q, { line: 0 }))).toBeNull();
  });
  it('la fiche mémo : astuce validée (doc 08 n° 47) et textes du doc 06', () => {
    expect(c00.memo?.tip).toBe("Cherche d'abord les signes qui se touchent, puis demande-toi pour chaque − : il soustrait, ou c'est le signe d'un nombre ?");
    expect(c00.memo?.rule).toBe("**Un calcul s'écrit d'une seule façon.** On doit toujours savoir quel rôle joue chaque − : soustraire, ou signe d'un nombre.");
    expect(c00.memo?.ruleBullets).toEqual(['Deux signes ne se suivent jamais.', 'En tête, pas de parenthèses.', 'Le − se met avant le nombre.', 'Une parenthèse ouverte se ferme.']);
    expect(c00.memo?.examples).toEqual(['4 × (−3)', '−3 + 5']);
    expect(c00.memo?.mistake).toEqual({ wrong: '4 × −3', why: 'Le × et le − se touchent. On écrit 4 × (−3).' });
  });
  it('M est le vrai signe moins U+2212', () => {
    expect(M.charCodeAt(0)).toBe(0x2212);
    expect(joinPieces(['4', '\\times', '(', '-3', ')'])).toBe('4 \\times (-3)');
  });
});
