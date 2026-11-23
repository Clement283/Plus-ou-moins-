/**
 * Messages of the writing errors (doc 03 §3, doc 07 #1 and #5). `readRaw` gives the error type;
 * the raw tokens tell the cases doc 07 separates inside a type.
 */
import { readRaw, type RawInput, type RawToken } from './input/raw';

export const WRITING_MESSAGES = {
  'moins-apres': "Le signe moins s'écrit avant le nombre : −3.",
  'double-signe': "Il y a deux signes moins à la suite. Un nombre n'a qu'un signe : −3 ou 3.",
  'parenthese': 'Une parenthèse ouverte doit être fermée, et une parenthèse fermée doit avoir été ouverte.',
  /** Doc 07 #5: a closed parenthesis before the number, none opened. */
  'parenthese-fermee': 'Une parenthèse fermée doit avoir été ouverte.',
  /** Doc 07 #1: « 3−4 » or « 3−(4) », a calculation left unfinished. */
  'un-seul-nombre': 'Ta réponse doit être un seul nombre.',
  'ecriture-invalide': "Cette réponse n'est pas un nombre bien écrit.",
  'division-par-zero': 'On ne divise jamais par 0.',
} as const;

const chars = (tokens: readonly RawToken[]): string => tokens.map((t) => (t.t === 'c' ? t.c : 'F')).join('');
const boxes = (tokens: readonly RawToken[]): string[] => tokens.flatMap((t) => (t.t === 'frac' ? [chars(t.num), chars(t.den)] : []));

export function diagnoseWriting(raw: RawInput, expectInteger: boolean, errorType: string | null): string {
  switch (errorType) {
    case 'moins-apres':
      return WRITING_MESSAGES['moins-apres'];
    case 'double-signe':
      return WRITING_MESSAGES['double-signe'];
    case 'parenthese': {
      const root = chars(raw.tokens);
      const noOpen = !root.includes('(') && !boxes(raw.tokens).some((b) => b.includes('('));
      return root.startsWith(')') && noOpen ? WRITING_MESSAGES['parenthese-fermee'] : WRITING_MESSAGES.parenthese;
    }
    default: {
      const read = readRaw(raw, expectInteger);
      if (read.kind === 'writing-error' && read.divZero) return WRITING_MESSAGES['division-par-zero'];
      if ([chars(raw.tokens), ...boxes(raw.tokens)].some((s) => /[\dF]-./.test(s))) return WRITING_MESSAGES['un-seul-nombre'];
      return WRITING_MESSAGES['ecriture-invalide'];
    }
  }
}
