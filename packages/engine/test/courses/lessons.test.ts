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
    ['Quand deux signes se touchent'],
    ['La règle 1, à toi'],
    ['Et au début du calcul ?'],
    ['Le moins se met avant le nombre'],
    ['Une parenthèse ouverte se ferme'],
    ['Règles 3 et 4, à toi'],
    [null],
    ['Comparer deux cas'],
    ['Les 4 règles à retenir'],
    ['Cours 0 · Pratique'],
    ['Exemple 1 sur 2'],
    [null], [null], [null],
    ['Place aux 5 exercices de fin'],
  ],
  'c01-additionner-meme-signe': [
    ['Additionner deux nombres de même signe'],
    ['La droite graduée et les bonds'],
    ['Deux dettes qui s\'ajoutent'],
    ['Comparer deux cas'],
    ['J\'additionne les longueurs des bonds'],
    ['Je garde le signe'],
    ['Les 2 règles à retenir'],
    ['Cours 1 · Pratique'],
    ['Exemple 1 sur 2'],
    EX, EX, EX,
    ['Place aux 5 exercices de fin'],
  ],
  'c02-additionner-signes-contraires': [
    ['Additionner deux nombres de signes contraires'],
    ['Un bond qui en défait un autre'],
    ['Comparer deux cas'],
    ['Je soustrais les longueurs des bonds'],
    [null], [null],
    ['Le plus grand décide du signe'],
    [null], [null],
    ['Autres façons de faire'],
    ['Cours 2 · Pratique'],
    ['Exemple 1 sur 2'],
    EX, EX, EX,
    ['Place aux 5 exercices de fin'],
  ],
  'c03-additionner-plusieurs': [
    ['Additionner plusieurs nombres relatifs'],
    ["L'ordre des bonds ne change rien"],
    ['Comparer deux cas'],
    ['Je regroupe les positifs et les négatifs'],
    ['Je calcule chaque groupe'],
    [null], [null],
    ['De gauche à droite, un calcul à la fois'],
    ['Autres façons de faire'],
    ['Cours 3 · Pratique'],
    ['Exemple 1 sur 2'],
    EX, EX, EX,
    ['Place aux 5 exercices de fin'],
  ],
  'c04-soustraire': [
    ['Soustraire un nombre relatif'],
    ['Retrancher une dette'],
    ['Comparer deux cas'],
    ["J'ajoute l'opposé"],
    ["Puis j'additionne"],
    [null], [null],
    ['Autres façons de faire'],
    ['Cours 4 · Pratique'],
    ['Exemple 1 sur 2'],
    EX, EX, EX,
    ['Place aux 5 exercices de fin'],
  ],
  'c05-multiplier-deux': [
    ['Multiplier deux nombres relatifs'],
    ["Multiplier, c'est répéter"],
    ['Le signe du produit'],
    ["Les nombres d'abord, le signe ensuite"],
    [null], [null],
    ['Comparer deux cas'],
    ['Autres façons de faire'],
    ['Cours 5 · Pratique'],
    ['Exemple 1 sur 2'],
    EX, EX, EX,
    ['Place aux 5 exercices de fin'],
  ],
  'c06-diviser-deux': [
    ['Diviser deux nombres relatifs'],
    ["Diviser, c'est chercher un facteur"],
    ['Le signe du quotient'],
    ['Vérifier par la multiplication'],
    [null], [null],
    ['Comparer deux cas'],
    ['Autres façons de faire'],
    ['Cours 6 · Pratique'],
    ['Exemple 1 sur 2'],
    EX, EX, EX,
    ['Place aux 5 exercices de fin'],
  ],
  'c07-multiplier-plusieurs': [
    ['Multiplier plusieurs nombres relatifs'],
    ['Multiplier deux par deux'],
    ['Je compte les signes −'],
    ["Le signe d'abord, puis les nombres"],
    [null], [null],
    ['Comparer deux cas'],
    ['Autres façons de faire'],
    ['Cours 7 · Pratique'],
    ['Exemple 1 sur 2'],
    EX, EX, EX,
    ['Place aux 5 exercices de fin'],
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
          // exception : la dernière ligne de l'exemple 1 du Cours 1 a sa consigne propre (doc 06, écran 9)
          const own = 'Tape ce qui manque dans la case, avec les touches du clavier.';
          expect([own, "Complète, une case après l'autre."], id).toContain(p.consigne);
        }
      }
    }
  });
});

