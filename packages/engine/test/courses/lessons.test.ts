import { describe, expect, it } from 'vitest';
import { courseRunItems, getCourse, seededRng } from '../../src';
import type { CourseDef, LessonBlock, LessonPart } from '../../src';
import { lessonStep } from '../../src/courses/types';

/** Doc 09 : titre et sous-titre de chaque écran de leçon, dans l'ordre des `parts` (null = pas de titre, la consigne reste). */
type T = [title: string | null, subtitle?: string];
const EX: T = [null]; // exemple guidé : consigne « Complète, une case après l'autre. »
const CALC: T = [null];
const ordreOf = (calc: string): T => [`Remets les étapes de ${calc} dans l'ordre`];

const DOC09: Record<string, T[]> = {
  'c00-bien-ecrire': [
    ['Bien écrire un calcul'],
    ['Le signe − a deux rôles'],
    [null], [null],
    ['Quand deux signes se touchent'],
    ['Avec toutes les opérations'],
    [null],
    ['Et au début du calcul ?'],
    ['Le moins se met avant le nombre'],
    [null], [null],
    ['Une parenthèse ouverte se ferme'],
    [null],
    ['Les 4 règles à retenir'],
    [null],
    [null],
    EX, EX,
    ['Place aux 5 exercices de fin'],
  ],
  'c01-additionner-meme-signe': [
    ['Deux dettes font une plus grande dette', 'Tu dois 3 €, puis encore 5 €.'],
    ['Même signe : j\'additionne, je garde le signe'],
    ordreOf('−2 + (−7)'),
    CALC,
    EX, EX, EX, EX,
  ],
  'c02-additionner-signes-contraires': [
    ['Une dette, puis un gain', 'Tu dois 3 € et tu gagnes 5 €. Il te reste 2 €.'],
    ['Signes contraires : je soustrais', 'Je garde le signe du plus grand.'],
    ordreOf('4 + (−9)'),
    CALC,
    [null],
    EX, EX, EX, EX,
  ],
  'c03-additionner-plusieurs': [
    ['Je range les positifs et les négatifs', 'Les positifs d\'un côté, les négatifs de l\'autre.'],
    ['Je regroupe, puis je termine', 'Positifs, puis négatifs, puis le cours 2.'],
    ordreOf('7 + (−1) + (−8)'),
    CALC,
    EX, EX, EX, EX,
  ],
  'c04-soustraire': [
    ['Enlever une dette, c\'est gagner de l\'argent'],
    ['Soustraire, c\'est ajouter l\'opposé', 'Je transforme en addition, puis j\'applique les cours 1 et 2.'],
    ['Réécris 5 − (−3) comme une addition', 'Touche les étiquettes dans l\'ordre. Attention, il y en a une en trop.'],
    CALC,
    ['Trouve la ligne fausse', 'Touche la ligne où le calcul se trompe.'],
    EX, EX, EX, EX,
  ],
  'c05-multiplier-deux': [
    ['Deux signes pareils donnent +', 'Deux signes différents donnent −.'],
    ['Je trouve le signe, puis je multiplie', 'Même signe : +. Signes contraires : −.'],
    ordreOf('−4 × (−3)'),
    CALC,
    [null],
    [null], EX, EX, [null], EX, EX,
  ],
  'c06-diviser-deux': [
    ['Diviser, c\'est la même règle', 'Bonne nouvelle : rien de nouveau à retenir.'],
    ['Même règle qu\'en multiplication', 'Signes pareils : +. Différents : −.'],
    ordreOf('24 ÷ (−6)'),
    CALC,
    [null], EX, EX, [null], EX, EX,
  ],
  'c07-multiplier-plusieurs': [
    ['Je compte les signes moins', 'Deux signes −, c\'est pair : le résultat est positif.'],
    ['Pair donne +, impair donne −', 'Je compte les −, puis je multiplie.'],
    ordreOf('−2 × (−3) × (−1) × 4'),
    CALC,
    EX, [null], EX, EX, EX, [null], EX, EX,
  ],
};

const textsOf = (p: LessonPart) => ({ title: p.title ?? null, subtitle: 'subtitle' in p ? p.subtitle : undefined });
const lines = (p: LessonPart): Extract<LessonBlock, { t: 'text' }>[] =>
  p.type === 'explication' ? p.blocks.filter((b): b is Extract<LessonBlock, { t: 'text' }> => b.t === 'text') : [];

