import { toSpeech } from './toSpeech';

const BLOCKS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'LI', 'UL', 'OL', 'SECTION', 'BR', 'TABLE', 'TR']);
const SKIPPED = 'button, svg, script, style, [data-speak-skip], [aria-hidden="true"]';

function walk(node: Node, out: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    out.push(node.textContent ?? '');
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;
  if (el.matches(SKIPPED)) return;
  if (el.hasAttribute('data-speak-open')) {
    out.push(' un mot à trouver ');
    return;
  }
  const block = BLOCKS.has(el.tagName);
  if (block) out.push('\n');
  el.childNodes.forEach((c) => walk(c, out));
  if (block) out.push('\n');
}

/** Ce que l'écran dit : titre, phrase affichée, consigne ; sans les repères marqués data-speak-skip. */
export function speakable(root: HTMLElement): string {
  const out: string[] = [];
  root.childNodes.forEach((c) => walk(c, out));
  const lines = out
    .join('')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return toSpeech(lines.join('. '));
}

function synth(): SpeechSynthesis | null {
  try {
    const s = window.speechSynthesis;
    return s && typeof SpeechSynthesisUtterance !== 'undefined' ? s : null;
  } catch {
    return null;
  }
}

/** Lit le texte en français. N'affiche jamais d'erreur : sans voix, il ne se passe rien. */
export function speak(text: string, onEnd?: () => void): void {
  try {
    const s = synth();
    if (!s) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    const v = (s.getVoices ? s.getVoices() : []).find((x) => /^fr/i.test(x.lang));
    if (v) u.voice = v;
    if (onEnd) u.onend = u.onerror = () => onEnd();
    s.speak(u);
  } catch {
    /* échec silencieux */
  }
}

export function stopSpeaking(): void {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* rien */
  }
}
