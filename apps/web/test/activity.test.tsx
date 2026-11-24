import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { LESSON_REPEAT_NOTE, buildQuestion, courseRunItems, foldProgress, getCourse, num, op, rat, seededRng, type ActivityItem, type ActivityKind, type ActivityState, type Question } from '@pom/engine';

const recorded: any[] = [];
vi.mock('../src/store/sync', () => ({ recordEvent: vi.fn(async (e: unknown) => void recorded.push(e)) }));
import { recordEvent } from '../src/store/sync';
import { ActivityScreen } from '../src/screens/Activity';

const C05 = getCourse('c05-multiplier-deux');
const ex = (a: number, b: number, answer: number) => ({ courseId: C05.id, level: 1 as const, expr: op('*', num(a), num(b)), answer: rat(answer) });
const qItem = (i: number, a: number, b: number): ActivityItem => ({
  type: 'question',
  itemId: `fin-${i}`,
  courseId: C05.id,
  activity: 'fin',
  question: { kind: 'saisie', ex: ex(a, b, a * b), promptLatex: `${a} \\times ${b}` } as Question,
});
// 5 calculs : 2 × 3, 3 × 4, 4 × 5, 5 × 6, 6 × 7
const five = () => [2, 3, 4, 5, 6].map((a, i) => qItem(i, a, a + 1));

const setVisibility = (v: 'hidden' | 'visible') => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
  document.dispatchEvent(new Event('visibilitychange'));
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  setVisibility('visible');
  recorded.length = 0;
  vi.mocked(recordEvent).mockClear();
});

function setup(items: ActivityItem[], extra: Partial<React.ComponentProps<typeof ActivityScreen>> = {}, kind: ActivityKind = 'revision') {
  const ends: [ActivityState, boolean][] = [];
  const view = render(
    <ActivityScreen
      kind={kind}
      items={items}
      chip={(s, p) => (kind === 'revision' ? `Révisions, question ${p.n} sur ${p.total}` : s.type === 'question' ? `Cours 5, exercice ${p.n} sur ${p.total}` : 'Cours 5, leçon')}
      record
      rng={seededRng(1)}
      activityId="act-1"
      onEnd={(s, c) => ends.push([s, c])}
      {...extra}
    />,
  );
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const btn = (label: string) => $$('button').find((b) => (b.getAttribute('aria-label') ?? b.textContent) === label) ?? null;
  const type = (digits: string) => {
    for (const d of digits) fireEvent.click(btn(d)!);
  };
  const submit = (digits: string) => {
    type(digits);
    fireEvent.click(btn('Valider')!);
  };
  const next = () => fireEvent.click(btn('Continuer')!);
  const steps = () => $$('.stepper__step').length;
  const chips = () => $$('.chip').map((c) => c.textContent);
  return { ...view, ends, $, $$, btn, type, submit, next, steps, chips };
}

const answers = () => recorded.filter((e) => e.kind === 'answer');

/** Les premières réponses gardées en mémoire donnent le même décompte que le repli des événements. */
function tallyCheck(t: { ends: unknown[] }, firsts: { activity: string; correct: boolean }[]) {
  const events = recorded.map((e, i) => ({ ...e, id: `e${i}`, userId: 'u', at: 1000 + i, day: '2026-11-22' }));
  const run = Object.values(foldProgress(events).journal.runs)[0]!;
  const fin = firsts.filter((f) => f.activity === 'fin');
  expect({ first: firsts.length, ok: firsts.filter((f) => f.correct).length, fin: fin.length, finOk: fin.filter((f) => f.correct).length }).toEqual({ first: run.first, ok: run.ok, fin: run.fin, finOk: run.finOk });
  return t;
}

describe('ActivityScreen : premières réponses en mémoire', () => {
  it('Simplifie puis juste : une seule première réponse', () => {
    const division = { ...ex(-12, 4, -3), expr: op('/', num(-12), num(4)) };
    const item: ActivityItem = { type: 'question', itemId: 'fin-0', courseId: C05.id, activity: 'fin', question: { kind: 'saisie', ex: division, promptLatex: '\\frac{-12}{4}' } as Question };
    let firsts: { activity: string; correct: boolean }[] = [];
    const t = setup([item], { onEnd: (_s, _c, _r, f) => void (firsts = [...f]) });
    fireEvent.click(t.btn('fraction')!);
    fireEvent.click(t.btn('moins')!);
    t.type('12');
    fireEvent.click(t.btn('case suivante')!);
    t.type('4');
    fireEvent.click(t.btn('Valider')!); // Simplifie
    for (let i = 0; i < 8; i++) fireEvent.click(t.btn('effacer')!);
    fireEvent.click(t.btn('moins')!);
    t.submit('3');
    t.next();
    expect(firsts).toEqual([{ activity: 'fin', correct: true }]);
    tallyCheck(t, firsts);
  });

  it('calcul passé après plusieurs échecs : une première réponse fausse', () => {
    let firsts: { activity: string; correct: boolean }[] = [];
    const t = setup([qItem(0, 3, 4)], { onEnd: (_s, _c, _r, f) => void (firsts = [...f]) });
    t.submit('1');
    t.next();
    t.submit('0');
    t.next();
    t.submit('1');
    t.next();
    fireEvent.click(t.btn('Passer')!);
    t.next();
    expect(firsts).toEqual([{ activity: 'fin', correct: false }]);
    tallyCheck(t, firsts);
  });
});