describe('doc 09 : titres des écrans de leçon', () => {
  for (const [id, table] of Object.entries(DOC09)) {
    it(`${id} : un titre et un sous-titre par écran, dans l'ordre`, () => {
      const parts = getCourse(id).parts;
      expect(parts.length).toBe(table.length);
      // les écrans de question à consigne n'ont pas de titre ; les exemples guidés (trou) ont la consigne de la maquette
      parts.forEach((p, i) => {
        const [title, subtitle] = table[i]!;
        expect(textsOf(p), `${id} écran ${i + 1}`).toEqual({ title, subtitle });
      });
    });
  }

  it('Complète, une case après l\'autre : consigne de tous les exemples guidés à trous', () => {
    for (const id of Object.keys(DOC09)) {
      for (const p of getCourse(id).parts) {
        if (p.type === 'question' && p.activity === 'exemple' && p.question.kind === 'trou') {
          expect(p.consigne, id).toBe("Complète, une case après l'autre.");
        }
      }
    }
  });

  it('consignes propres à doc 09 : Cours 0 « Classer » et Cours 5 « Classer »', () => {
    const c0 = getCourse('c00-bien-ecrire').parts[14];
    const c5 = getCourse('c05-multiplier-deux').parts[4];
    expect(c0?.type === 'question' && c0.consigne).toBe("Fais glisser chaque calcul du bas de l'écran vers la bonne case. Tu peux aussi toucher un calcul, puis toucher la case.");
    expect(c5?.type === 'question' && c5.consigne).toBe('Sans calculer, le résultat est-il + ou − ?');
  });
});

describe('doc 09 : écran de règle, lignes ✓ et « Fais attention »', () => {
  const rule = (id: string) => getCourse(id).parts[1]!;
  const ok = (id: string) => lines(rule(id)).filter((b) => b.tone === 'ok').map((b) => b.text);
  const ko = (id: string) => lines(rule(id)).filter((b) => b.tone === 'ko');
  const neutral = (id: string) => lines(rule(id)).filter((b) => b.tone === 'neutre');
  const attention = (id: string) => rule(id).type === 'explication' && (rule(id) as { blocks: LessonBlock[] }).blocks.some((b) => b.t === 'heading' && b.text === 'Fais attention');

  it('Cours 4 : 3 lignes ✓, ✗ et ~ avec leurs explications', () => {
    const id = 'c04-soustraire';
    expect(ok(id)).toEqual(['5 − (−3) = 5 + 3 = **8**', '3 − 7 = 3 + (−7) = **−4**', '−4 − 6 = −4 + (−6) = **−10**']);
    expect(attention(id)).toBe(true);
    expect(ko(id)).toEqual([{ t: 'text', text: '6 − (−2) = 6 − 2 = 4', tone: 'ko', note: 'Le signe de −2 n\'a pas changé : 6 − (−2) = 6 + 2.' }]);
    expect(neutral(id)).toEqual([{ t: 'text', text: '(−4) − 6', tone: 'neutre', note: 'Pas faux, mais inutile : en tête, pas de parenthèses.' }]);
  });

  const KO: Record<string, [string, string]> = {
    'c01-additionner-meme-signe': ['−3 + (−5) = 8', 'Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !'],
    'c02-additionner-signes-contraires': ['3 + (−8) = 5', 'Le signe du résultat, c\'est celui du nombre le plus grand (sans son signe).'],
    'c03-additionner-plusieurs': ['−2 + 5 + (−4) = 1', 'Regarde qui gagne : le total des positifs ou celui des négatifs ? Le résultat prend son signe.'],
    'c05-multiplier-deux': ['−3 × (−4) = −12', '− × − = + et + × − = −. Deux signes pareils → + ; différents → −.'],
    'c06-diviser-deux': ['−12 ÷ 4 = 3', 'Même règle que pour × : signes pareils → + ; différents → −.'],
    'c07-multiplier-plusieurs': ['−2 × 3 × (−4) = −24', 'Compte les signes − : pair → + ; impair → −.'],
  };
  for (const [id, [line, note]] of Object.entries(KO)) {
    it(`${id} : « Fais attention » avec son ✗`, () => {
      expect(attention(id)).toBe(true);
      expect(ko(id)).toEqual([{ t: 'text', text: line, tone: 'ko', note }]);
      expect(neutral(id)).toEqual([]);
    });
  }

  const OK: Record<string, string[]> = {
    'c01-additionner-meme-signe': ['−3 + (−5) = −(3 + 5) = **−8**', '4 + 6 = **10**'],
    'c02-additionner-signes-contraires': [
      '−3 + 5 = 5 − 3 = **2** (5 est le plus grand, il est positif)',
      '4 + (−9) = 9 − 4 = **−5** (9 est le plus grand, il est négatif)',
      '−6 + 6 = **0** (deux opposés s\'annulent)',
    ],
    'c03-additionner-plusieurs': ['positifs : 3 + 3 = 6', 'négatifs : −3', '6 + (−3) = **3**'],
    'c05-multiplier-deux': ['−3 × (−4) = +(3 × 4) = **12**', '6 × (−7) = −(6 × 7) = **−42**'],
    'c06-diviser-deux': ['−12 ÷ 4 = −(12 ÷ 4) = **−3**', '−35 ÷ (−7) = +(35 ÷ 7) = **5**'],
    'c07-multiplier-plusieurs': ['−1 × (−5) × (−2) : 3 signes − → impair → **−10**', '4 × (−3) × 2 : 1 signe − → impair → **−24**'],
  };
  for (const [id, expected] of Object.entries(OK)) {
    it(`${id} : lignes ✓ de la règle`, () => {
      expect(ok(id)).toEqual(expected);
    });
  }

  it('Cours 0 : les 4 règles sont des encadrés des écrans pas à pas (parties 4, 8, 11) et de la question 7', () => {
    const parts = getCourse('c00-bien-ecrire').parts;
    const ruleOf = (i: number) => {
      const p = parts[i];
      return p?.type === 'etapes' ? p.steps.find((st) => st.rule)?.rule : undefined;
    };
    expect(ruleOf(4)?.n).toBe(1);
    expect(ruleOf(8)).toEqual({ n: 3, text: "**Le signe − d'un nombre négatif s'écrit toujours avant le nombre :** −3, jamais 3−." });
    expect(ruleOf(11)).toEqual({ n: 4, text: '**Une parenthèse ouverte doit toujours être fermée.**' });
    const q7 = parts[7];
    expect(q7?.type === 'question' && q7.outroRule?.n).toBe(2);
  });
});

