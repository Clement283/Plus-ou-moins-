const MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt'];

/** Texte affiché -> texte lu : nombres 0 à 20 en mots, symboles de calcul en clair. */
export function toSpeech(t: string): string {
  return t
    .replace(/\d+/g, (d) => (+d < MOTS.length ? ` ${MOTS[+d]} ` : ` ${d} `))
    .replace(/×/g, ' fois ')
    .replace(/÷/g, ' divisé par ')
    .replace(/\+/g, ' plus ')
    .replace(/−/g, ' moins ')
    .replace(/=/g, ' égale ')
    .replace(/\(/g, ' ouvre la parenthèse ')
    .replace(/\)/g, ' ferme la parenthèse ')
    .replace(/✓/g, ' juste ')
    .replace(/✗/g, ' faux ')
    .replace(/▢/g, ' case vide ')
    .replace(/\s+/g, ' ')
    .replace(/\s([.,?!:;])/g, '$1')
    .trim();
}