describe('ActivityScreen', () => {
  it('une erreur au 2e calcul : total 7, le même genre en 5e position, la répétition à la fin', () => {
    const t = setup(five());
    expect(t.steps()).toBe(5);
    t.submit('6');
    t.next();
    t.submit('1'); // 3 × 4 raté
    expect(t.$('.alert--error .alert__title')!.textContent).toBe('Pas tout à fait. La bonne réponse est 12.');
    expect(t.$('.q-foot .t-caption')!.textContent).toBe('Un calcul du même genre reviendra plus loin, et celui-ci à la fin.');
    expect(t.steps()).toBe(5); // le total grandit à la question suivante (maquette)
    t.next();
    expect(t.steps()).toBe(7);
    expect(t.$$('.stepper__step.is-error').length).toBe(1);
    t.submit('20'); // 4 × 5
    t.next();
    t.submit('30'); // 5 × 6
    t.next();
    // 5e position : le calcul du même genre
    expect(t.chips()).toEqual(['Révisions, question 5 sur 7', 'Même genre que ton erreur']);
    t.submit('0');
    t.next();
    t.submit('42'); // 6 × 7
    t.next();
    // la répétition exacte, à la fin, posée de la même façon
    expect(t.chips()).toEqual(['Révisions, question 7 sur 7', "Le calcul raté tout à l'heure"]);
    expect(t.$('.q-expr')!.textContent).toContain('3×4');
    expect(t.$$('.keypad').length).toBe(1);
  });

  it('même calcul raté 2 fois : pas de Passer au retour du 2e échec, Passer au 3e passage, événement skipped', () => {
    const t = setup([qItem(0, 3, 4)]);
    t.submit('1');
    t.next(); // même genre
    expect(t.btn('Passer')).toBeNull();
    t.submit('0');
    expect(t.$('.q-foot .t-caption')).toBeNull(); // un échec du même genre n'ajoute rien
    t.next(); // répétition (1er passage)
    expect(t.btn('Passer')).toBeNull();
    t.submit('1');
    expect(t.$('.alert--error .alert__title')!.textContent).toMatch(/^Pas encore\. /);
    expect(t.$('.q-foot .t-caption')!.textContent).toBe('Ce calcul reviendra encore à la fin.');
    expect(t.btn('Passer')).toBeNull();
    t.next();
    expect(t.btn('Passer')).not.toBeNull();
    fireEvent.click(t.btn('Passer')!);
    expect(answers().filter((e) => e.skipped)).toHaveLength(1);
    expect(t.$('h2')!.textContent).toBe('On le fait ensemble');
    expect(t.chips()).toContain('Calcul passé');
    expect(t.ends).toHaveLength(0);
    t.next();
    expect(t.ends).toHaveLength(1);
    expect(t.ends[0]![1]).toBe(true);
    expect(recorded.at(-1)).toMatchObject({ kind: 'activity_end', completed: true });
  });

  it('seule la 1re réponse a attempt 1', () => {
    const t = setup([qItem(0, 3, 4), qItem(1, 2, 3)]);
    t.submit('1');
    t.next();
    t.submit('6');
    t.next(); // 2 × 3 : juste
    t.submit('0'); // même genre
    t.next();
    t.submit('12'); // répétition juste
    expect(answers().map((e) => [e.attempt, e.correct])).toEqual([[1, false], [1, true], [2, false], [3, true]]);
  });

  it('Simplifie : la question reste, la saisie aussi, rien ne passe à la suite', () => {
    const division = { ...ex(-12, 4, -3), expr: op('/', num(-12), num(4)) };
    const item: ActivityItem = { type: 'question', itemId: 'fin-0', courseId: C05.id, activity: 'fin', question: { kind: 'saisie', ex: division, promptLatex: '\\frac{-12}{4}' } as Question };
    const t = setup([item]);
    fireEvent.click(t.btn('fraction')!);
    fireEvent.click(t.btn('moins')!);
    t.type('12');
    fireEvent.click(t.btn('case suivante')!);
    t.type('4');
    fireEvent.click(t.btn('Valider')!);
    expect(t.$('.alert--info')).not.toBeNull();
    expect(t.btn('Continuer')).toBeNull();
    expect(t.$('.answer')!.textContent).toContain('12');
    expect(answers()).toHaveLength(1);
    expect(answers()[0]).toMatchObject({ unfinished: true, attempt: 1 });
    expect(t.steps()).toBe(1);
  });

  it('arrière-plan pendant 5 min : durationMs sans ces 5 min', () => {
    vi.useFakeTimers();
    const t = setup([qItem(0, 3, 4)]);
    act(() => void vi.advanceTimersByTime(10_000));
    setVisibility('hidden');
    act(() => void vi.advanceTimersByTime(300_000));
    setVisibility('visible');
    act(() => void vi.advanceTimersByTime(5_000));
    t.submit('12');
    expect(answers()[0].durationMs).toBe(15_000);
  });

  it('record = false : aucun recordEvent', () => {
    const t = setup([qItem(0, 3, 4)], { record: false });
    t.submit('12');
    t.next();
    expect(t.ends).toHaveLength(1);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it('croix avec confirmQuit : dialogue, « Continuer » le ferme, « Quitter » enregistre completed false', () => {
    const t = setup(five(), { confirmQuit: { title: 'Quitter la séance ?', body: 'Ce que tu as fait est gardé.' } });
    t.submit('6');
    fireEvent.click(t.btn('Quitter')!); // la croix
    expect(t.$('[role=dialog]')!.textContent).toContain('Ce que tu as fait est gardé.');
    fireEvent.click(t.$$('[role=dialog] button').find((b) => b.textContent === 'Continuer')!);
    expect(t.$('[role=dialog]')).toBeNull();
    fireEvent.click(t.$$('button').find((b) => b.getAttribute('aria-label') === 'Quitter')!);
    fireEvent.click(t.$$('[role=dialog] button').find((b) => b.textContent === 'Quitter')!);
    expect(t.ends[0]![1]).toBe(false);
    expect(recorded.at(-1)).toMatchObject({ kind: 'activity_end', completed: false, activityId: 'act-1' });
  });

  it('croix sans confirmQuit : sort directement', () => {
    const t = setup(five());
    fireEvent.click(t.btn('Quitter')!);
    expect(t.ends[0]![1]).toBe(false);
  });

  it('une partie de leçon avec titre et sous-titre (doc 09) : le titre de l\'écran remplace celui du cours', () => {
    const part = C05.parts.find((p) => p.type === 'explication')!;
    const item: ActivityItem = { type: 'explication', itemId: 'partie-0', courseId: C05.id, partIndex: 0, blocks: (part as any).blocks, texts: { title: 'Deux signes pareils donnent +', subtitle: 'Deux signes différents donnent −.' } };
    const t = setup([item, qItem(0, 3, 4)], {}, 'cours');
    expect(t.$('h1')!.textContent).toBe('Deux signes pareils donnent +');
    expect(t.$('h1 + p')!.textContent).toBe('Deux signes différents donnent −.');
  });

  it('une partie de leçon : titre du cours, « Suivant », lesson_part_done avec la durée', () => {
    vi.useFakeTimers();
    const part = C05.parts.find((p) => p.type === 'explication')!;
    const item: ActivityItem = { type: 'explication', itemId: 'partie-0', courseId: C05.id, partIndex: 0, blocks: (part as any).blocks };
    const t = setup([item, qItem(0, 3, 4)], {}, 'cours');
    expect(t.$('h1')!.textContent).toBe(C05.title);
    expect(t.chips()).toEqual(['Cours 5, leçon']);
    act(() => void vi.advanceTimersByTime(7_000));
    fireEvent.click(t.btn('Suivant')!);
    expect(recorded[0]).toMatchObject({ kind: 'lesson_part_done', partIndex: 0, durationMs: 7_000 });
    expect(t.$('.q-expr')).not.toBeNull();
  });
});

describe('ActivityScreen : Cours 0 v2 (leçon pas à pas, petites questions)', () => {
  const C00 = getCourse('c00-bien-ecrire');
  const all = () => courseRunItems(C00, seededRng(1));
  const at = (...ns: number[]) => ns.map((n) => all()[n]!);
  const setup00 = (items: ActivityItem[]) => setup(items, {}, 'cours');
  const choice = (t: ReturnType<typeof setup>, label: string) => fireEvent.click(t.$$('.answer-zone .choice').find((b) => b.textContent === label)!);

  it('une partie `etapes` s’affiche (plus d’écran vide) : « Suite » puis « Suivant » passe à la suite', () => {
    const t = setup00(at(4, 6));
    expect(t.$('h1')!.textContent).toBe('Quand deux signes se touchent');
    expect(t.$('.stage')!.textContent).toContain('4 × −3');
    expect(t.btn('Suite')).not.toBeNull();
    for (let i = 0; i < 4; i++) fireEvent.click(t.btn('Suite')!);
    fireEvent.click(t.btn('Suivant')!);
    expect(recorded[0]).toMatchObject({ kind: 'lesson_part_done', partIndex: 4 });
    expect(t.container.textContent).toContain('Comment écrire correctement ce calcul ?');
  });

  it('2 questions par écran : la 2e garde la 1re en résumé, « Ta réponse : À soustraire ✓ »', () => {
    const t = setup00(at(2, 3));
    expect(t.$('.q-summary')).toBeNull();
    choice(t, 'À soustraire');
    t.next();
    expect(t.container.textContent).toContain('Et ici, à quoi sert le');
    expect(t.$('.q-summary')!.textContent).toContain('Ta réponse : À soustraire ✓');
    expect(t.$('.q-summary')!.textContent).toContain('Dans ce calcul, à quoi sert le');
    expect(t.$$('.answer-zone .choice').map((b) => b.textContent)).toEqual(['À soustraire', 'À dire que 6 est négatif']);
    choice(t, 'À dire que 6 est négatif'); // une fois répondue, le résumé reste en haut
    expect(t.$('.q-summary')!.textContent).toContain('Ta réponse : À soustraire ✓');
  });

  it('une 1re réponse fausse : « Ta réponse : … ✗ » au-dessus de la 2e', () => {
    const t = setup00(at(2, 3));
    choice(t, 'À dire que 5 est négatif');
    expect(t.$('.alert--error .alert__title')!.textContent).toBe('Pas tout à fait.'); // pas de préfixe en plus
    expect(t.$('.alert--error')!.textContent).toContain("on enlève 5 à 8. C'est une soustraction.");
    t.next();
    expect(t.$('.q-summary')!.textContent).toContain('Ta réponse : À dire que 5 est négatif ✗');
  });

  it('question « pour découvrir » ratée : accueil sans note de répétition, enregistrée comme `decouverte`', () => {
    const t = setup00(at(0, 4));
    expect(t.container.textContent).toContain('Question pour découvrir : elle ne compte pas dans la note.');
    choice(t, 'Oui');
    expect(t.$('.alert--info .alert__title')!.textContent).toBe("Pas tout à fait, et c'est normal.");
    expect(t.$('.q-foot .t-caption')).toBeNull();
    expect(recorded[0]).toMatchObject({ kind: 'answer', activity: 'decouverte' });
  });

  it('petite question : le message de l’option, pas de note de repassage ; juste : « Juste ! » puis l’explication', () => {
    const t = setup00(at(6, 4));
    choice(t, '(5 + −2)');
    expect(t.$('.q-foot .t-caption')).toBeNull();
    expect(t.$('.alert--error')!.textContent).toContain('Les parenthèses doivent entourer le nombre négatif');
    cleanup();
    const u = setup00(at(6, 4));
    choice(u, '5 + (−2)');
    expect(u.$('.alert--success .alert__title')!.textContent).toBe('Juste !');
    expect(u.$('.alert--success')!.textContent).toContain('ne se touchent plus');
  });

  it('exercice de fin « Toucher la faute » raté : titre sans « ligne N », aucune couleur de signe dans la correction', () => {
    const q = buildQuestion(C00, 'erreur', { rng: seededRng(3), level: 1, timesSeen: 0 });
    if (q.kind !== 'erreur' || !q.accept) throw new Error('toucher la faute attendu');
    const item: ActivityItem = { type: 'question', itemId: 'fin-0', courseId: C00.id, activity: 'fin', question: q };
    const t = setup00([item]);
    const wrong = q.lines.findIndex((_, i) => !q.accept!.includes(i));
    fireEvent.click(t.$$('.answer-zone .tag--piece')[q.accept.length === 0 ? 0 : wrong]!);
    if (q.accept.length > 0) {
      expect(t.$('.alert--error .alert__title')!.textContent).toBe('Pas tout à fait.');
      expect(t.$$('.resolution .neg, .resolution .pos')).toHaveLength(0);
    }
  });

  it('exemple guidé « Réécris » raté : la note de repassage de la leçon', () => {
    const t = setup00(at(16, 4));
    for (const k of ['6', '×', '−', '2']) fireEvent.click(t.btn(k)!);
    fireEvent.click(t.btn('Valider')!);
    expect(t.$('.alert--error')!.textContent).toContain('Le × et le − se touchent encore');
    expect(t.$('.resolution-label')!.textContent).toBe('Étape par étape');
    expect(t.$('.q-foot .t-caption')!.textContent).toBe(LESSON_REPEAT_NOTE);
  });
});
