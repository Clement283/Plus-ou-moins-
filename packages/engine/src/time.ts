const parisFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Jour calendaire Europe/Paris ('YYYY-MM-DD') d'un instant en millisecondes. */
export function parisDay(ms: number): string {
  const parts = parisFormat.formatToParts(new Date(ms));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function toUtcMs(day: string): number {
  const [y = 0, m = 1, d = 1] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Ajoute n jours (négatif permis) à une date 'YYYY-MM-DD'. Arithmétique calendaire pure. */
export function addDays(day: string, n: number): string {
  return new Date(toUtcMs(day) + n * 86_400_000).toISOString().slice(0, 10);
}

/** Nombre de jours de a à b (b − a). */
export function diffDays(a: string, b: string): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / 86_400_000);
}