describe('doc 09 : écran de règle, lignes ✓ et « Fais attention »', () => {
  const rule = (id: string) => getCourse(id).parts[1]!;
  const ok = (id: string) => lines(rule(id)).filter((b) => b.tone === 'ok').map((b) => b.text);
  const ko = (id: string) => lines(rule(id)).filter((b) => b.tone === 'ko');
  const neutral = (id: string) => lines(rule(id)).filter((b) => b.tone === 'neutre');
  const attention = (id: string) => rule(id).type === 'explication' && (rule(id) as { blocks: LessonBlock[] }).blocks.some((b) => b.t === 'heading' && b.text === 'Fais attention');

  const KO: Record<string, [string, string]> = {};
  for (const [id, [line, note]] of Object.entries(KO)) {
    it(`${id} : « Fais attention » avec son ✗`, () => {
      expect(attention(id)).toBe(true);
      expect(ko(id)).toEqual([{ t: 'text', text: line, tone: 'ko', note }]);
      expect(neutral(id)).toEqual([]);
    });
  }

  const OK: Record<string, string[]> = {};
  for (const [id, expected] of Object.entries(OK)) {
    it(`${id} : lignes ✓ de la règle`, () => {
      expect(ok(id)).toEqual(expected);
    });
  }

  it('Cours 0 : les 4 règles sont des encadrés des écrans pas à pas (parties 2, 5, 6) et de la question de la partie 4', () => {
    const parts = getCourse('c00-bien-ecrire').parts;
    const ruleOf = (i: number) => {
      const p = parts[i];
      return p?.type === 'etapes' ? p.steps.find((st) => st.rule)?.rule : undefined;
    };
    expect(ruleOf(2)?.n).toBe(1);
    expect(ruleOf(5)).toEqual({ n: 3, text: "**Le signe − d'un nombre négatif s'écrit toujours avant le nombre :** −3, jamais 3−." });
    expect(ruleOf(6)).toEqual({ n: 4, text: '**Une parenthèse ouverte doit toujours être fermée.**' });
    const q4 = parts[4];
    expect(q4?.type === 'question' && q4.outroRule?.n).toBe(2);
  });
});

describe('doc 09 : les textes d\'écran suivent la partie jusqu\'à l\'activité', () => {
  it('courseRunItems porte titre, sous-titre et consigne', () => {
    const items = courseRunItems(getCourse('c07-multiplier-plusieurs'), seededRng(1));
    expect(items[1]).toMatchObject({ type: 'explication', texts: { title: 'Multiplier deux par deux' } });
    expect(items[0]).toMatchObject({ type: 'question', activity: 'decouverte', texts: { title: 'Multiplier plusieurs nombres relatifs' } });
    expect(items[5]).toMatchObject({ type: 'question', texts: { joinPrevious: true } });
    expect(items.find((i) => i.itemId === 'partie-10')).toMatchObject({ type: 'question', texts: { consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.' } });
  });

  it('courseRunItems : une partie etapes devient une explication avec steps, les textes de question suivent', () => {
    const items = courseRunItems(getCourse('c00-bien-ecrire'), seededRng(1));
    // 17 parties, dont la série de pratique (4 questions) : 20 éléments, puis les 5 fins
    expect(items).toHaveLength(20 + 5);
    expect(items[1]).toMatchObject({ type: 'explication', itemId: 'partie-1', partIndex: 1, blocks: [], texts: { title: 'Le signe − a deux rôles' } });
    expect((items[1] as { steps?: unknown[] }).steps).toHaveLength(4);
    expect(items[0]).toMatchObject({ type: 'question', activity: 'decouverte', texts: { title: 'Bien écrire un calcul' } });
    expect(items[8]).toMatchObject({ type: 'question', activity: 'lecon', texts: { joinPrevious: true } });
    expect(items[4]).toMatchObject({ texts: { outroRule: { n: 2 } } });
    expect(items[11]).toMatchObject({ itemId: 'partie-11-0', activity: 'lecon', texts: { series: { n: 1, of: 4 } } });
    expect(items[20]).toMatchObject({ type: 'question', activity: 'fin' });
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