describe('doc 09 : les textes d\'écran suivent la partie jusqu\'à l\'activité', () => {
  it('courseRunItems porte titre, sous-titre et consigne', () => {
    const items = courseRunItems(getCourse('c04-soustraire'), seededRng(1));
    expect(items[1]).toMatchObject({ type: 'explication', texts: { title: "Soustraire, c'est ajouter l'opposé" } });
    expect(items[2]).toMatchObject({ type: 'question', texts: { title: 'Réécris 5 − (−3) comme une addition' } });
    expect(items[5]).toMatchObject({ type: 'question', texts: { consigne: "Complète, une case après l'autre." } });
    expect(items[3]).not.toHaveProperty('texts');
  });

  it('courseRunItems : une partie etapes devient une explication avec steps, les textes de question suivent', () => {
    const items = courseRunItems(getCourse('c00-bien-ecrire'), seededRng(1));
    expect(items).toHaveLength(19 + 5);
    expect(items[1]).toMatchObject({ type: 'explication', itemId: 'partie-1', partIndex: 1, blocks: [], texts: { title: 'Le signe − a deux rôles' } });
    expect((items[1] as { steps?: unknown[] }).steps).toHaveLength(4);
    expect(items[0]).toMatchObject({ type: 'question', activity: 'decouverte', texts: { title: 'Bien écrire un calcul' } });
    expect(items[3]).toMatchObject({ type: 'question', activity: 'lecon', texts: { joinPrevious: true } });
    expect(items[7]).toMatchObject({ texts: { outroRule: { n: 2 } } });
    expect(items[19]).toMatchObject({ type: 'question', activity: 'fin' });
  });
});

describe('partie pratique', () => {
  const q = (calc: string) => ({ kind: 'choix' as const, ex: getCourse('c01-additionner-meme-signe').generate(1, seededRng(1)), calcLatex: calc, prompt: 'p', options: [{ label: 'a', why: '' }, { label: 'b', why: '' }], correctIndex: 0 });
  const base = getCourse('c01-additionner-meme-signe');
  const fake = {
    ...base,
    lessonLength: 2,
    parts: [
      { type: 'explication', blocks: [] },
      { type: 'pratique', title: 'Pratique', questions: [0, 1, 2, 3].map((i) => ({ question: q(`${i}`), texts: i === 3 ? { uncounted: true as const } : undefined })) },
    ],
  } as unknown as CourseDef;

  it('gives one item per question with series texts', () => {
    const items = courseRunItems(fake, seededRng(1)).filter((i) => i.type === 'question' && i.itemId.startsWith('partie-1-'));
    expect(items.map((i) => i.itemId)).toEqual(['partie-1-0', 'partie-1-1', 'partie-1-2', 'partie-1-3']);
    items.forEach((i, k) => expect(i.type === 'question' && i.texts?.series).toEqual({ n: k + 1, of: 4 }));
  });
  it('counts the series as one lesson screen', () => {
    expect(lessonStep(fake, 1)).toEqual({ n: 2, total: 2 });
  });
  it('makes an uncounted question a decouverte', () => {
    const items = courseRunItems(fake, seededRng(1)).filter((i) => i.type === 'question');
    expect(items.find((i) => i.itemId === 'partie-1-3')?.type === 'question' && items.find((i) => i.itemId === 'partie-1-3')).toMatchObject({ activity: 'decouverte' });
    expect(items.find((i) => i.itemId === 'partie-1-0')).toMatchObject({ activity: 'lecon' });
  });
});
